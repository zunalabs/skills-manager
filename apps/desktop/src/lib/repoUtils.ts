/**
 * Pure utility functions for repo path normalization and skill discovery logic.
 * Extracted here so they can be unit tested independently.
 */

/**
 * Normalize a github field to owner/repo[/subpath].
 * Handles: full URL, full URL with /tree/main/, owner/repo, owner/repo/subpath
 */
export function toRepoPath(github: string): string {
  let s = github.trim().replace(/\/$/, '')
  s = s.replace(/^https?:\/\/github\.com\//, '')
  s = s.replace(/\/(?:tree|blob)\/[^/]+\//, '/')
  s = s.replace(/\/(?:tree|blob)\/[^/]+$/, '')
  return s
}

/**
 * Always link to the repo homepage (owner/repo), not subdirectories.
 */
export function toGithubUrl(repoPath: string): string {
  const parts = repoPath.split('/')
  return `https://github.com/${parts.slice(0, 2).join('/')}`
}

/**
 * Given a repo path (e.g. "owner/repo/.claude/skill-name"),
 * extract the last segment as the likely skill dir name.
 * Returns null if the path has only 2 parts (owner/repo).
 */
export function inferSkillDirName(repo: string): string | null {
  const parts = repo.trim().split('/')
  return parts.length > 2 ? parts[parts.length - 1].toLowerCase() : null
}

/**
 * Given a list of SKILL.md paths, compute the common base path
 * (the directory that contains all individual skill dirs).
 *
 * Examples:
 *   ['skills/pdf/SKILL.md', 'skills/docx/SKILL.md'] → 'skills'
 *   ['.claude/skills/foo/SKILL.md']                 → '.claude/skills'
 *   ['SKILL.md']                                    → '' (single-skill repo)
 */
export function computeSkillsBasePath(skillMdPaths: string[], repoName: string): {
  skillsBasePath: string
  isSingleSkill: boolean
  skillDirNames: string[]
} {
  const skillDirPaths = skillMdPaths.map((p) => p.split('/').slice(0, -1).join('/'))
  const isSingleSkill = skillDirPaths.length === 1 && skillDirPaths[0] === ''

  if (isSingleSkill) {
    return { skillsBasePath: '', isSingleSkill: true, skillDirNames: [repoName] }
  }

  const parts0 = skillDirPaths[0].split('/')
  let common = parts0.slice(0, -1)
  for (const p of skillDirPaths.slice(1)) {
    const segs = p.split('/').slice(0, -1)
    while (common.length > 0 && segs.slice(0, common.length).join('/') !== common.join('/')) {
      common = common.slice(0, -1)
    }
  }

  const skillsBasePath = common.join('/')
  const skillDirNames = skillDirPaths.map((p) => p.split('/').pop() || repoName)

  return { skillsBasePath, isSingleSkill: false, skillDirNames }
}

/**
 * Filter SKILL.md paths to those matching a subpath.
 * Tries exact subpath, then dotted variant (e.g. "claude" → ".claude").
 * Falls back to all paths if neither matches.
 */
export function filterSkillPaths(allPaths: string[], subpath: string): string[] {
  if (!subpath) return allPaths
  const dotSubpath = '.' + subpath.replace(/^\./, '')
  const exactMatch = allPaths.filter((p) => p.startsWith(subpath + '/'))
  const dotMatch = allPaths.filter((p) => p.startsWith(dotSubpath + '/'))
  return exactMatch.length > 0 ? exactMatch : dotMatch.length > 0 ? dotMatch : allPaths
}
