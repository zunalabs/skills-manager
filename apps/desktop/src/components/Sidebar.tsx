import { useState } from 'react'
import { Skill, Collection } from '../types'
import { ToolIcon } from './ToolIcon'
import { Tooltip } from './ui/Tooltip'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import StarIcon from '@mui/icons-material/Star'
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'

const PREVIEW_COUNT = 5

const COLLECTION_ICONS: Record<string, React.ReactNode> = {
  '__starred__': <StarIcon sx={{ fontSize: 13 }} className="text-amber-400" />,
  'coding': <CodeOutlinedIcon sx={{ fontSize: 13 }} />,
  'git': <AccountTreeOutlinedIcon sx={{ fontSize: 13 }} />,
  'writing': <EditNoteOutlinedIcon sx={{ fontSize: 13 }} />,
  'testing': <BugReportOutlinedIcon sx={{ fontSize: 13 }} />,
  'devops': <CloudOutlinedIcon sx={{ fontSize: 13 }} />,
  'data': <StorageOutlinedIcon sx={{ fontSize: 13 }} />,
  'web': <LanguageOutlinedIcon sx={{ fontSize: 13 }} />,
  'security': <LockOutlinedIcon sx={{ fontSize: 13 }} />,
  'ai': <AutoAwesomeOutlinedIcon sx={{ fontSize: 13 }} />,
  'productivity': <ChecklistOutlinedIcon sx={{ fontSize: 13 }} />,
  'files': <FolderOutlinedIcon sx={{ fontSize: 13 }} />,
  'review': <RateReviewOutlinedIcon sx={{ fontSize: 13 }} />,
}

