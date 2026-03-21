'use client'

import Link from 'next/link'
import { AgentIcon } from './AgentIcon'

const AGENTS = [
  'Claude Code',
  'Cursor',
  'Gemini CLI',
  'Windsurf',
  'GitHub Copilot',
  'Goose',
  'Antigravity',
  'OpenCode',
  'Kilo Code',
  'Trae',
]

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

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
