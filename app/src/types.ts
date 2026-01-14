export interface Commit {
  hash: string
  message: string
  author: string
  date: string
  refs: string[]
  parents: string[]
}

export interface DiffFile {
  oldPath: string
  newPath: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  hunks: DiffHunk[]
}

export interface DiffHunk {
  header: string
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  lines: DiffLine[]
}

export interface DiffLine {
  type: 'context' | 'add' | 'del'
  content: string
  oldNum?: number
  newNum?: number
}

export interface FileTreeNode {
  name: string
  path: string
  isDir: boolean
  children?: FileTreeNode[]
  file?: DiffFile
  expanded?: boolean
}

export interface WorkingChanges {
  staged: DiffFile[]
  unstaged: DiffFile[]
  untracked: string[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ChatSession {
  id: string
  repoPath: string
  title: string  // Auto-generated from first message or user-set
  messages: Message[]
  createdAt: string
  updatedAt: string
  // Optional context - what was being looked at when chat started
  context?: {
    commit?: string
    branch?: string
    files?: string[]
  }
}
