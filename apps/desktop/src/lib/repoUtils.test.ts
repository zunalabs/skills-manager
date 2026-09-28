import { describe, expect, it } from 'vitest'
import {
  computeSkillsBasePath,
  filterSkillPaths,
  inferSkillDirName,
  toGithubUrl,
  toRepoPath,
} from './repoUtils'

describe('GitHub repository input', () => {
  it('normalizes the input forms accepted by the install dialog', () => {
    expect(toRepoPath('owner/repo')).toBe('owner/repo')
    expect(toRepoPath('https://github.com/owner/repo/')).toBe('owner/repo')
    expect(toRepoPath('https://github.com/owner/repo.git')).toBe('owner/repo')
    expect(toRepoPath('https://github.com/owner/repo/tree/main/.agents/skills')).toBe('owner/repo/.agents/skills')
    expect(toRepoPath('https://github.com/owner/repo/blob/main/SKILL.md?plain=1')).toBe('owner/repo/SKILL.md')
  })

  it('builds a repository homepage without leaking a nested path', () => {
    expect(toGithubUrl('owner/repo/.agents/skills')).toBe('https://github.com/owner/repo')
  })

  it('infers a requested skill directory only when a subpath exists', () => {
    expect(inferSkillDirName('owner/repo')).toBeNull()
    expect(inferSkillDirName('https://github.com/owner/repo')).toBeNull()
    expect(inferSkillDirName('https://github.com/owner/repo/tree/main/Skills/Review')).toBe('review')
  })
})

describe('skill discovery paths', () => {
  it('recognizes a repository containing one root skill', () => {
    expect(computeSkillsBasePath(['SKILL.md'], 'my-skill')).toEqual({
      skillsBasePath: '',
      isSingleSkill: true,
      skillDirNames: ['my-skill'],
    })
  })

  it('finds the shared skills directory for multi-skill repositories', () => {
    expect(computeSkillsBasePath([
      '.agents/skills/review/SKILL.md',
      '.agents/skills/testing/SKILL.md',
    ], 'repo')).toEqual({
      skillsBasePath: '.agents/skills',
      isSingleSkill: false,
      skillDirNames: ['review', 'testing'],
    })
  })

  it('handles an empty GitHub response without throwing', () => {
    expect(computeSkillsBasePath([], 'repo')).toEqual({
      skillsBasePath: '',
      isSingleSkill: false,
      skillDirNames: [],
    })
  })

  it('honors exact and dot-prefixed requested subpaths', () => {
    const paths = ['.claude/skills/review/SKILL.md', '.claude/skills/testing/SKILL.md', 'SKILL.md']
    expect(filterSkillPaths(paths, '.claude/skills/review')).toEqual(['.claude/skills/review/SKILL.md'])
    expect(filterSkillPaths(paths, 'claude/skills')).toEqual([
      '.claude/skills/review/SKILL.md',
      '.claude/skills/testing/SKILL.md',
    ])
  })

  it('keeps discovery usable when a requested subpath does not exist', () => {
    const paths = ['skills/review/SKILL.md', 'skills/testing/SKILL.md']
    expect(filterSkillPaths(paths, 'missing')).toEqual(paths)
  })
})
