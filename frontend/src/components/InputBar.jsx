import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import useAppStore from '../store/appStore'
import { streamQuery, uploadFile, fetchDocuments } from '../api/client'
import { showToast } from './Toast'

export default function InputBar() {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const fileRef = useRef()
  const inputRef = useRef()

  const {
    addUserMessage, startAiMessage, appendToken,
    stopStreaming, setSources, isStreaming,
    setUploading, setDocuments
  } = useAppStore()

  // Auto-focus after streaming ends and on mount
  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus()
  }, [isStreaming])

  const handleSend = async () => {
    const question = input.trim()
    if (!question || isStreaming) return
    setInput('')
    inputRef.current?.focus()

    addUserMessage(question)
    startAiMessage()

    await streamQuery(
      question,
      (token) => appendToken(token),
      (sources) => setSources(sources),
      () => stopStreaming()
    ).catch((err) => {
      showToast(err?.message || 'Query failed')
      stopStreaming()
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadFile(file)
      const docs = await fetchDocuments()
      setDocuments(docs)
      showToast(`${file.name} uploaded`, 'success')
    } catch (err) {
      showToast(err?.response?.data?.detail || err?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <input type="file" ref={fileRef} className="hidden"
        accept=".pdf,.docx" onChange={handleFileChange} />

      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border
        bg-white/5 backdrop-blur-xl transition-all duration-200
        ${focused
          ? 'border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
          : 'border-white/10'}`}>

        {/* Attach button */}
        <button onClick={() => fileRef.current.click()}
          className="text-slate-400 hover:text-violet-400 transition-colors
            duration-200 active:scale-90">
          <Paperclip size={18} />
        </button>

        {/* Text input — always focused */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isStreaming ? 'Aether is thinking...' : 'Ask Aether...'}
          disabled={isStreaming}
          autoFocus
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500
            outline-none caret-violet-400 disabled:opacity-50"
        />

        {/* Mic button */}
        <button
          onClick={() => showToast('Microphone input coming soon', 'success')}
          className="text-slate-400 hover:text-violet-400 transition-colors
            duration-200 active:scale-90">
          <Mic size={18} />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className={`w-8 h-8 rounded-xl flex items-center justify-center
            transition-all duration-200 active:scale-90
            ${input.trim() && !isStreaming
              ? 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)] text-white'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}>
          <Send size={14} />
        </button>
      </div>
    </>
  )
}
