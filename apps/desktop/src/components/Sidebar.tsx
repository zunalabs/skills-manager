import { Skill } from '../types'
import { ToolIcon } from './ToolIcon'

interface SidebarProps {
  skills: Skill[]
  selected: Skill | null
  onSelect: (s: Skill | null) => void
  loading: boolean
  onToggle: (s: Skill) => void
}

export default function Sidebar({ skills, selected, onSelect, loading, onToggle }: SidebarProps) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.tool]) acc[s.tool] = []
    acc[s.tool].push(s)
    return acc
  }, {})

  if (loading) {
    return (
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
        <div className="p-3 space-y-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </aside>
    )
  }

  if (skills.length === 0) {
    return (
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex items-center justify-center">
        <p className="text-xs text-zinc-600">No skills found</p>
      </aside>
    )
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
      <div className="p-2 pt-3">
        {Object.entries(grouped).map(([tool, toolSkills]) => (
          <div key={tool} className="mb-5">
            {/* Tool group header */}
            <div className="flex items-center gap-2 px-2 mb-1.5">
              <span className="flex-shrink-0 flex items-center justify-center w-3.5 h-3.5 opacity-70">
                <ToolIcon tool={tool} size={14} />
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{tool}</span>
              <span className="ml-auto text-[10px] font-medium text-zinc-600 tabular-nums">{toolSkills.length}</span>
            </div>

            <div className="space-y-0.5">
              {toolSkills.map((skill) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  selected={selected?.id === skill.id}
                  onSelect={onSelect}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        ))}
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
      className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
        selected
          ? 'bg-violet-500/10 border border-violet-500/20'
          : 'hover:bg-zinc-900 border border-transparent'
      }`}
    >
      {/* Enable/disable toggle dot */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(skill)
        }}
        className={`flex-shrink-0 w-2 h-2 rounded-full transition-all mt-0.5 ${
          skill.enabled
            ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]'
            : 'bg-zinc-700 group-hover:bg-zinc-600'
        }`}
        title={skill.enabled ? 'Click to disable' : 'Click to enable'}
      />

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate leading-tight ${
          skill.enabled ? 'text-zinc-200' : 'text-zinc-500'
        }`}>
          {skill.name}
        </p>
        {skill.description && (
          <p className="text-[11px] text-zinc-600 truncate mt-0.5 leading-tight">{skill.description}</p>
        )}
      </div>

      {skill.hasTemplates && (
        <span className="flex-shrink-0 text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full border border-zinc-700/50 tabular-nums">
          {skill.templateCount}
        </span>
      )}
    </div>
  )
}
