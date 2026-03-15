import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import yaml from 'js-yaml'
import { execSync } from 'child_process'
import https from 'https'

const home = os.homedir()

// XDG config home (defaults to ~/.config)
const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config')

// All supported tool skill paths
const TOOL_PATHS: Record<string, string> = {
  'Claude Code': path.join(home, '.claude', 'skills'),
  'Cursor': path.join(home, '.cursor', 'skills'),
  'Gemini CLI': path.join(home, '.gemini', 'skills'),
  'Antigravity': path.join(home, '.gemini', 'antigravity', 'skills'),
  'Windsurf': path.join(home, '.codeium', 'windsurf', 'skills'),
  'OpenCode': path.join(configHome, 'opencode', 'skills'),
  'Goose': path.join(configHome, 'goose', 'skills'),
  'Codex': path.join(home, '.codex', 'skills'),
  'GitHub Copilot': path.join(home, '.copilot', 'skills'),
  'Kilo Code': path.join(home, '.kilocode', 'skills'),
  'Trae': path.join(home, '.trae', 'skills'),
}

interface SkillMeta {
  name?: string
  description?: string
  domain?: string
  version?: string
  tags?: string[]
  triggers?: {
    keywords?: { primary?: string[]; secondary?: string[] }
  }
}

interface Skill {
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

interface ToolSummary {
  tool: string
  path: string
  exists: boolean
  skillCount: number
  skills: Skill[]
}

function parseSkillMeta(skillDir: string): SkillMeta {
  const skillFile = path.join(skillDir, 'SKILL.md')
  if (!fs.existsSync(skillFile)) return {}

  try {
    const content = fs.readFileSync(skillFile, 'utf-8')
    // Extract YAML front matter between --- delimiters
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return {}
    return (yaml.load(match[1]) as SkillMeta) || {}
  } catch {
    return {}
  }
}

function readSkillDir(toolName: string, toolPath: string, skillDirName: string): Skill {
  const skillPath = path.join(toolPath, skillDirName)
  const meta = parseSkillMeta(skillPath)

  const templatesDir = path.join(skillPath, 'templates')
  const hasTemplates = fs.existsSync(templatesDir)
  let templateCount = 0
  if (hasTemplates) {
    try {
      templateCount = fs.readdirSync(templatesDir).length
    } catch {
      templateCount = 0
    }
  }

  // Check if skill is disabled (has .disabled marker file or name starts with _)
  const isDisabled = fs.existsSync(path.join(skillPath, '.disabled')) || skillDirName.startsWith('_')

  return {
    id: `${toolName}::${skillDirName}`,
    name: meta.name || skillDirName,
    description: meta.description || '',
    domain: meta.domain || '',
    version: meta.version || '',
    tags: meta.tags || [],
    keywords: [
      ...(meta.triggers?.keywords?.primary || []),
      ...(meta.triggers?.keywords?.secondary || []),
    ],
    path: skillPath,
    tool: toolName,
    toolPath,
    hasTemplates,
    templateCount,
    enabled: !isDisabled,
  }
}

function scanAllTools(): ToolSummary[] {
  return Object.entries(TOOL_PATHS).map(([toolName, toolPath]) => {
    const exists = fs.existsSync(toolPath)
    if (!exists) {
      return { tool: toolName, path: toolPath, exists: false, skillCount: 0, skills: [] }
    }

    let entries: string[] = []
    try {
      entries = fs.readdirSync(toolPath).filter((entry) => {
        const full = path.join(toolPath, entry)
        return fs.statSync(full).isDirectory()
      })
    } catch {
      entries = []
    }

    const skills = entries.map((dir) => readSkillDir(toolName, toolPath, dir))
    return { tool: toolName, path: toolPath, exists: true, skillCount: skills.length, skills }
  })
}

function readSkillReadme(skillPath: string): string {
  const files = ['README.md', 'SKILL.md']
  for (const f of files) {
    const fp = path.join(skillPath, f)
    if (fs.existsSync(fp)) {
      try {
        return fs.readFileSync(fp, 'utf-8')
      } catch {
        return ''
      }
    }
  }
  return ''
}

function listTemplates(skillPath: string): string[] {
  const templatesDir = path.join(skillPath, 'templates')
  if (!fs.existsSync(templatesDir)) return []
  try {
    return fs.readdirSync(templatesDir)
  } catch {
    return []
  }
}

function readTemplate(skillPath: string, templateName: string): string {
  const templateFile = path.join(skillPath, 'templates', templateName)
  if (!fs.existsSync(templateFile)) return ''
  try {
    return fs.readFileSync(templateFile, 'utf-8')
  } catch {
    return ''
  }
}

function deleteSkill(skillPath: string): boolean {
  try {
    fs.rmSync(skillPath, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

function toggleSkill(skillPath: string, enabled: boolean): boolean {
  const disabledMarker = path.join(skillPath, '.disabled')
  try {
    if (enabled) {
      // Enable: remove .disabled marker
      if (fs.existsSync(disabledMarker)) fs.unlinkSync(disabledMarker)
    } else {
      // Disable: create .disabled marker
      fs.writeFileSync(disabledMarker, '')
    }
    return true
  } catch {
    return false
  }
}

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    show: false,
  })

  win.once('ready-to-show', () => win?.show())

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC handlers
ipcMain.handle('skills:scanAll', () => scanAllTools())

ipcMain.handle('skills:getReadme', (_e, skillPath: string) => readSkillReadme(skillPath))

ipcMain.handle('skills:listTemplates', (_e, skillPath: string) => listTemplates(skillPath))

ipcMain.handle('skills:readTemplate', (_e, skillPath: string, templateName: string) =>
  readTemplate(skillPath, templateName)
)

ipcMain.handle('skills:toggle', (_e, skillPath: string, enabled: boolean) =>
  toggleSkill(skillPath, enabled)
)

// Returns the full TOOL_PATHS map so the renderer can display agent options
function listAgentPaths(): Record<string, string> {
  return TOOL_PATHS
}

// Copy a skill directory into another agent's skills folder
function copySkillToAgent(skillPath: string, targetAgent: string): { ok: boolean; error?: string } {
  const targetBase = TOOL_PATHS[targetAgent]
  if (!targetBase) return { ok: false, error: `Unknown agent: ${targetAgent}` }

  const skillName = path.basename(skillPath)
  const dest = path.join(targetBase, skillName)

  try {
    if (fs.existsSync(dest)) return { ok: false, error: 'Skill already exists in that agent' }
    fs.mkdirSync(targetBase, { recursive: true })
    fs.cpSync(skillPath, dest, { recursive: true })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: String(e) }
  }
}

// Shared HTTP helper for GitHub API calls
function httpsGet(url: string, cb: (data: string) => void, errCb: (e: string) => void) {
  https.get(url, { headers: { 'User-Agent': 'skills-manager', Accept: 'application/vnd.github.v3+json' } }, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      httpsGet(res.headers.location!, cb, errCb)
      return
    }
    let data = ''
    res.on('data', (chunk) => (data += chunk))
    res.on('end', () => cb(data))
  }).on('error', (e) => errCb(e.message))
}

