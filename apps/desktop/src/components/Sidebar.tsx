import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, FileCode2, FolderClosed, Library, PanelLeftClose, Star } from 'lucide-react'
import { Collection, Skill } from '../types'
import { ToolIcon } from './ToolIcon'

interface SidebarProps {
  skills: Skill[]; selected: Skill | null; onSelect: (s: Skill | null) => void
  loading: boolean; collections: Collection[]
  filterCollection: string | null; onFilterCollection: (id: string | null) => void
  compact?: boolean; sidebarWidth?: 'sm' | 'md' | 'lg'; favourites: Set<string>
  onToggleFavourite: (skillId: string) => void; onToggleSidebar: () => void
}

export default function Sidebar({
  skills, selected, onSelect, loading, collections, filterCollection,
  onFilterCollection, compact, sidebarWidth = 'md', favourites,
  onToggleFavourite, onToggleSidebar,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showAllCollections, setShowAllCollections] = useState(false)
  const grouped = useMemo(() => skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    ;(acc[skill.tool] ??= []).push(skill)
    return acc
  }, {}), [skills])
  const width = sidebarWidth === 'sm' ? 'w-52' : sidebarWidth === 'lg' ? 'w-80' : 'w-64'
  const visibleCollections = showAllCollections ? collections : collections.slice(0, 4)

  return <aside className={`library-sidebar ${width}`}>
    <div className="sidebar-heading">
      <div><span>Browse</span><strong>{skills.length}</strong></div>
      <button onClick={onToggleSidebar} title="Hide skills sidebar" aria-label="Hide skills sidebar"><PanelLeftClose size={15} /></button>
    </div>
    <div className="sidebar-nav">
      <button className={!filterCollection ? 'active' : ''} onClick={() => onFilterCollection(null)}><Library size={14} /><span>All skills</span><small>{skills.length}</small></button>
      <div className="sidebar-section-title"><span>Collections</span>{collections.length > 4 && <button onClick={() => setShowAllCollections((v) => !v)}>{showAllCollections ? 'Less' : 'More'}</button>}</div>
      {visibleCollections.map((collection) => <button key={collection.id} className={filterCollection === collection.id ? 'active' : ''} onClick={() => onFilterCollection(filterCollection === collection.id ? null : collection.id)}>
        {collection.id === '__starred__' ? <Star size={13} fill="currentColor" /> : <FolderClosed size={13} />}
        <span>{collection.name}</span><small>{collection.skillIds.length}</small>
      </button>)}
    </div>
    <div className="sidebar-section-title agents-title"><span>Agents</span><small>{Object.keys(grouped).length}</small></div>
    <div className="sidebar-scroll">
      {loading ? <LoadingRows /> : skills.length === 0 ? <div className="sidebar-empty"><FileCode2 size={20} /><span>No skills match this view</span></div> : Object.entries(grouped).map(([tool, toolSkills]) => {
        const isCollapsed = collapsed[tool] === true
        return <section className="agent-group" key={tool}>
          <button className="agent-heading" onClick={() => setCollapsed((v) => ({ ...v, [tool]: !isCollapsed }))}>
            <span className="agent-icon"><ToolIcon tool={tool} size={15} /></span><strong>{tool}</strong><span>{toolSkills.length}</span>{isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
          {!isCollapsed && <div className="skill-list">{toolSkills.map((skill) => <button key={skill.id} className={`skill-row ${selected?.id === skill.id ? 'selected' : ''} ${compact ? 'compact' : ''}`} onClick={() => onSelect(skill)}>
            <span className="skill-row-copy">
              <strong>{skill.name}</strong>
              {getSkillSubtitle(skill) && <small>{getSkillSubtitle(skill)}</small>}
            </span>
            {skill.hasTemplates && <span className="template-count">{skill.templateCount}</span>}
            <span role="button" tabIndex={0} className={`star-action ${favourites.has(skill.id) ? 'starred' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFavourite(skill.id) }}><Star size={12} fill={favourites.has(skill.id) ? 'currentColor' : 'none'} /></span>
          </button>)}</div>}
        </section>
      })}
    </div>
  </aside>
}

function getSkillSubtitle(skill: Skill): string {
  const subtitle = (skill.domain || skill.description || '').trim()
  return subtitle.toLowerCase() === skill.name.trim().toLowerCase() ? '' : subtitle
}

function LoadingRows() {
  return <div className="loading-rows">{Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ width: `${92 - (i % 3) * 12}%` }} />)}</div>
}
