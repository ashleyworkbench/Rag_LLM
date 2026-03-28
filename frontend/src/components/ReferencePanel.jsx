import ReferenceCard from './ReferenceCard'
import { BookOpen } from 'lucide-react'
import useAppStore from '../store/appStore'

export default function ReferencePanel() {
  const { sources } = useAppStore()

  return (
    <aside className="w-72 h-full flex flex-col gap-4 p-4 border-l border-white/10
      bg-white/5 backdrop-blur-xl shrink-0">

      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-2">
        <BookOpen size={16} className="text-violet-400" />
        <h2 className="text-white font-semibold text-sm">Source References</h2>
        {sources.length > 0 && (
          <span className="ml-auto text-[10px] bg-violet-500/20 text-violet-300
            px-2 py-0.5 rounded-full border border-violet-500/20">
            {sources.length}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {sources.length === 0
          ? <p className="text-xs text-slate-500 px-2 mt-4 text-center">
              Sources will appear here after you ask a question.
            </p>
          : sources.map((source, i) => (
              <ReferenceCard key={i} source={source} />
            ))}
      </div>
    </aside>
  )
}
