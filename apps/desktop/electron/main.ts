import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import fs from 'fs'
import os from 'os'
import yaml from 'js-yaml'
import https from 'https'
import chokidar from 'chokidar'

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

function getDisabledPath(toolPath: string): string {
  return toolPath + '_disabled'
}

function readSkillDir(toolName: string, toolPath: string, skillDirName: string, isEnabled: boolean): Skill {
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
    enabled: isEnabled,
  }
}

function scanDir(toolName: string, toolPath: string, isEnabled: boolean): Skill[] {
  if (!fs.existsSync(toolPath)) return []
  try {
    const entries = fs.readdirSync(toolPath).filter((entry) => {
      const full = path.join(toolPath, entry)
      try {
        const stats = fs.statSync(full)
        return stats.isDirectory()
      } catch {
        return false
      }
    })
    return entries.map((dir) => readSkillDir(toolName, toolPath, dir, isEnabled))
  } catch {
    return []
  }
}

function scanAllTools(): ToolSummary[] {
  return Object.entries(TOOL_PATHS).map(([toolName, toolPath]) => {
    const exists = fs.existsSync(toolPath)
    const disabledPath = getDisabledPath(toolPath)

    // Migration: Move old dot-prefixed skill folders to the _disabled directory
    if (exists) {
      try {
        const items = fs.readdirSync(toolPath)
        for (const item of items) {
          if (item.startsWith('.') && item !== '.' && item !== '..') {
            const oldPath = path.join(toolPath, item)
            const cleanName = item.slice(1)
            const newPath = path.join(disabledPath, cleanName)
            if (!fs.existsSync(disabledPath)) fs.mkdirSync(disabledPath, { recursive: true })
            if (!fs.existsSync(newPath)) {
              console.log(`Migrating legacy disabled skill: ${item} -> ${newPath}`)
              fs.renameSync(oldPath, newPath)
            }
          }
        }
      } catch (err) {
        console.error(`Migration error for ${toolName}:`, err)
      }
    }

    const activeSkills = scanDir(toolName, toolPath, true)
    const disabledSkills = scanDir(toolName, disabledPath, false)
    const allSkills = [...activeSkills, ...disabledSkills]

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

async function renameWithRetry(oldPath: string, newPath: string, retries = 10, delay = 150): Promise<void> {
  const isWindows = process.platform === 'win32'
  for (let i = 0; i <= retries; i++) {
    try {
      fs.renameSync(oldPath, newPath)
      return
    } catch (err: any) {
      const isLockError = err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES'
      if (isLockError && i < retries && isWindows) {
        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }
      throw err
    }
  }
}

async function toggleSkill(skillPath: string, enabled: boolean): Promise<{ ok: boolean; newPath: string; error?: string }> {
  try {
    const parentDir = path.dirname(skillPath)
    const baseName = path.basename(skillPath)
    
    let activePath = ''
    let disabledPath = ''
    let toolName = 'the agent'
    
    for (const [name, p] of Object.entries(TOOL_PATHS)) {
      const d = getDisabledPath(p)
      if (parentDir === p || parentDir === d) {
        activePath = p
        disabledPath = d
        toolName = name
        break
      }
    }
    
    if (!activePath) {
      return { ok: false, newPath: skillPath, error: 'Could not identify agent directory' }
    }
    
    const targetDir = enabled ? activePath : disabledPath
    const newPath = path.join(targetDir, baseName)
    
    if (newPath === skillPath) return { ok: true, newPath }
    
    if (fs.existsSync(newPath)) {
      return { ok: false, newPath: skillPath, error: `Destination already exists at ${newPath}` }
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    try {
      await renameWithRetry(skillPath, newPath)
    } catch (e: any) {
      if (e.code === 'EPERM' || e.code === 'EBUSY') {
        return { 
          ok: false, 
          newPath: skillPath, 
          error: `Operation not permitted (locked). Please close any active sessions of ${toolName} (e.g., Claude Code, Goose) and try again.`
        }
      }
      throw e
    }
    
    return { ok: true, newPath }
  } catch (e) {
    console.error('toggleSkill error:', e)
    return { ok: false, newPath: skillPath, error: String(e) }
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

app.whenReady().then(() => {
  createWindow()

  // Watch skill directories and notify renderer on any change
  const watchPaths = Object.values(TOOL_PATHS)
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
  if (!process.env.VITE_DEV_SERVER_URL) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
