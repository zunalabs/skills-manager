import { useEffect, useRef, useState } from 'react'
import { Minus, Square, X } from 'lucide-react'

interface TitleBarProps {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  onInstall: () => void
  onSettings: () => void
  onFeedback: () => void
  onRefresh: () => void
  onToggleSidebar: () => void
  onThemeChange: (theme: 'dark' | 'light') => void
}

type MenuName = 'File' | 'Edit' | 'View' | 'Window' | 'Help'

export default function TitleBar({
  theme, sidebarOpen, onInstall, onSettings, onFeedback, onRefresh, onToggleSidebar, onThemeChange,
}: TitleBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpenMenu(null)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const key = event.key.toLowerCase()
      if (key === 'n') { event.preventDefault(); onInstall() }
      if (key === ',') { event.preventDefault(); onSettings() }
      if (key === 'r') { event.preventDefault(); onRefresh() }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [onInstall, onRefresh, onSettings])

  const run = (action: () => void | Promise<unknown>) => {
    setOpenMenu(null)
    void action()
  }

  const edit = (action: 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'selectAll') =>
    run(() => window.skillsAPI.editAction(action))

  return (
    <div className="window-titlebar" ref={barRef} onDoubleClick={() => void window.skillsAPI.windowControl('maximize')}>
      <nav className="window-menu" aria-label="Application menu" onDoubleClick={(event) => event.stopPropagation()}>
        <Menu label="File" open={openMenu === 'File'} onToggle={() => setOpenMenu(openMenu === 'File' ? null : 'File')}>
          <MenuItem label="Add skill" shortcut="Ctrl+N" onClick={() => run(onInstall)} />
          <MenuItem label="Settings" shortcut="Ctrl+," onClick={() => run(onSettings)} />
          <MenuDivider />
          <MenuItem label="Close" shortcut="Alt+F4" onClick={() => run(() => window.skillsAPI.windowControl('close'))} />
        </Menu>
        <Menu label="Edit" open={openMenu === 'Edit'} onToggle={() => setOpenMenu(openMenu === 'Edit' ? null : 'Edit')}>
          <MenuItem label="Undo" shortcut="Ctrl+Z" onClick={() => edit('undo')} />
          <MenuItem label="Redo" shortcut="Ctrl+Y" onClick={() => edit('redo')} />
          <MenuDivider />
          <MenuItem label="Cut" shortcut="Ctrl+X" onClick={() => edit('cut')} />
          <MenuItem label="Copy" shortcut="Ctrl+C" onClick={() => edit('copy')} />
          <MenuItem label="Paste" shortcut="Ctrl+V" onClick={() => edit('paste')} />
          <MenuItem label="Select all" shortcut="Ctrl+A" onClick={() => edit('selectAll')} />
        </Menu>
        <Menu label="View" open={openMenu === 'View'} onToggle={() => setOpenMenu(openMenu === 'View' ? null : 'View')}>
          <MenuItem label="Scan for changes" shortcut="Ctrl+R" onClick={() => run(onRefresh)} />
          <MenuItem label={sidebarOpen ? 'Hide skills sidebar' : 'Show skills sidebar'} onClick={() => run(onToggleSidebar)} />
          <MenuDivider />
          <MenuItem label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={() => run(() => onThemeChange(theme === 'dark' ? 'light' : 'dark'))} />
        </Menu>
        <Menu label="Window" open={openMenu === 'Window'} onToggle={() => setOpenMenu(openMenu === 'Window' ? null : 'Window')}>
          <MenuItem label="Minimize" onClick={() => run(() => window.skillsAPI.windowControl('minimize'))} />
          <MenuItem label="Maximize or restore" onClick={() => run(() => window.skillsAPI.windowControl('maximize'))} />
        </Menu>
        <Menu label="Help" open={openMenu === 'Help'} onToggle={() => setOpenMenu(openMenu === 'Help' ? null : 'Help')}>
          <MenuItem label="Documentation" onClick={() => run(() => window.skillsAPI.openExternal('https://github.com/zunalabs/skills-manager'))} />
          <MenuItem label="GitHub repository" onClick={() => run(() => window.skillsAPI.openExternal('https://github.com/zunalabs/skills-manager'))} />
          <MenuDivider />
          <MenuItem label="Send feedback" onClick={() => run(onFeedback)} />
          <MenuItem label="Sponsor Skills Manager" onClick={() => run(() => window.skillsAPI.openExternal('https://github.com/sponsors/evergreenx'))} />
          <MenuDivider />
          <MenuItem label="Privacy" onClick={() => run(() => window.skillsAPI.openExternal('https://sm.idoevergreen.me/privacy'))} />
          <MenuItem label="Terms" onClick={() => run(() => window.skillsAPI.openExternal('https://sm.idoevergreen.me/terms'))} />
        </Menu>
      </nav>

      <div className="window-drag-region" />
      <div className="window-controls" onDoubleClick={(event) => event.stopPropagation()}>
        <button onClick={() => void window.skillsAPI.windowControl('minimize')} aria-label="Minimize"><Minus size={15} /></button>
        <button onClick={() => void window.skillsAPI.windowControl('maximize')} aria-label="Maximize or restore"><Square size={12} /></button>
        <button className="close" onClick={() => void window.skillsAPI.windowControl('close')} aria-label="Close"><X size={15} /></button>
      </div>
    </div>
  )
}

function Menu({ label, open, onToggle, children }: { label: MenuName; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="window-menu-group">
      <button className={open ? 'active' : ''} onClick={onToggle}>{label}</button>
      {open && <div className="window-menu-popover">{children}</div>}
    </div>
  )
}

function MenuItem({ label, shortcut, onClick }: { label: string; shortcut?: string; onClick: () => void }) {
  return <button className="window-menu-item" onClick={onClick}><span>{label}</span>{shortcut && <kbd>{shortcut}</kbd>}</button>
}

function MenuDivider() {
  return <div className="window-menu-divider" />
}
