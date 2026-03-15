import { useState, useEffect, useCallback } from 'react'
import { ToolSummary, Skill } from './types'
import Sidebar from './components/Sidebar'
import SkillDetail from './components/SkillDetail'
import Header from './components/Header'
import InstallModal from './components/InstallModal'
import { ToolIcon } from './components/ToolIcon'

export default function App() {
  const [tools, setTools] = useState<ToolSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [search, setSearch] = useState('')
  const [filterTool, setFilterTool] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all')
  const [showInstallModal, setShowInstallModal] = useState(false)

  const loadSkills = useCallback(async () => {
    setLoading(true)
    try {
      const data = await window.skillsAPI.scanAll()
      setTools(data)
    } catch (err) {
      console.error('Failed to scan skills:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const allSkills = tools.flatMap((t) => t.skills)

  const filteredSkills = allSkills.filter((s) => {
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
    return matchSearch && matchTool && matchStatus
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
      const newDirName = result.newPath.split(/[\\/]/).pop() ?? ''
      const newId = `${skill.tool}::${newDirName}`
      const patch = { enabled: newEnabled, path: result.newPath, id: newId }
      setTools((prev) =>
        prev.map((t) => ({
          ...t,
          skills: t.skills.map((s) => s.id === skill.id ? { ...s, ...patch } : s),
        }))
      )
      if (selectedSkill?.id === skill.id) {
        setSelectedSkill((prev) => prev ? { ...prev, ...patch } : prev)
      }
    }
  }

  const totalEnabled = allSkills.filter((s) => s.enabled).length

  return (
    <div className="flex flex-col h-screen bg-[#0c0c0e]">
      <Header
        search={search}
        onSearch={setSearch}
        onRefresh={loadSkills}
        onInstall={() => setShowInstallModal(true)}
        totalSkills={allSkills.length}
        totalEnabled={totalEnabled}
        filterTool={filterTool}
        onFilterTool={setFilterTool}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
        tools={tools}
      />
      {showInstallModal && (
        <InstallModal
          onClose={() => setShowInstallModal(false)}
          onInstalled={() => { setShowInstallModal(false); loadSkills() }}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          skills={filteredSkills}
          selected={selectedSkill}
          onSelect={setSelectedSkill}
          loading={loading}
          onToggle={handleToggle}
        />
        <main className="flex-1 overflow-hidden">
          {selectedSkill ? (
            <SkillDetail
              skill={selectedSkill}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState tools={tools} loading={loading} />
          )}
        </main>
      </div>
    </div>
  )
}

function EmptyState({ tools, loading }: { tools: ToolSummary[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-600">Scanning skill directories...</p>
        </div>
      </div>
    )
  }

  const available = tools.filter((t) => t.exists)
  const missing = tools.filter((t) => !t.exists)

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-sm">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="font-heading text-lg text-zinc-300 mb-1">Select a skill</h2>
          <p className="text-xs text-zinc-600">
            {available.length > 0
              ? `${available.length} agent${available.length !== 1 ? 's' : ''} with skills installed`
              : 'No agent paths found on this machine'}
          </p>
        </div>

        {/* Tool status grid */}
        <div className="space-y-1.5">
          {tools.map((t) => (
            <div
              key={t.tool}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                t.exists
                  ? 'bg-zinc-900/60 border-zinc-800'
                  : 'bg-transparent border-zinc-800/50'
              }`}
            >
              <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 ${t.exists ? 'opacity-100' : 'opacity-30'}`}>
                <ToolIcon tool={t.tool} size={16} />
              </span>
              <span className={`text-xs flex-1 font-medium ${t.exists ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {t.tool}
              </span>
              {t.exists ? (
                <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700/50 tabular-nums">
                  {t.skillCount} skill{t.skillCount !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-700">not found</span>
              )}
            </div>
          ))}
        </div>

        {missing.length > 0 && (
          <p className="text-[11px] text-zinc-700 text-center mt-4">
            {missing.length} path{missing.length !== 1 ? 's' : ''} not configured on this machine
          </p>
        )}
      </div>
    </div>
  )
}
