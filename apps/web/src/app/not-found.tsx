'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AgentIcon } from './AgentIcon'

type OS = 'windows' | 'linux' | 'mac' | null

function useDetectedOS(): OS {
  const [os, setOS] = useState<OS>(null)
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('win')) setOS('windows')
    else if (ua.includes('linux')) setOS('linux')
    else if (ua.includes('mac')) setOS('mac')
  }, [])
  return os
}

const WindowsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 88 88" fill="currentColor" aria-hidden>
    <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.066 41.344-47.318-6.63-.066-34.893z"/>
  </svg>
)

const LinuxIcon = () => (
  <svg viewBox="0 0 48 48" width="15" height="15" fill="currentColor" aria-hidden>
    <path d="M24 2C14 2 10 10 10 17c0 4 1.5 7.5 4 10l-2 4c-1 2-3 3-5 4v2c3 0 6-1 8-3l1-1c1 1 3 2 8 2s7-1 8-2l1 1c2 2 5 3 8 3v-2c-2-1-4-2-5-4l-2-4c2.5-2.5 4-6 4-10C38 10 34 2 24 2zm-4 28c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2zm8 0c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
  </svg>
)

function DownloadButton({ os }: { os: OS }) {
  if (!os) return null

  if (os === 'mac') {
    return (
      <p className="text-[#858585] text-xs">
        macOS coming soon —{' '}
        <a href="https://github.com/zunalabs/skills-manager" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
          follow on GitHub
        </a>
      </p>
    )
  }

  const platform = os === 'linux' ? 'linux' : 'windows'
  const label = os === 'linux' ? 'Download for Linux' : 'Download for Windows'
  const icon = os === 'linux' ? <LinuxIcon /> : <WindowsIcon />

  return (
    <a
      href={`/api/download?platform=${platform}`}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition-colors"
    >
      {icon}
      {label}
    </a>
  )
}

// Deterministic positions/animations so they don't shift on hydration
const FLOATERS = [
  { agent: 'Claude Code',    top: '8%',  left: '6%',   size: 32, dur: 7,  delay: 0,   opacity: 0.25 },
  { agent: 'Cursor',         top: '15%', left: '82%',  size: 28, dur: 9,  delay: 1.2, opacity: 0.2  },
  { agent: 'Gemini CLI',     top: '72%', left: '10%',  size: 30, dur: 8,  delay: 0.6, opacity: 0.22 },
  { agent: 'Windsurf',       top: '78%', left: '78%',  size: 36, dur: 11, delay: 2,   opacity: 0.18 },
  { agent: 'GitHub Copilot', top: '40%', left: '4%',   size: 24, dur: 6,  delay: 0.3, opacity: 0.2  },
  { agent: 'Antigravity',    top: '55%', left: '88%',  size: 34, dur: 10, delay: 1.8, opacity: 0.22 },
  { agent: 'OpenCode',       top: '88%', left: '50%',  size: 26, dur: 8,  delay: 0.9, opacity: 0.18 },
  { agent: 'Kilo Code',      top: '5%',  left: '50%',  size: 22, dur: 7,  delay: 2.5, opacity: 0.2  },
  { agent: 'Trae',           top: '30%', left: '92%',  size: 28, dur: 9,  delay: 1.5, opacity: 0.18 },
  { agent: 'Cursor',         top: '62%', left: '2%',   size: 20, dur: 6,  delay: 3,   opacity: 0.15 },
  { agent: 'Claude Code',    top: '92%', left: '22%',  size: 26, dur: 8,  delay: 0.4, opacity: 0.15 },
  { agent: 'Gemini CLI',     top: '20%', left: '28%',  size: 18, dur: 7,  delay: 1,   opacity: 0.12 },
]

export default function NotFound() {
  const os = useDetectedOS()

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden select-none"
      style={{ background: '#0a0908', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Floating agent logos */}
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: f.top,
            left: f.left,
            opacity: f.opacity,
            animation: `float ${f.dur}s ease-in-out ${f.delay}s infinite alternate`,
          }}
        >
          <AgentIcon agent={f.agent} size={f.size} />
        </div>
      ))}

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(-3deg); }
          to   { transform: translateY(-18px) rotate(3deg); }
        }
      `}</style>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Ghost 404 */}
        <div className="relative mb-6">
          <p
            className="text-[110px] sm:text-[140px] font-black leading-none text-white"
            style={{
              WebkitTextStroke: '2px rgba(255,255,255,0.6)',
              letterSpacing: '-0.05em',
              textShadow: '0 0 60px rgba(139,92,246,0.25)',
            }}
          >
            404
          </p>
        </div>

        <p className="text-[11px] font-semibold tracking-widest text-violet-500/60 uppercase mb-3">
          skill not found
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          This page went to{' '}
          <code className="text-violet-400 font-mono text-xl sm:text-2xl">.disabled/</code>
        </h1>
        <p className="text-[#858585] text-sm mb-10 max-w-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist. Maybe it was deleted, or
          the URL was mistyped.
        </p>

        <div className="flex flex-col items-center gap-3">
          <DownloadButton os={os} />
          <Link href="/" className="text-sm text-[#858585] hover:text-white transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
