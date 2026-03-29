import React, { useState, useEffect, useRef } from 'react'
import { Download, ArrowLeft, Check } from 'lucide-react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ToolIcon } from './ToolIcon'
import { DiscoveredSkill } from '../types'
import { inferSkillDirName } from '../lib/repoUtils'

interface InstallModalProps {
  onClose: () => void
  onInstalled: () => void
  defaultRepo?: string
}

type Stage = 'input' | 'select' | 'installing'

export default function InstallModal({ onClose, onInstalled, defaultRepo }: InstallModalProps) {
  const [stage, setStage] = useState<Stage>('input')
  const [repo, setRepo] = useState(defaultRepo ?? '')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const [discoveredSkills, setDiscoveredSkills] = useState<DiscoveredSkill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())

  const [agentPaths, setAgentPaths] = useState<Record<string, string>>({})
  const [targetAgents, setTargetAgents] = useState<Set<string>>(new Set())

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
    const inferredDirName = inferSkillDirName(repo.trim())
    const dirMatch = inferredDirName
      ? res.skills.find((s) => s.dirName.toLowerCase() === inferredDirName)
      : undefined
    if (dirMatch) {
      setSelectedSkills(new Set([dirMatch.dirName]))
    } else {
      setSelectedSkills(new Set(res.skills.map((s) => s.dirName)))
    }
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
    const skillsToInstall = Array.from(selectedSkills).map(dirName => {
      const skill = discoveredSkills.find(s => s.dirName === dirName)
      return { dirName, apiPath: skill!.apiPath }
    })
    const allInstalled: string[] = []
    let lastError: string | undefined
    for (const agent of targetAgents) {
      const res = await window.skillsAPI.installFromGitHub(repo.trim(), agent, skillsToInstall)
      if (res.installed.length > 0) allInstalled.push(...res.installed)
      if (!res.ok) lastError = res.error
    }
    const combined = { ok: !lastError, installed: allInstalled, error: lastError }
    setResult(combined)
    if (allInstalled.length > 0) onInstalled()
  }

  const canInstall = selectedSkills.size > 0 && targetAgents.size > 0

  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <RadixDialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden focus:outline-none"
        >
        {/* Step indicator */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-zinc-800">
          {(['input', 'select', 'installing'] as Stage[]).map((s, i) => (
            <React.Fragment key={s}>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                stage === s
                  ? 'bg-black text-white border border-zinc-700'
                  : ['installing'].includes(stage) && i < ['input','select','installing'].indexOf(stage)
                    ? 'bg-zinc-700 text-zinc-400'
                    : 'text-zinc-600'
              }`}>
                {i + 1}. {s === 'input' ? 'Repo' : s === 'select' ? 'Select' : 'Install'}
              </span>
              {i < 2 && <span className="text-zinc-800 text-[10px]">›</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          {stage === 'select' && (
            <button
              onClick={() => setStage('input')}
              className="w-6 h-6 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-600/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-zinc-100">Install from GitHub</h2>
            {stage === 'select' && (
              <p className="text-[11px] text-zinc-500 truncate">{repo}</p>
            )}
          </div>
          <RadixDialog.Close asChild>
            <button className="w-6 h-6 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </RadixDialog.Close>
        </div>

        <div className="p-5 space-y-4">
          {/* Input stage */}
          {stage === 'input' && (
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
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 disabled:opacity-50 transition-colors"
              />
              <p className="text-[11px] text-zinc-600 mt-1">
                e.g. <span className="text-zinc-500 font-mono">vercel-labs/agent-skills</span>
              </p>
              {fetchError && (
                <p className="text-[11px] text-red-400 mt-1.5">{fetchError}</p>
              )}
            </div>
          )}

          {/* Select stage */}
          {stage === 'select' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                    Skills <span className="text-violet-400 normal-case font-normal">{selectedSkills.size}/{discoveredSkills.length}</span>
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
                <div className="space-y-1 max-h-44 min-h-16 overflow-y-auto">
                  {discoveredSkills.map((skill) => {
                    const checked = selectedSkills.has(skill.dirName)
                    return (
                      <button
                        key={skill.dirName}
                        onClick={() => toggleSkill(skill.dirName)}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 rounded border text-left transition-colors ${
                          checked
                            ? 'bg-violet-600/10 border-violet-600/20'
                            : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                          checked ? 'bg-violet-600 border-violet-600' : 'border-zinc-600'
                        }`}>
                          {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={`text-xs font-medium block truncate ${checked ? 'text-zinc-100' : 'text-zinc-400'}`}>
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

              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-2">
                  Install into
                  {targetAgents.size > 0 && (
                    <span className="ml-1.5 text-violet-400 normal-case font-normal">{targetAgents.size} selected</span>
                  )}
                </label>
                {Object.keys(agentPaths).length === 0 ? (
                  <p className="text-[11px] text-zinc-600 italic">No agent paths configured</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.keys(agentPaths).map((agent) => (
                      <button
                        key={agent}
                        onClick={() => toggleAgent(agent)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] transition-colors text-left ${
                          targetAgents.has(agent)
                            ? 'bg-violet-600/10 border-violet-600/25 text-zinc-100'
                            : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <ToolIcon tool={agent} size={11} />
                        <span className="truncate">{agent}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Installing stage */}
          {stage === 'installing' && (
            <>
              <div
                ref={progressRef}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-0.5 font-mono"
              >
                {progress.map((msg, i) => (
                  <p key={i} className="text-[11px] text-zinc-500 leading-snug">{msg}</p>
                ))}
                {!result && (
                  <p className="text-[11px] text-violet-400 animate-pulse">Working...</p>
                )}
              </div>
              {result && (
                <div className={`rounded-lg px-3 py-2.5 border text-xs ${
                  result.ok && result.installed.length > 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
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
        <div className="border-t border-zinc-800">
          <div className="flex items-center justify-end gap-2 px-5 py-3">
            <RadixDialog.Close asChild>
              <button className="text-xs px-3 py-1.5 rounded font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-colors">
                {result?.ok ? 'Close' : 'Cancel'}
              </button>
            </RadixDialog.Close>

            {stage === 'input' && (
              <button
                onClick={handleFetch}
                disabled={!repo.trim() || fetching}
                className="text-xs px-3 py-1.5 rounded font-medium bg-black text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 border border-zinc-700"
              >
                {fetching ? (
                  <>
                    <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : 'Fetch skills'}
              </button>
            )}

            {stage === 'select' && (
              <button
                onClick={handleInstall}
                disabled={!canInstall}
                className="text-xs px-3 py-1.5 rounded font-medium bg-black text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 border border-zinc-700"
              >
                <Download className="w-3 h-3" />
                Install {selectedSkills.size > 0 && targetAgents.size > 0 ? `${selectedSkills.size} into ${targetAgents.size}` : ''}
              </button>
            )}
          </div>
          {stage === 'select' && !canInstall && (
            <p className="text-[10px] text-zinc-600 text-center pb-2">
              Select at least one skill and one agent to install
            </p>
          )}
        </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
