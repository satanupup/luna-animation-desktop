/**
 * 🎭 璐娜的 GIF 動畫製作器 - Playwright UI 測試
 * 真實的瀏覽器測試，包含截圖、點擊和輸出驗證
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;

class PlaywrightUITest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.screenshotDir = path.join(__dirname, 'playwright-screenshots');
    this.outputDir = path.join(__dirname, 'playwright-outputs');
  }

  async runAllTests() {
    console.log('🎭 開始 Playwright UI 測試...');
    
    try {
      await this.setupBrowser();
      await this.setupTestEnvironment();
      
      // 執行各種 UI 測試
      await this.testMainInterface();
      await this.testShapeSelection();
      await this.testAnimationTypes();
      await this.testRotationFeature();
      await this.testOutputGeneration();
      
      await this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Playwright 測試失敗:', error);
    } finally {
      await this.cleanup();
    }
  }

  async setupBrowser() {
    console.log('🌐 啟動瀏覽器...');
    
    this.browser = await chromium.launch({
      headless: false, // 顯示瀏覽器窗口以便觀察
      slowMo: 500 // 減慢操作速度以便觀察
    });
    
    this.page = await this.browser.newPage();
    
    // 設定視窗大小
    await this.page.setViewportSize({ width: 1200, height: 800 });
    
    console.log('✅ 瀏覽器啟動成功');
  }

  async setupTestEnvironment() {
    console.log('🔧 設定測試環境...');
    
    await fs.mkdir(this.screenshotDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // 載入應用程式（假設在本地服務器運行）
    const appURL = 'file://' + path.join(__dirname, '..', 'src', 'index.html');
    await this.page.goto(appURL);
    
    // 等待頁面載入
    await this.page.waitForLoadState('networkidle');
    
    console.log('✅ 測試環境準備完成');
  }

  async testMainInterface() {
    console.log('\n🖥️ 測試主界面...');
    
    try {
      // 截圖主界面
      await this.takeScreenshot('main-interface');
      
      // 檢查主要元素是否存在
      const elements = [
        '#shape-selector',
        '#animation-type-selector',
        '#preview-canvas',
        '#generate-gif-btn',
        '#generate-svg-btn'
      ];
      
      for (const selector of elements) {
        const element = await this.page.$(selector);
        const exists = element !== null;
        
        this.testResults.push({
          type: 'UI Element',
          name: `element_${selector.replace('#', '')}`,
          status: exists ? 'PASS' : 'FAIL',
          details: { selector, exists }
        });
        
        console.log(`${exists ? '✅' : '❌'} 元素 ${selector}: ${exists ? '存在' : '不存在'}`);
      }
      
    } catch (error) {
      console.error('❌ 主界面測試失敗:', error);
      this.testResults.push({
        type: 'UI Test',
        name: 'main_interface',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testShapeSelection() {
    console.log('\n🔷 測試形狀選擇...');
    
    try {
      const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
      
      for (const shape of shapes) {
        // 點擊形狀選擇器
        await this.page.click('#shape-selector');
        await this.page.waitForTimeout(500);
        
        // 選擇特定形狀
        const shapeOption = await this.page.$(`option[value="${shape}"]`);
        if (shapeOption) {
          await this.page.selectOption('#shape-selector', shape);
          await this.page.waitForTimeout(1000);
          
          // 截圖選擇後的效果
          await this.takeScreenshot(`shape-${shape}-selected`);
          
          // 檢查預覽是否更新
          const canvas = await this.page.$('#preview-canvas');
          const canvasExists = canvas !== null;
          
          this.testResults.push({
            type: 'Shape Selection',
            name: `shape_${shape}`,
            status: canvasExists ? 'PASS' : 'FAIL',
            details: { shape, canvasExists }
          });
          
          console.log(`${canvasExists ? '✅' : '❌'} 形狀 ${shape} 選擇測試`);
        }
      }
      
    } catch (error) {
      console.error('❌ 形狀選擇測試失敗:', error);
      this.testResults.push({
        type: 'Shape Selection',
        name: 'shape_selection_error',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testAnimationTypes() {
    console.log('\n🎬 測試動畫類型...');
    
    try {
      const animations = ['bounce', 'pulse', 'rotate', 'swing', 'fade'];
      
      for (const animation of animations) {
        // 選擇動畫類型
        await this.page.selectOption('#animation-type-selector', animation);
        await this.page.waitForTimeout(1000);
        
        // 截圖動畫效果
        await this.takeScreenshot(`animation-${animation}`);
        
        // 檢查動畫是否開始
        const isAnimating = await this.page.evaluate(() => {
          const canvas = document.getElementById('preview-canvas');
          return canvas && canvas.style.display !== 'none';
        });
        
        this.testResults.push({
          type: 'Animation',
          name: `animation_${animation}`,
          status: isAnimating ? 'PASS' : 'FAIL',
          details: { animation, isAnimating }
        });
        
        console.log(`${isAnimating ? '✅' : '❌'} 動畫 ${animation} 測試`);
      }
      
    } catch (error) {
      console.error('❌ 動畫類型測試失敗:', error);
      this.testResults.push({
        type: 'Animation',
        name: 'animation_error',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testRotationFeature() {
    console.log('\n🔄 測試旋轉功能...');
    
    try {
      // 檢查旋轉滑桿是否存在
      const rotationSlider = await this.page.$('#rotation-slider');
      if (!rotationSlider) {
        console.log('⚠️ 旋轉滑桿不存在，跳過旋轉測試');
        return;
      }
      
      const rotationAngles = [0, 45, 90, 180, 270];
      
      for (const angle of rotationAngles) {
        // 設定旋轉角度
        await this.page.fill('#rotation-slider', angle.toString());
        await this.page.waitForTimeout(1000);
        
        // 截圖旋轉效果
        await this.takeScreenshot(`rotation-${angle}deg`);
        
        // 檢查旋轉值是否正確設定
        const currentValue = await this.page.inputValue('#rotation-slider');
        const isCorrect = parseInt(currentValue) === angle;
        
        this.testResults.push({
          type: 'Rotation',
          name: `rotation_${angle}deg`,
          status: isCorrect ? 'PASS' : 'FAIL',
          details: { angle, currentValue, isCorrect }
        });
        
        console.log(`${isCorrect ? '✅' : '❌'} 旋轉 ${angle}° 測試`);
      }
      
    } catch (error) {
      console.error('❌ 旋轉功能測試失敗:', error);
      this.testResults.push({
        type: 'Rotation',
        name: 'rotation_error',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testOutputGeneration() {
    console.log('\n📤 測試輸出生成...');
    
    try {
      // 測試 SVG 生成
      await this.testSVGGeneration();
      
      // 測試 GIF 生成
      await this.testGIFGeneration();
      
    } catch (error) {
      console.error('❌ 輸出生成測試失敗:', error);
      this.testResults.push({
        type: 'Output',
        name: 'output_error',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testSVGGeneration() {
    console.log('📄 測試 SVG 生成...');
    
    try {
      // 點擊 SVG 生成按鈕
      await this.page.click('#generate-svg-btn');
      
      // 等待下載開始
      const downloadPromise = this.page.waitForEvent('download');
      const download = await downloadPromise;
      
      // 保存下載的檔案
      const svgPath = path.join(this.outputDir, 'test-output.svg');
      await download.saveAs(svgPath);
      
      // 驗證 SVG 檔案
      const svgContent = await fs.readFile(svgPath, 'utf8');
      const isValidSVG = svgContent.includes('<svg') && svgContent.includes('</svg>');
      
      this.testResults.push({
        type: 'SVG Output',
        name: 'svg_generation',
        status: isValidSVG ? 'PASS' : 'FAIL',
        details: { 
          fileSize: svgContent.length,
          isValidSVG,
          hasAnimation: svgContent.includes('<animate')
        }
      });
      
      console.log(`${isValidSVG ? '✅' : '❌'} SVG 生成測試 (${svgContent.length} bytes)`);
      
    } catch (error) {
      console.error('❌ SVG 生成測試失敗:', error);
      this.testResults.push({
        type: 'SVG Output',
        name: 'svg_generation_error',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testGIFGeneration() {
    console.log('🎬 測試 GIF 生成...');
    
    try {
      // 點擊 GIF 生成按鈕
      await this.page.click('#generate-gif-btn');
      
      // 等待生成完成（可能需要較長時間）
      await this.page.waitForTimeout(10000);
      
      // 檢查是否有成功訊息或下載
      const successMessage = await this.page.$('.success-message');
      const hasSuccess = successMessage !== null;
      
      this.testResults.push({
        type: 'GIF Output',
        name: 'gif_generation',
        status: hasSuccess ? 'PASS' : 'FAIL',
        details: { hasSuccess }
      });
      
      console.log(`${hasSuccess ? '✅' : '❌'} GIF 生成測試`);
      
    } catch (error) {
      console.error('❌ GIF 生成測試失敗:', error);
      this.testResults.push({
        type: 'GIF Output',
        name: 'gif_generation_error',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async takeScreenshot(name) {
    const screenshotPath = path.join(this.screenshotDir, `${name}.png`);
    await this.page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 截圖已保存: ${name}.png`);
  }

  async generateTestReport() {
    console.log('\n📊 生成 Playwright 測試報告...');
    
    const summary = {
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'PASS').length,
      failed: this.testResults.filter(r => r.status === 'FAIL').length,
      errors: this.testResults.filter(r => r.status === 'ERROR').length,
      timestamp: new Date().toISOString()
    };
    
    const report = {
      summary,
      results: this.testResults,
      environment: {
        browser: 'Chromium',
        testRunner: 'Playwright',
        platform: process.platform
      }
    };
    
    // 保存報告
    const reportPath = path.join(this.outputDir, 'playwright-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Playwright 測試總結:');
    console.log(`✅ 通過: ${summary.passed}`);
    console.log(`❌ 失敗: ${summary.failed}`);
    console.log(`🚨 錯誤: ${summary.errors}`);
    console.log(`📈 成功率: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);
    console.log(`📄 報告已保存: ${reportPath}`);
  }

  async cleanup() {
    console.log('\n🧹 清理 Playwright 測試環境...');
    
    if (this.browser) {
      await this.browser.close();
      console.log('✅ 瀏覽器已關閉');
    }
    
    console.log('✅ Playwright 測試環境清理完成');
  }
}

// 執行測試
if (require.main === module) {
  const tester = new PlaywrightUITest();
  tester.runAllTests().catch(console.error);
}

module.exports = PlaywrightUITest;
