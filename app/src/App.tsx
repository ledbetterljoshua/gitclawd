import { useState, useCallback, useRef, useEffect } from 'react'
import { Commit, DiffFile, WorkingChanges } from './types'
import Header from './components/Header'
import CommitGraph from './components/CommitGraph'
import DiffViewer, { DiffViewerHandle } from './components/DiffViewer'
import ClaudePanel from './components/ClaudePanel'
import RepoModal from './components/RepoModal'
import './App.css'

function App() {
  const [repoPath, setRepoPath] = useState<string | null>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [diffFiles, setDiffFiles] = useState<DiffFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [workingChanges, setWorkingChanges] = useState<WorkingChanges | null>(null)
  const [showWorkingChanges, setShowWorkingChanges] = useState(false)
  // Messages now managed by ClaudePanel via storage
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<string>('')
  const [isClaudeLoading, setIsClaudeLoading] = useState(false)
  const [recentRepos] = useState<string[]>([]) // Could persist to localStorage
  const diffViewerRef = useRef<DiffViewerHandle>(null)

  // Panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [rightPanelWidth, setRightPanelWidth] = useState(300)
  const [isClaudePanelOpen, setIsClaudePanelOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const isResizing = useRef<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Panel resize handlers
  const handleMouseDown = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    isResizing.current = side
    startX.current = e.clientX
    startWidth.current = side === 'left' ? leftPanelWidth : rightPanelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [leftPanelWidth, rightPanelWidth])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return

      const delta = e.clientX - startX.current
      if (isResizing.current === 'left') {
        const newWidth = Math.min(Math.max(startWidth.current + delta, 200), 500)
        setLeftPanelWidth(newWidth)
      } else {
        const newWidth = Math.min(Math.max(startWidth.current - delta, 200), 500)
        setRightPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      isResizing.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleFileClick = useCallback((path: string) => {
    setSelectedFile(path)
    diffViewerRef.current?.scrollToFile(path)
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const handleCopyHash = useCallback(async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      showToast(`Copied ${hash.slice(0, 7)}`)
    } catch (err) {
      console.error('Failed to copy hash:', err)
    }
  }, [showToast])

  const openRepo = useCallback(async (path: string) => {
    try {
      const res = await fetch('/api/open-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }

      setRepoPath(path)
      setIsModalOpen(false)

      // Fetch commits
      const logRes = await fetch('/api/commits')
      const logData = await logRes.json()
      setCommits(logData.commits || [])

      // Fetch status for branch info
      const statusRes = await fetch('/api/status')
      const statusData = await statusRes.json()
      setCurrentBranch(statusData.branch || 'main')

      // Fetch working changes
      const wcRes = await fetch('/api/working-changes')
      const wcData = await wcRes.json()
      setWorkingChanges(wcData)

    } catch (err) {
      console.error('Failed to open repo:', err)
    }
  }, [])

  const selectCommit = useCallback(async (commit: Commit) => {
    setSelectedCommit(commit)
    setShowWorkingChanges(false)
    setSelectedFile(null)

    try {
      // Tell server which commit is selected (so Claude can see it)
      fetch('/api/select-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: commit.hash })
      })

      const res = await fetch(`/api/diff/${commit.hash}`)
      const data = await res.json()
      // Parse diff into files
      const files = parseDiff(data.diff || '')
      setDiffFiles(files)
    } catch (err) {
      console.error('Failed to fetch diff:', err)
    }
  }, [])

  const selectWorkingChanges = useCallback(async () => {
    setSelectedCommit(null)
    setShowWorkingChanges(true)
    setSelectedFile(null)

    // Clear server selection
    fetch('/api/select-commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: null })
    })

    try {
      const res = await fetch('/api/diff')
      const data = await res.json()
      // Combine staged and unstaged
      const stagedFiles = parseDiff(data.staged || '')
      const unstagedFiles = parseDiff(data.unstaged || '')
      setDiffFiles([...stagedFiles, ...unstagedFiles])
    } catch (err) {
      console.error('Failed to fetch working changes:', err)
    }
  }, [])

  const sendMessage = useCallback(async (content: string, onResponse: (response: string) => void) => {
    setIsClaudeLoading(true)

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      })
      const data = await res.json()

      // Extract text from responses
      let responseText = ''
      if (data.responses) {
        for (const r of data.responses) {
          if (r.type === 'text') responseText += r.content
        }
      }

      onResponse(responseText || data.error || 'No response')
    } catch (err) {
      onResponse('Error: Failed to get response')
    } finally {
      setIsClaudeLoading(false)
    }
  }, [])

  const toggleClaudePanel = useCallback(() => {
    setIsClaudePanelOpen(prev => !prev)
  }, [])

  return (
    <div
      className="app"
      style={{
        gridTemplateColumns: `${leftPanelWidth}px 1fr ${isClaudePanelOpen ? rightPanelWidth : 0}px`
      }}
    >
      <Header
        repoPath={repoPath}
        currentBranch={currentBranch}
        onOpenRepo={(path) => {
          if (path) {
            // Direct path from electron file dialog
            openRepo(path)
          } else {
            // No path, show modal (web fallback)
            setIsModalOpen(true)
          }
        }}
      />

      <div className="panel-container left-panel" style={{ width: leftPanelWidth }}>
        <CommitGraph
          commits={commits}
          selectedCommit={selectedCommit}
          workingChanges={workingChanges}
          showWorkingChanges={showWorkingChanges}
          diffFiles={diffFiles}
          onSelectCommit={selectCommit}
          onSelectWorkingChanges={selectWorkingChanges}
          onFileClick={handleFileClick}
          onCopyHash={handleCopyHash}
        />
        <div
          className="resize-handle left"
          onMouseDown={(e) => handleMouseDown('left', e)}
        />
      </div>

      <div className="panel-container center-panel">
        <DiffViewer
          ref={diffViewerRef}
          files={diffFiles}
          selectedFile={selectedFile}
          selectedCommit={selectedCommit}
          showWorkingChanges={showWorkingChanges}
          onSelectFile={setSelectedFile}
        />
        {/* Claude panel toggle */}
        <button className="claude-toggle" onClick={toggleClaudePanel} title={isClaudePanelOpen ? 'Hide Claude' : 'Show Claude'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isClaudePanelOpen ? (
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            ) : (
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            )}
          </svg>
        </button>
      </div>

      {isClaudePanelOpen && (
        <div className="panel-container right-panel" style={{ width: rightPanelWidth }}>
          <div
            className="resize-handle right"
            onMouseDown={(e) => handleMouseDown('right', e)}
          />
          <ClaudePanel
            repoPath={repoPath}
            currentBranch={currentBranch}
            selectedCommitHash={selectedCommit?.hash || null}
            isLoading={isClaudeLoading}
            onSendMessage={sendMessage}
          />
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}

      <RepoModal
        isOpen={isModalOpen}
        recentRepos={recentRepos}
        onClose={() => setIsModalOpen(false)}
        onSelectRepo={openRepo}
        onBrowse={() => {
          // In electron, this would open a file dialog
          // For web, we just show the modal with manual input
        }}
      />
    </div>
  )
}

