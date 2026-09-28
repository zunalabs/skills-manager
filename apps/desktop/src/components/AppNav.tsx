import { Compass, Heart, Library, MessageSquare, Plus, Settings2 } from 'lucide-react'
import { APP_VERSION } from '../lib/appVersion'

interface AppNavProps {
  view: 'skills' | 'discover'
  onViewChange: (view: 'skills' | 'discover') => void
  onInstall: () => void
  onSettings: () => void
  onFeedback: () => void
  totalSkills: number
}

export default function AppNav({
  view, onViewChange, onInstall, onSettings, onFeedback, totalSkills,
}: AppNavProps) {
  const openUrl = (url: string) => window.skillsAPI.openExternal(url)

  return (
    <aside className="app-nav">
      <div className="app-nav-brand">
        <div className="app-nav-logo" aria-hidden="true">
          <img src="./brand/mark-dark.svg" alt="" />
        </div>
        <div><strong>Skills Manager</strong></div>
      </div>

      <button className="nav-install" onClick={onInstall}><Plus size={15} /> Add skill</button>

      <nav className="app-nav-links" aria-label="Main navigation">
        <button className={view === 'skills' ? 'active' : ''} onClick={() => onViewChange('skills')}>
          <Library size={15} /><span>Skills</span><small>{totalSkills}</small>
        </button>
        <button className={view === 'discover' ? 'active' : ''} onClick={() => onViewChange('discover')}>
          <Compass size={15} /><span>Discover</span>
        </button>
      </nav>

      <div className="app-nav-footer">
        <button onClick={onSettings}><Settings2 size={15} /><span>Settings</span></button>
        <button onClick={onFeedback}><MessageSquare size={15} /><span>Send feedback</span></button>
        <button onClick={() => openUrl('https://github.com/sponsors/evergreenx')}><Heart size={15} /><span>Sponsor</span></button>
        <button className="nav-creator" onClick={() => openUrl('https://idoevergreen.me')}>
          <span>Built by ido evergreen</span><small>v{APP_VERSION}</small>
        </button>
      </div>
    </aside>
  )
}
