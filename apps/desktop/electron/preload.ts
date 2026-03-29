import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('skillsAPI', {
  scanAll: () => ipcRenderer.invoke('skills:scanAll'),
  getReadme: (skillPath: string) => ipcRenderer.invoke('skills:getReadme', skillPath),
  listTemplates: (skillPath: string) => ipcRenderer.invoke('skills:listTemplates', skillPath),
  readTemplate: (skillPath: string, templateName: string) =>
    ipcRenderer.invoke('skills:readTemplate', skillPath, templateName),
  toggle: (skillPath: string, enabled: boolean) =>
    ipcRenderer.invoke('skills:toggle', skillPath, enabled),
  delete: (skillPath: string) => ipcRenderer.invoke('skills:delete', skillPath),
  listAgentPaths: () => ipcRenderer.invoke('skills:listAgentPaths'),
  copyToAgent: (skillPath: string, targetAgent: string) =>
    ipcRenderer.invoke('skills:copyToAgent', skillPath, targetAgent),
  discoverSkills: (repo: string) => ipcRenderer.invoke('skills:discoverSkills', repo),
  installFromGitHub: (repo: string, targetAgent: string, skillsToInstall: { dirName: string; apiPath: string }[]) =>
    ipcRenderer.invoke('skills:installFromGitHub', repo, targetAgent, skillsToInstall),
  onInstallProgress: (cb: (msg: string) => void) => {
    ipcRenderer.on('skills:installProgress', (_e, msg) => cb(msg))
    return () => ipcRenderer.removeAllListeners('skills:installProgress')
  },
  openInExplorer: (skillPath: string) => ipcRenderer.invoke('skills:openInExplorer', skillPath),
  openExternal: (url: string) => ipcRenderer.invoke('skills:openExternal', url),
  searchMarketplace: (query: string, page: number) => ipcRenderer.invoke('skills:searchMarketplace', query, page),
  getGithubToken: () => ipcRenderer.invoke('skills:getGithubToken'),
  setGithubToken: (token: string) => ipcRenderer.invoke('skills:setGithubToken', token),
  // Collections
  listCollections: () => ipcRenderer.invoke('collections:list'),
  createCollection: (name: string) => ipcRenderer.invoke('collections:create', name),
  deleteCollection: (id: string) => ipcRenderer.invoke('collections:delete', id),
  addToCollection: (collectionId: string, skillId: string) => ipcRenderer.invoke('collections:addSkill', collectionId, skillId),
  removeFromCollection: (collectionId: string, skillId: string) => ipcRenderer.invoke('collections:removeSkill', collectionId, skillId),
  // File watching
  onSkillsChanged: (cb: () => void) => {
    ipcRenderer.on('skills:changed', cb)
    return () => ipcRenderer.removeListener('skills:changed', cb)
  },
})
