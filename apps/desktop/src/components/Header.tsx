import { PanelLeftOpen, RotateCw, Search } from 'lucide-react'
import { ToolSummary } from '../types'
import { Select, SelectItem } from './ui/Select'

interface HeaderProps {
  search: string
  onSearch: (value: string) => void
  onRefresh: () => void
  filterTool: string
  onFilterTool: (tool: string) => void
  tools: ToolSummary[]
  view: 'skills' | 'discover'
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Header({
  search, onSearch, onRefresh, filterTool, onFilterTool, tools, view,
  sidebarOpen, onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="app-header">
      {view === 'skills' && !sidebarOpen && (
        <button className="icon-button sidebar-header-toggle" onClick={onToggleSidebar} title="Show skills sidebar" aria-label="Show skills sidebar">
          <PanelLeftOpen size={16} />
        </button>
      )}
      {view === 'skills' && (
        <div className="command-search">
          <Search size={14} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search skills, tags, or capabilities" />
          <kbd>Ctrl K</kbd>
        </div>
      )}

      <div className="header-actions">
        {view === 'skills' && <>
          <Select value={filterTool} onValueChange={onFilterTool}>
            <SelectItem value="all">All agents</SelectItem>
            {tools.filter((tool) => tool.exists).map((tool) => <SelectItem key={tool.tool} value={tool.tool}>{tool.tool}</SelectItem>)}
          </Select>
        </>}
        <button className="icon-button" onClick={onRefresh} title="Scan for changes" aria-label="Scan for skill changes"><RotateCw size={15} /></button>
      </div>
    </header>
  )
}
