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
  installFromGitHub: (repo: string, targetAgent: string, skillDirNames: string[], skillsBasePath: string) =>
    ipcRenderer.invoke('skills:installFromGitHub', repo, targetAgent, skillDirNames, skillsBasePath),
  onInstallProgress: (cb: (msg: string) => void) => {
    ipcRenderer.on('skills:installProgress', (_e, msg) => cb(msg))
    return () => ipcRenderer.removeAllListeners('skills:installProgress')
  },
  openInExplorer: (skillPath: string) => ipcRenderer.invoke('skills:openInExplorer', skillPath),
})
