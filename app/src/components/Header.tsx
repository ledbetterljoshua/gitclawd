import './Header.css'

// Check if we're in electron
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI

interface HeaderProps {
  repoPath: string | null
  currentBranch: string
  onOpenRepo: (path?: string) => void
}

export default function Header({ repoPath, currentBranch, onOpenRepo }: HeaderProps) {
  const handleOpenClick = async () => {
    if (isElectron) {
      // Use electron's native file dialog
      const path = await (window as any).electronAPI.openRepoDialog()
      if (path) {
        onOpenRepo(path)
      }
    } else {
      // Fall back to modal
      onOpenRepo()
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-emoji">🦞</span>
          <span className="logo-text">GitClawd</span>
        </div>

        <button className="header-btn" onClick={handleOpenClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>Open</span>
        </button>
      </div>

      <div className="header-center">
        {repoPath ? (
          <div className="repo-info">
            <span className="repo-name">{getRepoName(repoPath)}</span>
            <span className="repo-path">{repoPath}</span>
          </div>
        ) : (
          <span className="no-repo">No repository open</span>
        )}
      </div>

      <div className="header-right">
        {currentBranch && (
          <div className="branch-indicator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9c0 9-12 6-12 12" />
            </svg>
            <span>{currentBranch}</span>
          </div>
        )}
      </div>
    </header>
  )
}

function getRepoName(path: string): string {
  return path.split('/').filter(Boolean).pop() || path
}
