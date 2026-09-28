import { useState, useEffect, useCallback } from 'react'
import { toRepoPath, toGithubUrl } from '../lib/repoUtils'
import { toast } from 'sonner'
import { Download, ExternalLink, Search, Star } from 'lucide-react'

interface SkillResult {
  id: number
  name: string
  slug: string
  github: string
  owner: { name: string; url: string }
  description: string
  stars: number
}

interface MarketplaceProps {
  onInstall: (repo: string) => void
}

async function fetchSkills(query: string, page: number): Promise<{ skills: SkillResult[]; hasMore: boolean; source: 'marketplace' | 'github' }> {
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
  return { skills, hasMore: data.pagination?.hasMore ?? false, source: data.source === 'github' ? 'github' : 'marketplace' }
}

export default function Marketplace({ onInstall }: MarketplaceProps) {
  const [allSkills, setAllSkills] = useState<SkillResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [source, setSource] = useState<'marketplace' | 'github'>('marketplace')

  const load = useCallback((p: number, append: boolean) => {
    if (p === 1) setLoading(true)
    else setLoadingMore(true)
    setError('')
    fetchSkills('', p)
      .then(({ skills: items, hasMore: more, source: resultSource }) => {
        setAllSkills((prev) => append ? [...prev, ...items] : items)
        setHasMore(more)
        setSource(resultSource)
      })
      .catch((e) => {
        const msg = e.message ?? 'Failed to load'
        setError(msg)
        toast.error(`Marketplace error: ${msg}`)
      })
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [])

  useEffect(() => { load(1, false) }, [load])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next, true)
  }

  const q = search.toLowerCase()
  const skills = q
    ? allSkills.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.github.toLowerCase().includes(q)
      )
    : allSkills

  return (
    <div className="marketplace-view flex flex-col h-full overflow-hidden bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skill packs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <span className="text-[11px] text-zinc-600 ml-auto">
          {!loading && (q ? `${skills.length} of ${allSkills.length}` : `${allSkills.length} packs`)}
        </span>
        <button
          onClick={() => window.skillsAPI.openExternal(source === 'github' ? 'https://github.com/topics/agent-skills' : 'https://mcpmarket.com')}
          className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          {source === 'github' ? 'GitHub catalog' : 'MCP Market'} <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-600">Loading registry…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-sm text-zinc-300 mb-1">Failed to load</p>
              <p className="text-xs text-zinc-600 mb-3">{error}</p>
              <button
                onClick={() => load(1, false)}
                className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && skills.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-zinc-500">No packs found</p>
          </div>
        )}

        {!loading && !error && skills.length > 0 && (
          <>
            <div className="marketplace-grid grid grid-cols-3 gap-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} onInstall={onInstall} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-5">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40 transition-all"
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
    <div className="flex flex-col gap-2.5 p-3.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <img
          src={avatarUrl}
          alt={owner}
          width={24}
          height={24}
          className="rounded flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-zinc-100 leading-tight truncate">
            {skill.name}
          </div>
          <div className="text-[10px] text-zinc-600 truncate mt-0.5">
            {skill.github.split('/').slice(0, 2).join('/')}
          </div>
        </div>
        {skill.stars > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <Star className="w-3 h-3 text-zinc-600" fill="currentColor" />
            <span className="text-[10px] text-zinc-600 tabular-nums">{skill.stars}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {skill.description && (
        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 flex-1">
          {skill.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={() => window.skillsAPI.openExternal(repoUrl)}
          className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          View repo
        </button>
        <button
          onClick={() => onInstall(skill.github)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-black text-white hover:bg-zinc-800 transition-colors border border-zinc-700"
        >
          <Download className="w-3 h-3" />
          Install
        </button>
      </div>
    </div>
  )
}
