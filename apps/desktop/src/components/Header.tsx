import { ToolSummary } from '../types'

interface HeaderProps {
  search: string
  onSearch: (s: string) => void
  onRefresh: () => void
  onInstall: () => void
  totalSkills: number
  totalEnabled: number
  filterTool: string
  onFilterTool: (t: string) => void
  filterStatus: 'all' | 'enabled' | 'disabled'
  onFilterStatus: (s: 'all' | 'enabled' | 'disabled') => void
  tools: ToolSummary[]
}

export default function Header({
  search, onSearch, onRefresh, onInstall,
  totalSkills, totalEnabled,
  filterTool, onFilterTool,
  filterStatus, onFilterStatus,
  tools,
}: HeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-zinc-800/60 bg-zinc-950">
      <div className="flex items-center gap-2.5 px-4 h-12">

        {/* Logo */}
        <span className="font-heading text-[15px] text-zinc-100 tracking-tight mr-1 flex-shrink-0">
          Skills
        </span>

        <div className="w-px h-3.5 bg-zinc-800 flex-shrink-0" />

        {/* Search */}
        <div className="relative flex-1 max-w-56">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* Tool filter */}
        <select
          value={filterTool}
          onChange={(e) => onFilterTool(e.target.value)}
          className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:outline-none cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <option value="all">All agents</option>
          {tools.filter((t) => t.exists).map((t) => (
            <option key={t.tool} value={t.tool}>{t.tool}</option>
          ))}
        </select>

        {/* Status filter */}
        <div className="flex items-center bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-0.5">
          {(['all', 'enabled', 'disabled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onFilterStatus(s)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all capitalize ${
                filterStatus === s
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {/* Stats */}
          <span className="text-xs text-zinc-600 tabular-nums">
            <span className="text-green-500">{totalEnabled}</span>
            <span className="mx-1 text-zinc-700">/</span>
            {totalSkills}
          </span>

          {/* Install */}
          <button
            onClick={onInstall}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-zinc-700/60 bg-zinc-900/70 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Install
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded-lg border border-zinc-800/80 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-zinc-300 transition-colors flex items-center justify-center"
            title="Refresh"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.1-3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13.5 3v2.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
