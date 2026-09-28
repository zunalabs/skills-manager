import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import fs from 'fs'
import os from 'os'
import yaml from 'js-yaml'
import https from 'https'
import chokidar from 'chokidar'
import { initialize as initializeAptabase, trackEvent as trackAptabaseEvent } from '@aptabase/electron/main'
import { sanitizeTelemetryEvent } from '../src/lib/telemetryPolicy'

const APTABASE_APP_KEY = 'A-US-2773624305'
if (process.env.NODE_ENV !== 'test') void initializeAptabase(APTABASE_APP_KEY)

function sendTelemetry(eventName: string, properties: Record<string, unknown> = {}) {
  const safeEvent = sanitizeTelemetryEvent(eventName, properties)
  if (safeEvent) void trackAptabaseEvent(safeEvent.eventName, safeEvent.properties)
}

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

// Primary install paths. Legacy locations are scanned below so upgrades do not
// hide skills users already have on disk.
const TOOL_PATHS: Record<string, string> = {
  'Claude Code': path.join(home, '.claude', 'skills'),
  'Cursor': path.join(home, '.cursor', 'skills'),
  'Gemini CLI': path.join(home, '.gemini', 'skills'),
  'Antigravity CLI': path.join(home, '.gemini', 'antigravity-cli', 'skills'),
  'Windsurf': path.join(home, '.codeium', 'windsurf', 'skills'),
  'Devin Desktop': path.join(configHome, 'devin', 'skills'),
  'OpenCode': path.join(configHome, 'opencode', 'skills'),
  'Goose': path.join(configHome, 'goose', 'skills'),
  'Codex': path.join(home, '.agents', 'skills'),
  'GitHub Copilot': path.join(home, '.copilot', 'skills'),
  'Kilo Code': path.join(home, '.kilo', 'skills'),
  'Trae': path.join(home, '.trae', 'skills'),
}

const TOOL_LEGACY_PATHS: Record<string, string[]> = {
  'Antigravity CLI': [
    path.join(home, '.gemini', 'config', 'skills'),
    path.join(home, '.gemini', 'antigravity', 'skills'),
  ],
  Codex: [path.join(home, '.codex', 'skills')],
  'Kilo Code': [path.join(home, '.kilocode', 'skills')],
}