interface SidebarProps {
  skills: Skill[]
  selected: Skill | null
  onSelect: (s: Skill | null) => void
  loading: boolean
  onToggle: (s: Skill) => void
  collections: Collection[]
  filterCollection: string | null
  onFilterCollection: (id: string | null) => void
  compact?: boolean
  sidebarWidth?: 'sm' | 'md' | 'lg'
  favourites: Set<string>
  onToggleFavourite: (skillId: string) => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Sidebar({
  skills, selected, onSelect, loading, onToggle,
  collections, filterCollection, onFilterCollection, compact, sidebarWidth = 'md',
  favourites, onToggleFavourite, onToggleSidebar,
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showAll, setShowAll] = useState<Record<string, boolean>>({})

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.tool]) acc[s.tool] = []
    acc[s.tool].push(s)
    return acc
  }, {})

  if (loading) {
    return (
      <aside className={`flex-shrink-0 flex flex-col overflow-hidden ${sidebarWidth === 'sm' ? 'w-44' : sidebarWidth === 'lg' ? 'w-72' : 'w-56'}`}>
        <div className="flex-1 px-2 pt-3 space-y-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-zinc-900 animate-pulse"
              style={{ opacity: 1 - i * 0.1, width: i % 3 === 0 ? '60%' : '100%' }}
            />
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className={`flex-shrink-0 flex flex-col overflow-y-auto ${sidebarWidth === 'sm' ? 'w-44' : sidebarWidth === 'lg' ? 'w-72' : 'w-56'}`}>
      <nav className="flex-1 px-2 py-2">
        {/* Tag-based collections */}
        {collections.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center px-2 py-1.5">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex-1">
                Collections
              </span>
              <Tooltip content="Collapse sidebar" side="right">
                <button
                  onClick={onToggleSidebar}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors p-0.5 rounded"
                >
                  <ChevronLeftOutlinedIcon sx={{ fontSize: 14 }} />
                </button>
              </Tooltip>
            </div>

            {collections.map((col) => {
              const active = filterCollection === col.id
              const isStarred = col.id === '__starred__'
              return (
                <div
                  key={col.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    active
                      ? isStarred
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-zinc-800 text-zinc-100'
                      : isStarred
                        ? 'text-amber-400 hover:bg-amber-500/5 active:bg-amber-500/5 hover:text-amber-300'
                        : 'text-zinc-400 hover:bg-zinc-900 active:bg-zinc-900 hover:text-zinc-200'
                  }`}
                  onClick={() => onFilterCollection(active ? null : col.id)}
                >
                  <span className="flex-shrink-0 text-zinc-500">
                    {COLLECTION_ICONS[col.id] ?? <LayersOutlinedIcon sx={{ fontSize: 13 }} />}
                  </span>
                  <span className="text-xs flex-1 truncate capitalize">{col.name}</span>
                  <span className={`text-[10px] tabular-nums ${isStarred ? 'text-amber-600' : 'text-zinc-700'}`}>
                    {col.skillIds.length}
                  </span>
                </div>
              )
            })}

            <div className="border-t border-zinc-800/60 mt-2 mb-2" />
          </div>
        )}

        {/* Collapse button when no collections */}
        {collections.length === 0 && (
          <div className="flex items-center px-2 py-1.5 mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex-1">
              Collections
            </span>
            <button
              onClick={onToggleSidebar}
              className="text-zinc-600 hover:text-zinc-400 transition-colors p-0.5 rounded"
              title="Collapse sidebar"
            >
              <ChevronLeftOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        )}

        {/* Skills grouped by tool */}
        {skills.length === 0 ? (
          <p className="text-xs text-zinc-600 px-3">No skills found</p>
        ) : (
          Object.entries(grouped).map(([tool, toolSkills]) => {
            const isExpanded = expanded[tool] ?? false
            const isShowingAll = showAll[tool] ?? false
            const visible = isShowingAll ? toolSkills : toolSkills.slice(0, PREVIEW_COUNT)
            const hiddenCount = toolSkills.length - PREVIEW_COUNT

            return (
              <div key={tool} className="mb-1">
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [tool]: !isExpanded }))}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-zinc-900/60 active:bg-zinc-900/60 transition-colors group"
                >
                  <span className="text-zinc-600 flex-shrink-0">
                    <ToolIcon tool={tool} size={13} />
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate flex-1">
                    {tool}
                  </span>
                  <span className="text-[10px] text-zinc-700 tabular-nums flex-shrink-0">
                    {toolSkills.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-0.5 space-y-px">
                    {visible.map((skill) => (
                      <SkillItem
                        key={skill.id}
                        skill={skill}
                        selected={selected?.id === skill.id}
                        onSelect={onSelect}
                        onToggle={onToggle}
                        compact={compact}
                        isFavourite={favourites.has(skill.id)}
                        onToggleFavourite={onToggleFavourite}
                      />
                    ))}

                    {toolSkills.length > PREVIEW_COUNT && !isShowingAll && (
                      <button
                        onClick={() => setShowAll((prev) => ({ ...prev, [tool]: true }))}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {hiddenCount} more
                      </button>
                    )}

                    {isShowingAll && toolSkills.length > PREVIEW_COUNT && (
                      <button
                        onClick={() => setShowAll((prev) => ({ ...prev, [tool]: false }))}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="rotate-180">
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Show less
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </nav>
    </aside>
  )
}

function SkillItem({
  skill,
  selected,
  onSelect,
  onToggle,
  compact,
  isFavourite,
  onToggleFavourite,
}: {
  skill: Skill
  selected: boolean
  onSelect: (s: Skill | null) => void
  onToggle: (s: Skill) => void
  compact?: boolean
  isFavourite: boolean
  onToggleFavourite: (skillId: string) => void
}) {
  return (
    <div
      onClick={() => onSelect(selected ? null : skill)}
      className={`group flex items-center gap-2.5 px-3 rounded-lg cursor-pointer transition-colors ${
        compact ? 'py-1' : 'py-2'
      } ${
        selected
          ? 'bg-zinc-800 text-zinc-100'
          : 'text-zinc-400 hover:bg-zinc-900 active:bg-zinc-900 hover:text-zinc-200'
      }`}
    >
      <span className={`flex-1 min-w-0 text-xs truncate ${
        selected ? 'text-zinc-100 font-medium' : 'text-zinc-300'
      }`}>
        {skill.name}
      </span>

      {skill.hasTemplates && (
        <span className={`flex-shrink-0 text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
          selected ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-900 text-zinc-600'
        }`}>
          {skill.templateCount}
        </span>
      )}

      <Tooltip content={isFavourite ? 'Remove from starred' : 'Add to starred'} side="right">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(skill.id) }}
          className={`flex-shrink-0 transition-all ${
            isFavourite ? 'opacity-100 text-amber-400' : 'opacity-0 group-hover:opacity-100 text-zinc-600'
          }`}
        >
          {isFavourite
            ? <StarIcon sx={{ fontSize: 11 }} />
            : <StarOutlinedIcon sx={{ fontSize: 11 }} />
          }
        </button>
      </Tooltip>
    </div>
  )
}
