import * as RadixDialog from '@radix-ui/react-dialog'
import { ExternalLink, Moon, Sun, X } from 'lucide-react'
import { AppSettings } from '../types'
import { Switch } from './ui/Switch'
import { APP_VERSION } from '../lib/appVersion'

interface SettingsPanelProps {
  settings: AppSettings
  onChange: (s: AppSettings) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const set = (patch: Partial<AppSettings>) => onChange({ ...settings, ...patch })

  return (
    <RadixDialog.Root open onOpenChange={(o) => !o && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="app-overlay fixed inset-0 z-50 bg-black/40" />
        <RadixDialog.Content
          className="app-dialog settings-dialog fixed right-0 top-0 z-50 h-full w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl focus:outline-none"
        >
        <div className="settings-header">
          <span>Settings</span>
          <RadixDialog.Close asChild>
            <button className="settings-close" aria-label="Close settings"><X size={15} /></button>
          </RadixDialog.Close>
        </div>

        <div className="settings-body">
          {/* Appearance */}
          <section>
            <p className="settings-section-title">Appearance</p>

            {/* Theme */}
            <div className="mb-4">
              <p className="settings-label">Theme</p>
              <div className="settings-choice-grid two">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => set({ theme: t })}
                    className={`settings-choice theme-choice ${settings.theme === t ? 'selected' : ''}`}
                  >
                    {t === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar width */}
            <div className="mb-4">
              <p className="settings-label">Sidebar width</p>
              <div className="settings-choice-grid three">
                {(['sm', 'md', 'lg'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => set({ sidebarWidth: w })}
                    className={`settings-choice ${settings.sidebarWidth === w ? 'selected' : ''}`}
                  >
                    {w === 'sm' ? 'Narrow' : w === 'lg' ? 'Wide' : 'Default'}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSetting
              label="Compact sidebar"
              description="Reduce padding on skill items"
              value={settings.compactSidebar}
              onChange={(v) => set({ compactSidebar: v })}
            />

            <div className="mt-3">
              <ToggleSetting
                label="Show version badges"
                description="Display version number on skills"
                value={settings.showVersionBadge}
                onChange={(v) => set({ showVersionBadge: v })}
              />
            </div>
          </section>

          {/* Behavior */}
          <section>
            <p className="settings-section-title">Behavior</p>

            <ToggleSetting
              label="File watcher"
              description="Auto-reload when files change on disk"
              value={settings.fileWatcher}
              onChange={(v) => set({ fileWatcher: v })}
            />

            <div className="mt-3">
              <ToggleSetting
                label="Confirm before delete"
                description="Ask for confirmation when deleting a skill"
                value={settings.confirmDelete}
                onChange={(v) => set({ confirmDelete: v })}
              />
            </div>
          </section>

          <section>
            <p className="settings-section-title">About</p>
            <div className="settings-about"><span>Skills Manager</span><span>v{APP_VERSION}</span></div>
            <button className="settings-creator" onClick={() => window.skillsAPI.openExternal('https://idoevergreen.me')}>
              Built by ido evergreen <ExternalLink size={11} />
            </button>
          </section>
        </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

function ToggleSetting({
  label, description, value, onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="settings-toggle-row">
      <div className="min-w-0">
        <p>{label}</p>
        <small>{description}</small>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
