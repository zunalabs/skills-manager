import Link from 'next/link'

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold tracking-[-0.02em]">Skills Manager</Link>
          <Link href="/" className="text-xs text-[#858585] transition-colors hover:text-white">Back to home</Link>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-6 pb-24 pt-20">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#737373]">{eyebrow}</p>
        <h1 className="max-w-2xl font-heading text-5xl leading-[1.05] tracking-[-0.035em] sm:text-6xl">{title}</h1>
        <p className="mt-5 text-sm text-[#737373]">Last updated {updated}</p>
        <div className="mt-16 max-w-2xl space-y-10 text-[15px] leading-7 text-[#b8b8b8] [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-white [&_li]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc">
          {children}
        </div>
      </article>
    </main>
  )
}
