
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ToolSummary } from '../types'
import { Tooltip } from './ui/Tooltip'
import { Select, SelectItem } from './ui/Select'
import { Tabs, Tab } from './ui/Tabs'

const LANDING_URL = 'https://github.com/zunalabs/skills-manager#readme'
const DOCS_URL = 'https://github.com/zunalabs/skills-manager'

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
  view: 'skills' | 'discover'
  onViewChange: (v: 'skills' | 'discover') => void
  onSettings: () => void
}

export default function Header({
  search, onSearch, onRefresh, onInstall,
  totalSkills, totalEnabled,
  filterTool, onFilterTool,
  filterStatus, onFilterStatus,
  tools,
  view, onViewChange,
  onSettings,
}: HeaderProps) {
  return (
    <header className="flex-shrink-0 h-11 border-b border-zinc-800 bg-zinc-950 flex items-center gap-3 px-3">

      {/* Logo */}
      <span className="font-heading text-sm text-zinc-100 tracking-tight flex-shrink-0 pl-1">
        Skills
      </span>

      <div className="w-px h-4 bg-zinc-800 flex-shrink-0" />

      {/* View toggle */}
      <Tabs value={view} onValueChange={(v) => onViewChange(v as 'skills' | 'discover')}>
        <Tab value="skills">Skills</Tab>
        <Tab value="discover">✦ Discover</Tab>
      </Tabs>

      {view === 'skills' && (
        <>
          <div className="w-px h-4 bg-zinc-800 flex-shrink-0" />

          {/* Search */}
          <div className="relative w-44">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search skills…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Agent filter */}
          <Select value={filterTool} onValueChange={onFilterTool}>
            <SelectItem value="all">All agents</SelectItem>
            {tools.filter((t) => t.exists).map((t) => (
              <SelectItem key={t.tool} value={t.tool}>{t.tool}</SelectItem>
            ))}
          </Select>

          {/* Status filter */}
          <Tabs value={filterStatus} onValueChange={(s) => onFilterStatus(s as 'all' | 'enabled' | 'disabled')}>
            <Tab value="all">All</Tab>
            <Tab value="enabled">Enabled</Tab>
            <Tab value="disabled">Disabled</Tab>
          </Tabs>
        </>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        {/* Stats */}
        <span className="text-xs text-zinc-600 tabular-nums">
          <span className="text-emerald-500">{totalEnabled}</span>
          <span className="mx-1 opacity-30">/</span>
          {totalSkills}
        </span>

        {/* Install */}
        <button
          onClick={onInstall}
          className="flex items-center gap-1.5 px-3 h-7 rounded-md bg-black hover:bg-zinc-800 text-white text-xs font-medium transition-colors border border-zinc-700"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Install
        </button>

        {/* Refresh */}
        <Tooltip content="Refresh" side="bottom">
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.1-3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13.5 3v2.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Tooltip>

        {/* Settings */}
        <Tooltip content="Settings" side="bottom">
          <button
            onClick={onSettings}
            className="w-7 h-7 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
          </button>
        </Tooltip>

        {/* Help */}
        <HelpMenu />
      </div>
    </header>
  )
}

function HelpMenu() {
  const openUrl = (url: string) => window.skillsAPI.openExternal(url)

  return (
    <>
      <DropdownMenu.Root>
        <Tooltip content="Help" side="bottom">
          <DropdownMenu.Trigger asChild>
            <button className="w-7 h-7 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6.5 6.5a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="12" r="0.75" fill="currentColor"/>
              </svg>
            </button>
          </DropdownMenu.Trigger>
        </Tooltip>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 w-44 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden py-1"
          >
            <DropdownMenu.Item
              onSelect={() => openUrl(LANDING_URL)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer outline-none transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2.5A5.5 5.5 0 1 0 13.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M11 2h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 8l6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Learn more
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-zinc-800 mx-2 my-1" />
            <DropdownMenu.Item
              onSelect={() => openUrl(DOCS_URL)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer outline-none transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M6 8h4M6 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Docs &amp; repo
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  )
}
