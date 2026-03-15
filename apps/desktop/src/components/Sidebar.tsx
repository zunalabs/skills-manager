import { useState } from 'react'
import { Skill } from '../types'
import { ToolIcon } from './ToolIcon'

const PREVIEW_COUNT = 3

interface SidebarProps {
  skills: Skill[]
  selected: Skill | null
  onSelect: (s: Skill | null) => void
  loading: boolean
  onToggle: (s: Skill) => void
}

export default function Sidebar({ skills, selected, onSelect, loading, onToggle }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.tool]) acc[s.tool] = []
    acc[s.tool].push(s)
    return acc
  }, {})

  if (loading) {
    return (
      <aside className="w-60 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950 overflow-y-auto">
        <div className="px-3 pt-4 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-zinc-900/60 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      </aside>
    )
  }

  if (skills.length === 0) {
    return (
      <aside className="w-60 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950 flex items-center justify-center">
        <p className="text-xs text-zinc-600">No skills found</p>
      </aside>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950 overflow-y-auto">
      <div className="px-2 pt-3 pb-4">
        {Object.entries(grouped).map(([tool, toolSkills]) => {
          const isExpanded = expanded[tool]
          const visible = isExpanded ? toolSkills : toolSkills.slice(0, PREVIEW_COUNT)
          const hidden = toolSkills.length - PREVIEW_COUNT

          return (
            <div key={tool} className="mb-4">
              {/* Tool group header */}
              <div className="flex items-center gap-1.5 px-2.5 mb-1 h-7">
                <span className="flex-shrink-0 opacity-50">
                  <ToolIcon tool={tool} size={12} />
                </span>
                <span className="text-[10px] font-medium text-zinc-500 tracking-wide truncate">{tool}</span>
                <span className="ml-auto text-[10px] text-zinc-700 tabular-nums flex-shrink-0">{toolSkills.length}</span>
              </div>

              <div className="space-y-px">
                {visible.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    selected={selected?.id === skill.id}
                    onSelect={onSelect}
                    onToggle={onToggle}
                  />
                ))}
              </div>

              {/* See more / less */}
              {toolSkills.length > PREVIEW_COUNT && (
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [tool]: !prev[tool] }))}
                  className="w-full mt-1 px-2.5 py-1.5 text-left text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1.5"
                >
                  {isExpanded ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 6.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Show less
                    </>
                  ) : (
                    <>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {hidden} more
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function SkillRow({
  skill,
  selected,
  onSelect,
  onToggle,
}: {
  skill: Skill
  selected: boolean
  onSelect: (s: Skill | null) => void
  onToggle: (s: Skill) => void
}) {
  return (
    <div
      onClick={() => onSelect(selected ? null : skill)}
      className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
        selected
          ? 'bg-zinc-800/80'
          : 'hover:bg-zinc-900/80'
      }`}
    >
      {/* Enable dot */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(skill) }}
        className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors ${
          skill.enabled ? 'bg-green-500' : 'bg-zinc-700 group-hover:bg-zinc-600'
        }`}
        title={skill.enabled ? 'Disable' : 'Enable'}
      />

      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate leading-tight ${
          selected ? 'text-zinc-100' : skill.enabled ? 'text-zinc-300' : 'text-zinc-500'
        }`}>
          {skill.name}
        </p>
        {skill.description && (
          <p className="text-[11px] text-zinc-600 truncate mt-0.5 leading-tight">{skill.description}</p>
        )}
      </div>

      {skill.hasTemplates && (
        <span className="flex-shrink-0 text-[10px] text-zinc-700 tabular-nums">{skill.templateCount}</span>
      )}
    </div>
  )
}
