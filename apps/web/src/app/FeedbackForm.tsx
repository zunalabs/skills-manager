'use client'

import { useState } from 'react'

export default function FeedbackForm() {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), email: email.trim() }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setMessage('')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 text-emerald-400 text-sm mb-2">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6.5 10l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Feedback sent — thank you!
        </div>
        <p className="text-[#555] text-xs">We read every message.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What's working, what's missing, what would you love to see?"
        rows={4}
        required
        className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555] resize-none focus:outline-none focus:border-[rgba(255,255,255,0.18)] transition-colors"
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional — for follow-up)"
          className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[rgba(255,255,255,0.18)] transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !message.trim()}
          className="shrink-0 bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs">Something went wrong — please try again or open a GitHub issue.</p>
      )}
    </form>
  )
}
