/**
 * 🔄 璐娜的 GIF 動畫製作器 - 增強預覽測試
 * 
 * 專門測試預覽更新功能和所有新增的控制項
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class EnhancedPreviewTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            previewUpdates: {},
            controlTests: {},
            performanceTests: {},
            issues: [],
            summary: {}
        };
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'test': '🧪',
            'preview': '🔄'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTests() {
        this.log('開始增強預覽測試...', 'test');
        
        try {
            await this.setupBrowser();
            await this.loadApplication();
            await this.testPreviewUpdates();
            await this.testAllControls();
            await this.testPerformance();
            await this.generateReport();
        } catch (error) {
            this.log(`測試過程發生錯誤: ${error.message}`, 'error');
            this.testResults.issues.push({
                type: 'critical',
                message: error.message,
                stack: error.stack
            });
        } finally {
            await this.cleanup();
        }
    }

    async setupBrowser() {
        this.log('啟動瀏覽器...', 'info');
        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 100 // 減慢操作以便觀察
        });
        this.page = await this.browser.newPage();
        
        // 設置視窗大小
        await this.page.setViewportSize({ width: 1200, height: 800 });
    }

    async loadApplication() {
        this.log('載入應用程式...', 'info');
        const appPath = path.join(__dirname, '..', 'src', 'index.html');
        await this.page.goto(`file://${appPath}`);
        
        // 等待應用程式載入完成
        await this.page.waitForSelector('#canvas', { timeout: 10000 });
        await this.page.waitForTimeout(2000); // 等待動畫引擎初始化
        
        this.log('應用程式載入完成', 'success');
    }

    async testPreviewUpdates() {
        this.log('測試預覽更新功能...', 'preview');
        
        const controls = [
            { id: 'shape', type: 'select', values: ['circle', 'square', 'triangle'] },
            { id: 'fillColor', type: 'color', values: ['#ff0000', '#00ff00', '#0000ff'] },
            { id: 'strokeColor', type: 'color', values: ['#000000', '#ffffff', '#ff00ff'] },
            { id: 'size', type: 'range', values: [20, 50, 80] },
            { id: 'filled', type: 'checkbox', values: [true, false] },
            { id: 'strokeWidth', type: 'range', values: [1, 4, 8] },
            { id: 'animationMode', type: 'select', values: ['loop', 'enter-exit', 'enter-only'] },
            { id: 'animationType', type: 'select', values: ['bounce', 'slide', 'fade', 'zoom'] },
            { id: 'speed', type: 'range', values: [500, 1000, 2000] },
            { id: 'duration', type: 'range', values: [1, 3, 5] },
            { id: 'loops', type: 'select', values: ['infinite', '3', '5'] },
            { id: 'delay', type: 'range', values: [0, 500, 1000] },
            { id: 'rotation', type: 'range', values: [0, 90, 180] },
            { id: 'quality', type: 'select', values: ['12', '15', '20'] }
        ];

        for (const control of controls) {
            await this.testControlPreview(control);
        }
    }

    async testControlPreview(control) {
        this.log(`測試 ${control.id} 控制項預覽更新...`, 'test');
        
        try {
            const element = await this.page.$(`#${control.id}`);
            if (!element) {
                this.testResults.issues.push({
                    type: 'error',
                    message: `控制項 ${control.id} 不存在`
                });
                return;
            }

            const results = [];
            
            for (const value of control.values) {
                // 記錄變更前的畫布狀態
                const beforeCanvas = await this.getCanvasState();
                
                // 變更控制項值
                await this.setControlValue(control.id, control.type, value);
                
                // 等待預覽更新
                await this.page.waitForTimeout(500);
                
                // 記錄變更後的畫布狀態
                const afterCanvas = await this.getCanvasState();
                
                // 檢查是否有變化
                const hasChanged = beforeCanvas !== afterCanvas;
                
                results.push({
                    value: value,
                    previewUpdated: hasChanged,
                    timestamp: Date.now()
                });
                
                this.log(`  ${control.id} = ${value}: ${hasChanged ? '✅ 預覽已更新' : '❌ 預覽未更新'}`, hasChanged ? 'success' : 'error');
                
                if (!hasChanged) {
                    this.testResults.issues.push({
                        type: 'warning',
                        message: `控制項 ${control.id} 值 ${value} 未觸發預覽更新`
                    });
                }
            }
            
            this.testResults.previewUpdates[control.id] = {
                type: control.type,
                results: results,
                successRate: results.filter(r => r.previewUpdated).length / results.length
            };
            
        } catch (error) {
            this.log(`測試 ${control.id} 時發生錯誤: ${error.message}`, 'error');
            this.testResults.issues.push({
                type: 'error',
                message: `控制項 ${control.id} 測試失敗: ${error.message}`
            });
        }
    }

    async setControlValue(id, type, value) {
        const element = await this.page.$(`#${id}`);
        
        switch (type) {
            case 'select':
                await element.selectOption(value);
                break;
            case 'range':
                await element.fill(value.toString());
                break;
            case 'color':
                await element.fill(value);
                break;
            case 'checkbox':
                if (value) {
                    await element.check();
                } else {
                    await element.uncheck();
                }
                break;
        }
        
        // 觸發 change/input 事件
        await element.dispatchEvent('input');
        await element.dispatchEvent('change');
    }

    async getCanvasState() {
        // 獲取畫布的當前狀態（可以是截圖的 hash 或其他唯一標識）
        return await this.page.evaluate(() => {
            const canvas = document.getElementById('canvas');
            if (canvas) {
                return canvas.toDataURL();
            }
            return null;
        });
    }

    async testAllControls() {
        this.log('測試所有控制項功能...', 'test');
        
        const controlTests = [
            { name: '形狀選擇', test: () => this.testShapeSelection() },
            { name: '顏色控制', test: () => this.testColorControls() },
            { name: '大小調整', test: () => this.testSizeControls() },
            { name: '動畫設定', test: () => this.testAnimationSettings() },
            { name: '品質設定', test: () => this.testQualitySettings() },
            { name: '方式選擇', test: () => this.testMethodSelection() },
            { name: '面板控制', test: () => this.testPanelControls() }
        ];

        for (const controlTest of controlTests) {
            try {
                this.log(`執行 ${controlTest.name} 測試...`, 'test');
                const result = await controlTest.test();
                this.testResults.controlTests[controlTest.name] = {
                    success: true,
                    result: result
                };
                this.log(`${controlTest.name} 測試完成`, 'success');
            } catch (error) {
                this.log(`${controlTest.name} 測試失敗: ${error.message}`, 'error');
                this.testResults.controlTests[controlTest.name] = {
                    success: false,
                    error: error.message
                };
                this.testResults.issues.push({
                    type: 'error',
                    message: `${controlTest.name} 測試失敗: ${error.message}`
                });
            }
        }
    }

    async testShapeSelection() {
        const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
        const results = [];
        
        for (const shape of shapes) {
            await this.page.selectOption('#shape', shape);
            await this.page.waitForTimeout(300);
            
            const isVisible = await this.page.isVisible('#canvas');
            results.push({ shape, canvasVisible: isVisible });
        }
        
        return results;
    }

    async testColorControls() {
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        const results = [];
        
        for (const color of colors) {
            await this.page.fill('#fillColor', color);
            await this.page.fill('#strokeColor', color);
            await this.page.waitForTimeout(300);
            
            const fillValue = await this.page.inputValue('#fillColor');
            const strokeValue = await this.page.inputValue('#strokeColor');
            
            results.push({
                color,
                fillSet: fillValue === color,
                strokeSet: strokeValue === color
            });
        }
        
        return results;
    }

    async testSizeControls() {
        const sizes = [20, 40, 60, 80];
        const results = [];
        
        for (const size of sizes) {
            await this.page.fill('#size', size.toString());
            await this.page.waitForTimeout(300);
            
            const value = await this.page.inputValue('#size');
            const displayValue = await this.page.textContent('#sizeValue');
            
            results.push({
                size,
                valueSet: parseInt(value) === size,
                displayUpdated: displayValue.includes(size.toString())
            });
        }
        
        return results;
    }

    async testAnimationSettings() {
        const settings = [
            { mode: 'loop', type: 'bounce', speed: 1000 },
            { mode: 'enter-exit', type: 'slide', speed: 1500 },
            { mode: 'enter-only', type: 'fade', speed: 2000 }
        ];
        
        const results = [];
        
        for (const setting of settings) {
            await this.page.selectOption('#animationMode', setting.mode);
            await this.page.selectOption('#animationType', setting.type);
            await this.page.fill('#speed', setting.speed.toString());
            await this.page.waitForTimeout(500);
            
            const modeValue = await this.page.inputValue('#animationMode');
            const typeValue = await this.page.inputValue('#animationType');
            const speedValue = await this.page.inputValue('#speed');
            
            results.push({
                setting,
                modeSet: modeValue === setting.mode,
                typeSet: typeValue === setting.type,
                speedSet: parseInt(speedValue) === setting.speed
            });
        }
        
        return results;
    }

    async testQualitySettings() {
        const qualities = ['12', '15', '20'];
        const results = [];
        
        for (const quality of qualities) {
            await this.page.selectOption('#quality', quality);
            await this.page.waitForTimeout(300);
            
            const value = await this.page.inputValue('#quality');
            results.push({
                quality,
                valueSet: value === quality
            });
        }
        
        return results;
    }

    async testMethodSelection() {
        const methods = ['frames', 'ffmpeg'];
        const results = [];
        
        for (const method of methods) {
            const button = await this.page.$(`[data-method="${method}"]`);
            await button.click();
            await this.page.waitForTimeout(300);
            
            const isActive = await button.evaluate(el => el.classList.contains('active'));
            results.push({
                method,
                isActive
            });
        }
        
        return results;
    }

    async testPanelControls() {
        const panels = [
            { button: '#helpBtn', panel: '#helpPanel' },
            { button: '#settingsBtn', panel: '#settingsPanel' }
        ];
        
        const results = [];
        
        for (const panel of panels) {
            // 開啟面板
            await this.page.click(panel.button);
            await this.page.waitForTimeout(300);
            
            const isVisible = await this.page.isVisible(panel.panel);
            
            // 關閉面板
            const closeBtn = await this.page.$(`${panel.panel} .close-btn`);
            if (closeBtn) {
                await closeBtn.click();
                await this.page.waitForTimeout(300);
            }
            
            const isHidden = !(await this.page.isVisible(panel.panel));
            
            results.push({
                panel: panel.panel,
                canOpen: isVisible,
                canClose: isHidden
            });
        }
        
        return results;
    }

    async testPerformance() {
        this.log('測試性能表現...', 'test');
        
        const performanceTests = [
            { name: '快速連續變更', test: () => this.testRapidChanges() },
            { name: '記憶體使用', test: () => this.testMemoryUsage() },
            { name: '響應時間', test: () => this.testResponseTime() }
        ];

        for (const perfTest of performanceTests) {
            try {
                const result = await perfTest.test();
                this.testResults.performanceTests[perfTest.name] = result;
                this.log(`${perfTest.name} 測試完成`, 'success');
            } catch (error) {
                this.log(`${perfTest.name} 測試失敗: ${error.message}`, 'error');
                this.testResults.performanceTests[perfTest.name] = {
                    error: error.message
                };
            }
        }
    }

    async testRapidChanges() {
        const startTime = Date.now();
        
        // 快速連續變更多個控制項
        for (let i = 0; i < 10; i++) {
            await this.page.fill('#size', (20 + i * 5).toString());
            await this.page.fill('#speed', (500 + i * 100).toString());
            await this.page.selectOption('#shape', i % 2 === 0 ? 'circle' : 'square');
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        return {
            duration: duration,
            changesPerSecond: (30 / duration * 1000).toFixed(2)
        };
    }

    async testMemoryUsage() {
        const metrics = await this.page.evaluate(() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        });
        
        return metrics;
    }

    async testResponseTime() {
        const responseTimes = [];
        
        for (let i = 0; i < 5; i++) {
            const startTime = Date.now();
            await this.page.fill('#size', (30 + i * 10).toString());
            await this.page.waitForTimeout(100); // 等待預覽更新
            const endTime = Date.now();
            
            responseTimes.push(endTime - startTime);
        }
        
        return {
            average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            min: Math.min(...responseTimes),
            max: Math.max(...responseTimes),
            all: responseTimes
        };
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        
        this.testResults.summary = {
            totalDuration: duration,
            previewUpdateTests: Object.keys(this.testResults.previewUpdates).length,
            controlTests: Object.keys(this.testResults.controlTests).length,
            performanceTests: Object.keys(this.testResults.performanceTests).length,
            totalIssues: this.testResults.issues.length,
            criticalIssues: this.testResults.issues.filter(i => i.type === 'critical').length,
            successfulPreviewUpdates: Object.values(this.testResults.previewUpdates)
                .filter(p => p.successRate > 0.8).length
        };

        // 保存報告
        const reportPath = path.join(__dirname, 'enhanced-preview-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
        
        this.log(`測試報告已保存: ${reportPath}`, 'info');
        this.displaySummary();
    }

    displaySummary() {
        console.log('\n' + '='.repeat(80));
        console.log('🔄 增強預覽測試摘要報告');
        console.log('='.repeat(80));
        
        const summary = this.testResults.summary;
        
        console.log(`\n⏱️ 測試時間: ${(summary.totalDuration / 1000).toFixed(2)}s`);
        console.log(`🔄 預覽更新測試: ${summary.previewUpdateTests} 個控制項`);
        console.log(`🎛️ 控制項測試: ${summary.controlTests} 個功能`);
        console.log(`⚡ 性能測試: ${summary.performanceTests} 個項目`);
        console.log(`✅ 成功的預覽更新: ${summary.successfulPreviewUpdates}/${summary.previewUpdateTests}`);
        console.log(`⚠️ 發現問題: ${summary.totalIssues} (嚴重: ${summary.criticalIssues})`);

        if (this.testResults.issues.length > 0) {
            console.log('\n🔍 發現的問題:');
            this.testResults.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
            });
        }

        console.log('\n📊 預覽更新成功率:');
        Object.entries(this.testResults.previewUpdates).forEach(([control, data]) => {
            const rate = (data.successRate * 100).toFixed(1);
            const status = data.successRate > 0.8 ? '✅' : data.successRate > 0.5 ? '⚠️' : '❌';
            console.log(`  ${control}: ${rate}% ${status}`);
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
    const tester = new EnhancedPreviewTest();
    tester.runTests().catch(console.error);
}

module.exports = EnhancedPreviewTest;
