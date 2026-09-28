import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { message, email, category, rating, source, appVersion, platform } = body

  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 4000) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }
  if (email && (typeof email !== 'string' || email.length > 320)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[feedback] DISCORD_WEBHOOK_URL not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const lines = [
    '**New feedback from Skills Manager**',
    `**Type:** ${typeof category === 'string' && ['bug', 'idea', 'general'].includes(category) ? category : 'general'}`,
    `**Source:** ${source === 'desktop' ? `desktop ${typeof appVersion === 'string' ? appVersion.slice(0, 30) : ''} · ${typeof platform === 'string' ? platform.slice(0, 30) : 'unknown'}` : 'website'}`,
    ...(typeof rating === 'number' && Number.isInteger(rating) && rating >= 1 && rating <= 5 ? [`**Rating:** ${rating}/5`] : []),
    '',
    `> ${message.trim().replace(/\n/g, '\n> ')}`,
  ]
  if (typeof email === 'string' && email.trim()) {
    lines.push('', `📧 ${email.trim()}`)
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n'), allowed_mentions: { parse: [] } }),
  })

  if (!res.ok) {
    console.error('[feedback] Discord webhook failed', res.status)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
