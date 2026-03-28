import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'
import { Bot, FileText, Search, ExternalLink } from 'lucide-react'
import useAppStore from '../store/appStore'

function DocsPage({ documents }) {
  const handleOpen = (filename) => {
    window.open(`http://localhost:8000/api/upload/open/${encodeURIComponent(filename)}`, '_blank')
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h2 className="text-white font-semibold mb-4">Uploaded Documents</h2>
      {documents.length === 0
        ? <p className="text-slate-500 text-sm">No documents uploaded yet.</p>
        : <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div key={doc.filename}
                className="p-4 rounded-xl border border-white/10 bg-white/5
                  hover:border-violet-500/30 transition-all duration-200
                  flex items-center gap-3 group cursor-pointer"
                onClick={() => handleOpen(doc.filename)}>
                <FileText size={18} className="text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{doc.filename}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {doc.chunk_count} chunks · {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-violet-400
                  transition-colors shrink-0" />
              </div>
            ))}
          </div>}
    </div>
  )
}

function SearchPage() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h2 className="text-white font-semibold mb-4">Search Documents</h2>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10
        bg-white/5 focus-within:border-violet-500/50 transition-all duration-200">
        <Search size={16} className="text-slate-400" />
        <input type="text" placeholder="Search across all documents..."
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none" />
      </div>
      <p className="text-slate-600 text-xs mt-4">
        Type to search across all uploaded documents.
      </p>
    </div>
  )
}

export default function ChatWindow() {
  const { messages, isStreaming, activePage, documents } = useAppStore()
  const bottomRef = useRef()

  // Filter out empty AI messages (from failed attempts)
  const validMessages = messages.filter(
    (m) => m.content.trim() !== '' || m.role === 'user'
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const pageTitle = { chat: 'Chat', docs: 'Documents', search: 'Search' }[activePage]
  const pageSubtitle = {
    chat: 'Ask questions about your documents',
    docs: 'Manage your uploaded files',
    search: 'Search across all documents',
  }[activePage]

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold">{pageTitle}</h1>
            <p className="text-xs text-slate-500">{pageSubtitle}</p>
          </div>
          {isStreaming && (
            <div className="ml-auto flex items-center gap-2 text-xs text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Thinking...
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      {activePage === 'docs' && <DocsPage documents={documents} />}
      {activePage === 'search' && <SearchPage />}

      {activePage === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            {validMessages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40 mt-20">
                <Bot size={40} className="text-violet-400" />
                <p className="text-sm text-slate-400 text-center">
                  Upload a document and start asking questions
                </p>
              </div>
            )}
            {validMessages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content}
                isStreaming={isStreaming && i === validMessages.length - 1 && msg.role === 'ai'} />
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <InputBar />
          </div>
        </>
      )}
    </main>
  )
}
