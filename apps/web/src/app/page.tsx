'use client'

import { useEffect, useState } from 'react'
import Faq from './Faq'
import { AgentIcon } from './AgentIcon'
import ScrollReveal from './ScrollReveal'
import { Spotlight } from './Spotlight'
import { CardSpotlight } from './CardSpotlight'
import { TracingBeam } from './TracingBeam'
import { ShootingStars } from './ShootingStars'
import { MovingBorderButton } from './MovingBorder'
import { LampContainer } from './LampContainer'
import { HeroHighlight, Highlight } from './HeroHighlight'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
})

const agents = [
  'Claude Code',
  'Cursor',
  'Gemini CLI',
  'Windsurf',
  'GitHub Copilot',
  'Goose',
  'OpenAI Codex',
  'OpenCode',
  'Kilo Code',
  'Trae',
  'Antigravity',
]

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Unified view',
    description:
      'See every skill installed across all your agents in one place. No more hunting through config directories.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M10 3v10M10 13l-3-3M10 13l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Install from GitHub',
    description:
      'Paste any GitHub repo URL and install skills with one click. Works with public repos and custom registries.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10h6M13 10l-2.5-2.5M13 10l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Copy between agents',
    description:
      'Found the perfect skill for Claude Code? Push it to Cursor or Copilot in seconds — no manual file copying.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Enable / disable',
    description:
      'Toggle any skill on or off without deleting it. Experiment freely and roll back without losing your setup.',
  },
]