interface DiscoveredSkill {
  dirName: string
  name: string
  description: string
}

interface DiscoverResult {
  ok: boolean
  skillsBasePath: string
  skills: DiscoveredSkill[]
  error?: string
}

// Discover skills in a GitHub repo without installing anything.
// Checks skills/ subdir first, then falls back to root.
// Parses SKILL.md frontmatter for name + description.
function discoverSkills(repo: string): Promise<DiscoverResult> {
  return new Promise((resolve) => {
    const [owner, repoName] = repo.replace('https://github.com/', '').replace(/\/$/, '').split('/')
    if (!owner || !repoName) return resolve({ ok: false, skillsBasePath: '', skills: [], error: 'Invalid repo format. Use owner/repo' })

    function parseSkillMdFrontmatter(content: string): { name: string; description: string } {
      const match = content.match(/^---\n([\s\S]*?)\n---/)
      if (!match) return { name: '', description: '' }
      try {
        const meta = yaml.load(match[1]) as { name?: string; description?: string }
        return { name: meta?.name || '', description: meta?.description || '' }
      } catch {
        return { name: '', description: '' }
      }
    }

    function scanDirs(dirs: Array<{ name: string; type: string }>, basePath: string) {
      const skillDirs = dirs.filter((e) => e.type === 'dir' && !e.name.startsWith('.'))
      if (skillDirs.length === 0) {
        resolve({ ok: true, skillsBasePath: basePath, skills: [] })
        return
      }
      const skills: DiscoveredSkill[] = []
      let pending = skillDirs.length
      skillDirs.forEach((dir) => {
        const dirPath = basePath ? `${basePath}/${dir.name}` : dir.name
        httpsGet(
          `https://api.github.com/repos/${owner}/${repoName}/contents/${dirPath}`,
          (raw) => {
            let files: Array<{ name: string; type: string; download_url: string | null }> = []
            try { files = JSON.parse(raw) } catch { files = [] }
            const skillMdFile = files.find((f) => f.name === 'SKILL.md' && f.type === 'file')
            if (!skillMdFile?.download_url) { if (--pending === 0) resolve({ ok: true, skillsBasePath: basePath, skills }); return }
            httpsGet(skillMdFile.download_url, (content) => {
              const meta = parseSkillMdFrontmatter(content)
              skills.push({ dirName: dir.name, name: meta.name || dir.name, description: meta.description })
              if (--pending === 0) resolve({ ok: true, skillsBasePath: basePath, skills })
            }, () => {
              skills.push({ dirName: dir.name, name: dir.name, description: '' })
              if (--pending === 0) resolve({ ok: true, skillsBasePath: basePath, skills })
            })
          },
          () => { if (--pending === 0) resolve({ ok: true, skillsBasePath: basePath, skills }) }
        )
      })
    }

    httpsGet(`https://api.github.com/repos/${owner}/${repoName}/contents`, (raw) => {
      let root: Array<{ name: string; type: string }> = []
      try { root = JSON.parse(raw) } catch { return resolve({ ok: false, skillsBasePath: '', skills: [], error: 'Failed to parse GitHub response' }) }
      if (!Array.isArray(root)) return resolve({ ok: false, skillsBasePath: '', skills: [], error: (root as { message?: string }).message || 'GitHub API error' })

      const skillsDir = root.find((e) => e.name === 'skills' && e.type === 'dir')
      if (skillsDir) {
        httpsGet(`https://api.github.com/repos/${owner}/${repoName}/contents/skills`, (raw2) => {
          let contents: Array<{ name: string; type: string }> = []
          try { contents = JSON.parse(raw2) } catch { contents = [] }
          const dirs = contents.filter((e) => e.type === 'dir')
          if (dirs.length > 0) { scanDirs(dirs, 'skills') } else { scanDirs(root, '') }
        }, () => scanDirs(root, ''))
      } else {
        scanDirs(root, '')
      }
    }, (err) => resolve({ ok: false, skillsBasePath: '', skills: [], error: err }))
  })
}

