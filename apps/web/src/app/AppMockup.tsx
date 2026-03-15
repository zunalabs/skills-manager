import { AgentIcon } from './AgentIcon'

const mockSkills = [
  { agent: 'Claude Code', name: 'format-commits',   enabled: true,  selected: true  },
  { agent: 'Cursor',       name: 'enforce-types',    enabled: true,  selected: false },
  { agent: 'Windsurf',     name: 'code-review',      enabled: false, selected: false },
  { agent: 'GitHub Copilot', name: 'test-generator', enabled: true,  selected: false },
  { agent: 'Gemini CLI',   name: 'api-docs',         enabled: false, selected: false },
]

const selected = mockSkills[0]

export default function AppMockup() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]"
      style={{
        background: '#111110',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 h-10 border-b border-[rgba(255,255,255,0.06)] shrink-0"
        style={{ background: '#0d0d0c' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="h-6 w-52 flex items-center px-3 gap-2 rounded-md"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="5.5" cy="5.5" r="3.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
              <path d="M8.5 8.5L10.5 10.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>Search skills…</span>
          </div>
        </div>
        <button
          className="text-[10px] font-medium text-white px-2.5 py-1 rounded-md"
          style={{ background: '#7c3aed' }}
        >
          + Install
        </button>
      </div>

      {/* App body */}
      <div className="flex" style={{ height: '340px' }}>
        {/* Sidebar */}
        <div
          className="w-60 border-r border-[rgba(255,255,255,0.05)] flex flex-col overflow-hidden shrink-0"
          style={{ background: '#0f0f0e' }}
        >
          {mockSkills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[rgba(255,255,255,0.04)]"
              style={{
                background: skill.selected ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
            >
              <span className="shrink-0 opacity-80">
                <AgentIcon agent={skill.agent} size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[11px] font-medium truncate"
                  style={{ color: skill.selected ? '#e4e4e7' : '#71717a' }}
                >
                  {skill.name}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#3f3f46' }}>
                  {skill.agent}
                </div>
              </div>
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: skill.enabled ? '#10b981' : '#3f3f46' }}
              />
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="flex-1 p-6 overflow-hidden">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{selected.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="opacity-70"><AgentIcon agent={selected.agent} size={12} /></span>
                <span className="text-[11px]" style={{ color: '#52525b' }}>{selected.agent}</span>
              </div>
            </div>
            {/* Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px]" style={{ color: '#52525b' }}>Enabled</span>
              <div className="w-8 h-4 rounded-full relative" style={{ background: '#10b981' }}>
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs leading-relaxed mb-5" style={{ color: '#52525b' }}>
            Enforces conventional commit message format across all commits. Validates
            structure, scope, and type prefixes automatically.
          </p>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mb-5">
            {['commits', 'git', 'formatting'].map((tag) => (
              <span
                key={tag}
                className="text-[10px] rounded-full px-2 py-0.5 border"
                style={{ color: '#52525b', borderColor: '#27272a' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Path */}
          <div className="text-[10px] font-mono mb-5" style={{ color: '#3f3f46' }}>
            ~/.claude/skills/format-commits.md
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              className="text-[11px] px-3 py-1.5 rounded-lg border"
              style={{ color: '#a1a1aa', borderColor: '#27272a' }}
            >
              Copy to agent
            </button>
            <button
              className="text-[11px] px-3 py-1.5 rounded-lg border"
              style={{ color: 'rgba(239,68,68,0.6)', borderColor: 'rgba(127,29,29,0.4)' }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
