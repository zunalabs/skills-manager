import { test, expect, _electron as electron, ElectronApplication } from '@playwright/test';

test.describe('Skills Manager Desktop App', () => {
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    // Start the Electron app in the current directory
    electronApp = await electron.launch({
      args: ['.'],
      env: {
        ...(process.env as Record<string, string>),
        NODE_ENV: 'test',
        VITE_DEV_SERVER_URL: 'http://localhost:5173',
      }
    });
  });

  test.afterEach(async () => {
    // Graceful teardown
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should launch and verify the main window', async () => {
    // Grab the first window spawned
    const window = await electronApp.firstWindow();
    expect(window).toBeTruthy();

    // Verify title setup in main process or index.html
    // Provide a fallback regex depending on index.html config
    await expect(window).toHaveTitle(/Skills Manager|Vite \+ React \+ TS|Vite \+ React/i);

    // Simple visibility check
    await expect(window.locator('body')).toBeVisible();
  });
});
