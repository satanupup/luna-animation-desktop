/**
 * 🎯 璐娜的 GIF 動畫製作器 - 完整輸出測試運行器
 * 執行所有測試並生成綜合報告，包含實際輸出驗證
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class CompleteOutputTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.outputDir = path.join(__dirname, 'test-results');
    this.screenshotDir = path.join(__dirname, 'test-screenshots');
  }

  // 執行所有測試
  async runAllTests() {
    console.log('🎯 璐娜的 GIF 動畫製作器 - 完整輸出測試開始');
    console.log('=' .repeat(80));
    console.log(`🕐 開始時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log('=' .repeat(80));

    try {
      // 準備測試環境
      await this.setupTestEnvironment();

      // 執行各種測試
      await this.runBasicFunctionTests();
      await this.runOutputValidationTests();
      await this.runUIInteractionTests();
      await this.runPerformanceTests();
      await this.runVisualRegressionTests();

      // 生成最終報告
      await this.generateFinalReport();

    } catch (error) {
      console.error('❌ 測試執行失敗:', error);
    } finally {
      await this.cleanup();
    }
  }

  // 設定測試環境
  async setupTestEnvironment() {
    console.log('\n🔧 設定測試環境...');
    
    // 創建必要的目錄
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.screenshotDir, { recursive: true });
    await fs.mkdir(path.join(__dirname, 'tests', 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(__dirname, 'tests', 'test-outputs'), { recursive: true });
    
    console.log('✅ 測試環境準備完成');
  }

  // 執行基本功能測試
  async runBasicFunctionTests() {
    console.log('\n📋 執行基本功能測試...');
    
    const basicTests = [
      { name: 'SVG 功能測試', script: 'test-svg-output.js' },
      { name: 'FFmpeg 可用性測試', script: 'test-actual-output.js' },
      { name: '診斷測試', script: 'debug-test.js' }
    ];

    for (const test of basicTests) {
      await this.runSingleTest(test.name, test.script, 'BASIC');
    }
  }

  // 執行輸出驗證測試
  async runOutputValidationTests() {
    console.log('\n📤 執行輸出驗證測試...');
    
    const outputTests = [
      { name: '增強版 UI 輸出測試', script: 'tests/enhanced-ui-output-test.js' },
      { name: '全面輸出測試', script: 'tests/comprehensive-output-test.js' },
      { name: 'GIF 驗證測試', script: 'tests/gif-validation-test.js' }
    ];

    for (const test of outputTests) {
      await this.runSingleTest(test.name, test.script, 'OUTPUT');
    }
  }

  // 執行 UI 交互測試
  async runUIInteractionTests() {
    console.log('\n🖱️ 執行 UI 交互測試...');
    
    const uiTests = [
      { name: 'UI 點擊測試', script: 'tests/ui-click-test.js' },
      { name: 'Playwright UI 測試', script: 'tests/playwright-ui-test.js' }
    ];

    for (const test of uiTests) {
      await this.runSingleTest(test.name, test.script, 'UI');
    }
  }

  // 執行性能測試
  async runPerformanceTests() {
    console.log('\n⚡ 執行性能測試...');
    
    const performanceTests = [
      { name: '性能基準測試', script: 'tests/performance-test.js' }
    ];

    for (const test of performanceTests) {
      await this.runSingleTest(test.name, test.script, 'PERFORMANCE');
    }
  }

  // 執行視覺回歸測試
  async runVisualRegressionTests() {
    console.log('\n📸 執行視覺回歸測試...');
    
    const visualTests = [
      { name: '視覺回歸測試', script: 'tests/visual-regression-test.js' },
      { name: '截圖對比測試', script: 'tests/screenshot-comparison-test.js' }
    ];

    for (const test of visualTests) {
      await this.runSingleTest(test.name, test.script, 'VISUAL');
    }
  }

  // 執行單個測試
  async runSingleTest(testName, scriptPath, category) {
    console.log(`\n🧪 執行: ${testName}`);
    
    const startTime = Date.now();
    
    try {
      const result = await this.executeTestScript(scriptPath);
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        category,
        status: result.success ? 'PASS' : 'FAIL',
        duration,
        output: result.output,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      console.log(`${result.success ? '✅' : '❌'} ${testName}: ${result.success ? 'PASS' : 'FAIL'} (${duration}ms)`);
      
      if (!result.success && result.error) {
        console.log(`   錯誤: ${result.error.substring(0, 200)}...`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        category,
        status: 'ERROR',
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`🚨 ${testName}: ERROR (${duration}ms)`);
      console.log(`   錯誤: ${error.message}`);
    }
  }

  // 執行測試腳本
  async executeTestScript(scriptPath) {
    return new Promise((resolve) => {
      const fullPath = path.join(__dirname, scriptPath);
      
      // 檢查檔案是否存在
      fs.access(fullPath).then(() => {
        const child = spawn('node', [fullPath], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          error += data.toString();
        });

        child.on('close', (code) => {
          resolve({
            success: code === 0,
            output,
            error: error || null
          });
        });

        // 設定超時
        setTimeout(() => {
          child.kill();
          resolve({
            success: false,
            output,
            error: '測試超時'
          });
        }, 60000); // 60秒超時

      }).catch(() => {
        resolve({
          success: false,
          output: '',
          error: `測試檔案不存在: ${scriptPath}`
        });
      });
    });
  }

  // 生成最終報告
  async generateFinalReport() {
    console.log('\n📊 生成最終測試報告...');

    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const summary = {
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'PASS').length,
      failed: this.testResults.filter(r => r.status === 'FAIL').length,
      errors: this.testResults.filter(r => r.status === 'ERROR').length,
      totalDuration,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString()
    };

    // 按類別統計
    const categoryStats = {};
    for (const result of this.testResults) {
      if (!categoryStats[result.category]) {
        categoryStats[result.category] = { total: 0, passed: 0, failed: 0, errors: 0 };
      }
      categoryStats[result.category].total++;
      if (result.status === 'PASS') categoryStats[result.category].passed++;
      else if (result.status === 'FAIL') categoryStats[result.category].failed++;
      else if (result.status === 'ERROR') categoryStats[result.category].errors++;
    }

    const report = {
      title: '璐娜的 GIF 動畫製作器 - 完整輸出測試報告',
      summary,
      categoryStats,
      results: this.testResults,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    };

    // 保存 JSON 報告
    const reportPath = path.join(this.outputDir, 'complete-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // 生成 HTML 報告
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(this.outputDir, 'complete-test-report.html');
    await fs.writeFile(htmlPath, htmlReport);

    // 顯示摘要
    console.log('\n' + '=' .repeat(80));
    console.log('📊 最終測試摘要');
    console.log('=' .repeat(80));
    console.log(`🕐 結束時間: ${new Date().toLocaleString('zh-TW')}`);
    console.log(`⏱️ 總執行時間: ${(totalDuration / 1000).toFixed(1)}秒`);
    console.log(`📊 總測試數: ${summary.totalTests}`);
    console.log(`✅ 通過: ${summary.passed}`);
    console.log(`❌ 失敗: ${summary.failed}`);
    console.log(`🚨 錯誤: ${summary.errors}`);
    console.log(`📈 成功率: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 各類別統計:');
    for (const [category, stats] of Object.entries(categoryStats)) {
      const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${successRate}%)`);
    }
    
    console.log('\n📄 報告檔案:');
    console.log(`  JSON: ${reportPath}`);
    console.log(`  HTML: ${htmlPath}`);
    console.log('=' .repeat(80));

    // 如果有失敗的測試，顯示詳情
    const failedTests = this.testResults.filter(r => r.status !== 'PASS');
    if (failedTests.length > 0) {
      console.log('\n❌ 失敗的測試:');
      for (const test of failedTests) {
        console.log(`  ${test.name}: ${test.status}`);
        if (test.error) {
          console.log(`    錯誤: ${test.error.substring(0, 100)}...`);
        }
      }
    }
  }

  // 生成 HTML 報告
  generateHTMLReport(report) {
    const { summary, categoryStats, results } = report;
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>璐娜的動畫製作器 - 完整測試報告</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Microsoft JhengHei', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .category-stats { margin-bottom: 30px; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .category-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .test-results { margin-top: 30px; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #ccc; }
        .pass { background: #d4edda; border-left-color: #28a745; }
        .fail { background: #f8d7da; border-left-color: #dc3545; }
        .error { background: #fff3cd; border-left-color: #ffc107; }
        .test-header { font-weight: bold; margin-bottom: 5px; }
        .test-details { font-size: 0.9em; color: #666; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌙 璐娜的 GIF 動畫製作器</h1>
            <h2>完整輸出測試報告</h2>
            <p>測試時間: ${new Date(summary.startTime).toLocaleString('zh-TW')} - ${new Date(summary.endTime).toLocaleString('zh-TW')}</p>
        </div>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${summary.totalTests}</div>
                <div class="stat-label">總測試數</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.passed}</div>
                <div class="stat-label">✅ 通過</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.failed}</div>
                <div class="stat-label">❌ 失敗</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${((summary.passed / summary.totalTests) * 100).toFixed(1)}%</div>
                <div class="stat-label">📈 成功率</div>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%"></div>
        </div>

        <div class="category-stats">
            <h3>📊 各類別統計</h3>
            <div class="category-grid">
                ${Object.entries(categoryStats).map(([category, stats]) => `
                    <div class="category-card">
                        <h4>${category}</h4>
                        <p>通過: ${stats.passed}/${stats.total} (${((stats.passed / stats.total) * 100).toFixed(1)}%)</p>
                        <p>失敗: ${stats.failed}, 錯誤: ${stats.errors}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="test-results">
            <h3>📋 詳細測試結果</h3>
            ${results.map(result => `
                <div class="test-result ${result.status.toLowerCase()}">
                    <div class="test-header">
                        ${result.category} - ${result.name}: ${result.status}
                        <span style="float: right;">${result.duration}ms</span>
                    </div>
                    ${result.error ? `<div class="test-details">錯誤: ${result.error}</div>` : ''}
                    <div class="test-details">時間: ${new Date(result.timestamp).toLocaleString('zh-TW')}</div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  // 清理資源
  async cleanup() {
    console.log('\n🧹 清理測試環境...');
    // 這裡可以添加清理邏輯
    console.log('✅ 清理完成');
  }
}

// 執行測試
if (require.main === module) {
  const runner = new CompleteOutputTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = CompleteOutputTestRunner;
