import { useState } from 'react'
import './RepoModal.css'

interface RepoModalProps {
  isOpen: boolean
  recentRepos: string[]
  onClose: () => void
  onSelectRepo: (path: string) => void
  onBrowse: () => void
}

export default function RepoModal({
  isOpen,
  recentRepos,
  onClose,
  onSelectRepo,
  onBrowse,
}: RepoModalProps) {
  const [inputPath, setInputPath] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputPath.trim()) {
      onSelectRepo(inputPath.trim())
      setInputPath('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Open Repository</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="repo-path-form">
            <div className="input-group">
              <FolderIcon />
              <input
                type="text"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="Enter repository path..."
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" className="browse-btn" onClick={onBrowse}>
                Browse...
              </button>
              <button type="submit" className="open-btn" disabled={!inputPath.trim()}>
                Open
              </button>
            </div>
          </form>

          {recentRepos.length > 0 && (
            <div className="recent-repos">
              <h3>Recent Repositories</h3>
              <div className="recent-list">
                {recentRepos.map((repo, i) => (
                  <button
                    key={i}
                    className="recent-item"
                    onClick={() => onSelectRepo(repo)}
                  >
                    <RepoIcon />
                    <div className="recent-info">
                      <span className="recent-name">{getRepoName(repo)}</span>
                      <span className="recent-path">{repo}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getRepoName(path: string): string {
  return path.split('/').filter(Boolean).pop() || path
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6L18 18" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  )
}

function RepoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 004 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}
