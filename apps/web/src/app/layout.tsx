import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skills Manager',
  description: 'The universal skill manager for AI coding agents.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
