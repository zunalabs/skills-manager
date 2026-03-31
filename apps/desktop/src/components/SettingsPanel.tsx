import * as RadixDialog from '@radix-ui/react-dialog'
import { AppSettings } from '../types'
import { Switch } from './ui/Switch'

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
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <RadixDialog.Content
          className="fixed right-0 top-0 z-50 h-full w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl focus:outline-none"
        >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="text-sm font-medium text-zinc-200">Settings</span>
          <RadixDialog.Close asChild>
            <button className="w-6 h-6 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </RadixDialog.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Appearance */}
          <section>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Appearance</p>

            {/* Theme */}
            <div className="mb-4">
              <p className="text-xs text-zinc-300 mb-2">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => set({ theme: t })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                      settings.theme === t
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {t === 'dark' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar width */}
            <div className="mb-4">
              <p className="text-xs text-zinc-300 mb-2">Sidebar width</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['sm', 'md', 'lg'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => set({ sidebarWidth: w })}
                    className={`py-1.5 rounded-md border text-xs font-medium transition-all ${
                      settings.sidebarWidth === w
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
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
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Behavior</p>

            <ToggleSetting
              label="File watcher"
              description="Auto-reload when files change on disk"
              value={settings.fileWatcher}
              onChange={(v) => set({ fileWatcher: v })}
            />

            <div className="mt-3">
              <ToggleSetting
                label="Show disabled skills"
                description="Include disabled skills in the list"
                value={settings.showDisabled}
                onChange={(v) => set({ showDisabled: v })}
              />
            </div>

            <div className="mt-3">
              <ToggleSetting
                label="Confirm before delete"
                description="Ask for confirmation when deleting a skill"
                value={settings.confirmDelete}
                onChange={(v) => set({ confirmDelete: v })}
              />
            </div>
          </section>

          {/* About */}
          <section>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">About</p>
            <div className="space-y-2 text-xs text-zinc-500">
              <div className="flex justify-between">
                <span>Skills Manager</span>
                <span className="text-zinc-600">v0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Made by</span>
                <button
                  onClick={() => window.skillsAPI.openExternal('https://github.com/zunalabs')}
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Zunalabs
                </button>
              </div>
            </div>
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
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-zinc-300">{label}</p>
        <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">{description}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
