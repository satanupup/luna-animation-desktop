/**
 * 🎯 璐娜的 GIF 動畫製作器 - 全面測試執行器
 * 執行所有輸出內容、截圖和功能測試
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class ComprehensiveTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🎯 開始璐娜的 GIF 動畫製作器全面測試...');
    console.log('=' .repeat(60));
    
    try {
      // 1. 基礎功能測試
      await this.runBasicTests();
      
      // 2. 輸出內容測試
      await this.runOutputTests();
      
      // 3. UI 交互測試
      await this.runUITests();
      
      // 4. 效能測試
      await this.runPerformanceTests();
      
      // 5. 生成綜合報告
      await this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ 測試執行失敗:', error);
    }
  }

  async runBasicTests() {
    console.log('\n📋 執行基礎功能測試...');
    
    const basicTests = [
      { name: 'SVG 測試', script: 'test:svg' },
      { name: 'FFmpeg 測試', script: 'test:ffmpeg' },
      { name: '動畫測試', script: 'test:animation' }
    ];

    for (const test of basicTests) {
      await this.runSingleTest(test);
    }
  }

  async runOutputTests() {
    console.log('\n📤 執行輸出內容測試...');
    
    const outputTests = [
      { name: 'GIF 驗證測試', script: 'test:gif' },
      { name: '全面輸出測試', script: 'test:output:comprehensive' },
      { name: '截圖對比測試', script: 'test:screenshots' }
    ];

    for (const test of outputTests) {
      await this.runSingleTest(test);
    }
  }

  async runUITests() {
    console.log('\n🖱️ 執行 UI 交互測試...');
    
    const uiTests = [
      { name: 'UI 點擊測試', script: 'test:ui:click' },
      { name: 'Playwright UI 測試', script: 'test:ui:playwright' },
      { name: '視覺回歸測試', script: 'test:ui:visual' }
    ];

    for (const test of uiTests) {
      await this.runSingleTest(test);
    }
  }

  async runPerformanceTests() {
    console.log('\n⚡ 執行效能測試...');
    
    const performanceTests = [
      { name: '效能測試', script: 'test:performance' }
    ];

    for (const test of performanceTests) {
      await this.runSingleTest(test);
    }
  }

  async runSingleTest(test) {
    const { name, script } = test;
    console.log(`\n🧪 執行 ${name}...`);
    
    const startTime = Date.now();
    
    try {
      const result = await this.executeNpmScript(script);
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name,
        script,
        status: result.success ? 'PASS' : 'FAIL',
        duration,
        output: result.output,
        error: result.error
      });
      
      console.log(`${result.success ? '✅' : '❌'} ${name} 完成 (${duration}ms)`);
      
      if (!result.success && result.error) {
        console.log(`   錯誤: ${result.error.substring(0, 200)}...`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name,
        script,
        status: 'ERROR',
        duration,
        error: error.message
      });
      
      console.log(`🚨 ${name} 執行錯誤 (${duration}ms): ${error.message}`);
    }
  }

  async executeNpmScript(script) {
    return new Promise((resolve) => {
      const child = spawn('npm', ['run', script], {
        cwd: __dirname,
        stdio: 'pipe',
        shell: true
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
          error: error || (code !== 0 ? `Process exited with code ${code}` : null)
        });
      });

      child.on('error', (err) => {
        resolve({
          success: false,
          output,
          error: err.message
        });
      });
    });
  }

  async generateComprehensiveReport() {
    console.log('\n📊 生成綜合測試報告...');
    
    const totalDuration = Date.now() - this.startTime;
    
    const summary = {
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'PASS').length,
      failed: this.testResults.filter(r => r.status === 'FAIL').length,
      errors: this.testResults.filter(r => r.status === 'ERROR').length,
      totalDuration,
      timestamp: new Date().toISOString()
    };
    
    const report = {
      summary,
      results: this.testResults,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        testRunner: 'ComprehensiveTestRunner',
        workingDirectory: __dirname
      }
    };
    
    // 保存 JSON 報告
    const reportPath = path.join(__dirname, 'tests', 'reports', `comprehensive-test-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // 生成 HTML 報告
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'tests', 'reports', `comprehensive-test-report-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    
    // 生成 Markdown 報告
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, 'tests', 'reports', `comprehensive-test-report-${Date.now()}.md`);
    await fs.writeFile(markdownPath, markdownReport);
    
    // 顯示總結
    console.log('\n' + '='.repeat(60));
    console.log('🎯 璐娜的 GIF 動畫製作器 - 全面測試總結');
    console.log('='.repeat(60));
    console.log(`📊 總測試數: ${summary.totalTests}`);
    console.log(`✅ 通過: ${summary.passed}`);
    console.log(`❌ 失敗: ${summary.failed}`);
    console.log(`🚨 錯誤: ${summary.errors}`);
    console.log(`📈 成功率: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️ 總耗時: ${(totalDuration / 1000).toFixed(1)} 秒`);
    console.log(`📄 JSON 報告: ${reportPath}`);
    console.log(`🌐 HTML 報告: ${htmlPath}`);
    console.log(`📝 Markdown 報告: ${markdownPath}`);
    console.log('='.repeat(60));
    
    // 顯示詳細結果
    console.log('\n📋 詳細測試結果:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🚨';
      const duration = `${result.duration}ms`;
      console.log(`${index + 1}. ${status} ${result.name} (${duration})`);
    });
    
    // 如果有失敗的測試，顯示建議
    if (summary.failed > 0 || summary.errors > 0) {
      console.log('\n💡 改進建議:');
      this.testResults.filter(r => r.status !== 'PASS').forEach(result => {
        console.log(`   • ${result.name}: 檢查 ${result.script} 腳本`);
      });
    }
    
    console.log('\n🎉 全面測試完成！');
  }

  generateHTMLReport(report) {
    const { summary, results } = report;
    
    return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>璐娜的 GIF 動畫製作器 - 全面測試報告</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 2em; }
        .summary-card p { margin: 0; opacity: 0.9; }
        .test-results { margin-top: 30px; }
        .test-result { margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 5px solid #ddd; }
        .pass { border-left-color: #4CAF50; background: #f1f8e9; }
        .fail { border-left-color: #f44336; background: #ffebee; }
        .error { border-left-color: #ff9800; background: #fff3e0; }
        .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .test-name { font-weight: bold; font-size: 1.1em; }
        .test-duration { color: #666; font-size: 0.9em; }
        .test-script { color: #888; font-size: 0.9em; }
        .progress-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 璐娜的 GIF 動畫製作器</h1>
            <h2>全面測試報告</h2>
            <p>測試時間: ${summary.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>${summary.totalTests}</h3>
                <p>總測試數</p>
            </div>
            <div class="summary-card">
                <h3>${summary.passed}</h3>
                <p>通過測試</p>
            </div>
            <div class="summary-card">
                <h3>${summary.failed}</h3>
                <p>失敗測試</p>
            </div>
            <div class="summary-card">
                <h3>${((summary.passed / summary.totalTests) * 100).toFixed(1)}%</h3>
                <p>成功率</p>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(summary.passed / summary.totalTests) * 100}%"></div>
        </div>
        
        <div class="test-results">
            <h3>📋 詳細測試結果</h3>
            ${results.map(result => `
                <div class="test-result ${result.status.toLowerCase()}">
                    <div class="test-header">
                        <div class="test-name">${result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🚨'} ${result.name}</div>
                        <div class="test-duration">${result.duration}ms</div>
                    </div>
                    <div class="test-script">腳本: ${result.script}</div>
                    ${result.error ? `<div style="margin-top: 10px; color: #d32f2f; font-size: 0.9em;">錯誤: ${result.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>總耗時: ${(summary.totalDuration / 1000).toFixed(1)} 秒</p>
            <p>生成時間: ${new Date().toLocaleString('zh-TW')}</p>
        </div>
    </div>
</body>
</html>`;
  }

  generateMarkdownReport(report) {
    const { summary, results } = report;
    
    return `# 🎯 璐娜的 GIF 動畫製作器 - 全面測試報告

## 📊 測試總結

- **總測試數:** ${summary.totalTests}
- **✅ 通過:** ${summary.passed}
- **❌ 失敗:** ${summary.failed}
- **🚨 錯誤:** ${summary.errors}
- **📈 成功率:** ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%
- **⏱️ 總耗時:** ${(summary.totalDuration / 1000).toFixed(1)} 秒
- **🕒 測試時間:** ${summary.timestamp}

## 📋 詳細測試結果

${results.map((result, index) => {
  const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🚨';
  return `### ${index + 1}. ${status} ${result.name}

- **狀態:** ${result.status}
- **腳本:** \`${result.script}\`
- **耗時:** ${result.duration}ms
${result.error ? `- **錯誤:** ${result.error}` : ''}
`;
}).join('\n')}

## 🎯 測試環境

- **平台:** ${report.environment.platform}
- **Node.js 版本:** ${report.environment.nodeVersion}
- **測試執行器:** ${report.environment.testRunner}

## 💡 改進建議

${summary.failed > 0 || summary.errors > 0 ? 
  results.filter(r => r.status !== 'PASS').map(result => 
    `- **${result.name}:** 檢查 \`${result.script}\` 腳本的實現`
  ).join('\n') : 
  '🎉 所有測試都通過了！璐娜的應用程式運行良好。'
}

---

**報告生成時間:** ${new Date().toLocaleString('zh-TW')}
`;
  }
}

// 執行全面測試
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = ComprehensiveTestRunner;
