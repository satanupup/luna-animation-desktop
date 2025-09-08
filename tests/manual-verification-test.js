/**
 * 🔍 手動驗證測試
 * 
 * 專門測試用戶提到的功能：填充顏色、線條顏色、旋轉角度
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class ManualVerificationTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            fillColor: {},
            strokeColor: {},
            rotation: {},
            issues: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'test': '🧪',
            'manual': '👁️'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTest() {
        this.log('開始手動驗證測試...', 'manual');
        
        try {
            await this.setupBrowser();
            await this.loadApplication();
            await this.testFillColor();
            await this.testStrokeColor();
            await this.testRotation();
            await this.generateReport();
        } catch (error) {
            this.log(`測試失敗: ${error.message}`, 'error');
            this.testResults.issues.push({
                type: 'critical',
                message: error.message
            });
        } finally {
            await this.cleanup();
        }
    }

    async setupBrowser() {
        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000 // 慢速操作以便觀察
        });
        this.page = await this.browser.newPage();
        await this.page.setViewportSize({ width: 1200, height: 800 });
    }

    async loadApplication() {
        this.log('載入應用程式...', 'info');
        const appPath = path.join(__dirname, '..', 'src', 'index.html');
        await this.page.goto(`file://${appPath}`);
        
        await this.page.waitForSelector('#canvas', { timeout: 10000 });
        await this.page.waitForTimeout(3000); // 等待動畫引擎完全初始化
        
        this.log('應用程式載入完成', 'success');
    }

    async testFillColor() {
        this.log('測試填充顏色功能...', 'test');
        
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        const results = [];
        
        for (const color of colors) {
            this.log(`測試填充顏色: ${color}`, 'test');
            
            // 獲取變更前的畫布狀態
            const beforeCanvas = await this.getCanvasDataURL();
            const beforeImageData = await this.getCanvasImageData();
            
            // 變更填充顏色
            await this.page.fill('#fillColor', color);
            await this.page.waitForTimeout(1000); // 等待更新
            
            // 獲取變更後的畫布狀態
            const afterCanvas = await this.getCanvasDataURL();
            const afterImageData = await this.getCanvasImageData();
            
            // 檢查是否有變化
            const canvasChanged = beforeCanvas !== afterCanvas;
            const pixelsChanged = this.compareImageData(beforeImageData, afterImageData);
            
            const result = {
                color: color,
                canvasDataChanged: canvasChanged,
                pixelsChanged: pixelsChanged,
                actualColor: await this.page.inputValue('#fillColor')
            };
            
            results.push(result);
            
            if (canvasChanged || pixelsChanged > 0) {
                this.log(`  ✅ 填充顏色 ${color}: 預覽已更新 (${pixelsChanged} 像素變化)`, 'success');
            } else {
                this.log(`  ❌ 填充顏色 ${color}: 預覽未更新`, 'error');
                this.testResults.issues.push({
                    type: 'error',
                    message: `填充顏色 ${color} 未觸發預覽更新`
                });
            }
        }
        
        this.testResults.fillColor = {
            results: results,
            successRate: results.filter(r => r.canvasDataChanged || r.pixelsChanged > 0).length / results.length
        };
    }

    async testStrokeColor() {
        this.log('測試線條顏色功能...', 'test');
        
        // 先確保是空心模式以便看到線條顏色
        await this.page.uncheck('#filled');
        await this.page.waitForTimeout(500);
        
        const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
        const results = [];
        
        for (const color of colors) {
            this.log(`測試線條顏色: ${color}`, 'test');
            
            const beforeCanvas = await this.getCanvasDataURL();
            const beforeImageData = await this.getCanvasImageData();
            
            await this.page.fill('#strokeColor', color);
            await this.page.waitForTimeout(1000);
            
            const afterCanvas = await this.getCanvasDataURL();
            const afterImageData = await this.getCanvasImageData();
            
            const canvasChanged = beforeCanvas !== afterCanvas;
            const pixelsChanged = this.compareImageData(beforeImageData, afterImageData);
            
            const result = {
                color: color,
                canvasDataChanged: canvasChanged,
                pixelsChanged: pixelsChanged,
                actualColor: await this.page.inputValue('#strokeColor')
            };
            
            results.push(result);
            
            if (canvasChanged || pixelsChanged > 0) {
                this.log(`  ✅ 線條顏色 ${color}: 預覽已更新 (${pixelsChanged} 像素變化)`, 'success');
            } else {
                this.log(`  ❌ 線條顏色 ${color}: 預覽未更新`, 'error');
                this.testResults.issues.push({
                    type: 'error',
                    message: `線條顏色 ${color} 未觸發預覽更新`
                });
            }
        }
        
        this.testResults.strokeColor = {
            results: results,
            successRate: results.filter(r => r.canvasDataChanged || r.pixelsChanged > 0).length / results.length
        };
    }

    async testRotation() {
        this.log('測試旋轉角度功能...', 'test');
        
        // 選擇一個容易看出旋轉效果的形狀
        await this.page.selectOption('#shape', 'triangle');
        await this.page.waitForTimeout(500);
        
        const angles = [0, 45, 90, 135, 180, 225, 270, 315];
        const results = [];
        
        for (const angle of angles) {
            this.log(`測試旋轉角度: ${angle}°`, 'test');
            
            const beforeCanvas = await this.getCanvasDataURL();
            const beforeImageData = await this.getCanvasImageData();
            
            await this.page.fill('#rotation', angle.toString());
            await this.page.waitForTimeout(1000);
            
            const afterCanvas = await this.getCanvasDataURL();
            const afterImageData = await this.getCanvasImageData();
            
            const canvasChanged = beforeCanvas !== afterCanvas;
            const pixelsChanged = this.compareImageData(beforeImageData, afterImageData);
            
            const result = {
                angle: angle,
                canvasDataChanged: canvasChanged,
                pixelsChanged: pixelsChanged,
                actualAngle: await this.page.inputValue('#rotation')
            };
            
            results.push(result);
            
            if (canvasChanged || pixelsChanged > 0) {
                this.log(`  ✅ 旋轉角度 ${angle}°: 預覽已更新 (${pixelsChanged} 像素變化)`, 'success');
            } else {
                this.log(`  ❌ 旋轉角度 ${angle}°: 預覽未更新`, 'error');
                this.testResults.issues.push({
                    type: 'error',
                    message: `旋轉角度 ${angle}° 未觸發預覽更新`
                });
            }
        }
        
        this.testResults.rotation = {
            results: results,
            successRate: results.filter(r => r.canvasDataChanged || r.pixelsChanged > 0).length / results.length
        };
    }

    async getCanvasDataURL() {
        return await this.page.evaluate(() => {
            const canvas = document.getElementById('canvas');
            if (canvas) {
                return canvas.toDataURL();
            }
            return null;
        });
    }

    async getCanvasImageData() {
        return await this.page.evaluate(() => {
            const canvas = document.getElementById('canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                return Array.from(imageData.data);
            }
            return null;
        });
    }

    compareImageData(before, after) {
        if (!before || !after || before.length !== after.length) {
            return 0;
        }
        
        let changedPixels = 0;
        for (let i = 0; i < before.length; i += 4) {
            // 比較 RGBA 值
            if (before[i] !== after[i] || 
                before[i+1] !== after[i+1] || 
                before[i+2] !== after[i+2] || 
                before[i+3] !== after[i+3]) {
                changedPixels++;
            }
        }
        return changedPixels;
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'manual-verification-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
        
        this.log(`手動驗證報告已保存: ${reportPath}`, 'info');
        this.displaySummary();
    }

    displaySummary() {
        console.log('\n' + '='.repeat(80));
        console.log('👁️ 手動驗證測試摘要報告');
        console.log('='.repeat(80));
        
        console.log(`\n📊 測試結果:`);
        console.log(`  填充顏色成功率: ${(this.testResults.fillColor.successRate * 100).toFixed(1)}%`);
        console.log(`  線條顏色成功率: ${(this.testResults.strokeColor.successRate * 100).toFixed(1)}%`);
        console.log(`  旋轉角度成功率: ${(this.testResults.rotation.successRate * 100).toFixed(1)}%`);
        console.log(`  發現問題: ${this.testResults.issues.length}`);

        if (this.testResults.issues.length > 0) {
            console.log('\n🔍 發現的問題:');
            this.testResults.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
            });
        }

        console.log('\n📋 詳細結果:');
        
        console.log('\n🎨 填充顏色:');
        this.testResults.fillColor.results.forEach(result => {
            const status = (result.canvasDataChanged || result.pixelsChanged > 0) ? '✅' : '❌';
            console.log(`  ${result.color}: ${status} (${result.pixelsChanged} 像素變化)`);
        });

        console.log('\n🖊️ 線條顏色:');
        this.testResults.strokeColor.results.forEach(result => {
            const status = (result.canvasDataChanged || result.pixelsChanged > 0) ? '✅' : '❌';
            console.log(`  ${result.color}: ${status} (${result.pixelsChanged} 像素變化)`);
        });

        console.log('\n🔄 旋轉角度:');
        this.testResults.rotation.results.forEach(result => {
            const status = (result.canvasDataChanged || result.pixelsChanged > 0) ? '✅' : '❌';
            console.log(`  ${result.angle}°: ${status} (${result.pixelsChanged} 像素變化)`);
        });

        console.log('\n' + '='.repeat(80));
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// 執行測試
if (require.main === module) {
    const tester = new ManualVerificationTest();
    tester.runTest().catch(console.error);
}

module.exports = ManualVerificationTest;
