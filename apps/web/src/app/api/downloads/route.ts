export const revalidate = 3600 // re-fetch at most once per hour

export async function GET() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/zunalabs/skills-manager/releases',
      {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return Response.json({ total: null })
    const releases = await res.json()
    const total: number = releases
      .flatMap((r: any) => r.assets as any[])
      .reduce((sum: number, a: any) => sum + (a.download_count ?? 0), 0)
    return Response.json({ total })
  } catch {
    return Response.json({ total: null })
  }
}