// Parse unified diff into structured format
function parseDiff(diffText: string): DiffFile[] {
  if (typeof diffText !== 'string' || !diffText.trim()) return []

  const files: DiffFile[] = []
  const lines = diffText.split('\n')
  let currentFile: DiffFile | null = null
  let currentHunk: any = null
  let oldLineNum = 0
  let newLineNum = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('diff --git')) {
      if (currentFile) files.push(currentFile)
      const match = line.match(/diff --git a\/(.*) b\/(.*)/)
      currentFile = {
        oldPath: match ? match[1] : '',
        newPath: match ? match[2] : '',
        status: 'modified',
        additions: 0,
        deletions: 0,
        hunks: []
      }
      currentHunk = null
      continue
    }

    if (!currentFile) continue

    if (line.startsWith('new file mode')) {
      currentFile.status = 'added'
    } else if (line.startsWith('deleted file mode')) {
      currentFile.status = 'deleted'
    } else if (line.startsWith('rename from')) {
      currentFile.status = 'renamed'
    }

    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)/)
      if (match) {
        oldLineNum = parseInt(match[1])
        newLineNum = parseInt(match[3])
        currentHunk = {
          header: line,
          oldStart: oldLineNum,
          oldCount: parseInt(match[2] || '1'),
          newStart: newLineNum,
          newCount: parseInt(match[4] || '1'),
          lines: []
        }
        currentFile.hunks.push(currentHunk)
      }
      continue
    }

    if (!currentHunk) continue

    if (line.startsWith('+') && !line.startsWith('+++')) {
      currentHunk.lines.push({ type: 'add', content: line.slice(1), newNum: newLineNum++ })
      currentFile.additions++
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      currentHunk.lines.push({ type: 'del', content: line.slice(1), oldNum: oldLineNum++ })
      currentFile.deletions++
    } else if (!line.startsWith('\\')) {
      currentHunk.lines.push({ type: 'context', content: line.slice(1) || '', oldNum: oldLineNum++, newNum: newLineNum++ })
    }
  }

  if (currentFile) files.push(currentFile)
  return files
}

export default App
