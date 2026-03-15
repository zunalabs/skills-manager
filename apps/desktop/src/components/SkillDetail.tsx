import { useState, useEffect } from 'react'
import { Skill } from '../types'
import { FolderOpen, Code, FileText, ChevronRight, Trash2, Copy } from 'lucide-react'
import { ToolIcon } from './ToolIcon'

interface SkillDetailProps {
  skill: Skill
  onToggle: (s: Skill) => void
  onDelete: (s: Skill) => void
}

export default function SkillDetail({ skill, onToggle, onDelete }: SkillDetailProps) {
  const [readme, setReadme] = useState('')
  const [templates, setTemplates] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateContent, setTemplateContent] = useState('')
  const [activeTab, setActiveTab] = useState<'readme' | 'templates'>('readme')
  const [loadingReadme, setLoadingReadme] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showCopyPanel, setShowCopyPanel] = useState(false)
  const [agentPaths, setAgentPaths] = useState<Record<string, string>>({})
  const [copyStatus, setCopyStatus] = useState<Record<string, 'idle' | 'ok' | 'error'>>({})
  const [copyError, setCopyError] = useState<string | null>(null)

  useEffect(() => {
    setReadme('')
    setTemplates([])
    setSelectedTemplate(null)
    setTemplateContent('')
    setActiveTab('readme')
    setConfirmDelete(false)
    setShowCopyPanel(false)
    setCopyStatus({})
    setCopyError(null)

    setLoadingReadme(true)
    window.skillsAPI.getReadme(skill.path).then((r) => {
      setReadme(r)
      setLoadingReadme(false)
    })

    window.skillsAPI.listTemplates(skill.path).then((t) => {
      setTemplates(t)
    })
  }, [skill.id, skill.path])

  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateContent('')
      return
    }
    window.skillsAPI.readTemplate(skill.path, selectedTemplate).then(setTemplateContent)
  }, [selectedTemplate, skill.path])

  const readmeBody = readme
    ? readme.replace(/^---[\s\S]*?---\n?/, '').trim()
    : ''

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      {/* Skill header */}
      <div className="flex-shrink-0 border-b border-zinc-800/60 px-6 py-5">
        <div className="flex items-start gap-4">
          {/* Tool icon */}
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ToolIcon tool={skill.tool} size={26} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + status badges */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-heading text-base text-zinc-100 leading-tight">{skill.name}</h1>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                skill.enabled
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700'
              }`}>
                {skill.enabled ? 'enabled' : 'disabled'}
              </span>
              {skill.version && (
                <span className="text-[10px] text-zinc-600 bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-zinc-700/50">
                  v{skill.version}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-500 leading-snug mb-2">{skill.description || 'No description'}</p>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="opacity-70"><ToolIcon tool={skill.tool} size={11} /></span>
                <span>{skill.tool}</span>
              </span>
              {skill.domain && (
                <>
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{skill.domain}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onToggle(skill)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                skill.enabled
                  ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15 hover:border-green-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {skill.enabled ? 'Enabled' : 'Disabled'}
            </button>

            <button
              onClick={() => window.skillsAPI.openInExplorer(skill.path)}
              className="w-7 h-7 rounded-lg hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-600 hover:text-zinc-300 transition-all flex items-center justify-center"
              title="Open in Explorer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={async () => {
                if (!showCopyPanel) {
                  const paths = await window.skillsAPI.listAgentPaths()
                  setAgentPaths(paths)
                }
                setShowCopyPanel((v) => !v)
                setConfirmDelete(false)
              }}
              className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center ${
                showCopyPanel
                  ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                  : 'hover:bg-zinc-800 border-transparent hover:border-zinc-700 text-zinc-600 hover:text-zinc-300'
              }`}
              title="Copy to another agent"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={async () => {
                    const ok = await window.skillsAPI.delete(skill.path)
                    if (ok) onDelete(skill)
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-7 h-7 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-zinc-600 hover:text-red-400 transition-all flex items-center justify-center"
                title="Delete skill"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {skill.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Keywords */}
        {skill.keywords.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {skill.keywords.slice(0, 8).map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-500 border border-zinc-700/50"
              >
                {kw}
              </span>
            ))}
            {skill.keywords.length > 8 && (
              <span className="text-[11px] text-zinc-600">+{skill.keywords.length - 8} more</span>
            )}
          </div>
        )}

        {/* Copy to agent panel */}
        {showCopyPanel && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-[11px] text-zinc-500 mb-2">Copy to agent:</p>
            {copyError && (
              <p className="text-[11px] text-red-400 mb-2">{copyError}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(agentPaths)
                .filter((a) => a !== skill.tool)
                .map((agent) => {
                  const st = copyStatus[agent] ?? 'idle'
                  return (
                    <button
                      key={agent}
                      disabled={st !== 'idle'}
                      onClick={async () => {
                        setCopyError(null)
                        setCopyStatus((prev) => ({ ...prev, [agent]: 'idle' }))
                        const res = await window.skillsAPI.copyToAgent(skill.path, agent)
                        if (res.ok) {
                          setCopyStatus((prev) => ({ ...prev, [agent]: 'ok' }))
                        } else {
                          setCopyStatus((prev) => ({ ...prev, [agent]: 'error' }))
                          setCopyError(res.error ?? 'Copy failed')
                        }
                      }}
                      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        st === 'ok'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default'
                          : st === 'error'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 cursor-default'
                          : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <ToolIcon tool={agent} size={11} />
                      {agent}
                      {st === 'ok' && <span className="text-green-400">✓</span>}
                      {st === 'error' && <span className="text-red-400">✗</span>}
                    </button>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b border-zinc-800/60 bg-[#0c0c0e] px-6 gap-1">
        <TabButton
          active={activeTab === 'readme'}
          onClick={() => setActiveTab('readme')}
          icon={<FileText className="w-3.5 h-3.5" />}
          label="README"
        />
        {templates.length > 0 && (
          <TabButton
            active={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
            icon={<Code className="w-3.5 h-3.5" />}
            label="Templates"
            count={templates.length}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'readme' && (
          <div className="h-full overflow-y-auto px-6 py-5">
            {loadingReadme ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3.5 bg-zinc-900 rounded animate-pulse"
                    style={{ width: `${55 + i * 9}%` }}
                  />
                ))}
              </div>
            ) : readmeBody ? (
              <MarkdownView content={readmeBody} />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600">
                <p className="text-xs">No README found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex h-full">
            {/* Template list */}
            <div className="w-44 flex-shrink-0 border-r border-zinc-800 overflow-y-auto p-2">
              {templates.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs truncate transition-all ${
                    selectedTemplate === t
                      ? 'bg-violet-500/10 text-zinc-200 border border-violet-500/20'
                      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* Template content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedTemplate && templateContent ? (
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{templateContent}</pre>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600">
                  <p className="text-xs">Select a template to view</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-1 py-2.5 text-xs border-b-2 mr-4 transition-colors font-medium ${
        active
          ? 'border-violet-500 text-zinc-100'
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          active ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

function MarkdownView({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactElement[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="font-heading text-sm text-zinc-200 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      )
      i++
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-heading text-base text-zinc-100 mt-7 mb-3 pb-2 border-b border-zinc-800">
          {line.slice(3)}
        </h2>
      )
      i++
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="font-heading text-lg text-zinc-100 mt-4 mb-3">
          {line.slice(2)}
        </h1>
      )
      i++
    } else if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(
        <div key={key++} className="my-4 rounded-lg overflow-hidden border border-zinc-800">
          {lang && (
            <div className="flex items-center gap-1.5 bg-zinc-800/60 border-b border-zinc-800 px-3 py-1.5">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">{lang}</span>
            </div>
          )}
          <pre className="!border-0 !rounded-none !m-0">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="space-y-1.5 my-3 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )
    } else if (line === '---' || line === '***') {
      elements.push(<hr key={key++} className="border-zinc-800 my-5" />)
      i++
    } else if (line.trim() === '') {
      i++
    } else {
      elements.push(
        <p key={key++} className="text-xs text-zinc-400 leading-relaxed my-2">
          {line}
        </p>
      )
      i++
    }
  }

  return <div className="max-w-none">{elements}</div>
}