function getToolPaths(toolName: string): string[] {
  return [TOOL_PATHS[toolName], ...(TOOL_LEGACY_PATHS[toolName] ?? [])].filter(Boolean)
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

function getDisabledPath(toolPath: string): string {
  return toolPath + '_disabled'
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

  const displayName = skillDirName.startsWith('.') ? skillDirName.slice(1) : skillDirName

  return {
    id: `${toolName}::${skillDirName}`,
    name: meta.name || displayName,
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
  }
}

function scanDir(toolName: string, toolPath: string): Skill[] {
  if (!fs.existsSync(toolPath)) return []
  try {
    const entries = fs.readdirSync(toolPath).filter((entry) => {
      const full = path.join(toolPath, entry)
      try {
        const stats = fs.statSync(full)
        return stats.isDirectory() && !entry.startsWith('.')
      } catch {
        return false
      }
    })
    return entries.map((dir) => readSkillDir(toolName, toolPath, dir))
  } catch {
    return []
  }
}

function scanAllTools(): ToolSummary[] {
  return Object.entries(TOOL_PATHS).map(([toolName, toolPath]) => {
    const toolPaths = getToolPaths(toolName)
    let exists = toolPaths.some((candidate) => fs.existsSync(candidate))
    const discovered = new Map<string, Skill>()

    for (const sourcePath of toolPaths) {
      const sourceExists = fs.existsSync(sourcePath)
      const disabledPath = getDisabledPath(sourcePath)

      // Restore skills hidden by older Skills Manager releases. The current
      // product treats every discovered skill as available.
      if (sourceExists) {
        try {
          for (const item of fs.readdirSync(sourcePath)) {
            const oldPath = path.join(sourcePath, item)
            if (item.startsWith('.') && fs.existsSync(path.join(oldPath, 'SKILL.md'))) {
              const restoredPath = path.join(sourcePath, item.slice(1))
              if (!fs.existsSync(restoredPath)) fs.renameSync(oldPath, restoredPath)
            }
          }
        } catch (err) {
          console.error(`Skill migration error for ${toolName}:`, err)
        }
      }

      if (fs.existsSync(disabledPath)) {
        try {
          if (!fs.existsSync(sourcePath)) fs.mkdirSync(sourcePath, { recursive: true })
          for (const item of fs.readdirSync(disabledPath)) {
            const oldPath = path.join(disabledPath, item)
            const restoredPath = path.join(sourcePath, item)
            if (fs.existsSync(path.join(oldPath, 'SKILL.md')) && !fs.existsSync(restoredPath)) {
              fs.renameSync(oldPath, restoredPath)
            }
          }
        } catch (err) {
          console.error(`Could not restore disabled skills for ${toolName}:`, err)
        }
      }

      for (const skill of scanDir(toolName, sourcePath)) {
        const key = skill.name.toLowerCase()
        if (!discovered.has(key)) discovered.set(key, skill)
      }
    }

    exists = toolPaths.some((candidate) => fs.existsSync(candidate))
    const allSkills = [...discovered.values()]

    return { 
      tool: toolName, 
      path: toolPath, 
      exists, 
      skillCount: allSkills.length, 
      skills: allSkills 
    }
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

async function deleteSkill(skillPath: string, retries = 5, delay = 200): Promise<boolean> {
  for (let i = 0; i <= retries; i++) {
    try {
      fs.rmSync(skillPath, { recursive: true, force: true })
      return true
    } catch (err: any) {
      const isLockError = err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES'
      if (isLockError && i < retries && process.platform === 'win32') {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }
      return false
    }
  }
  return false
}

let win: BrowserWindow | null = null

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png')
  const isMac = process.platform === 'darwin'
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
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    trafficLightPosition: isMac ? { x: 13, y: 12 } : undefined,
    frame: isMac,
    show: false,
  })

  Menu.setApplicationMenu(null)

  win.once('ready-to-show', () => win?.show())

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC handlers
ipcMain.handle('window:control', (event, action: 'minimize' | 'maximize' | 'close') => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window) return false
  if (action === 'minimize') window.minimize()
  if (action === 'maximize') window.isMaximized() ? window.unmaximize() : window.maximize()
  if (action === 'close') window.close()
  return window.isMaximized()
})

ipcMain.handle('window:edit', (event, action: 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'selectAll') => {
  const contents = event.sender
  if (action === 'undo') contents.undo()
  if (action === 'redo') contents.redo()
  if (action === 'cut') contents.cut()
  if (action === 'copy') contents.copy()
  if (action === 'paste') contents.paste()
  if (action === 'selectAll') contents.selectAll()
})

ipcMain.handle('telemetry:track', (_event, eventName: string, properties?: Record<string, unknown>) => {
  sendTelemetry(eventName, properties)
})

ipcMain.handle('skills:scanAll', () => scanAllTools())

ipcMain.handle('skills:getReadme', (_e, skillPath: string) => readSkillReadme(skillPath))

ipcMain.handle('skills:listTemplates', (_e, skillPath: string) => listTemplates(skillPath))

ipcMain.handle('skills:readTemplate', (_e, skillPath: string, templateName: string) =>
  readTemplate(skillPath, templateName)
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
  apiPath: string
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
        const skillsBasePath = isSingleSkill ? ':root:' : (() => {
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
          const apiPath = dirPath
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/HEAD/${skillMdPath}`

          httpsGet(rawUrl, (content) => {
            const meta = parseSkillMdFrontmatter(content)
            skills.push({ dirName, apiPath, name: meta.name || dirName, description: meta.description })
            if (--pending === 0) resolve({ ok: true, skillsBasePath, skills })
          }, () => {
            skills.push({ dirName, apiPath, name: dirName, description: '' })
            if (--pending === 0) resolve({ ok: true, skillsBasePath, skills })
          })
        })
      },
      (err) => resolve({ ok: false, skillsBasePath: '', skills: [], error: err })
    )
  })
}

// Recursively download a GitHub directory (contents API) into a local folder.
// Returns true if all items were downloaded successfully.
function downloadDir(
  owner: string,
  repoName: string,
  apiPath: string,
  localDestDir: string,
  onProgress: (msg: string) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${apiPath}`
    httpsGet(url, (raw) => {
      let items: Array<{ name: string; type: string; download_url: string | null; path: string }> = []
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) {
          const msg = (parsed as { message?: string })?.message || 'Unexpected response'
          onProgress(`  Error: ${msg}${apiPath ? ` (path: ${apiPath})` : ' (root)'}`)
          return resolve(false)
        }
        items = parsed
      } catch {
        onProgress('  Error: Failed to parse GitHub response')
        return resolve(false)
      }

      try { fs.mkdirSync(localDestDir, { recursive: true }) } catch { /* ignore */ }

      const files = items.filter((f) => f.type === 'file')
      const dirs = items.filter((f) => f.type === 'dir')
      let pending = files.length + dirs.length
      if (pending === 0) return resolve(true)

      let allOk = true
      const done = (ok = true) => {
        if (!ok) allOk = false
        if (--pending === 0) resolve(allOk)
      }

      for (const file of files) {
        if (!file.download_url) { done(); continue }
        httpsGet(file.download_url, (content) => {
          try { fs.writeFileSync(path.join(localDestDir, file.name), content, 'utf-8') } catch { /* ignore */ }
          done()
        }, () => done())
      }

      for (const dir of dirs) {
        downloadDir(owner, repoName, dir.path, path.join(localDestDir, dir.name), onProgress)
          .then((ok) => done(ok))
      }
    }, (err) => {
      onProgress(`  Network error: ${err}`)
      resolve(false)
    })
  })
}

