import { ChatSession, Message } from '../types'

// Simple storage key based on repo path
function getStorageKey(repoPath: string): string {
  // Convert path to a safe key: /Users/josh/code/ladder -> users-josh-code-ladder
  return 'gitclawd-chats-' + repoPath.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
}

// Generate UUID
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}

// Generate title from first user message
function generateTitle(messages: Message[]): string {
  const firstUserMsg = messages.find(m => m.role === 'user')
  if (!firstUserMsg) return 'New Chat'
  // Take first 50 chars of first message
  const title = firstUserMsg.content.slice(0, 50)
  return title.length < firstUserMsg.content.length ? title + '...' : title
}

export interface ChatStore {
  sessions: ChatSession[]
  activeSessionId: string | null
}

// Load all sessions for a repo
export function loadChatStore(repoPath: string): ChatStore {
  try {
    const key = getStorageKey(repoPath)
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load chat store:', e)
  }
  return { sessions: [], activeSessionId: null }
}

// Save chat store
export function saveChatStore(repoPath: string, store: ChatStore): void {
  try {
    const key = getStorageKey(repoPath)
    localStorage.setItem(key, JSON.stringify(store))
  } catch (e) {
    console.error('Failed to save chat store:', e)
  }
}

// Create a new session
export function createSession(
  repoPath: string,
  context?: { commit?: string; branch?: string; files?: string[] }
): ChatSession {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    repoPath,
    title: 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
    context
  }
}

// Add message to session and save
export function addMessage(
  repoPath: string,
  sessionId: string,
  message: Message
): ChatStore {
  const store = loadChatStore(repoPath)
  const session = store.sessions.find(s => s.id === sessionId)

  if (session) {
    session.messages.push(message)
    session.updatedAt = new Date().toISOString()
    // Update title if this is the first user message
    if (session.title === 'New Chat' && message.role === 'user') {
      session.title = generateTitle(session.messages)
    }
  }

  saveChatStore(repoPath, store)
  return store
}

// Get or create active session
export function getOrCreateActiveSession(
  repoPath: string,
  context?: { commit?: string; branch?: string; files?: string[] }
): { store: ChatStore; session: ChatSession } {
  let store = loadChatStore(repoPath)

  // Try to find active session
  let session = store.activeSessionId
    ? store.sessions.find(s => s.id === store.activeSessionId)
    : null

  // If no active session, create one
  if (!session) {
    session = createSession(repoPath, context)
    store.sessions.unshift(session) // Add to beginning
    store.activeSessionId = session.id
    saveChatStore(repoPath, store)
  }

  return { store, session }
}

// Switch to a different session
export function switchSession(repoPath: string, sessionId: string): ChatStore {
  const store = loadChatStore(repoPath)
  store.activeSessionId = sessionId
  saveChatStore(repoPath, store)
  return store
}

// Start a new session (keeps old ones)
export function startNewSession(
  repoPath: string,
  context?: { commit?: string; branch?: string; files?: string[] }
): { store: ChatStore; session: ChatSession } {
  const store = loadChatStore(repoPath)
  const session = createSession(repoPath, context)
  store.sessions.unshift(session)
  store.activeSessionId = session.id
  saveChatStore(repoPath, store)
  return { store, session }
}

// Delete a session
export function deleteSession(repoPath: string, sessionId: string): ChatStore {
  const store = loadChatStore(repoPath)
  store.sessions = store.sessions.filter(s => s.id !== sessionId)
  if (store.activeSessionId === sessionId) {
    store.activeSessionId = store.sessions[0]?.id || null
  }
  saveChatStore(repoPath, store)
  return store
}
