import { useState, useEffect, useRef } from 'react'
import { X, Download, ArrowLeft, Check } from 'lucide-react'
import { ToolIcon } from './ToolIcon'
import { DiscoveredSkill } from '../types'

interface InstallModalProps {
  onClose: () => void
  onInstalled: () => void
}

type Stage = 'input' | 'select' | 'installing'

export default function InstallModal({ onClose, onInstalled }: InstallModalProps) {
  const [stage, setStage] = useState<Stage>('input')
  const [repo, setRepo] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Discovered data
  const [discoveredSkills, setDiscoveredSkills] = useState<DiscoveredSkill[]>([])
  const [skillsBasePath, setSkillsBasePath] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())

  // Agent selection
  const [agentPaths, setAgentPaths] = useState<Record<string, string>>({})
  const [targetAgents, setTargetAgents] = useState<Set<string>>(new Set())

  // Installing
  const [progress, setProgress] = useState<string[]>([])
  const [result, setResult] = useState<{ ok: boolean; installed: string[]; error?: string } | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.skillsAPI.listAgentPaths().then(setAgentPaths)
    inputRef.current?.focus()
    const unsub = window.skillsAPI.onInstallProgress((msg) => {
      setProgress((prev) => [...prev, msg])
    })
    return unsub
  }, [])

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.scrollTop = progressRef.current.scrollHeight
    }
  }, [progress])

  const handleFetch = async () => {
    if (!repo.trim()) return
    setFetching(true)
    setFetchError('')
    const res = await window.skillsAPI.discoverSkills(repo.trim())
    setFetching(false)
    if (!res.ok) { setFetchError(res.error ?? 'Failed to fetch repo'); return }
    if (res.skills.length === 0) { setFetchError('No skills found in this repo'); return }
    setDiscoveredSkills(res.skills)
    setSkillsBasePath(res.skillsBasePath)
    setSelectedSkills(new Set(res.skills.map((s) => s.dirName)))
    setStage('select')
  }

  const toggleSkill = (dirName: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev)
      next.has(dirName) ? next.delete(dirName) : next.add(dirName)
      return next
    })
  }

  const toggleAgent = (agent: string) => {
    setTargetAgents((prev) => {
      const next = new Set(prev)
      next.has(agent) ? next.delete(agent) : next.add(agent)
      return next
    })
  }

  const handleInstall = async () => {
    if (selectedSkills.size === 0 || targetAgents.size === 0) return
    setStage('installing')
    setProgress([])
    setResult(null)
    const skillDirNames = Array.from(selectedSkills)
    const allInstalled: string[] = []
    let lastError: string | undefined
    for (const agent of targetAgents) {
      const res = await window.skillsAPI.installFromGitHub(repo.trim(), agent, skillDirNames, skillsBasePath)
      if (res.installed.length > 0) allInstalled.push(...res.installed)
      if (!res.ok) lastError = res.error
    }
    const combined = { ok: !lastError, installed: allInstalled, error: lastError }
    setResult(combined)
    if (allInstalled.length > 0) onInstalled()
  }

  const canInstall = selectedSkills.size > 0 && targetAgents.size > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          {stage === 'select' && (
            <button
              onClick={() => setStage('input')}
              className="w-6 h-6 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-100">Install from GitHub</h2>
            {stage === 'select' && (
              <p className="text-[11px] text-zinc-500 truncate">{repo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Stage: input */}
          {stage === 'input' && (
            <>
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
                  GitHub repo
                </label>
                <input
                  ref={inputRef}
                  value={repo}
                  onChange={(e) => { setRepo(e.target.value); setFetchError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                  placeholder="owner/repo or full GitHub URL"
                  disabled={fetching}
                  className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 disabled:opacity-50 transition-colors"
                />
                <p className="text-[11px] text-zinc-600 mt-1">
                  e.g. <span className="text-zinc-500">vercel-labs/agent-skills</span>
                </p>
                {fetchError && (
                  <p className="text-[11px] text-red-400 mt-1.5">{fetchError}</p>
                )}
              </div>
            </>
          )}

          {/* Stage: select */}
          {stage === 'select' && (
            <>
              {/* Skill picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                    Skills <span className="text-violet-400 normal-case">{selectedSkills.size}/{discoveredSkills.length}</span>
                  </label>
                  <button
                    onClick={() => setSelectedSkills(
                      selectedSkills.size === discoveredSkills.length
                        ? new Set()
                        : new Set(discoveredSkills.map((s) => s.dirName))
                    )}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {selectedSkills.size === discoveredSkills.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
                  {discoveredSkills.map((skill) => {
                    const checked = selectedSkills.has(skill.dirName)
                    return (
                      <button
                        key={skill.dirName}
                        onClick={() => toggleSkill(skill.dirName)}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                          checked
                            ? 'bg-violet-500/10 border-violet-500/20'
                            : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                          checked ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'
                        }`}>
                          {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={`text-xs font-medium block truncate ${checked ? 'text-zinc-200' : 'text-zinc-400'}`}>
                            {skill.name}
                          </span>
                          {skill.description && (
                            <span className="text-[10px] text-zinc-600 block truncate mt-0.5 leading-tight">
                              {skill.description}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Agent picker */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
                  Install into
                  {targetAgents.size > 0 && (
                    <span className="ml-1.5 text-violet-400 normal-case">{targetAgents.size} selected</span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                  {Object.keys(agentPaths).map((agent) => (
                    <button
                      key={agent}
                      onClick={() => toggleAgent(agent)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all text-left ${
                        targetAgents.has(agent)
                          ? 'bg-violet-500/10 border-violet-500/25 text-zinc-200'
                          : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <ToolIcon tool={agent} size={11} />
                      <span className="truncate">{agent}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Stage: installing */}
          {stage === 'installing' && (
            <>
              <div
                ref={progressRef}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-0.5"
              >
                {progress.map((msg, i) => (
                  <p key={i} className="text-[11px] text-zinc-500 font-mono leading-snug">{msg}</p>
                ))}
                {!result && (
                  <p className="text-[11px] text-violet-400 font-mono animate-pulse">Working...</p>
                )}
              </div>
              {result && (
                <div className={`rounded-lg px-3 py-2.5 border text-xs ${
                  result.ok && result.installed.length > 0
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : result.ok && result.installed.length === 0
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {result.ok && result.installed.length > 0
                    ? `Installed ${result.installed.length} skill${result.installed.length !== 1 ? 's' : ''}: ${result.installed.join(', ')}`
                    : result.ok
                    ? 'No new skills installed (all may already exist)'
                    : result.error ?? 'Installation failed'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
          >
            {result?.ok ? 'Close' : 'Cancel'}
          </button>

          {stage === 'input' && (
            <button
              onClick={handleFetch}
              disabled={!repo.trim() || fetching}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              {fetching ? (
                <>
                  <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" />
                  Fetching...
                </>
              ) : (
                'Fetch skills'
              )}
            </button>
          )}

          {stage === 'select' && (
            <button
              onClick={handleInstall}
              disabled={!canInstall}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Install {selectedSkills.size > 0 && targetAgents.size > 0 ? `${selectedSkills.size} into ${targetAgents.size}` : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