// Install selected skills from a GitHub repo into target agent's skills folder.
async function installFromGitHub(
  repo: string,
  targetAgent: string,
  skillsToInstall: { dirName: string; apiPath: string }[],
  onProgress: (msg: string) => void
): Promise<{ ok: boolean; installed: string[]; error?: string }> {
  const targetBase = TOOL_PATHS[targetAgent]
  if (!targetBase) return { ok: false, installed: [], error: `Unknown agent: ${targetAgent}` }

  const repoParts = repo.replace('https://github.com/', '').replace(/\/$/, '').split('/')
  const owner = repoParts[0]
  const repoName = repoParts[1]
  if (!owner || !repoName) return { ok: false, installed: [], error: 'Invalid repo format. Use owner/repo' }

  try { fs.mkdirSync(targetBase, { recursive: true }) } catch { /* ignore */ }

  const installed: string[] = []
  let lastError: string | undefined

  for (const skill of skillsToInstall) {
    const { dirName, apiPath } = skill
    const destDir = path.join(targetBase, dirName)

    if (fs.existsSync(destDir)) {
      onProgress(`Skipping ${dirName} (already exists)`)
      continue
    }

    onProgress(`Installing ${dirName}...`)
    const ok = await downloadDir(owner, repoName, apiPath, destDir, onProgress)
    if (ok) {
      installed.push(dirName)
      onProgress(`✓ ${dirName} installed`)
    } else {
      lastError = `Failed to install ${dirName}`
      try { fs.rmSync(destDir, { recursive: true, force: true }) } catch { /* ignore */ }
    }
  }

  return { ok: !lastError, installed, error: lastError }
}

ipcMain.handle('skills:delete', (_e, skillPath: string) => deleteSkill(skillPath))

ipcMain.handle('skills:listAgentPaths', () => listAgentPaths())

ipcMain.handle('skills:copyToAgent', (_e, skillPath: string, targetAgent: string) =>
  copySkillToAgent(skillPath, targetAgent)
)

ipcMain.handle('skills:discoverSkills', (_e, repo: string) => discoverSkills(repo))

ipcMain.handle('skills:installFromGitHub', async (e, repo: string, targetAgent: string, skillsToInstall: { dirName: string; apiPath: string }[]) => {
  return installFromGitHub(repo, targetAgent, skillsToInstall, (msg) => {
    e.sender.send('skills:installProgress', msg)
  })
})

// ── Collections ──────────────────────────────────────────────────────────────
interface Collection {
  id: string
  name: string
  skillIds: string[]
}

function getCollectionsPath() {
  return path.join(app.getPath('userData'), 'collections.json')
}

function readCollections(): Collection[] {
  try { return JSON.parse(fs.readFileSync(getCollectionsPath(), 'utf-8')) } catch { return [] }
}

function writeCollections(cols: Collection[]) {
  fs.writeFileSync(getCollectionsPath(), JSON.stringify(cols, null, 2))
}

ipcMain.handle('collections:list', () => readCollections())

ipcMain.handle('collections:create', (_e, name: string) => {
  const cols = readCollections()
  const col: Collection = { id: Date.now().toString(), name, skillIds: [] }
  writeCollections([...cols, col])
  return col
})

