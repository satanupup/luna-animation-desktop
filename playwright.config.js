/**
 * 🎭 璐娜的 GIF 動畫製作器 - Playwright 配置
 * 用於真實瀏覽器測試和輸出驗證
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // 測試目錄
  testDir: './tests',
  
  // 測試檔案模式
  testMatch: '**/playwright-*.js',
  
  // 全域設定
  fullyParallel: false, // 不並行執行，避免資源衝突
  forbidOnly: !!process.env.CI, // CI 環境中禁止 test.only
  retries: process.env.CI ? 2 : 1, // CI 環境重試 2 次，本地重試 1 次
  workers: 1, // 只使用 1 個 worker，避免 Electron 衝突
  
  // 報告器
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['list']
  ],
  
  // 全域設定
  use: {
    // 基本設定
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    // 截圖設定
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // 瀏覽器設定
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // 輸出目錄
    outputDir: 'test-results/playwright-output'
  },

  // 專案配置
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 允許檔案協議
        launchOptions: {
          args: ['--allow-file-access-from-files', '--disable-web-security']
        }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox 特定設定
        launchOptions: {
          firefoxUserPrefs: {
            'security.fileuri.strict_origin_policy': false
          }
        }
      },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 移動裝置測試（可選）
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 網頁伺服器設定（如果需要）
  webServer: {
    command: 'npm start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  
  // 測試超時設定
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // 輸出目錄
  outputDir: 'test-results/playwright-output',
  
  // 全域設定檔案
  globalSetup: require.resolve('./tests/global-setup.js'),
  globalTeardown: require.resolve('./tests/global-teardown.js'),
});
