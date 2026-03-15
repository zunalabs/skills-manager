export interface Skill {
  id: string
  name: string
  description: string
  domain: string
  version: string
  tags: string[]
  keywords: string[]
  path: string
  tool: string
  toolPath: string
  hasTemplates: boolean
  templateCount: number
  enabled: boolean
}

export interface ToolSummary {
  tool: string
  path: string
  exists: boolean
  skillCount: number
  skills: Skill[]
}

export interface DiscoveredSkill {
  dirName: string
  name: string
  description: string
}

export interface DiscoverResult {
  ok: boolean
  skillsBasePath: string
  skills: DiscoveredSkill[]
  error?: string
}

declare global {
  interface Window {
    skillsAPI: {
      scanAll: () => Promise<ToolSummary[]>
      getReadme: (skillPath: string) => Promise<string>
      listTemplates: (skillPath: string) => Promise<string[]>
      readTemplate: (skillPath: string, templateName: string) => Promise<string>
      toggle: (skillPath: string, enabled: boolean) => Promise<boolean>
      delete: (skillPath: string) => Promise<boolean>
      listAgentPaths: () => Promise<Record<string, string>>
      copyToAgent: (skillPath: string, targetAgent: string) => Promise<{ ok: boolean; error?: string }>
      discoverSkills: (repo: string) => Promise<DiscoverResult>
      installFromGitHub: (repo: string, targetAgent: string, skillDirNames: string[], skillsBasePath: string) => Promise<{ ok: boolean; installed: string[]; error?: string }>
      onInstallProgress: (cb: (msg: string) => void) => () => void
      openInExplorer: (skillPath: string) => Promise<void>
    }
  }
}
