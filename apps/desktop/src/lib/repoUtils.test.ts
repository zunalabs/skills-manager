import { describe, it, expect } from 'vitest'
import {
  toRepoPath,
  toGithubUrl,
  inferSkillDirName,
  computeSkillsBasePath,
  filterSkillPaths,
} from './repoUtils'

// ─── toRepoPath ──────────────────────────────────────────────────────────────

describe('toRepoPath', () => {
  it('leaves owner/repo unchanged', () => {
    expect(toRepoPath('owner/repo')).toBe('owner/repo')
  })

  it('strips https://github.com/', () => {
    expect(toRepoPath('https://github.com/owner/repo')).toBe('owner/repo')
  })

  it('strips /tree/main/ and keeps subpath', () => {
    expect(toRepoPath('https://github.com/owner/repo/tree/main/.claude')).toBe('owner/repo/.claude')
  })

  it('strips /tree/main/ with nested subpath', () => {
    expect(toRepoPath('https://github.com/owner/repo/tree/main/.claude/skills')).toBe('owner/repo/.claude/skills')
  })

  it('strips trailing /tree/main with no subpath', () => {
    expect(toRepoPath('https://github.com/owner/repo/tree/main')).toBe('owner/repo')
  })

  it('strips trailing slash', () => {
    expect(toRepoPath('owner/repo/')).toBe('owner/repo')
  })

  it('handles /blob/ the same as /tree/', () => {
    expect(toRepoPath('https://github.com/owner/repo/blob/main/skills')).toBe('owner/repo/skills')
  })

  it('preserves subpath without URL prefix', () => {
    expect(toRepoPath('owner/repo/.claude/skill-name')).toBe('owner/repo/.claude/skill-name')
  })
})

// ─── toGithubUrl ─────────────────────────────────────────────────────────────

describe('toGithubUrl', () => {
  it('returns github URL for owner/repo', () => {
    expect(toGithubUrl('owner/repo')).toBe('https://github.com/owner/repo')
  })

  it('strips subpath — always links to repo homepage', () => {
    expect(toGithubUrl('owner/repo/.claude/skills')).toBe('https://github.com/owner/repo')
  })

  it('handles 3-part paths', () => {
    expect(toGithubUrl('owner/repo/skills')).toBe('https://github.com/owner/repo')
  })
})

// ─── inferSkillDirName ───────────────────────────────────────────────────────

describe('inferSkillDirName', () => {
  it('returns null for owner/repo (2 parts)', () => {
    expect(inferSkillDirName('owner/repo')).toBeNull()
  })

  it('returns last segment for 3-part path', () => {
    expect(inferSkillDirName('owner/repo/skills')).toBe('skills')
  })

  it('returns last segment for 4-part path', () => {
    expect(inferSkillDirName('owner/repo/.claude/update-docs')).toBe('update-docs')
  })

  it('lowercases the result', () => {
    expect(inferSkillDirName('owner/repo/.claude/Update-Docs')).toBe('update-docs')
  })
})

// ─── computeSkillsBasePath ───────────────────────────────────────────────────

describe('computeSkillsBasePath', () => {
  it('handles single-skill repo (SKILL.md at root)', () => {
    const result = computeSkillsBasePath(['SKILL.md'], 'my-repo')
    expect(result.isSingleSkill).toBe(true)
    expect(result.skillsBasePath).toBe('')
    expect(result.skillDirNames).toEqual(['my-repo'])
  })

  it('computes base path for skills/ structure', () => {
    const result = computeSkillsBasePath([
      'skills/pdf/SKILL.md',
      'skills/docx/SKILL.md',
    ], 'repo')
    expect(result.skillsBasePath).toBe('skills')
    expect(result.skillDirNames).toEqual(['pdf', 'docx'])
  })

  it('computes base path for .claude/skills/ structure', () => {
    const result = computeSkillsBasePath([
      '.claude/skills/foo/SKILL.md',
      '.claude/skills/bar/SKILL.md',
    ], 'repo')
    expect(result.skillsBasePath).toBe('.claude/skills')
    expect(result.skillDirNames).toEqual(['foo', 'bar'])
  })

  it('handles single skill in subdirectory', () => {
    const result = computeSkillsBasePath(['.claude/skills/update-docs/SKILL.md'], 'repo')
    expect(result.skillsBasePath).toBe('.claude/skills')
    expect(result.skillDirNames).toEqual(['update-docs'])
  })
})

// ─── filterSkillPaths ────────────────────────────────────────────────────────

describe('filterSkillPaths', () => {
  const paths = [
    '.claude/skills/foo/SKILL.md',
    '.claude/skills/bar/SKILL.md',
    'other/SKILL.md',
  ]

  it('returns all paths when subpath is empty', () => {
    expect(filterSkillPaths(paths, '')).toEqual(paths)
  })

  it('filters by exact subpath', () => {
    const result = filterSkillPaths(paths, '.claude/skills')
    expect(result).toEqual(['.claude/skills/foo/SKILL.md', '.claude/skills/bar/SKILL.md'])
  })

  it('tries dotted variant when exact subpath has no match', () => {
    // "claude/skills" (no dot) → should match ".claude/skills"
    const result = filterSkillPaths(paths, 'claude/skills')
    expect(result).toEqual(['.claude/skills/foo/SKILL.md', '.claude/skills/bar/SKILL.md'])
  })

  it('falls back to all paths when neither subpath matches', () => {
    const result = filterSkillPaths(paths, 'nonexistent')
    expect(result).toEqual(paths)
  })

  it('filters to a single-skill subpath', () => {
    const result = filterSkillPaths(paths, '.claude/skills/foo')
    expect(result).toEqual(['.claude/skills/foo/SKILL.md'])
  })
})
