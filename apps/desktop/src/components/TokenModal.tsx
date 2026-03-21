import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface TokenModalProps {
  onClose: () => void
}

export default function TokenModal({ onClose }: TokenModalProps) {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.skillsAPI.getGithubToken().then((t) => setToken(t))
  }, [])

  const handleSave = async () => {
    await window.skillsAPI.setGithubToken(token.trim())
    setSaved(true)
    setTimeout(onClose, 800)
  }

  const handleClear = async () => {
    await window.skillsAPI.setGithubToken('')
    setToken('')
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="6" r="3.5" stroke="#a1a1aa" strokeWidth="1.4"/>
              <path d="M10 10l4 4" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M9.5 6H12M11 4.5V7.5" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-zinc-100">GitHub Token</h2>
            <p className="text-[11px] text-zinc-500">Needed to avoid API rate limits</p>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
              Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => { setToken(e.target.value); setSaved(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 font-mono transition-colors"
            />
            <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
              Create a token at{' '}
              <button
                onClick={() => window.skillsAPI.openExternal('https://github.com/settings/tokens/new?scopes=public_repo&description=Skills+Manager')}
                className="text-zinc-400 hover:text-zinc-200 underline transition-colors"
              >
                github.com/settings/tokens
              </button>
              {' '}with <span className="text-zinc-400 font-mono">public_repo</span> scope (read-only is fine).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-zinc-800">
          {token ? (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-zinc-500 hover:text-red-400 transition-colors"
            >
              Clear token
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!token.trim() || saved}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
