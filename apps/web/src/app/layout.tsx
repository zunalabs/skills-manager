import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skills Manager — Universal AI Agent Skills',
  description:
    'Browse, install, enable, and share AI agent skills across all major coding agents in one desktop app.',
  openGraph: {
    title: 'Skills Manager',
    description: 'Universal AI agent skills manager for Claude Code, Cursor, Copilot, and more.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
