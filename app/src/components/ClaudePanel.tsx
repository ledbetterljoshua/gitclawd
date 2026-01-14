import { useState, useRef, useEffect } from 'react'
import Markdown from 'react-markdown'
import { Message } from '../types'
import {
  getOrCreateActiveSession,
  addMessage,
  startNewSession,
  switchSession,
  deleteSession,
  ChatStore
} from '../lib/chatStorage'
import './ClaudePanel.css'

interface ClaudePanelProps {
  repoPath: string | null
  currentBranch: string
  selectedCommitHash: string | null
  isLoading: boolean
  onSendMessage: (content: string, onResponse: (response: string) => void) => void
}

export default function ClaudePanel({
  repoPath,
  currentBranch,
  selectedCommitHash,
  isLoading,
  onSendMessage
}: ClaudePanelProps) {
  const [input, setInput] = useState('')
  const [store, setStore] = useState<ChatStore>({ sessions: [], activeSessionId: null })
  const [showSessionList, setShowSessionList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load sessions when repo changes
  useEffect(() => {
    if (repoPath) {
      const { store: loadedStore } = getOrCreateActiveSession(repoPath, {
        branch: currentBranch,
        commit: selectedCommitHash || undefined
      })
      setStore(loadedStore)
    } else {
      setStore({ sessions: [], activeSessionId: null })
    }
  }, [repoPath])

  // Get active session
  const activeSession = store.activeSessionId
    ? store.sessions.find(s => s.id === store.activeSessionId)
    : null
  const messages = activeSession?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !repoPath || !store.activeSessionId) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    // Add user message to storage
    const updatedStore = addMessage(repoPath, store.activeSessionId, userMessage)
    setStore(updatedStore)
    setInput('')

    // Send to Claude and handle response
    onSendMessage(input.trim(), (response: string) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
      const finalStore = addMessage(repoPath, store.activeSessionId!, assistantMessage)
      setStore(finalStore)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleNewChat = () => {
    if (!repoPath) return
    const { store: newStore } = startNewSession(repoPath, {
      branch: currentBranch,
      commit: selectedCommitHash || undefined
    })
    setStore(newStore)
    setShowSessionList(false)
  }

  const handleSwitchSession = (sessionId: string) => {
    if (!repoPath) return
    const newStore = switchSession(repoPath, sessionId)
    setStore(newStore)
    setShowSessionList(false)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!repoPath) return
    const newStore = deleteSession(repoPath, sessionId)
    setStore(newStore)
  }

  const handleSuggestion = (text: string) => {
    if (!repoPath || !store.activeSessionId) return

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }

    const updatedStore = addMessage(repoPath, store.activeSessionId, userMessage)
    setStore(updatedStore)

    onSendMessage(text, (response: string) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
      const finalStore = addMessage(repoPath, store.activeSessionId!, assistantMessage)
      setStore(finalStore)
    })
  }

  return (
    <div className="claude-panel">
      <div className="claude-header">
        <div className="claude-title">
          <span className="claude-icon">🦞</span>
          <span>Claude</span>
        </div>
        <div className="claude-header-actions">
          <button
            className="session-dropdown-btn"
            onClick={() => setShowSessionList(!showSessionList)}
            title="Chat history"
          >
            <HistoryIcon />
            {store.sessions.length > 0 && (
              <span className="session-count">{store.sessions.length}</span>
            )}
          </button>
          <button className="new-chat-btn" onClick={handleNewChat} title="New chat">
            <PlusIcon />
          </button>
          <span className="claude-status">
            {isLoading ? 'Thinking...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Session list dropdown */}
      {showSessionList && (
        <div className="session-list">
          {store.sessions.length === 0 ? (
            <div className="session-empty">No chat history</div>
          ) : (
            store.sessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${session.id === store.activeSessionId ? 'active' : ''}`}
                onClick={() => handleSwitchSession(session.id)}
              >
                <div className="session-info">
                  <span className="session-title">{session.title}</span>
                  <span className="session-date">{formatDate(session.updatedAt)}</span>
                </div>
                <button
                  className="session-delete"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="claude-messages">
        {messages.length === 0 ? (
          <div className="claude-empty">
            <div className="claude-empty-icon">💬</div>
            <p>Ask Claude about your repository</p>
            <div className="claude-suggestions">
              <button onClick={() => handleSuggestion('Summarize the recent changes')}>
                Summarize recent changes
              </button>
              <button onClick={() => handleSuggestion('What files have the most churn?')}>
                Most changed files
              </button>
              <button onClick={() => handleSuggestion('Explain the current diff')}>
                Explain current diff
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-header">
                  <span className="message-role">
                    {msg.role === 'user' ? 'You' : 'Claude'}
                  </span>
                  {msg.timestamp && (
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>
                <div className="message-content">
                  <MessageContent content={msg.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-header">
                  <span className="message-role">Claude</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="claude-input" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={repoPath ? "Ask Claude about this repository..." : "Open a repository first..."}
          rows={1}
          disabled={isLoading || !repoPath}
        />
        <button type="submit" disabled={!input.trim() || isLoading || !repoPath}>
          <SendIcon />
        </button>
      </form>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  return (
    <Markdown
      components={{
        // Custom code block rendering
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match && !className

          if (isInline) {
            return <code className="inline-code" {...props}>{children}</code>
          }

          return (
            <pre className={`code-block ${match?.[1] || ''}`}>
              <code {...props}>{children}</code>
            </pre>
          )
        },
        // Style links
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
        }
      }}
    >
      {content}
    </Markdown>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
