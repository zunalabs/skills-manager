import { useState, useEffect, useCallback, useMemo } from 'react'
import { ToolSummary, Skill, AppSettings } from './types'
import Sidebar from './components/Sidebar'
import SkillDetail from './components/SkillDetail'
import Header from './components/Header'
import InstallModal from './components/InstallModal'
import Marketplace from './components/Marketplace'
import SettingsPanel from './components/SettingsPanel'
import { ToolIcon } from './components/ToolIcon'
import { categorizeSkills } from './lib/categorize'
import { Toaster, toast } from 'sonner'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  compactSidebar: false,
  fileWatcher: true,
  showDisabled: true,
  sidebarWidth: 'md',
  confirmDelete: true,
  showVersionBadge: true,
}

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('skills-manager-settings')
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch {}
  return DEFAULT_SETTINGS
}

export default function App() {
  const [tools, setTools] = useState<ToolSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [search, setSearch] = useState('')
  const [filterTool, setFilterTool] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all')
  const [filterCollection, setFilterCollection] = useState<string | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [installRepo, setInstallRepo] = useState<string | undefined>(undefined)
  const [view, setView] = useState<'skills' | 'discover'>('skills')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [favourites, setFavourites] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('skills-manager-favourites') ?? '[]'))
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(settings.theme)
  }, [settings.theme])

  const handleSettingsChange = (s: AppSettings) => {
    setSettings(s)
    localStorage.setItem('skills-manager-settings', JSON.stringify(s))
  }

  const handleToggleFavourite = (skillId: string) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      const isStarred = next.has(skillId)
      if (isStarred) {
        next.delete(skillId)
        toast.success('Removed from starred')
      } else {
        next.add(skillId)
        toast.success('Added to starred')
      }
      localStorage.setItem('skills-manager-favourites', JSON.stringify([...next]))
      return next
    })
  }

  const loadSkills = useCallback(async () => {
    setLoading(true)
    try {
      const data = await window.skillsAPI.scanAll()
      setTools(data)
    } catch (err) {
      console.error('Failed to scan skills:', err)
      toast.error('Failed to scan skill directories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  // Re-scan when files change on disk (respects fileWatcher setting)
  useEffect(() => {
    if (!settings.fileWatcher) return
    return window.skillsAPI.onSkillsChanged(() => loadSkills())
  }, [loadSkills, settings.fileWatcher])

  const allSkills = tools.flatMap((t) => t.skills)

  // Derive collections by analyzing skill content (name, description, domain, keywords)
  const tagCollections = useMemo(() => {
    const cats = categorizeSkills(allSkills)
    if (favourites.size > 0) {
      return [
        { id: '__starred__', name: 'Starred', skillIds: allSkills.filter(s => favourites.has(s.id)).map(s => s.id) },
        ...cats,
      ]
    }
    return cats
  }, [allSkills, favourites])

  const activeCollection = tagCollections.find((c) => c.id === filterCollection) ?? null

  const filteredSkills = allSkills.filter((s) => {
    // If user explicitly filters for disabled, show them regardless of settings.showDisabled
    if (filterStatus !== 'disabled' && !settings.showDisabled && !s.enabled) return false
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchTool = filterTool === 'all' || s.tool === filterTool
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'enabled' && s.enabled) ||
      (filterStatus === 'disabled' && !s.enabled)
    const matchCollection = !activeCollection || activeCollection.skillIds.includes(s.id)
    return matchSearch && matchTool && matchStatus && matchCollection
  })

  const handleDelete = (skill: Skill) => {
    setTools((prev) =>
      prev.map((t) => ({
        ...t,
        skills: t.skills.filter((s) => s.id !== skill.id),
        skillCount: t.tool === skill.tool ? t.skillCount - 1 : t.skillCount,
      }))
    )
    if (selectedSkill?.id === skill.id) setSelectedSkill(null)
  }

  const handleToggle = async (skill: Skill) => {
    const newEnabled = !skill.enabled
    const result = await window.skillsAPI.toggle(skill.path, newEnabled)
    if (result.ok) {
      const patch = { enabled: newEnabled, path: result.newPath }
      setTools((prev) =>
        prev.map((t) => ({
          ...t,
          skills: t.skills.map((s) => s.id === skill.id ? { ...s, ...patch } : s),
        }))
      )
          if (selectedSkill?.id === skill.id) {
            setSelectedSkill((prev) => prev ? { ...prev, ...patch } : prev)
          }
          toast.success(`Skill ${newEnabled ? 'enabled' : 'disabled'}`)
        } else {
          console.error('Toggle failed for', skill.path, (result as any).error)
          toast.error(`Failed to toggle skill: ${(result as any).error || 'Unknown error'}`)
        }
  }

  const totalEnabled = allSkills.filter((s) => s.enabled).length

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <Header
        search={search}
        onSearch={setSearch}
        onRefresh={loadSkills}
        onInstall={() => { setInstallRepo(undefined); setShowInstallModal(true) }}
        totalSkills={allSkills.length}
        totalEnabled={totalEnabled}
        filterTool={filterTool}
        onFilterTool={setFilterTool}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
        tools={tools}
        view={view}
        onViewChange={setView}
        onSettings={() => setShowSettings((v) => !v)}
      />
      {showInstallModal && (
        <InstallModal
          onClose={() => { setShowInstallModal(false); setInstallRepo(undefined) }}
          onInstalled={() => { setShowInstallModal(false); setInstallRepo(undefined); loadSkills() }}
          defaultRepo={installRepo}
        />
      )}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
      {view === 'discover' ? (
        <div className="flex flex-1 overflow-hidden p-2">
          <div className="flex-1 overflow-hidden rounded-lg border border-zinc-800">
            <Marketplace
              onInstall={(repo) => { setInstallRepo(repo); setShowInstallModal(true) }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden p-2 gap-2">
          {sidebarOpen && (
            <Sidebar
              skills={filteredSkills}
              selected={selectedSkill}
              onSelect={setSelectedSkill}
              loading={loading}
              onToggle={handleToggle}
              collections={tagCollections}
              filterCollection={filterCollection}
              onFilterCollection={setFilterCollection}
              compact={settings.compactSidebar}
              sidebarWidth={settings.sidebarWidth}
              favourites={favourites}
              onToggleFavourite={handleToggleFavourite}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(v => !v)}
            />
          )}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex-shrink-0 w-6 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors"
              title="Show sidebar"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <main className="flex-1 overflow-hidden rounded-lg border border-zinc-800">
            {selectedSkill ? (
              <SkillDetail
                skill={selectedSkill}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isFavourite={favourites.has(selectedSkill?.id ?? '')}
                onToggleFavourite={() => handleToggleFavourite(selectedSkill!.id)}
                requireConfirmDelete={settings.confirmDelete}
                showVersionBadge={settings.showVersionBadge}
              />
            ) : (
              <EmptyState tools={tools} loading={loading} />
            )}
          </main>
        </div>
      )}
      <Toaster
        richColors
        closeButton
        position="bottom-right"
        theme={settings.theme}
        toastOptions={{
          className: 'sonner-toast',
          classNames: {
            toast: 'group !bg-zinc-900/80 !backdrop-blur-xl !border-zinc-800 !shadow-2xl !rounded-xl !p-4 !flex !items-start !gap-3 !w-full !max-w-[320px]',
            title: '!text-zinc-100 !font-medium !text-xs !leading-tight',
            description: '!text-zinc-500 !text-[11px] !mt-1 !leading-normal',
            closeButton: '!bg-zinc-800 !border-zinc-700 !text-zinc-400 hover:!bg-zinc-700 hover:!text-zinc-200 !transition-colors',
            error: '!border-red-500/30 !bg-red-500/5',
            success: '!border-emerald-500/30 !bg-emerald-500/5',
            warning: '!border-amber-500/30 !bg-amber-500/5',
          },
        }}
      />
    </div>
  )
}

function EmptyState({ tools, loading }: { tools: ToolSummary[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-600">Scanning skill directories…</p>
        </div>
      </div>
    )
  }

  const available = tools.filter((t) => t.exists)
  const missing = tools.filter((t) => !t.exists)

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-xs">
        <div className="text-center mb-6">
          <h2 className="font-heading text-base text-zinc-300 mb-1">Select a skill</h2>
          <p className="text-xs text-zinc-600">
            {available.length > 0
              ? `${available.length} agent${available.length !== 1 ? 's' : ''} with skills installed`
              : 'No agent paths found on this machine'}
          </p>
        </div>

        <div className="space-y-1">
          {tools.map((t) => (
            <div
              key={t.tool}
              className={`flex items-center gap-3 px-3 py-2.5 rounded border ${
                t.exists ? 'bg-zinc-900 border-zinc-800' : 'bg-transparent border-zinc-800/40'
              }`}
            >
              <span className={`flex-shrink-0 ${t.exists ? 'text-zinc-400' : 'text-zinc-700'}`}>
                <ToolIcon tool={t.tool} size={14} />
              </span>
              <span className={`text-xs flex-1 font-medium ${t.exists ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {t.tool}
              </span>
              {t.exists ? (
                <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full tabular-nums">
                  {t.skillCount} skill{t.skillCount !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-700">not found</span>
              )}
            </div>
          ))}
        </div>

        {missing.length > 0 && (
          <p className="text-[11px] text-zinc-500 text-center mt-4">
            {missing.length} path{missing.length !== 1 ? 's' : ''} not configured
          </p>
        )}
      </div>
    </div>
  )
}
