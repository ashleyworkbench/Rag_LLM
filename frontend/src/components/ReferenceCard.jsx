import { FileText, ExternalLink } from 'lucide-react'

const BASE_URL = 'http://localhost:8000/api'

function toRelevance(score) {
  const relevance = Math.max(0, 1 - score / 2)
  return Math.round(relevance * 100)
}

export default function ReferenceCard({ source, active }) {
  const relevance = toRelevance(source.score)

  const handleOpen = () => {
    // Opens the file in a new browser tab
    window.open(`${BASE_URL}/upload/open/${encodeURIComponent(source.filename)}`, '_blank')
  }

  return (
    <div
      onClick={handleOpen}
      title={`Click to open ${source.filename}`}
      className={`p-3 rounded-xl border cursor-pointer
        transition-all duration-200 group
        hover:shadow-[0_0_16px_rgba(139,92,246,0.15)] hover:-translate-y-0.5
        ${active
          ? 'border-violet-500/50 bg-violet-500/10'
          : 'border-white/10 bg-white/5 hover:border-violet-500/30'}`}>

      {/* File name + score */}
      <div className="flex items-center gap-2 mb-2">
        <FileText size={13} className="text-violet-400 shrink-0" />
        <span className="text-xs font-medium text-slate-300 truncate">
          {source.filename}
        </span>
        <ExternalLink size={11} className="text-slate-600 group-hover:text-violet-400
          transition-colors shrink-0 ml-auto" />
      </div>

      {/* Relevance badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full
          ${relevance >= 70
            ? 'text-green-400 bg-green-500/10'
            : relevance >= 40
              ? 'text-violet-400 bg-violet-500/10'
              : 'text-slate-400 bg-white/5'}`}>
          {relevance}% match
        </span>
      </div>

      {/* Snippet */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3
        group-hover:text-slate-300 transition-colors duration-200">
        {source.snippet}
      </p>
    </div>
  )
}
