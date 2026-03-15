'use client'

import { useState } from 'react'

const items = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    q: 'What are skills?',
    a: (
      <>
        Skills are reusable instruction sets that extend what an AI coding agent can do. They're
        typically markdown or text files that tell the agent how to handle specific tasks — things
        like enforcing a commit message format, following a project's code style, or running a
        custom workflow. Each agent has its own name for them: Claude Code calls them{' '}
        <span className="text-white font-mono text-xs border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          /skills
        </span>
        , Cursor has Rules, Copilot has Instructions — but they're all the same idea.
      </>
    ),
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M10 2a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3.5 5.5V15a.5.5 0 0 1-.5.5h-4A.5.5 0 0 1 7.5 15v-1.5C5.5 12.5 4 10.5 4 8a6 6 0 0 1 6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.5 17.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    q: 'What inspired this?',
    a: "The AI coding agent space exploded fast. Within months there were a dozen agents, each with their own way of storing and loading skills. Moving between agents meant re-doing all your configuration from scratch, and discovering good community-built skills meant digging through GitHub manually. Skills Manager was built to fix that friction — one app that speaks every agent's language, so your knowledge travels with you no matter which tool you're using that day.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9V6.5a3 3 0 1 1 6 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    q: 'Is it free?',
    a: 'Yes. Skills Manager is fully open source under the MIT license. No accounts, no telemetry, no paywalls — ever.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="12" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="12" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    q: 'Which agents are supported?',
    a: 'Currently: Claude Code, Cursor, Gemini CLI, Windsurf, GitHub Copilot, Goose, OpenAI Codex, OpenCode, Kilo Code, Trae, and Antigravity. New agents are added as they gain traction — contributions welcome.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className="rounded-2xl border transition-colors duration-200"
            style={{
              borderColor: isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
              background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
            >
              {/* Icon badge */}
              <span
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200"
                style={{
                  background: isOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  color: isOpen ? '#ffffff' : '#52525b',
                }}
              >
                {item.icon}
              </span>

              <span
                className="flex-1 font-medium transition-colors duration-200 text-[0.9375rem]"
                style={{ color: isOpen ? '#ffffff' : '#a1a1aa' }}
              >
                {item.q}
              </span>

              {/* Chevron */}
              <span
                className="shrink-0 transition-all duration-300"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: isOpen ? '#ffffff' : '#3f3f46',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 pl-[4.25rem] text-sm text-[#858585] leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
