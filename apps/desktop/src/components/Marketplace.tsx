import { useState, useEffect, useCallback } from 'react'
import { toRepoPath, toGithubUrl } from '../lib/repoUtils'

interface SkillResult {
  id: number
  name: string
  slug: string
  github: string // owner/repo
  owner: { name: string; url: string }
  description: string
  stars: number
}

interface MarketplaceProps {
  onInstall: (repo: string) => void
}

async function fetchSkills(query: string, page: number): Promise<{ skills: SkillResult[]; hasMore: boolean }> {
  const res = await window.skillsAPI.searchMarketplace(query, page)
  if (!res.ok) throw new Error(res.error ?? 'Failed to fetch')
  const data = res.data
  const skills: SkillResult[] = (data.skills ?? [])
    .filter((item: any) => typeof item.name === 'string' && typeof item.github === 'string')
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      github: toRepoPath(item.github),
      owner: { name: item.owner?.name ?? '', url: item.owner?.url ?? '' },
      description: item.description ?? '',
      stars: item.github_stars ?? 0,
    }))
  return { skills, hasMore: data.pagination?.hasMore ?? false }
}

export default function Marketplace({ onInstall }: MarketplaceProps) {
  const [allSkills, setAllSkills] = useState<SkillResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback((p: number, append: boolean) => {
    if (p === 1) setLoading(true)
    else setLoadingMore(true)
    setError('')
    fetchSkills('', p)
      .then(({ skills: items, hasMore: more }) => {
        setAllSkills((prev) => append ? [...prev, ...items] : items)
        setHasMore(more)
      })
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [])

  useEffect(() => {
    load(1, false)
  }, [load])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next, true)
  }

  // Filter client-side
  const q = search.toLowerCase()
  const skills = q
    ? allSkills.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.github.toLowerCase().includes(q)
      )
    : allSkills

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 flex-shrink-0">
        <div className="relative flex-1 max-w-64">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search skill packs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
        <span className="text-[11px] text-zinc-600 ml-auto">
          {!loading && (q ? `${skills.length} of ${allSkills.length}` : `${allSkills.length} packs`)}
        </span>
        <button
          onClick={() => window.skillsAPI.openExternal('https://mcpmarket.com')}
          className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Powered by mcpmarket.com ↗
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-600">Loading skill registry…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-1">Failed to load registry</p>
              <p className="text-xs text-zinc-600 mb-3">{error}</p>
              <button
                onClick={() => load(1, false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && skills.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-1">No packs found</p>
              <p className="text-xs text-zinc-600">Try a different search</p>
            </div>
          </div>
        )}

        {!loading && !error && skills.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} onInstall={onInstall} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50 transition-all"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
                      Loading…
                    </>
                  ) : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SkillCard({ skill, onInstall }: { skill: SkillResult; onInstall: (repo: string) => void }) {
  const owner = skill.owner.name || skill.github.split('/')[0]
  const avatarUrl = `https://github.com/${owner}.png?size=56`
  const repoUrl = toGithubUrl(skill.github)

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <img
          src={avatarUrl}
          alt={owner}
          width={28}
          height={28}
          className="rounded-md flex-shrink-0 opacity-80"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-200 leading-tight truncate">
            {skill.name}
          </div>
          <div className="text-[11px] text-zinc-600 truncate">
            {skill.github.split('/').slice(0, 2).join('/')}
          </div>
        </div>
        {skill.stars > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="text-zinc-600">
              <path d="M8 1l1.9 4.1 4.1.4-3 2.8.8 4.2L8 10.4l-3.8 2.1.8-4.2-3-2.8 4.1-.4z"/>
            </svg>
            <span className="text-[11px] text-zinc-600 tabular-nums">{skill.stars}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {skill.description && (
        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
          {skill.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <button
          onClick={() => window.skillsAPI.openExternal(repoUrl)}
          className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          View repo
        </button>
        <button
          onClick={() => onInstall(skill.github)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 hover:text-violet-300 transition-all"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 5l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Install
        </button>
      </div>
    </div>
  )
}
