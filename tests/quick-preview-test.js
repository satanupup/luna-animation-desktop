/**
 * 🚀 快速預覽測試
 * 
 * 快速驗證預覽更新修復是否有效
 */

const { chromium } = require('playwright');
const path = require('path');

class QuickPreviewTest {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'test': '🧪'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTest() {
        this.log('開始快速預覽測試...', 'test');
        
        try {
            await this.setupBrowser();
            await this.loadApplication();
            await this.testKeyControls();
        } catch (error) {
            this.log(`測試失敗: ${error.message}`, 'error');
        } finally {
            await this.cleanup();
        }
    }

    async setupBrowser() {
        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 200
        });
        this.page = await this.browser.newPage();
        await this.page.setViewportSize({ width: 1200, height: 800 });
    }

    async loadApplication() {
        this.log('載入應用程式...', 'info');
        const appPath = path.join(__dirname, '..', 'src', 'index.html');
        await this.page.goto(`file://${appPath}`);
        
        await this.page.waitForSelector('#canvas', { timeout: 10000 });
        await this.page.waitForTimeout(2000);
        
        this.log('應用程式載入完成', 'success');
    }

    async testKeyControls() {
        this.log('測試關鍵控制項預覽更新...', 'test');
        
        const tests = [
            { name: 'duration', selector: '#duration', values: ['1', '3', '5'] },
            { name: 'speed', selector: '#speed', values: ['500', '1000', '2000'] },
            { name: 'rotation', selector: '#rotation', values: ['0', '90', '180'] },
            { name: 'delay', selector: '#delay', values: ['0', '500', '1000'] }
        ];

        for (const test of tests) {
            this.log(`測試 ${test.name} 控制項...`, 'test');
            
            let updateCount = 0;
            
            for (const value of test.values) {
                const beforeCanvas = await this.getCanvasState();
                
                await this.page.fill(test.selector, value);
                await this.page.waitForTimeout(500);
                
                const afterCanvas = await this.getCanvasState();
                
                if (beforeCanvas !== afterCanvas) {
                    updateCount++;
                    this.log(`  ${test.name} = ${value}: ✅ 預覽已更新`, 'success');
                } else {
                    this.log(`  ${test.name} = ${value}: ❌ 預覽未更新`, 'error');
                }
            }
            
            const successRate = (updateCount / test.values.length * 100).toFixed(1);
            this.log(`${test.name} 成功率: ${successRate}%`, updateCount > 0 ? 'success' : 'error');
        }
    }

    async getCanvasState() {
        return await this.page.evaluate(() => {
            const canvas = document.getElementById('canvas');
            if (canvas) {
                return canvas.toDataURL();
            }
            return null;
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// 執行測試
if (require.main === module) {
    const tester = new QuickPreviewTest();
    tester.runTest().catch(console.error);
}

module.exports = QuickPreviewTest;
