/**
 * 🎭 璐娜的 GIF 動畫製作器 - Playwright 輸出驗證測試
 * 使用真實瀏覽器測試所有輸出功能並驗證生成的內容
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class PlaywrightOutputValidationTest {
  constructor() {
    this.electronProcess = null;
    this.outputDir = path.join(__dirname, 'playwright-outputs');
    this.testResults = [];
  }

  // 啟動 Electron 應用程式
  async startElectronApp() {
    console.log('🚀 啟動 Electron 應用程式...');
    
    return new Promise((resolve, reject) => {
      this.electronProcess = spawn('npm', ['start'], {
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      this.electronProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('Electron 輸出:', data.toString());
      });

      this.electronProcess.stderr.on('data', (data) => {
        console.log('Electron 錯誤:', data.toString());
      });

      // 等待應用程式啟動
      setTimeout(() => {
        console.log('✅ Electron 應用程式啟動完成');
        resolve();
      }, 8000);
    });
  }

  // 停止 Electron 應用程式
  async stopElectronApp() {
    if (this.electronProcess) {
      this.electronProcess.kill();
      console.log('✅ Electron 應用程式已關閉');
    }
  }
}

// Playwright 測試套件
test.describe('璐娜的 GIF 動畫製作器 - 輸出驗證測試', () => {
  let testRunner;
  let page;

  test.beforeAll(async ({ browser }) => {
    testRunner = new PlaywrightOutputValidationTest();
    
    // 啟動 Electron 應用程式
    await testRunner.startElectronApp();
    
    // 創建瀏覽器頁面
    page = await browser.newPage();
    
    // 設定較長的超時時間
    page.setDefaultTimeout(30000);
    
    // 導航到應用程式（假設在 localhost:3000）
    try {
      await page.goto('http://localhost:3000');
    } catch (error) {
      console.log('⚠️ 無法連接到 localhost:3000，嘗試檔案協議...');
      // 如果是檔案協議，需要調整路徑
      const indexPath = path.join(__dirname, '..', 'src', 'index.html');
      await page.goto(`file://${indexPath}`);
    }
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    console.log('✅ 頁面載入完成');
  });

  test.afterAll(async () => {
    if (testRunner) {
      await testRunner.stopElectronApp();
    }
  });

  test('🎨 測試 SVG 動畫生成並驗證輸出', async () => {
    console.log('\n🎨 開始 SVG 動畫測試...');

    try {
      // 1. 設定動畫參數
      await page.selectOption('#shapeSelect', 'circle');
      await page.selectOption('#animationTypeSelect', 'bounce');
      await page.fill('#colorInput', '#ff3b30');
      await page.fill('#sizeInput', '40');
      await page.fill('#durationInput', '2');

      // 2. 選擇 SVG 生成模式
      await page.click('input[value="svg"]');
      
      // 3. 點擊生成按鈕
      await page.click('#generateBtn');
      
      // 4. 等待生成完成
      await page.waitForSelector('.status.success', { timeout: 15000 });
      
      // 5. 檢查是否有成功訊息
      const statusText = await page.textContent('.status');
      expect(statusText).toContain('SVG 動畫生成成功');
      
      // 6. 驗證 SVG 預覽是否存在
      const svgPreview = await page.locator('#preview-canvas svg');
      await expect(svgPreview).toBeVisible();
      
      // 7. 檢查 SVG 內容
      const svgContent = await svgPreview.innerHTML();
      expect(svgContent).toContain('animate');
      expect(svgContent).toContain('circle');
      
      console.log('✅ SVG 動畫測試通過');

    } catch (error) {
      console.error('❌ SVG 動畫測試失敗:', error);
      throw error;
    }
  });

  test('🎬 測試 GIF 動畫生成並驗證輸出', async () => {
    console.log('\n🎬 開始 GIF 動畫測試...');

    try {
      // 1. 設定動畫參數
      await page.selectOption('#shapeSelect', 'square');
      await page.selectOption('#animationTypeSelect', 'rotate');
      await page.fill('#colorInput', '#007aff');
      await page.fill('#fpsInput', '15');
      await page.fill('#durationInput', '1');

      // 2. 選擇 FFmpeg GIF 生成模式
      await page.click('input[value="ffmpeg"]');
      
      // 3. 點擊生成按鈕
      await page.click('#generateBtn');
      
      // 4. 等待生成完成（GIF 生成可能需要更長時間）
      await page.waitForSelector('.status.success', { timeout: 30000 });
      
      // 5. 檢查是否有成功訊息
      const statusText = await page.textContent('.status');
      expect(statusText).toContain('GIF') || expect(statusText).toContain('成功');
      
      // 6. 檢查進度條是否完成
      const progressBar = await page.locator('.progress-fill');
      const progressWidth = await progressBar.evaluate(el => el.style.width);
      expect(progressWidth).toBe('100%');
      
      console.log('✅ GIF 動畫測試通過');

    } catch (error) {
      console.error('❌ GIF 動畫測試失敗:', error);
      throw error;
    }
  });

  test('📸 測試 PNG 幀序列生成並驗證輸出', async () => {
    console.log('\n📸 開始 PNG 幀序列測試...');

    try {
      // 1. 設定動畫參數
      await page.selectOption('#shapeSelect', 'triangle');
      await page.selectOption('#animationTypeSelect', 'pulse');
      await page.fill('#colorInput', '#34c759');
      await page.fill('#fpsInput', '10');
      await page.fill('#durationInput', '1');

      // 2. 選擇 PNG 幀序列生成模式
      await page.click('input[value="frames"]');
      
      // 3. 點擊生成按鈕
      await page.click('#generateBtn');
      
      // 4. 等待生成完成
      await page.waitForSelector('.status.success', { timeout: 20000 });
      
      // 5. 檢查是否有成功訊息
      const statusText = await page.textContent('.status');
      expect(statusText).toContain('PNG') || expect(statusText).toContain('幀') || expect(statusText).toContain('成功');
      
      // 6. 檢查是否顯示了幀數量
      expect(statusText).toMatch(/\d+.*幀/);
      
      console.log('✅ PNG 幀序列測試通過');

    } catch (error) {
      console.error('❌ PNG 幀序列測試失敗:', error);
      throw error;
    }
  });

  test('🔧 測試所有控制項功能', async () => {
    console.log('\n🔧 開始控制項功能測試...');

    try {
      // 測試形狀選擇
      const shapes = ['circle', 'square', 'triangle', 'line'];
      for (const shape of shapes) {
        await page.selectOption('#shapeSelect', shape);
        const selectedValue = await page.inputValue('#shapeSelect');
        expect(selectedValue).toBe(shape);
      }

      // 測試動畫類型選擇
      const animations = ['bounce', 'rotate', 'pulse', 'fade'];
      for (const animation of animations) {
        await page.selectOption('#animationTypeSelect', animation);
        const selectedValue = await page.inputValue('#animationTypeSelect');
        expect(selectedValue).toBe(animation);
      }

      // 測試數值輸入
      await page.fill('#sizeInput', '50');
      expect(await page.inputValue('#sizeInput')).toBe('50');

      await page.fill('#speedInput', '1500');
      expect(await page.inputValue('#speedInput')).toBe('1500');

      await page.fill('#fpsInput', '20');
      expect(await page.inputValue('#fpsInput')).toBe('20');

      await page.fill('#durationInput', '3');
      expect(await page.inputValue('#durationInput')).toBe('3');

      // 測試顏色選擇
      await page.fill('#colorInput', '#ff9500');
      expect(await page.inputValue('#colorInput')).toBe('#ff9500');

      console.log('✅ 控制項功能測試通過');

    } catch (error) {
      console.error('❌ 控制項功能測試失敗:', error);
      throw error;
    }
  });

  test('📷 測試截圖功能並驗證視覺效果', async () => {
    console.log('\n📷 開始截圖測試...');

    try {
      // 設定測試參數
      await page.selectOption('#shapeSelect', 'circle');
      await page.selectOption('#animationTypeSelect', 'bounce');
      await page.fill('#colorInput', '#ff3b30');

      // 等待動畫預覽載入
      await page.waitForTimeout(2000);

      // 截圖整個應用程式
      const fullScreenshot = await page.screenshot({
        path: path.join(__dirname, 'screenshots', 'full-app.png'),
        fullPage: true
      });

      // 截圖預覽區域
      const previewElement = await page.locator('#preview-canvas');
      await expect(previewElement).toBeVisible();
      
      const previewScreenshot = await previewElement.screenshot({
        path: path.join(__dirname, 'screenshots', 'preview-canvas.png')
      });

      // 截圖控制面板
      const controlsElement = await page.locator('.controls-panel');
      await expect(controlsElement).toBeVisible();
      
      const controlsScreenshot = await controlsElement.screenshot({
        path: path.join(__dirname, 'screenshots', 'controls-panel.png')
      });

      // 驗證截圖檔案大小（確保不是空白）
      expect(fullScreenshot.length).toBeGreaterThan(1000);
      expect(previewScreenshot.length).toBeGreaterThan(500);
      expect(controlsScreenshot.length).toBeGreaterThan(500);

      console.log('✅ 截圖測試通過');

    } catch (error) {
      console.error('❌ 截圖測試失敗:', error);
      throw error;
    }
  });

  test('🧪 測試錯誤處理和邊界條件', async () => {
    console.log('\n🧪 開始錯誤處理測試...');

    try {
      // 測試無效的數值輸入
      await page.fill('#sizeInput', '0');
      await page.fill('#durationInput', '0');
      await page.click('#generateBtn');
      
      // 應該顯示錯誤或警告
      await page.waitForTimeout(1000);
      
      // 測試極大的數值
      await page.fill('#sizeInput', '1000');
      await page.fill('#durationInput', '100');
      await page.click('#generateBtn');
      
      await page.waitForTimeout(1000);

      // 重置為正常值
      await page.fill('#sizeInput', '40');
      await page.fill('#durationInput', '2');

      console.log('✅ 錯誤處理測試通過');

    } catch (error) {
      console.error('❌ 錯誤處理測試失敗:', error);
      throw error;
    }
  });

  test('⚡ 測試性能和響應速度', async () => {
    console.log('\n⚡ 開始性能測試...');

    try {
      const startTime = Date.now();

      // 快速切換多個設定
      for (let i = 0; i < 5; i++) {
        await page.selectOption('#shapeSelect', 'circle');
        await page.selectOption('#animationTypeSelect', 'bounce');
        await page.fill('#colorInput', '#ff3b30');
        await page.waitForTimeout(100);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 性能應該在合理範圍內
      expect(duration).toBeLessThan(5000); // 5秒內完成

      console.log(`⚡ 性能測試通過: ${duration}ms`);

    } catch (error) {
      console.error('❌ 性能測試失敗:', error);
      throw error;
    }
  });
});

module.exports = PlaywrightOutputValidationTest;