ipcMain.handle('collections:delete', (_e, id: string) => {
  writeCollections(readCollections().filter((c) => c.id !== id))
})

ipcMain.handle('collections:addSkill', (_e, collectionId: string, skillId: string) => {
  const cols = readCollections()
  writeCollections(cols.map((c) =>
    c.id === collectionId && !c.skillIds.includes(skillId)
      ? { ...c, skillIds: [...c.skillIds, skillId] }
      : c
  ))
})

ipcMain.handle('collections:removeSkill', (_e, collectionId: string, skillId: string) => {
  const cols = readCollections()
  writeCollections(cols.map((c) =>
    c.id === collectionId ? { ...c, skillIds: c.skillIds.filter((id) => id !== skillId) } : c
  ))
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

ipcMain.handle('feedback:submit', async (_event, feedback: {
  category?: string
  rating?: number
  message?: string
  email?: string
}) => {
  const message = feedback.message?.trim()
  if (!message || message.length > 4000) {
    return { ok: false, error: 'Please enter feedback between 1 and 4,000 characters.' }
  }

  try {
    const response = await fetch('https://sm.idoevergreen.me/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: ['bug', 'idea', 'general'].includes(feedback.category ?? '') ? feedback.category : 'general',
        rating: Number.isInteger(feedback.rating) && feedback.rating! >= 1 && feedback.rating! <= 5
          ? feedback.rating
          : undefined,
        message,
        email: feedback.email?.trim() || undefined,
        source: 'desktop',
        appVersion: app.getVersion(),
        platform: process.platform,
      }),
    })
    if (!response.ok) return { ok: false, error: 'Feedback could not be sent right now.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Check your internet connection and try again.' }
  }
})

ipcMain.handle('skills:searchMarketplace', async (_e, query: string, page: number) => {
  function doGet(url: string, headers: Record<string, string>): Promise<{ ok: boolean; data?: any; error?: string }> {
    return new Promise((resolve) => {
      const req = https.get(url, { headers }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          doGet(new URL(res.headers.location, url).toString(), headers).then(resolve)
          return
        }
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          const status = res.statusCode ?? 0
          if (status < 200 || status >= 300) {
            resolve({ ok: false, error: `Registry request failed (HTTP ${status})` })
            return
          }
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
  const marketplace = await doGet(`https://mcpmarket.com/api/search?${params}`, {
    'Accept': 'application/json',
    'User-Agent': 'skills-manager-desktop',
    'Referer': 'https://mcpmarket.com/',
  })
  if (marketplace.ok && Array.isArray(marketplace.data?.skills)) return marketplace

  const githubToken = getGithubToken()
  const githubHeaders: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'skills-manager-desktop',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (githubToken) githubHeaders.Authorization = `Bearer ${githubToken}`
  const githubQuery = query.trim() ? `${query.trim()} topic:agent-skills` : 'topic:agent-skills'
  const githubParams = new URLSearchParams({
    q: githubQuery,
    sort: 'stars',
    order: 'desc',
    per_page: '24',
    page: String(page),
  })
  const github = await doGet(`https://api.github.com/search/repositories?${githubParams}`, githubHeaders)
  if (!github.ok) return { ok: false, error: `${marketplace.error ?? 'Marketplace unavailable'}; ${github.error ?? 'GitHub fallback unavailable'}` }

  const items = Array.isArray(github.data?.items) ? github.data.items : []
  return {
    ok: true,
    data: {
      source: 'github',
      skills: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.name,
        github: item.full_name,
        owner: { name: item.owner?.login ?? '', url: item.owner?.html_url ?? '' },
        description: item.description ?? '',
        github_stars: item.stargazers_count ?? 0,
      })),
      pagination: { hasMore: (github.data?.total_count ?? 0) > page * 24 },
    },
  }
})

app.whenReady().then(() => {
  createWindow()

  // Watch skill directories and notify renderer on any change
  const watchPaths = Object.keys(TOOL_PATHS).flatMap(getToolPaths)
  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    depth: 2,
    awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 },
  })
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  watcher.on('all', () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (win) win.webContents.send('skills:changed')
    }, 500)
  })

  // Check for updates silently after startup (production only)
  if (!process.env.VITE_DEV_SERVER_URL && process.env.NODE_ENV !== 'test') {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
