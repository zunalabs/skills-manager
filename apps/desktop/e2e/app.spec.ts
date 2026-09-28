import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const appDirectory = path.resolve(__dirname, '..')
const packageInfo = JSON.parse(readFileSync(path.join(appDirectory, 'package.json'), 'utf8'))

test.describe('Skills Manager desktop', () => {
  let electronApp: ElectronApplication
  let window: Page
  let profileDirectory: string

  test.beforeAll(async () => {
    profileDirectory = await mkdtemp(path.join(tmpdir(), 'skills-manager-e2e-'))
    electronApp = await electron.launch({
      args: ['.', `--user-data-dir=${profileDirectory}`],
      cwd: appDirectory,
      env: {
        ...(process.env as Record<string, string>),
        NODE_ENV: 'test',
      },
    })
    window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
  })

  test.afterAll(async () => {
    await electronApp?.close()
    if (profileDirectory) await rm(profileDirectory, { recursive: true, force: true })
  })

  test('shows the redesigned application shell and current navigation', async () => {
    await expect(window).toHaveTitle('Skills Manager')
    await expect(window.getByRole('button', { name: 'Add skill' })).toBeVisible()
    await expect(window.getByRole('navigation', { name: 'Main navigation' })).toContainText('Skills')
    await expect(window.getByRole('navigation', { name: 'Main navigation' })).toContainText('Discover')
    await expect(window.getByText(`v${packageInfo.version}`, { exact: true })).toBeVisible()
  })

  test('keeps the Settings heading below the title bar and light mode works', async () => {
    await window.getByRole('button', { name: 'Settings' }).last().click()
    const settings = window.locator('.settings-dialog')
    await expect(settings).toBeVisible()
    await expect(settings.locator('.settings-header')).toContainText('Settings')

    const drawer = await settings.boundingBox()
    expect(drawer?.y).toBeGreaterThanOrEqual(37)

    await settings.getByRole('button', { name: 'Light' }).click()
    await expect(window.locator('html')).toHaveClass(/light/)
    await expect(settings.getByText(`v${packageInfo.version}`, { exact: true })).toBeVisible()
    await settings.getByRole('button', { name: 'Close settings' }).click()
  })

  test('does not show removed skill-state controls or an analytics notice', async () => {
    await expect(window.getByText('Anonymous usage analytics are on')).toHaveCount(0)
    await expect(window.getByRole('button', { name: 'Enabled', exact: true })).toHaveCount(0)
    await expect(window.getByRole('button', { name: 'Disabled', exact: true })).toHaveCount(0)
  })
})