// Install selected skills from a GitHub repo into target agent's skills folder.
function installFromGitHub(
  repo: string,
  targetAgent: string,
  skillDirNames: string[],
  skillsBasePath: string,
  onProgress: (msg: string) => void
): Promise<{ ok: boolean; installed: string[]; error?: string }> {
  return new Promise((resolve) => {
    const targetBase = TOOL_PATHS[targetAgent]
    if (!targetBase) return resolve({ ok: false, installed: [], error: `Unknown agent: ${targetAgent}` })
    const [owner, repoName] = repo.replace('https://github.com/', '').replace(/\/$/, '').split('/')
    if (!owner || !repoName) return resolve({ ok: false, installed: [], error: 'Invalid repo format. Use owner/repo' })

    fs.mkdirSync(targetBase, { recursive: true })
    const installed: string[] = []
    let pending = skillDirNames.length
    if (pending === 0) return resolve({ ok: true, installed: [] })

    skillDirNames.forEach((dirName) => {
      const dirPath = skillsBasePath ? `${skillsBasePath}/${dirName}` : dirName
      const destDir = path.join(targetBase, dirName)

      if (fs.existsSync(destDir)) {
        onProgress(`Skipping ${dirName} (already exists)`)
        if (--pending === 0) resolve({ ok: true, installed })
        return
      }

      httpsGet(`https://api.github.com/repos/${owner}/${repoName}/contents/${dirPath}`, (raw) => {
        let files: Array<{ name: string; type: string; download_url: string | null }> = []
        try { files = JSON.parse(raw) } catch { files = [] }

        const fileList = files.filter((f) => f.type === 'file')
        if (fileList.length === 0) { if (--pending === 0) resolve({ ok: true, installed }); return }

        fs.mkdirSync(destDir, { recursive: true })
        onProgress(`Installing ${dirName}...`)

        let filePending = fileList.length
        fileList.forEach((file) => {
          if (!file.download_url) { if (--filePending === 0) { installed.push(dirName); if (--pending === 0) resolve({ ok: true, installed }) }; return }
          httpsGet(file.download_url, (content) => {
            try { fs.writeFileSync(path.join(destDir, file.name), content) } catch { /* ignore */ }
            if (--filePending === 0) { installed.push(dirName); if (--pending === 0) resolve({ ok: true, installed }) }
          }, () => { if (--filePending === 0) { if (--pending === 0) resolve({ ok: true, installed }) } })
        })
      }, () => { if (--pending === 0) resolve({ ok: true, installed }) })
    })
  })
}

ipcMain.handle('skills:delete', (_e, skillPath: string) => deleteSkill(skillPath))

ipcMain.handle('skills:listAgentPaths', () => listAgentPaths())

ipcMain.handle('skills:copyToAgent', (_e, skillPath: string, targetAgent: string) =>
  copySkillToAgent(skillPath, targetAgent)
)

ipcMain.handle('skills:discoverSkills', (_e, repo: string) => discoverSkills(repo))

ipcMain.handle('skills:installFromGitHub', async (e, repo: string, targetAgent: string, skillDirNames: string[], skillsBasePath: string) => {
  return installFromGitHub(repo, targetAgent, skillDirNames, skillsBasePath, (msg) => {
    e.sender.send('skills:installProgress', msg)
  })
})

ipcMain.handle('skills:openInExplorer', (_e, skillPath: string) => {
  const { shell } = require('electron')
  shell.openPath(skillPath)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
