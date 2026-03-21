import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, email } = await req.json()

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[feedback] DISCORD_WEBHOOK_URL not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const lines = [
    '**New feedback from Skills Manager**',
    '',
    `> ${message.trim().replace(/\n/g, '\n> ')}`,
  ]
  if (email?.trim()) {
    lines.push('', `📧 ${email.trim()}`)
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n') }),
  })

  if (!res.ok) {
    console.error('[feedback] Discord webhook failed', res.status)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
