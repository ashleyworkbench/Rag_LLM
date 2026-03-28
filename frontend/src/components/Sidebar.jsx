import { MessageSquare, FileText, Search, Upload, File, Loader2, Trash2, ExternalLink } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import useAppStore from '../store/appStore'
import { uploadFile, fetchDocuments, deleteDocument } from '../api/client'
import { showToast } from './Toast'

const navItems = [
  { icon: MessageSquare, label: 'Chat', page: 'chat' },
  { icon: FileText, label: 'Docs', page: 'docs' },
  { icon: Search, label: 'Search', page: 'search' },
]

export default function Sidebar() {
  const [dragging, setDragging] = useState(false)
  const { documents, setDocuments, isUploading, setUploading,
          activePage, setActivePage, clearChat } = useAppStore()
  const fileRef = useRef()

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(() => {
      showToast('Cannot reach backend on port 8000 — is it running?')
    })
  }, [])

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      await uploadFile(file)
      const docs = await fetchDocuments()
      setDocuments(docs)
      showToast(`${file.name} uploaded successfully`, 'success')
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Upload failed'
      showToast(msg)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (filename, e) => {
    e.stopPropagation()
    try {
      await deleteDocument(filename)
      const docs = await fetchDocuments()
      setDocuments(docs)
      showToast(`${filename} deleted`, 'success')
    } catch (err) {
      showToast('Delete failed')
    }
  }
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  return (
    <aside className="w-64 h-full flex flex-col gap-4 p-4 border-r border-white/10
      bg-white/5 backdrop-blur-xl shrink-0">

      {/* App name + clear chat */}
      <div className="flex items-center gap-2 px-2 pt-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600
          flex items-center justify-center text-white font-bold text-sm shrink-0">N</div>
        <span className="text-white font-semibold text-lg tracking-tight">Nexus</span>
        <button onClick={clearChat}
          title="Clear chat"
          className="ml-auto text-slate-500 hover:text-red-400 transition-colors duration-200">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Workspace selector */}
      <div className="px-2">
        <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
          text-sm text-slate-400 cursor-pointer hover:bg-white/10 transition-colors
          outline-none appearance-none">
          <option>My Workspace</option>
          <option>Work Projects</option>
          <option>Personal</option>
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map(({ icon: Icon, label, page }) => (
          <button key={page}
            onClick={() => setActivePage(page)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              transition-all duration-200
              ${activePage === page
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Document library */}
      <div className="flex-1 flex flex-col gap-2 px-2 overflow-hidden">
        <p className="text-xs text-slate-500 uppercase tracking-wider px-1">
          Document Library
        </p>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {documents.length === 0
            ? <p className="text-xs text-slate-600 px-1 mt-1">No documents yet</p>
            : documents.map((doc) => (
                <div key={doc.filename}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                    text-slate-400 hover:bg-white/5 hover:text-white
                    transition-all duration-200 cursor-pointer group">
                  <File size={14} className="text-violet-400 shrink-0" />
                  <span className="truncate text-xs flex-1">{doc.filename}</span>
                  {/* Open inline */}
                  <button
                    onClick={() => window.open(`http://localhost:8000/api/upload/open/${encodeURIComponent(doc.filename)}`, '_blank')}
                    title="View file"
                    className="opacity-0 group-hover:opacity-100 text-slate-500
                      hover:text-violet-400 transition-all duration-200 shrink-0">
                    <ExternalLink size={12} />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(doc.filename, e)}
                    title="Delete file"
                    className="opacity-0 group-hover:opacity-100 text-slate-500
                      hover:text-red-400 transition-all duration-200 shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
        </div>
      </div>

      {/* Upload box */}
      <div className="px-2 pb-2">
        <input type="file" ref={fileRef} className="hidden"
          accept=".pdf,.docx" onChange={(e) => handleUpload(e.target.files[0])} />
        <div
          onClick={() => !isUploading && fileRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full rounded-xl border-2 border-dashed p-4
            flex flex-col items-center gap-2 cursor-pointer
            transition-all duration-200
            ${dragging
              ? 'border-violet-400 bg-violet-500/10 scale-[1.02]'
              : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'}`}>
          {isUploading
            ? <Loader2 size={18} className="text-violet-400 animate-spin" />
            : <Upload size={18} className="text-slate-400" />}
          <p className="text-xs text-slate-400 text-center">
            {isUploading ? 'Processing...' : 'Drop PDF or DOCX here'}
          </p>
        </div>
      </div>
    </aside>
  )
}
