import { useState, useEffect, useCallback, useMemo } from 'react'
import { ToolSummary, Skill, AppSettings } from './types'
import Sidebar from './components/Sidebar'
import SkillDetail from './components/SkillDetail'
import Header from './components/Header'
import InstallModal from './components/InstallModal'
import Marketplace from './components/Marketplace'
import SettingsPanel from './components/SettingsPanel'
import AppNav from './components/AppNav'
import TitleBar from './components/TitleBar'
import FeedbackModal from './components/FeedbackModal'
import { ToolIcon } from './components/ToolIcon'
import { categorizeSkills } from './lib/categorize'
import { Toaster, toast } from 'sonner'
import { countBucket, durationBucket, trackTelemetry } from './lib/telemetry'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  compactSidebar: false,
  fileWatcher: true,
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
  const [filterCollection, setFilterCollection] = useState<string | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [installRepo, setInstallRepo] = useState<string | undefined>(undefined)
  const [view, setView] = useState<'skills' | 'discover'>('skills')
  const [showSettings, setShowSettings] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
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
    root.classList.add(`platform-${window.skillsAPI.platform}`)
  }, [settings.theme])

  const handleSettingsChange = (s: AppSettings) => {
    setSettings(s)
    localStorage.setItem('skills-manager-settings', JSON.stringify(s))
  }

  useEffect(() => {
    void trackTelemetry('app_opened', { architecture: window.skillsAPI.architecture })
  }, [])

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
    const startedAt = performance.now()
    try {
      const data = await window.skillsAPI.scanAll()
      setTools(data)
      void trackTelemetry('scan_completed', {
        duration: durationBucket(performance.now() - startedAt),
        connected_agents: countBucket(data.filter((tool) => tool.exists).length),
        skills: countBucket(data.reduce((sum, tool) => sum + tool.skillCount, 0)),
      })
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

  useEffect(() => {
    if (view === 'discover') void trackTelemetry('discover_opened')
  }, [view])

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
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchTool = filterTool === 'all' || s.tool === filterTool
    const matchCollection = !activeCollection || activeCollection.skillIds.includes(s.id)
    return matchSearch && matchTool && matchCollection
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

  return (
    <div className="app-shell">
      <TitleBar
        theme={settings.theme}
        sidebarOpen={sidebarOpen}
        onInstall={() => { setInstallRepo(undefined); setShowInstallModal(true) }}
        onSettings={() => setShowSettings(true)}
        onFeedback={() => setShowFeedback(true)}
        onRefresh={loadSkills}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        onThemeChange={(theme) => handleSettingsChange({ ...settings, theme })}
      />
      <div className="app-layout">
      <AppNav
        view={view}
        onViewChange={setView}
        onInstall={() => { setInstallRepo(undefined); setShowInstallModal(true) }}
        onSettings={() => setShowSettings((v) => !v)}
        onFeedback={() => setShowFeedback(true)}
        totalSkills={allSkills.length}
      />
      <section className="app-stage">
      <Header
        search={search}
        onSearch={setSearch}
        onRefresh={loadSkills}
        filterTool={filterTool}
        onFilterTool={setFilterTool}
        tools={tools}
        view={view}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
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
        <div className="workspace-frame">
          <div className="content-panel">
            <Marketplace
              onInstall={(repo) => { setInstallRepo(repo); setShowInstallModal(true) }}
            />
          </div>
        </div>
      ) : (
        <div className="workspace-frame">
          {sidebarOpen && (
            <Sidebar
              skills={filteredSkills}
              selected={selectedSkill}
              onSelect={setSelectedSkill}
              loading={loading}
              collections={tagCollections}
              filterCollection={filterCollection}
              onFilterCollection={setFilterCollection}
              compact={settings.compactSidebar}
              sidebarWidth={settings.sidebarWidth}
              favourites={favourites}
              onToggleFavourite={handleToggleFavourite}
              onToggleSidebar={() => setSidebarOpen(v => !v)}
            />
          )}
          <main className="content-panel">
            {selectedSkill ? (
              <SkillDetail
                skill={selectedSkill}
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
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      </section>
      </div>
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
            warning: '!border-zinc-500/30 !bg-zinc-500/5',
          },
        }}
      />
    </div>
  )
}

function EmptyState({ tools, loading }: { tools: ToolSummary[]; loading: boolean }) {
  if (loading) {
    return <div className="detail-loading"><i /><span>Indexing your workspace…</span></div>
  }

  const available = tools.filter((t) => t.exists)
  const missing = tools.filter((t) => !t.exists)
  const skillCount = tools.reduce((sum, tool) => sum + tool.skillCount, 0)

  return (
    <div className="library-overview">
      <div className="overview-symbol" aria-hidden="true">
        <img src="./brand/mark-dark.svg" alt="" />
      </div>
      <h1>Select a skill to get started</h1>
      <p>Review instructions, inspect templates, and manage where each skill is available.</p>
      <div className="overview-stats">
        <div><strong>{skillCount}</strong><span>skills indexed</span></div>
        <div><strong>{available.length}</strong><span>agents connected</span></div>
        <div><strong>{missing.length}</strong><span>agents available</span></div>
      </div>
      <div className="agent-rack">
        <span>Connected agents</span>
        <div>{available.map((tool) => <div key={tool.tool} title={`${tool.tool}: ${tool.skillCount} skills`}><ToolIcon tool={tool.tool} size={18} /><i>{tool.skillCount}</i></div>)}</div>
      </div>
    </div>
  )
}
