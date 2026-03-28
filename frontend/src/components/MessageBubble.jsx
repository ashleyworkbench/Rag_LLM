import ReactMarkdown from 'react-markdown'
import { Bot, User } from 'lucide-react'

export default function MessageBubble({ role, content, isStreaming }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 items-start animate-fadeIn
      ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center
        ${isUser
          ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
          : 'bg-white/10 border border-white/10'}`}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot size={14} className="text-violet-400" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-violet-600 text-white rounded-tr-sm'
          : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>

        {isUser ? (
          <p>{content}</p>
        ) : (
          <>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="text-violet-300 font-semibold">{children}</strong>
                ),
              }}>
              {content}
            </ReactMarkdown>
            {/* Blinking cursor while streaming */}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-violet-400 ml-0.5
                animate-pulse rounded-sm align-middle" />
            )}
          </>
        )}
      </div>
    </div>
  )
}
