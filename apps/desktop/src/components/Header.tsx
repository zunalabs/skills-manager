import { RefreshCw, Search, Download } from 'lucide-react'
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
    <header className="flex-shrink-0 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3 px-4 h-11">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-1 flex-shrink-0">
          <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center text-white flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5H11L8.25 6.75L9.25 10.5L6 8.25L2.75 10.5L3.75 6.75L1 4.5H4.5L6 1Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-100 tracking-tight">Skills</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-zinc-800 flex-shrink-0" />

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Tool filter */}
        <select
          value={filterTool}
          onChange={(e) => onFilterTool(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-violet-500/50 cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <option value="all">All tools</option>
          {tools.filter((t) => t.exists).map((t) => (
            <option key={t.tool} value={t.tool}>{t.tool}</option>
          ))}
        </select>

        {/* Status filter */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
          {(['all', 'enabled', 'disabled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onFilterStatus(s)}
              className={`px-2.5 py-1 text-xs rounded transition-all capitalize font-medium ${
                filterStatus === s
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stats + refresh */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-green-400 font-medium tabular-nums">{totalEnabled}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 tabular-nums">{totalSkills}</span>
          </div>
          <button
            onClick={onInstall}
            className="flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium transition-colors"
            title="Install from GitHub"
          >
            <Download className="w-3 h-3" />
            Install
          </button>
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded-md border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-zinc-300 transition-colors flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
