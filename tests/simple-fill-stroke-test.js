/**
 * 🎨 簡化的填充和線條顏色測試
 * 
 * 測試填充顏色和線條顏色是否可以同時顯示（不依賴線條寬度控制項）
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class SimpleFillStrokeTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            tests: {},
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
            'color': '🎨'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTest() {
        this.log('開始簡化的填充和線條顏色測試...', 'color');
        
        try {
            await this.setupBrowser();
            await this.loadApplication();
            await this.testBasicFillStroke();
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
            slowMo: 1000
        });
        this.page = await this.browser.newPage();
        await this.page.setViewportSize({ width: 1200, height: 800 });
    }

    async loadApplication() {
        this.log('載入應用程式...', 'info');
        const appPath = path.join(__dirname, '..', 'src', 'index.html');
        await this.page.goto(`file://${appPath}`);
        
        await this.page.waitForSelector('#canvas', { timeout: 10000 });
        await this.page.waitForTimeout(3000);
        
        this.log('應用程式載入完成', 'success');
    }

    async testBasicFillStroke() {
        this.log('測試基本填充和線條顏色功能...', 'test');
        
        const testCases = [
            {
                name: '填充模式：紅色填充 + 藍色線條',
                fillColor: '#ff0000',
                strokeColor: '#0000ff',
                filled: true
            },
            {
                name: '線條模式：只有藍色線條',
                fillColor: '#ff0000',
                strokeColor: '#0000ff',
                filled: false
            },
            {
                name: '填充模式：綠色填充 + 黑色線條',
                fillColor: '#00ff00',
                strokeColor: '#000000',
                filled: true
            }
        ];

        for (const testCase of testCases) {
            await this.testSingleCase(testCase);
        }
    }

    async testSingleCase(testCase) {
        this.log(`測試: ${testCase.name}`, 'test');
        
        try {
            // 設置填充狀態
            if (testCase.filled) {
                await this.page.check('#filled');
            } else {
                await this.page.uncheck('#filled');
            }
            await this.page.waitForTimeout(1000);

            // 獲取變更前的畫布狀態
            const beforeCanvas = await this.getCanvasImageData();

            // 設置填充顏色
            await this.page.fill('#fillColor', testCase.fillColor);
            await this.page.waitForTimeout(1000);

            // 設置線條顏色
            await this.page.fill('#strokeColor', testCase.strokeColor);
            await this.page.waitForTimeout(1000);

            // 獲取變更後的畫布狀態
            const afterCanvas = await this.getCanvasImageData();

            // 分析顏色
            const colorAnalysis = this.analyzeColors(afterCanvas, testCase);

            // 判斷測試結果
            let success = false;
            if (testCase.filled) {
                // 填充模式：應該同時有填充顏色和線條顏色
                success = colorAnalysis.hasFillColor && colorAnalysis.hasStrokeColor;
            } else {
                // 線條模式：只應該有線條顏色
                success = colorAnalysis.hasStrokeColor;
            }

            const result = {
                testCase: testCase,
                canvasChanged: beforeCanvas !== afterCanvas,
                colorAnalysis: colorAnalysis,
                success: success
            };

            this.testResults.tests[testCase.name] = result;

            if (result.success) {
                this.log(`  ✅ ${testCase.name}: 成功`, 'success');
                if (testCase.filled) {
                    this.log(`    填充顏色: ${colorAnalysis.hasFillColor ? '✅ 檢測到' : '❌ 未檢測到'} (${colorAnalysis.fillColorPixels} 像素)`, colorAnalysis.hasFillColor ? 'success' : 'error');
                    this.log(`    線條顏色: ${colorAnalysis.hasStrokeColor ? '✅ 檢測到' : '❌ 未檢測到'} (${colorAnalysis.strokeColorPixels} 像素)`, colorAnalysis.hasStrokeColor ? 'success' : 'error');
                } else {
                    this.log(`    線條顏色: ${colorAnalysis.hasStrokeColor ? '✅ 檢測到' : '❌ 未檢測到'} (${colorAnalysis.strokeColorPixels} 像素)`, colorAnalysis.hasStrokeColor ? 'success' : 'error');
                }
            } else {
                this.log(`  ❌ ${testCase.name}: 失敗`, 'error');
                this.testResults.issues.push({
                    type: 'error',
                    message: `${testCase.name} 測試失敗`
                });
            }

            // 保存截圖
            await this.page.screenshot({
                path: path.join(__dirname, `simple-fill-stroke-${testCase.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`)
            });

        } catch (error) {
            this.log(`測試 ${testCase.name} 時發生錯誤: ${error.message}`, 'error');
            this.testResults.tests[testCase.name] = {
                testCase: testCase,
                success: false,
                error: error.message
            };
            this.testResults.issues.push({
                type: 'error',
                message: `${testCase.name} 測試錯誤: ${error.message}`
            });
        }
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

    analyzeColors(imageData, testCase) {
        if (!imageData) {
            return { hasFillColor: false, hasStrokeColor: false };
        }

        // 將十六進制顏色轉換為 RGB
        const fillRGB = this.hexToRgb(testCase.fillColor);
        const strokeRGB = this.hexToRgb(testCase.strokeColor);

        let fillColorPixels = 0;
        let strokeColorPixels = 0;
        let totalNonTransparentPixels = 0;

        // 分析每個像素
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            // 跳過透明像素
            if (a < 128) continue;
            
            totalNonTransparentPixels++;

            // 檢查是否接近填充顏色（允許一些誤差）
            if (this.colorDistance(r, g, b, fillRGB.r, fillRGB.g, fillRGB.b) < 50) {
                fillColorPixels++;
            }

            // 檢查是否接近線條顏色（允許一些誤差）
            if (this.colorDistance(r, g, b, strokeRGB.r, strokeRGB.g, strokeRGB.b) < 50) {
                strokeColorPixels++;
            }
        }

        return {
            hasFillColor: fillColorPixels > 100, // 至少有 100 個像素
            hasStrokeColor: strokeColorPixels > 20, // 至少有 20 個像素
            fillColorPixels: fillColorPixels,
            strokeColorPixels: strokeColorPixels,
            totalNonTransparentPixels: totalNonTransparentPixels
        };
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'simple-fill-stroke-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
        
        this.log(`簡化填充和線條顏色測試報告已保存: ${reportPath}`, 'info');
        this.displaySummary();
    }

    displaySummary() {
        console.log('\n' + '='.repeat(80));
        console.log('🎨 簡化填充和線條顏色測試摘要');
        console.log('='.repeat(80));
        
        const tests = Object.values(this.testResults.tests);
        const successfulTests = tests.filter(t => t.success);
        
        console.log(`\n📊 測試結果:`);
        console.log(`  總測試數: ${tests.length}`);
        console.log(`  成功測試: ${successfulTests.length}`);
        console.log(`  失敗測試: ${tests.length - successfulTests.length}`);
        console.log(`  成功率: ${tests.length > 0 ? ((successfulTests.length / tests.length) * 100).toFixed(1) : 0}%`);
        console.log(`  發現問題: ${this.testResults.issues.length}`);

        console.log('\n📋 詳細結果:');
        Object.entries(this.testResults.tests).forEach(([name, result]) => {
            const status = result.success ? '✅' : '❌';
            console.log(`  ${name}: ${status}`);
            if (result.colorAnalysis) {
                console.log(`    填充像素: ${result.colorAnalysis.fillColorPixels}`);
                console.log(`    線條像素: ${result.colorAnalysis.strokeColorPixels}`);
                console.log(`    總像素: ${result.colorAnalysis.totalNonTransparentPixels}`);
            }
        });

        if (this.testResults.issues.length > 0) {
            console.log('\n🔍 發現的問題:');
            this.testResults.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
            });
        }

        console.log('\n🎯 結論:');
        if (successfulTests.length === tests.length && tests.length > 0) {
            console.log('  🎉 所有測試通過！填充顏色和線條顏色可以完美同時顯示！');
            console.log('  ✅ 填充模式：同時顯示填充顏色和線條顏色');
            console.log('  ✅ 線條模式：只顯示線條顏色');
        } else {
            console.log('  🔧 部分測試失敗，需要進一步調整');
        }

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
    const tester = new SimpleFillStrokeTest();
    tester.runTest().catch(console.error);
}

module.exports = SimpleFillStrokeTest;
