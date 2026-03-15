import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Instrument_Serif } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sm.idoevergreen.me'),
  title: 'Skills Manager — Universal AI Agent Skills',
  description:
    'Browse, install, enable, and share AI agent skills across all major coding agents in one desktop app.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Skills Manager — Universal AI Agent Skills',
    description: 'Universal AI agent skills manager for Claude Code, Cursor, Copilot, and more.',
    url: 'https://sm.idoevergreen.me',
    siteName: 'Skills Manager',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Skills Manager — One place for all your AI skills',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skills Manager — Universal AI Agent Skills',
    description: 'Universal AI agent skills manager for Claude Code, Cursor, Copilot, and more.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
