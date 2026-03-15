import Faq from './Faq'
import { AgentIcon } from './AgentIcon'
import AppMockup from './AppMockup'
import ScrollReveal from './ScrollReveal'

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
  return (
    <div className="min-h-screen text-white font-sans" style={{ background: '#0a0908' }}>

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md"
        style={{ background: 'rgba(10,9,8,0.85)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Skills Manager</span>
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
            <a
              href="#download"
              className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors"
            >
              Download
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-6 text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs text-[#858585] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot inline-block" />
              Open source · Free forever
            </span>
          </div>

          <h1
            className="text-[3.25rem] sm:text-[4.5rem] md:text-[5.5rem] font-bold leading-[1.05] mb-5 animate-fade-up delay-100"
            style={{ letterSpacing: '-0.04em' }}
          >
            One place for all
            <br />
            your AI skills.
          </h1>

          <p className="text-[1.0625rem] leading-relaxed text-[#858585] max-w-sm mx-auto mb-10 animate-fade-up delay-200">
            Install, manage, and share skills across every major coding agent —
            Claude Code, Cursor, Copilot, and more.
          </p>

          <div
            id="download"
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-up delay-300"
          >
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-full hover:bg-neutral-200 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v8M8 10L5 7M8 10l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download for Mac
            </a>
            <a
              href="https://github.com/zunalabs/skills-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#858585] border border-[rgba(255,255,255,0.1)] px-6 py-3 rounded-full hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
                <path d="M7.5 0C3.36 0 0 3.36 0 7.5c0 3.31 2.15 6.12 5.13 7.11.38.07.52-.16.52-.36v-1.27c-2.1.46-2.54-.99-2.54-.99-.34-.87-.84-1.1-.84-1.1-.69-.47.05-.46.05-.46.76.05 1.16.78 1.16.78.67 1.15 1.77.82 2.2.63.07-.49.26-.82.48-1.01-1.68-.19-3.44-.84-3.44-3.73 0-.82.29-1.5.78-2.02-.08-.19-.34-.96.07-2 0 0 .64-.2 2.08.77a7.26 7.26 0 0 1 1.9-.26c.64 0 1.29.09 1.9.26 1.44-.97 2.08-.77 2.08-.77.41 1.04.15 1.81.07 2 .49.53.78 1.2.78 2.02 0 2.9-1.77 3.54-3.45 3.73.27.23.51.69.51 1.39v2.06c0 .2.13.44.52.36A7.51 7.51 0 0 0 15 7.5C15 3.36 11.64 0 7.5 0Z" />
              </svg>
              View on GitHub
            </a>
          </div>

          {/* App mockup — floats gently */}
          <div className="relative animate-fade-up delay-400">
            <div
              className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 80%, rgba(124,58,237,0.1) 0%, transparent 70%)',
              }}
            />
            <div className="animate-float">
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

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

      {/* Features */}
      <section className="border-t border-[rgba(255,255,255,0.06)] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <h2
              className="text-[2rem] sm:text-[2.5rem] font-bold text-center mb-3"
              style={{ letterSpacing: '-0.03em' }}
            >
              Everything you need
            </h2>
            <p className="text-center text-sm text-[#858585] mb-14">
              Stop managing skills manually. Skills Manager handles it all.
            </p>
          </ScrollReveal>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div
                  className="p-8 group transition-colors h-full"
                  style={{ background: '#0a0908' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-5 border border-[rgba(255,255,255,0.06)] text-[#858585] group-hover:text-white group-hover:border-[rgba(255,255,255,0.12)] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[#858585] leading-relaxed">{f.description}</p>
                </div>
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
              className="text-[2rem] sm:text-[2.5rem] font-bold text-center mb-14"
              style={{ letterSpacing: '-0.03em' }}
            >
              FAQ
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Faq />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[rgba(255,255,255,0.06)] py-20 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(124,58,237,0.1) 0%, transparent 70%)',
          }}
        />
        <ScrollReveal className="relative max-w-5xl mx-auto px-6 text-center">
          <h2
            className="text-[2rem] sm:text-[2.5rem] font-bold mb-4"
            style={{ letterSpacing: '-0.03em' }}
          >
            Ready to get started?
          </h2>
          <p className="text-sm text-[#858585] mb-8">
            Free and open source. Works on macOS, Windows, and Linux.
          </p>
          <a
            href="#download"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-full hover:bg-neutral-200 transition-colors"
          >
            Download Skills Manager
          </a>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-white">Skills Manager</span>
            <span className="text-sm text-[#858585] ml-2">by Zunalabs</span>
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
