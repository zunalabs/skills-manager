import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import yaml from 'js-yaml'
import https from 'https'

const home = os.homedir()

// XDG config home (defaults to ~/.config)
const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config')

// ── App config (GitHub token, etc.) ──────────────────────────────────────────
function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json')
}

function readConfig(): Record<string, string> {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeConfig(data: Record<string, string>) {
  try {
    fs.mkdirSync(path.dirname(getConfigPath()), { recursive: true })
    fs.writeFileSync(getConfigPath(), JSON.stringify(data, null, 2))
  } catch { /* ignore */ }
}

function getGithubToken(): string {
  return process.env.GITHUB_TOKEN || readConfig().githubToken || ''
}

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

function readSkillDir(toolName: string, toolPath: string, skillDirName: string, disabled = false): Skill {
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

  const isDisabled = disabled

  return {
    id: `${toolName}::${disabled ? '.disabled/' : ''}${skillDirName}`,
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

    const readDirs = (dirPath: string, disabled: boolean): Skill[] => {
      let entries: string[] = []
      try {
        entries = fs.readdirSync(dirPath).filter((entry) => {
          if (entry === '.disabled') return false
          const full = path.join(dirPath, entry)
          return fs.statSync(full).isDirectory()
        })
      } catch {
        entries = []
      }
      return entries.map((dir) => readSkillDir(toolName, dirPath, dir, disabled))
    }

    const activeSkills = readDirs(toolPath, false)
    const disabledDir = path.join(toolPath, '.disabled')
    const disabledSkills = fs.existsSync(disabledDir) ? readDirs(disabledDir, true) : []
    const skills = [...activeSkills, ...disabledSkills]

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

function toggleSkill(skillPath: string, enabled: boolean): { ok: boolean; newPath: string } {
  const skillName = path.basename(skillPath)
  const currentDir = path.dirname(skillPath)
  try {
    if (enabled) {
      // Move from .disabled/ back into the active tool directory
      const toolPath = path.dirname(currentDir)
      const newPath = path.join(toolPath, skillName)
      fs.renameSync(skillPath, newPath)
      return { ok: true, newPath }
    } else {
      // Move into .disabled/ subfolder within the same tool directory
      const disabledDir = path.join(currentDir, '.disabled')
      if (!fs.existsSync(disabledDir)) fs.mkdirSync(disabledDir, { recursive: true })
      const newPath = path.join(disabledDir, skillName)
      fs.renameSync(skillPath, newPath)
      return { ok: true, newPath }
    }
  } catch {
    return { ok: false, newPath: skillPath }
  }
}

let win: BrowserWindow | null = null

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png')
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f1117',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
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
  const token = getGithubToken()
  const headers: Record<string, string> = {
    'User-Agent': 'skills-manager',
    'Accept': 'application/vnd.github.v3+json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  https.get(url, { headers }, (res) => {
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
    const parts = repo.replace('https://github.com/', '').replace(/\/$/, '').split('/')
    const owner = parts[0]
    const repoName = parts[1]
    const subpath = parts.slice(2).join('/') // e.g. '.claude' from 'owner/repo/.claude'
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

    // Use GitHub's recursive tree API — one request gets all file paths
    httpsGet(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
      (raw) => {
        let tree: { tree?: Array<{ path: string; type: string }> } = {}
        try { tree = JSON.parse(raw) } catch {
          return resolve({ ok: false, skillsBasePath: '', skills: [], error: 'Failed to parse GitHub response' })
        }
        if (!tree.tree) {
          const msg = (tree as { message?: string }).message || 'GitHub API error'
          return resolve({ ok: false, skillsBasePath: '', skills: [], error: msg })
        }

        // Find all SKILL.md files in the whole tree
        const allFiles = tree.tree
        const allSkillMdPaths = allFiles
          .filter((f) => (f.type === 'blob' && f.path.toLowerCase().endsWith('/skill.md')) || f.path.toLowerCase() === 'skill.md')
          .map((f) => f.path)

        // If a subpath was given, prefer SKILL.md files under that path.
        // Also try with a leading dot (e.g. "claude" → ".claude") for common hidden dirs.
        let skillMdPaths = allSkillMdPaths
        if (subpath) {
          const dotSubpath = '.' + subpath.replace(/^\./, '') // ensure leading dot variant
          const exactMatch = allSkillMdPaths.filter((p) => p.startsWith(subpath + '/'))
          const dotMatch = allSkillMdPaths.filter((p) => p.startsWith(dotSubpath + '/'))
          skillMdPaths = exactMatch.length > 0 ? exactMatch : dotMatch.length > 0 ? dotMatch : allSkillMdPaths
        }

        if (skillMdPaths.length === 0) {
          return resolve({ ok: true, skillsBasePath: subpath || '', skills: [] })
        }

        // Determine the common skillsBasePath (parent of all skill dirs)
        // e.g. ['skills/pdf/SKILL.md', 'skills/docx/SKILL.md'] → basePath='skills'
        // e.g. ['.claude/skills/foo/SKILL.md'] → basePath='.claude/skills'
        // e.g. ['SKILL.md'] → basePath='' (single-skill repo)
        const skillDirPaths = skillMdPaths.map((p) => p.split('/').slice(0, -1).join('/')) // dir containing SKILL.md
        const isSingleSkill = skillDirPaths.length === 1 && skillDirPaths[0] === ''
        const skillsBasePath = isSingleSkill ? '' : (() => {
          // Find common parent
          const parts0 = skillDirPaths[0].split('/')
          let common = parts0.slice(0, -1) // parent of the skill dir
          for (const p of skillDirPaths.slice(1)) {
            const segs = p.split('/').slice(0, -1)
            while (common.length > 0 && segs.slice(0, common.length).join('/') !== common.join('/')) {
              common = common.slice(0, -1)
            }
          }
          return common.join('/')
        })()

        // Fetch each SKILL.md and build result
        const skills: DiscoveredSkill[] = []
        let pending = skillMdPaths.length

        skillMdPaths.forEach((skillMdPath) => {
          const dirPath = skillMdPath.split('/').slice(0, -1).join('/')
          const dirName = isSingleSkill ? repoName : (dirPath.split('/').pop() || repoName)
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/HEAD/${skillMdPath}`

          httpsGet(rawUrl, (content) => {
            const meta = parseSkillMdFrontmatter(content)
            skills.push({ dirName, name: meta.name || dirName, description: meta.description })
            if (--pending === 0) resolve({ ok: true, skillsBasePath, skills })
          }, () => {
            skills.push({ dirName, name: dirName, description: '' })
            if (--pending === 0) resolve({ ok: true, skillsBasePath, skills })
          })
        })
      },
      (err) => resolve({ ok: false, skillsBasePath: '', skills: [], error: err })
    )
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
  shell.openPath(skillPath)
})

ipcMain.handle('skills:openExternal', (_e, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle('skills:getGithubToken', () => {
  return readConfig().githubToken || ''
})

ipcMain.handle('skills:setGithubToken', (_e, token: string) => {
  const config = readConfig()
  if (token) config.githubToken = token
  else delete config.githubToken
  writeConfig(config)
})

ipcMain.handle('skills:searchMarketplace', (_e, query: string, page: number) => {
  function doGet(url: string): Promise<{ ok: boolean; data?: any; error?: string }> {
    return new Promise((resolve) => {
      const req = https.get(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'skillfish-cli',
          'Referer': 'https://mcpmarket.com/',
        }
      }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          doGet(res.headers.location).then(resolve)
          return
        }
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve({ ok: true, data: JSON.parse(data) })
          } catch {
            resolve({ ok: false, error: `Registry returned non-JSON (HTTP ${res.statusCode}): ${data.slice(0, 200)}` })
          }
        })
      })
      req.on('error', (e) => resolve({ ok: false, error: e.message }))
    })
  }
  const params = new URLSearchParams({ q: query, type: 'skills', limit: '24', page: String(page) })
  return doGet(`https://mcpmarket.com/api/search?${params}`)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
