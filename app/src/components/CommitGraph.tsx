import { useRef, useEffect, useCallback, useState } from 'react'
import { Commit, WorkingChanges, DiffFile } from '../types'
import './CommitGraph.css'

interface CommitGraphProps {
  commits: Commit[]
  selectedCommit: Commit | null
  workingChanges: WorkingChanges | null
  showWorkingChanges: boolean
  diffFiles: DiffFile[]
  onSelectCommit: (commit: Commit) => void
  onSelectWorkingChanges: () => void
  onFileClick: (path: string) => void
  onCopyHash: (hash: string) => void
}

const LANE_COLORS = [
  'var(--lane-1)', 'var(--lane-2)', 'var(--lane-3)', 'var(--lane-4)',
  'var(--lane-5)', 'var(--lane-6)', 'var(--lane-7)', 'var(--lane-8)'
]

const cfg = {
  nodeR: 4,
  rowH: 32,
  laneW: 16,
  graphPad: 8,
}

type ViewMode = 'commits' | 'files'

export default function CommitGraph({
  commits,
  selectedCommit,
  workingChanges,
  showWorkingChanges,
  diffFiles,
  onSelectCommit,
  onSelectWorkingChanges,
  onFileClick,
  onCopyHash,
}: CommitGraphProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [lanes, setLanes] = useState<Map<string, number>>(new Map())
  const [maxLane, setMaxLane] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('commits')
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())

  // Auto-switch to files view and expand all dirs when a commit is selected
  useEffect(() => {
    if (selectedCommit && diffFiles.length > 0) {
      setViewMode('files')
      // Auto-expand all directories
      const allDirs = new Set<string>()
      for (const file of diffFiles) {
        const parts = file.newPath.split('/')
        for (let i = 1; i < parts.length; i++) {
          allDirs.add(parts.slice(0, i).join('/'))
        }
      }
      setExpandedDirs(allDirs)
    }
  }, [selectedCommit, diffFiles])

  // Assign lanes to commits - simplified algorithm with max lane cap
  const MAX_LANES = 8 // Cap lanes to keep graph readable
  const assignLanes = useCallback((commits: Commit[]) => {
    const commitLanes = new Map<string, number>()
    const activeLanes = new Map<number, Set<string>>() // lane -> set of ancestor hashes
    let maxLane = 0

    const findFreeLane = () => {
      // Look for free lane within cap
      for (let l = 0; l < MAX_LANES; l++) {
        if (!activeLanes.has(l)) return l
      }
      // All lanes taken - reuse lane 0 (main branch)
      return 0
    }

    for (const commit of commits) {
      // Check if any child already claimed a lane for us
      let lane = -1
      for (const [l, ancestors] of activeLanes) {
        if (ancestors.has(commit.hash)) {
          lane = l
          ancestors.delete(commit.hash)
          if (ancestors.size === 0) {
            activeLanes.delete(l)
          }
          break
        }
      }

      // If no lane claimed, find first free lane
      if (lane === -1) {
        lane = findFreeLane()
      }

      maxLane = Math.max(maxLane, Math.min(lane, MAX_LANES - 1))
      commitLanes.set(commit.hash, lane)

      // Register first parent in same lane, second parent in new lane (for merges)
      for (let p = 0; p < commit.parents.length; p++) {
        const parentHash = commit.parents[p]
        const parentLane = p === 0 ? lane : findFreeLane()

        if (!activeLanes.has(parentLane)) {
          activeLanes.set(parentLane, new Set())
        }
        activeLanes.get(parentLane)!.add(parentHash)
      }
    }

    return { lanes: commitLanes, maxLane: Math.min(maxLane, MAX_LANES - 1) }
  }, [])

  useEffect(() => {
    const { lanes: newLanes, maxLane: newMaxLane } = assignLanes(commits)
    setLanes(newLanes)
    setMaxLane(newMaxLane)
  }, [commits, assignLanes])

  const graphWidth = cfg.graphPad * 2 + (maxLane + 1) * cfg.laneW

  const hasChanges = workingChanges && (
    workingChanges.staged.length > 0 ||
    workingChanges.unstaged.length > 0 ||
    workingChanges.untracked.length > 0
  )

  const handleHashClick = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation()
    onCopyHash(hash)
  }

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const fileTree = buildFileTree(diffFiles)

  // Get all directory paths for expand/collapse all
  const getAllDirPaths = useCallback((nodes: TreeNode[]): string[] => {
    const paths: string[] = []
    const traverse = (ns: TreeNode[]) => {
      for (const n of ns) {
        if (n.isDir) {
          paths.push(n.path)
          traverse(n.children)
        }
      }
    }
    traverse(nodes)
    return paths
  }, [])

  const expandAll = useCallback(() => {
    setExpandedDirs(new Set(getAllDirPaths(fileTree)))
  }, [fileTree, getAllDirPaths])

  const collapseAll = useCallback(() => {
    setExpandedDirs(new Set())
  }, [])

  return (
    <div className="graph-panel">
      {/* View mode tabs */}
      <div className="panel-tabs">
        <button
          className={viewMode === 'commits' ? 'active' : ''}
          onClick={() => setViewMode('commits')}
        >
          Commits
        </button>
        <button
          className={viewMode === 'files' ? 'active' : ''}
          onClick={() => setViewMode('files')}
          disabled={!selectedCommit && !showWorkingChanges}
        >
          Files {diffFiles.length > 0 && <span className="count">{diffFiles.length}</span>}
        </button>
      </div>

      {/* Working changes banner */}
      {hasChanges && viewMode === 'commits' && (
        <button
          className={`working-changes-row ${showWorkingChanges ? 'selected' : ''}`}
          onClick={onSelectWorkingChanges}
        >
          <span className="pulse-dot" />
          <span className="working-changes-label">Working Changes</span>
          <span className="working-changes-count">
            {(workingChanges!.staged.length || 0) + (workingChanges!.unstaged.length || 0) + (workingChanges!.untracked.length || 0)}
          </span>
        </button>
      )}

      <div className="panel-content" ref={scrollRef}>
        {viewMode === 'commits' ? (
          commits.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p>Open a repository</p>
            </div>
          ) : (
            <div className="commit-list">
              {commits.map((commit, index) => {
                const lane = lanes.get(commit.hash) || 0
                const nodeX = cfg.graphPad + lane * cfg.laneW + cfg.laneW / 2
                const nodeY = cfg.rowH / 2
                const color = LANE_COLORS[lane % 8]
                const isSelected = selectedCommit?.hash === commit.hash

                // Find connections to parents
                const parentConnections = commit.parents.map(parentHash => {
                  const parentIndex = commits.findIndex(c => c.hash === parentHash)
                  if (parentIndex === -1) return null
                  const parentLane = lanes.get(parentHash) || 0
                  const parentX = cfg.graphPad + parentLane * cfg.laneW + cfg.laneW / 2
                  return { parentIndex, parentLane, parentX, parentHash }
                }).filter(Boolean) as { parentIndex: number; parentLane: number; parentX: number; parentHash: string }[]

                return (
                  <div
                    key={commit.hash}
                    className={`commit-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectCommit(commit)}
                    style={{ height: cfg.rowH }}
                  >
                    {/* Graph section with SVG */}
                    <svg
                      className="commit-graph-svg"
                      width={graphWidth}
                      height={cfg.rowH}
                      style={{ flexShrink: 0 }}
                    >
                      {/* Lines to parents */}
                      {parentConnections.map((pc, i) => {
                        const rowsDown = pc.parentIndex - index
                        if (rowsDown <= 0) return null

                        // Line goes from this node down to parent
                        if (lane === pc.parentLane) {
                          // Straight line down
                          return (
                            <line
                              key={i}
                              x1={nodeX}
                              y1={nodeY}
                              x2={nodeX}
                              y2={cfg.rowH}
                              stroke={color}
                              strokeWidth={2}
                              opacity={0.6}
                            />
                          )
                        } else {
                          // Curved line to different lane
                          return (
                            <path
                              key={i}
                              d={`M ${nodeX} ${nodeY}
                                  C ${nodeX} ${cfg.rowH * 0.8},
                                    ${pc.parentX} ${cfg.rowH * 0.8},
                                    ${pc.parentX} ${cfg.rowH}`}
                              stroke={color}
                              strokeWidth={2}
                              fill="none"
                              opacity={0.6}
                            />
                          )
                        }
                      })}

                      {/* Lines coming from above (children) */}
                      {commits.slice(0, index).map((prevCommit, prevIndex) => {
                        if (!prevCommit.parents.includes(commit.hash)) return null
                        const prevLane = lanes.get(prevCommit.hash) || 0
                        const prevX = cfg.graphPad + prevLane * cfg.laneW + cfg.laneW / 2
                        const prevColor = LANE_COLORS[prevLane % 8]

                        if (prevLane === lane) {
                          return (
                            <line
                              key={`from-${prevIndex}`}
                              x1={nodeX}
                              y1={0}
                              x2={nodeX}
                              y2={nodeY}
                              stroke={prevColor}
                              strokeWidth={2}
                              opacity={0.6}
                            />
                          )
                        } else {
                          return (
                            <path
                              key={`from-${prevIndex}`}
                              d={`M ${prevX} 0
                                  C ${prevX} ${cfg.rowH * 0.2},
                                    ${nodeX} ${cfg.rowH * 0.2},
                                    ${nodeX} ${nodeY}`}
                              stroke={prevColor}
                              strokeWidth={2}
                              fill="none"
                              opacity={0.6}
                            />
                          )
                        }
                      })}

                      {/* Node circle */}
                      <circle
                        cx={nodeX}
                        cy={nodeY}
                        r={isSelected ? cfg.nodeR + 1 : cfg.nodeR}
                        fill={color}
                        stroke={isSelected ? 'rgba(255,255,255,0.4)' : 'none'}
                        strokeWidth={2}
                      />
                    </svg>

                    {/* Commit info */}
                    <div className="commit-info">
                      {commit.refs.length > 0 && (
                        <div className="commit-refs">
                          {commit.refs.slice(0, 2).map((ref, j) => (
                            <span
                              key={j}
                              className={`ref-badge ${ref.includes('HEAD') ? 'head' : ''}`}
                            >
                              {ref.replace('HEAD -> ', '').replace('origin/', '').slice(0, 12)}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="commit-message">{commit.message}</span>
                      <button
                        className="commit-hash"
                        onClick={(e) => handleHashClick(e, commit.hash)}
                        title="Click to copy"
                      >
                        {commit.hash.slice(0, 7)}
                      </button>
                      <span className="commit-date">{formatRelativeDate(commit.date)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div className="file-tree">
            {selectedCommit && (
              <div className="commit-summary">
                <span className="summary-hash" onClick={(e) => handleHashClick(e as any, selectedCommit.hash)}>
                  {selectedCommit.hash.slice(0, 7)}
                </span>
                <span className="summary-message">{selectedCommit.message}</span>
              </div>
            )}
            {showWorkingChanges && (
              <div className="commit-summary working">
                <span className="summary-message">Working Changes</span>
              </div>
            )}
            {diffFiles.length === 0 ? (
              <div className="empty-state small">
                <p>No changes</p>
              </div>
            ) : (
              <>
                <div className="file-tree-actions">
                  <button onClick={expandAll} title="Expand all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <button onClick={collapseAll} title="Collapse all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                </div>
                <div className="file-list">
                  {renderFileTree(fileTree, expandedDirs, toggleDir, onFileClick, 0)}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Back to commits button when in files view */}
      {viewMode === 'files' && (
        <button className="back-to-commits" onClick={() => setViewMode('commits')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All commits
        </button>
      )}
    </div>
  )
}

interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children: TreeNode[]
  file?: DiffFile
}

function buildFileTree(files: DiffFile[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const file of files) {
    const parts = file.newPath.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const path = parts.slice(0, i + 1).join('/')

      let node = current.find(n => n.name === part)
      if (!node) {
        node = { name: part, path, isDir: !isLast, children: [], file: isLast ? file : undefined }
        current.push(node)
      }
      current = node.children
    }
  }

  // Sort: directories first, then alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(root)

  return root
}

function renderFileTree(
  nodes: TreeNode[],
  expanded: Set<string>,
  onToggle: (path: string) => void,
  onFileClick: (path: string) => void,
  depth: number
): React.ReactNode {
  return nodes.map(node => (
    <div key={node.path}>
      {node.isDir ? (
        <>
          <button
            className="tree-dir"
            style={{ paddingLeft: 12 + depth * 12 }}
            onClick={() => onToggle(node.path)}
          >
            <svg
              className={`dir-chevron ${expanded.has(node.path) ? 'expanded' : ''}`}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <svg className="dir-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="dir-name">{node.name}</span>
            <span className="dir-count">{countFiles(node)}</span>
          </button>
          {expanded.has(node.path) && renderFileTree(node.children, expanded, onToggle, onFileClick, depth + 1)}
        </>
      ) : (
        <button
          className="tree-file"
          style={{ paddingLeft: 12 + depth * 12 }}
          onClick={() => onFileClick(node.path)}
        >
          <span className={`file-status ${node.file?.status || 'modified'}`}>
            {node.file?.status === 'added' ? '+' : node.file?.status === 'deleted' ? '−' : '•'}
          </span>
          <span className="file-name">{node.name}</span>
          {(node.file?.additions || node.file?.deletions) && (
            <span className="file-changes">
              {node.file.additions > 0 && <span className="additions">+{node.file.additions}</span>}
              {node.file.deletions > 0 && <span className="deletions">-{node.file.deletions}</span>}
            </span>
          )}
        </button>
      )}
    </div>
  ))
}

function countFiles(node: TreeNode): number {
  if (!node.isDir) return 1
  return node.children.reduce((sum, c) => sum + countFiles(c), 0)
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