export default function Home() {
  const [downloads, setDownloads] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/downloads')
      .then((r) => r.json())
      .then((d) => setDownloads(d.total))
      .catch(() => {})
  }, [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Skills Manager',
    'operatingSystem': 'macOS, Windows, Linux',
    'applicationCategory': 'DeveloperApplication',
    'description': 'Universal AI agent skills manager for Claude Code, Cursor, Copilot, and more.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'author': {
      '@type': 'Organization',
      'name': 'Zunalabs',
      'url': 'https://github.com/zunalabs'
    }
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What are skills?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Skills are reusable instruction sets that extend what an AI coding agent can do. They're typically markdown or text files that tell the agent how to handle specific tasks like enforcing commit message formats or following code styles."
        }
      },
      {
        '@type': 'Question',
        'name': 'Which agents are supported?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Currently supported agents include Claude Code, Cursor, Gemini CLI, Windsurf, GitHub Copilot, Goose, OpenAI Codex, OpenCode, Kilo Code, Trae, and Antigravity.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is it free?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Skills Manager is fully open source under the MIT license with no accounts or telemetry.'
        }
      }
    ]
  }

  return (
    <div className="min-h-screen text-white font-sans" style={{ background: '#0a0908' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md"
        style={{ background: 'rgba(10,9,8,0.85)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-heading text-base tracking-tight">Skills Manager</span>
          <nav className="flex items-center gap-6">
            <a
              href="https://github.com/zunalabs/skills-manager"
              className="text-[#858585] hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
                <path d="M7.5 0C3.36 0 0 3.36 0 7.5c0 3.31 2.15 6.12 5.13 7.11.38.07.52-.16.52-.36v-1.27c-2.1.46-2.54-.99-2.54-.99-.34-.87-.84-1.1-.84-1.1-.69-.47.05-.46.05-.46.76.05 1.16.78 1.16.78.67 1.15 1.77.82 2.2.63.07-.49.26-.82.48-1.01-1.68-.19-3.44-.84-3.44-3.73 0-.82.29-1.5.78-2.02-.08-.19-.34-.96.07-2 0 0 .64-.2 2.08.77a7.26 7.26 0 0 1 1.9-.26c.64 0 1.29.09 1.9.26 1.44-.97 2.08-.77 2.08-.77.41 1.04.15 1.81.07 2 .49.53.78 1.2.78 2.02 0 2.9-1.77 3.54-3.45 3.73.27.23.51.69.51 1.39v2.06c0 .2.13.44.52.36A7.51 7.51 0 0 0 15 7.5C15 3.36 11.64 0 7.5 0Z" />
              </svg>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <ShootingStars minDelay={800} maxDelay={3000} starWidth={12} />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />

        <HeroHighlight className="pt-24 pb-6">
          <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 text-xs text-[#858585] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot inline-block" />
              Open source · Free forever{downloads != null && ` · ${downloads.toLocaleString()} downloads`}
            </span>
          </motion.div>

          <motion.h1
            className="font-heading text-[2.5rem] sm:text-[3.25rem] md:text-[3.875rem] leading-[1.1] mb-5"
            style={{ letterSpacing: '-0.01em' }}
            {...fadeUp(0.1)}
          >
            One place for{' '}
            <Highlight>all your AI skills.</Highlight>
          </motion.h1>

          <motion.p
            className="text-sm leading-relaxed text-[#858585] max-w-sm mx-auto mb-10"
            {...fadeUp(0.2)}
          >
            Install, manage, and share skills across every major coding agent —
            Claude Code, Cursor, Copilot, and more.
          </motion.p>

          <motion.div
            id="download"
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
            {...fadeUp(0.3)}
          >
            <MovingBorderButton
              as="a"
              href="https://github.com/zunalabs/skills-manager/releases/latest/download/Skills-Manager-Setup.exe"
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="h-[46px]"
              innerClassName="gap-2 bg-white text-black text-sm font-semibold px-6 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 88 88" fill="currentColor" aria-hidden>
                <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.066 41.344-47.318-6.63-.066-34.893z"/>
              </svg>
              Download for Windows
            </MovingBorderButton>
            <a
              href="https://github.com/zunalabs/skills-manager/releases/latest/download/Skills-Manager-linux-x64.AppImage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#858585] hover:text-white border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] px-6 py-3 rounded-full transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm0 2c2.717 0 5.232 1.01 7.112 2.674L4.673 19.112A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2zm0 20c-2.717 0-5.232-1.01-7.112-2.674L19.327 4.888A9.944 9.944 0 0 1 22 12c0 5.523-4.477 10-10 10z"/>
              </svg>
              Download for Linux
            </a>
            <span className="inline-flex items-center gap-2 text-sm text-[#555555] border border-[rgba(255,255,255,0.06)] px-6 py-3 rounded-full cursor-not-allowed">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16.65 13.2c-.02-2 1.65-2.96 1.73-3.01-0.94-1.37-2.4-1.56-2.91-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.41 2.43-.36 6.03 1 8 .66.97 1.45 2.06 2.48 2.02 1-.04 1.37-.64 2.58-.64 1.21 0 1.55.64 2.6.62 1.08-.02 1.76-0.98 2.41-1.95.76-1.1 1.07-2.17 1.08-2.23-.02-.01-2.07-.79-2.1-3.27Z"/>
                <path d="M14.92 6.82c.54-.65.9-1.56.8-2.46-.77.03-1.7.51-2.25 1.16-.5.58-.94 1.52-.82 2.41.86.07 1.72-.44 2.27-1.11Z"/>
              </svg>
              Mac — coming soon
            </span>
          </motion.div>

          <motion.p className="text-[11px] text-[#555555] mb-8 -mt-8" {...fadeUp(0.35)}>
            Windows may show a SmartScreen warning — click &ldquo;More info&rdquo; → &ldquo;Run anyway&rdquo;.{' '}
            <a
              href="https://github.com/zunalabs/skills-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#858585] transition-colors"
            >
              Source code is public.
            </a>
          </motion.p>

          {/* App screenshot — floats gently */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <div
              className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 80%, rgba(255,255,255,0.04) 0%, transparent 70%)',
              }}
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            >
              <img
                src="/sm.PNG"
                alt="Skills Manager app screenshot"
                className="rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl w-full max-w-3xl mx-auto"
              />
            </motion.div>
          </motion.div>
          </div>
        </HeroHighlight>
      </section>

      {/* Video */}
      {/* Replace YOUTUBE_VIDEO_ID with the actual YouTube video ID once uploaded */}
      {(() => {
        const YOUTUBE_VIDEO_ID = 'touNnaNVqo8'
        if (!YOUTUBE_VIDEO_ID) return null
        return (
          <section className="border-t border-[rgba(255,255,255,0.06)] py-20">
            <div className="max-w-4xl mx-auto px-6">
              <ScrollReveal>
                <p className="text-center text-xs uppercase tracking-widest text-[#858585] mb-4">
                  See it in action
                </p>
                <h2
                  className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-10"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Watch the demo
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div
                  className="relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]"
                  style={{ aspectRatio: '16/9', background: '#0d0c0b' }}
                >
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                    title="Skills Manager demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                  />
                </div>
              </ScrollReveal>
            </div>
          </section>
        )
      })()}

      {/* Agent marquee */}
      <section className="border-t border-[rgba(255,255,255,0.06)] py-16 overflow-hidden">
        <ScrollReveal>
          <p className="text-center text-xs uppercase tracking-widest text-[#858585] mb-8">
            Works with {agents.length} coding agents
          </p>
        </ScrollReveal>
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
            style={{ background: 'linear-gradient(to right, #0a0908, transparent)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
            style={{ background: 'linear-gradient(to left, #0a0908, transparent)' }}
          />
          <div className="flex">
            <div className="animate-marquee flex shrink-0 gap-3">
              {[...agents, ...agents].map((agent, i) => (
                <div key={i} className="flex flex-col items-center gap-2 px-6 shrink-0">
                  <AgentIcon agent={agent} size={28} />
                  <span className="text-xs text-[#858585] whitespace-nowrap">{agent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features + FAQ with tracing beam */}
      <TracingBeam>
        {/* Features */}
        <section className="border-t border-[rgba(255,255,255,0.06)]">
          <LampContainer>
            <h2
              className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-3 text-white"
              style={{ letterSpacing: '-0.01em' }}
            >
              Everything you need
            </h2>
            <p className="text-center text-sm text-[#858585]">
              Stop managing skills manually. Skills Manager handles it all.
            </p>
          </LampContainer>

          <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-px rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={i * 80}>
                  <CardSpotlight
                    className="p-8 group h-full"
                    style={{ background: '#0a0908' }}
                  >
                    <div
                      className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center mb-5 border border-[rgba(255,255,255,0.06)] text-[#858585] group-hover:text-white group-hover:border-[rgba(255,255,255,0.12)] transition-colors"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      {f.icon}
                    </div>
                    <h3 className="relative z-10 text-sm font-semibold mb-2">{f.title}</h3>
                    <p className="relative z-10 text-sm text-[#858585] leading-relaxed">{f.description}</p>
                  </CardSpotlight>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[rgba(255,255,255,0.06)] py-20">
          <div className="max-w-2xl mx-auto px-6">
            <ScrollReveal>
              <h2
                className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-14"
                style={{ letterSpacing: '-0.01em' }}
              >
                FAQ
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <Faq />
            </ScrollReveal>
          </div>
        </section>
      </TracingBeam>

      {/* CTA */}
      <section className="border-t border-[rgba(255,255,255,0.06)] py-20 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />
        <ScrollReveal className="relative max-w-5xl mx-auto px-6 text-center">
          <h2
            className="font-heading text-[1.75rem] sm:text-[2.25rem] mb-4"
            style={{ letterSpacing: '-0.01em' }}
          >
            Ready to get started?
          </h2>
          <p className="text-sm text-[#858585] mb-8">
            Free and open source. Windows and Linux available now. Mac coming soon.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <MovingBorderButton
              as="a"
              href="https://github.com/zunalabs/skills-manager/releases/latest/download/Skills-Manager-Setup.exe"
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="h-[46px]"
              innerClassName="gap-2 bg-white text-black text-sm font-semibold px-6 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 88 88" fill="currentColor" aria-hidden>
                <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.066 41.344-47.318-6.63-.066-34.893z"/>
              </svg>
              Download for Windows
            </MovingBorderButton>
            <a
              href="https://github.com/zunalabs/skills-manager/releases/latest/download/Skills-Manager-linux-x64.AppImage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#858585] hover:text-white border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] px-6 py-3 rounded-full transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm0 2c2.717 0 5.232 1.01 7.112 2.674L4.673 19.112A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2zm0 20c-2.717 0-5.232-1.01-7.112-2.674L19.327 4.888A9.944 9.944 0 0 1 22 12c0 5.523-4.477 10-10 10z"/>
              </svg>
              Download for Linux
            </a>
            <span className="inline-flex items-center gap-2 text-sm text-[#555555] border border-[rgba(255,255,255,0.06)] px-6 py-3 rounded-full cursor-not-allowed">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16.65 13.2c-.02-2 1.65-2.96 1.73-3.01-0.94-1.37-2.4-1.56-2.91-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.41 2.43-.36 6.03 1 8 .66.97 1.45 2.06 2.48 2.02 1-.04 1.37-.64 2.58-.64 1.21 0 1.55.64 2.6.62 1.08-.02 1.76-0.98 2.41-1.95.76-1.1 1.07-2.17 1.08-2.23-.02-.01-2.07-.79-2.1-3.27Z"/>
                <path d="M14.92 6.82c.54-.65.9-1.56.8-2.46-.77.03-1.7.51-2.25 1.16-.5.58-.94 1.52-.82 2.41.86.07 1.72-.44 2.27-1.11Z"/>
              </svg>
              Mac — coming soon
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-heading text-base text-white">Skills Manager</span>
            <span className="text-sm text-[#858585] ml-2">by{' '}
              <a
                href="https://github.com/orgs/zunalabs/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Zunalabs
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/zunalabs/skills-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#858585] hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a href="/LICENSE" className="text-sm text-[#858585] hover:text-white transition-colors">
              MIT License
            </a>
            <span className="text-sm text-[#858585]">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
