import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { DiffFile, Commit } from '../types'
import './DiffViewer.css'

interface DiffViewerProps {
  files: DiffFile[]
  selectedFile: string | null
  selectedCommit: Commit | null
  showWorkingChanges: boolean
  onSelectFile: (path: string | null) => void
}

export interface DiffViewerHandle {
  scrollToFile: (path: string) => void
}

const DiffViewer = forwardRef<DiffViewerHandle, DiffViewerProps>(({
  files,
  selectedCommit,
  showWorkingChanges,
}, ref) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const fileRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const scrollToFile = useCallback((path: string) => {
    const el = fileRefs.current.get(path)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useImperativeHandle(ref, () => ({
    scrollToFile
  }), [scrollToFile])

  const setFileRef = useCallback((path: string, el: HTMLDivElement | null) => {
    if (el) {
      fileRefs.current.set(path, el)
    } else {
      fileRefs.current.delete(path)
    }
  }, [])

  const hasContent = files.length > 0 || selectedCommit || showWorkingChanges

  return (
    <div className="diff-panel">
      {/* Commit info bar */}
      {selectedCommit && (
        <div className="commit-info-bar">
          <span className="hash">{selectedCommit.hash.slice(0, 8)}</span>
          <span className="message">{selectedCommit.message}</span>
          <span className="author">{selectedCommit.author}</span>
          <span className="date">{formatDate(selectedCommit.date)}</span>
          <div className="refs">
            {selectedCommit.refs.map((r, i) => (
              <span key={i} className={`ref-tag ${r.includes('HEAD') ? 'head' : ''}`}>
                {r.replace('HEAD -> ', '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {showWorkingChanges && (
        <div className="commit-info-bar working">
          <span className="message">Working Changes</span>
        </div>
      )}

      {/* Diff content area - single scroll container */}
      <div className="diff-content-area" ref={contentRef}>
        {!hasContent ? (
          <div className="diff-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>Select a commit to view changes</p>
          </div>
        ) : files.length === 0 ? (
          <div className="diff-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>No changes in this commit</p>
          </div>
        ) : (
          <div className="diff-files">
            {files.map((file) => (
              <div
                key={file.newPath}
                className="diff-file-section"
                ref={(el) => setFileRef(file.newPath, el)}
              >
                <div className="diff-file-header">
                  <span className={`status-indicator ${file.status}`}>
                    {file.status === 'added' ? '+' : file.status === 'deleted' ? '−' : '•'}
                  </span>
                  <span className="file-path">{file.newPath}</span>
                  <span className="file-stats">
                    {file.additions > 0 && <span className="additions">+{file.additions}</span>}
                    {file.deletions > 0 && <span className="deletions">-{file.deletions}</span>}
                  </span>
                  <span className="language-badge">{getLanguage(file.newPath)}</span>
                </div>
                <div className="diff-file-content">
                  {file.hunks.map((hunk, j) => (
                    <div key={j} className="diff-hunk">
                      <div className="hunk-header">{hunk.header}</div>
                      <div className="hunk-lines">
                        {hunk.lines.map((line, k) => (
                          <div key={k} className={`diff-line ${line.type}`}>
                            <span className="line-num old">{line.oldNum ?? ''}</span>
                            <span className="line-num new">{line.newNum ?? ''}</span>
                            <span className="line-prefix">
                              {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                            </span>
                            <span className="line-content">{line.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

DiffViewer.displayName = 'DiffViewer'

export default DiffViewer

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    css: 'css', scss: 'scss', html: 'html', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sh: 'bash', sql: 'sql', swift: 'swift', kt: 'kotlin',
  }
  return map[ext] || ext
}
