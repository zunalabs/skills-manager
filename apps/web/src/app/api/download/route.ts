import { NextRequest, NextResponse } from 'next/server'

const FILES = {
  windows: 'https://github.com/zunalabs/skills-manager/releases/latest/download/Skills-Manager-Setup.exe',
  linux: 'https://github.com/zunalabs/skills-manager/releases/latest/download/Skills-Manager-linux-x86_64.AppImage',
}

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get('platform') as keyof typeof FILES
  const url = FILES[platform]
  if (!url) return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })

  // Log to Discord (fire and forget)
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (webhookUrl) {
    const country = req.headers.get('x-vercel-ip-country') ?? '?'
    const ua = req.headers.get('user-agent') ?? '?'
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `⬇️ **Download** · \`${platform}\` · ${country} · \`${ua.slice(0, 80)}\``,
      }),
    }).catch(() => {})
  }

  return NextResponse.redirect(url, { status: 302 })
}
