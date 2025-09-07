/**
 * 🧪 璐娜的 GIF 動畫製作器 - 全面測試運行器
 * 統一管理所有測試套件，提供完整的測試報告
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class LunaTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.testSuites = [
      {
        name: '🖱️ UI 點擊測試',
        command: 'npm run test:ui:click',
        description: '測試所有 UI 元素的點擊功能',
        priority: 'high',
        timeout: 60000
      },
      {
        name: '🎨 視覺回歸測試',
        command: 'npm run test:ui:visual',
        description: '檢查 UI 視覺一致性和設計規範',
        priority: 'medium',
        timeout: 45000
      },
      {
        name: '⚙️ 功能測試',
        command: 'npm run test:functionality',
        description: '測試核心功能的完整性',
        priority: 'high',
        timeout: 90000
      },
      {
        name: '🎬 動畫測試',
        command: 'npm run test:animation',
        description: '測試動畫引擎和渲染功能',
        priority: 'high',
        timeout: 60000
      },
      {
        name: '🎯 FFmpeg 測試',
        command: 'npm run test:ffmpeg',
        description: '測試 FFmpeg 集成和 GIF 生成',
        priority: 'medium',
        timeout: 120000
      },
      {
        name: '🎨 SVG 測試',
        command: 'npm run test:svg',
        description: '測試 SVG 動畫生成功能',
        priority: 'medium',
        timeout: 30000
      },
      {
        name: '⚡ 性能測試',
        command: 'npm run test:performance',
        description: '測試應用程式性能和響應速度',
        priority: 'low',
        timeout: 60000
      }
    ];
  }

  // 運行所有測試
  async runAllTests() {
    console.log('🚀 璐娜的 GIF 動畫製作器 - 全面測試開始');
    console.log('=' .repeat(60));
    
    const results = {
      total: this.testSuites.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    for (const suite of this.testSuites) {
      console.log(`\n🧪 執行: ${suite.name}`);
      console.log(`📝 描述: ${suite.description}`);
      console.log(`⏱️ 超時: ${suite.timeout / 1000}秒`);
      
      const result = await this.runSingleTest(suite);
      results.details.push(result);
      
      if (result.status === 'passed') {
        results.passed++;
        console.log(`✅ ${suite.name}: 測試通過`);
      } else if (result.status === 'failed') {
        results.failed++;
        console.log(`❌ ${suite.name}: 測試失敗`);
        if (result.error) {
          console.log(`   錯誤: ${result.error}`);
        }
      } else {
        results.skipped++;
        console.log(`⏭️ ${suite.name}: 測試跳過`);
      }
    }

    await this.generateReport(results);
    this.printSummary(results);
    
    return results;
  }

  // 運行單個測試
  async runSingleTest(suite) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const child = spawn('cmd', ['/c', suite.command], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        child.kill();
        resolve({
          name: suite.name,
          status: 'failed',
          duration: Date.now() - startTime,
          error: '測試超時',
          stdout: stdout,
          stderr: stderr
        });
      }, suite.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve({
          name: suite.name,
          status: code === 0 ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          error: code !== 0 ? `程序退出代碼: ${code}` : null
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          name: suite.name,
          status: 'failed',
          duration: Date.now() - startTime,
          error: error.message,
          stdout: stdout,
          stderr: stderr
        });
      });
    });
  }

  // 生成測試報告
  async generateReport(results) {
    const reportDir = path.join(__dirname, 'reports');
    await fs.mkdir(reportDir, { recursive: true });

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        successRate: Math.round((results.passed / results.total) * 100)
      },
      details: results.details,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd()
      }
    };

    // 保存 JSON 報告
    const jsonPath = path.join(reportDir, `test-report-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    // 生成 HTML 報告
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(reportDir, `test-report-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);

    console.log(`\n📊 測試報告已生成:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  // 生成 HTML 報告
  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>璐娜的 GIF 動畫製作器 - 測試報告</title>
    <style>
        body { font-family: 'Microsoft JhengHei', sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .test-item { margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #ddd; }
        .passed { border-left-color: #28a745; background: #d4edda; }
        .failed { border-left-color: #dc3545; background: #f8d7da; }
        .skipped { border-left-color: #ffc107; background: #fff3cd; }
        .details { margin-top: 10px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌙 璐娜的 GIF 動畫製作器</h1>
            <h2>測試報告</h2>
            <p>生成時間: ${new Date(report.timestamp).toLocaleString('zh-TW')}</p>
            <p>測試時長: ${Math.round(report.duration / 1000)}秒</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>總測試數</h3>
                <h2>${report.summary.total}</h2>
            </div>
            <div class="summary-card">
                <h3>通過</h3>
                <h2>${report.summary.passed}</h2>
            </div>
            <div class="summary-card">
                <h3>失敗</h3>
                <h2>${report.summary.failed}</h2>
            </div>
            <div class="summary-card">
                <h3>成功率</h3>
                <h2>${report.summary.successRate}%</h2>
            </div>
        </div>
        
        <h3>詳細結果</h3>
        ${report.details.map(test => `
            <div class="test-item ${test.status}">
                <h4>${test.name}</h4>
                <div class="details">
                    <p><strong>狀態:</strong> ${test.status === 'passed' ? '✅ 通過' : test.status === 'failed' ? '❌ 失敗' : '⏭️ 跳過'}</p>
                    <p><strong>耗時:</strong> ${Math.round(test.duration / 1000)}秒</p>
                    ${test.error ? `<p><strong>錯誤:</strong> ${test.error}</p>` : ''}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  // 打印測試摘要
  printSummary(results) {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 測試摘要');
    console.log('=' .repeat(60));
    console.log(`總測試數: ${results.total}`);
    console.log(`✅ 通過: ${results.passed}`);
    console.log(`❌ 失敗: ${results.failed}`);
    console.log(`⏭️ 跳過: ${results.skipped}`);
    console.log(`🎯 成功率: ${Math.round((results.passed / results.total) * 100)}%`);
    console.log(`⏱️ 總耗時: ${Math.round((Date.now() - this.startTime) / 1000)}秒`);
    console.log('=' .repeat(60));
    
    if (results.failed > 0) {
      console.log('❌ 有測試失敗，請檢查詳細報告');
      process.exit(1);
    } else {
      console.log('🎉 所有測試通過！');
    }
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const runner = new LunaTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = LunaTestRunner;
