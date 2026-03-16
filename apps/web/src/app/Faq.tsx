'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const items = [
  {
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
    q: 'What inspired this?',
    a: "The AI coding agent space exploded fast. Within months there were a dozen agents, each with their own way of storing and loading skills. Moving between agents meant re-doing all your configuration from scratch, and discovering good community-built skills meant digging through GitHub manually. Skills Manager was built to fix that friction — one app that speaks every agent's language, so your knowledge travels with you no matter which tool you're using that day.",
  },
  {
    q: 'Is it free?',
    a: 'Yes. Skills Manager is fully open source under the MIT license. No accounts, no telemetry, no paywalls — ever.',
  },
  {
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
          <motion.div
            key={i}
            className="rounded-2xl border overflow-hidden"
            animate={{
              borderColor: isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
              backgroundColor: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0)',
            }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
            >
              <motion.span
                className="flex-1 font-medium text-[0.9375rem]"
                animate={{ color: isOpen ? '#ffffff' : '#a1a1aa' }}
                transition={{ duration: 0.2 }}
              >
                {item.q}
              </motion.span>

              <motion.span
                className="shrink-0"
                animate={{
                  rotate: isOpen ? 180 : 0,
                  color: isOpen ? '#ffffff' : '#3f3f46',
                }}
                transition={{ duration: 0.25 }}
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
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <p className="px-5 pb-5 text-sm text-[#858585] leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
