/**
 * 📊 璐娜的 GIF 動畫製作器 - 測試報告生成器
 * 生成詳細的測試報告和統計分析
 */

const fs = require('fs').promises;
const path = require('path');

class LunaReportGenerator {
  constructor() {
    this.reportDir = path.join(__dirname, 'reports');
    this.templateDir = path.join(__dirname, 'templates');
  }

  // 生成完整測試報告
  async generateReport() {
    console.log('📊 開始生成測試報告...');
    console.log('=' .repeat(50));

    try {
      // 設定報告目錄
      await this.setupReportDirectory();
      
      // 收集測試數據
      const testData = await this.collectTestData();
      
      // 生成各種格式的報告
      await this.generateHTMLReport(testData);
      await this.generateJSONReport(testData);
      await this.generateMarkdownReport(testData);
      await this.generateCSVReport(testData);
      
      // 生成摘要報告
      await this.generateSummaryReport(testData);
      
      console.log('✅ 測試報告生成完成');
      this.showReportPaths();
      
    } catch (error) {
      console.error('❌ 測試報告生成失敗:', error.message);
    }
  }

  // 設定報告目錄
  async setupReportDirectory() {
    await fs.mkdir(this.reportDir, { recursive: true });
    await fs.mkdir(this.templateDir, { recursive: true });
  }

  // 收集測試數據
  async collectTestData() {
    console.log('📋 收集測試數據...');
    
    // 模擬測試數據（實際應用中會從測試結果檔案讀取）
    const testData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 87,
        passed: 79,
        failed: 6,
        skipped: 2,
        successRate: 90.8,
        duration: 245000 // 毫秒
      },
      categories: [
        {
          name: 'UI 點擊測試',
          total: 15,
          passed: 14,
          failed: 1,
          skipped: 0,
          tests: [
            { name: '基本 UI 元素測試', status: 'passed', duration: 1200 },
            { name: '控制面板測試', status: 'passed', duration: 2300 },
            { name: '方法選擇測試', status: 'failed', duration: 800, error: '按鈕響應超時' },
            { name: '動畫控制測試', status: 'passed', duration: 1500 }
          ]
        },
        {
          name: '功能測試',
          total: 25,
          passed: 23,
          failed: 2,
          skipped: 0,
          tests: [
            { name: '動畫引擎測試', status: 'passed', duration: 3200 },
            { name: '形狀生成測試', status: 'passed', duration: 2800 },
            { name: '參數驗證測試', status: 'failed', duration: 1200, error: '無效參數處理失敗' },
            { name: '檔案操作測試', status: 'passed', duration: 4500 }
          ]
        },
        {
          name: '動畫測試',
          total: 20,
          passed: 18,
          failed: 1,
          skipped: 1,
          tests: [
            { name: '動畫引擎核心功能', status: 'passed', duration: 2100 },
            { name: '形狀動畫測試', status: 'passed', duration: 3400 },
            { name: '動畫類型測試', status: 'failed', duration: 1800, error: '旋轉動畫異常' },
            { name: '幀生成測試', status: 'passed', duration: 5200 }
          ]
        },
        {
          name: 'FFmpeg 測試',
          total: 12,
          passed: 10,
          failed: 1,
          skipped: 1,
          tests: [
            { name: 'FFmpeg 可用性測試', status: 'passed', duration: 1500 },
            { name: 'GIF 轉換測試', status: 'passed', duration: 8200 },
            { name: '輸出品質測試', status: 'failed', duration: 3200, error: '品質不符合標準' },
            { name: '錯誤處理測試', status: 'skipped', duration: 0, error: 'FFmpeg 不可用' }
          ]
        },
        {
          name: 'SVG 測試',
          total: 8,
          passed: 8,
          failed: 0,
          skipped: 0,
          tests: [
            { name: 'SVG 生成測試', status: 'passed', duration: 1200 },
            { name: 'SVG 動畫測試', status: 'passed', duration: 2100 },
            { name: 'SVG 驗證測試', status: 'passed', duration: 800 }
          ]
        },
        {
          name: '性能測試',
          total: 7,
          passed: 6,
          failed: 1,
          skipped: 0,
          tests: [
            { name: '應用程式啟動性能', status: 'passed', duration: 3200 },
            { name: '記憶體使用測試', status: 'passed', duration: 2800 },
            { name: '渲染性能測試', status: 'failed', duration: 4200, error: '渲染時間超標' }
          ]
        }
      ],
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toLocaleString('zh-TW'),
        testRunner: 'Luna Test Suite v1.0.0'
      }
    };

    return testData;
  }

  // 生成 HTML 報告
  async generateHTMLReport(testData) {
    console.log('🌐 生成 HTML 報告...');
    
    const htmlContent = this.generateHTMLContent(testData);
    const htmlPath = path.join(this.reportDir, `test-report-${Date.now()}.html`);
    
    await fs.writeFile(htmlPath, htmlContent);
    
    return htmlPath;
  }

  // 生成 HTML 內容
  generateHTMLContent(testData) {
    return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>璐娜的 GIF 動畫製作器 - 測試報告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Microsoft JhengHei', 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f5f7fa;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 15px; 
            margin-bottom: 30px; 
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .summary-card { 
            background: white; 
            padding: 25px; 
            border-radius: 12px; 
            text-align: center; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-left: 4px solid #667eea;
        }
        .summary-card h3 { color: #666; margin-bottom: 10px; font-size: 0.9em; text-transform: uppercase; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; color: #333; }
        .summary-card.success .number { color: #28a745; }
        .summary-card.danger .number { color: #dc3545; }
        .summary-card.warning .number { color: #ffc107; }
        .summary-card.info .number { color: #17a2b8; }
        .category { 
            background: white; 
            margin-bottom: 25px; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .category-header { 
            background: #f8f9fa; 
            padding: 20px; 
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .category-title { font-size: 1.3em; font-weight: bold; color: #333; }
        .category-stats { display: flex; gap: 15px; }
        .stat { 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 0.85em; 
            font-weight: bold;
        }
        .stat.passed { background: #d4edda; color: #155724; }
        .stat.failed { background: #f8d7da; color: #721c24; }
        .stat.skipped { background: #fff3cd; color: #856404; }
        .test-list { padding: 0; }
        .test-item { 
            padding: 15px 20px; 
            border-bottom: 1px solid #f1f3f4; 
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-meta { display: flex; gap: 15px; align-items: center; font-size: 0.9em; color: #666; }
        .status { 
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 0.8em; 
            font-weight: bold;
        }
        .status.passed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .status.skipped { background: #fff3cd; color: #856404; }
        .duration { color: #6c757d; }
        .error { color: #dc3545; font-size: 0.85em; margin-top: 5px; }
        .footer { 
            text-align: center; 
            padding: 30px; 
            color: #666; 
            border-top: 1px solid #dee2e6; 
            margin-top: 40px;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌙 璐娜的 GIF 動畫製作器</h1>
            <p>測試報告 - ${testData.environment.timestamp}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${testData.summary.successRate}%"></div>
            </div>
            <p>成功率: ${testData.summary.successRate}%</p>
        </div>
        
        <div class="summary">
            <div class="summary-card info">
                <h3>總測試數</h3>
                <div class="number">${testData.summary.total}</div>
            </div>
            <div class="summary-card success">
                <h3>通過</h3>
                <div class="number">${testData.summary.passed}</div>
            </div>
            <div class="summary-card danger">
                <h3>失敗</h3>
                <div class="number">${testData.summary.failed}</div>
            </div>
            <div class="summary-card warning">
                <h3>跳過</h3>
                <div class="number">${testData.summary.skipped}</div>
            </div>
        </div>
        
        ${testData.categories.map(category => `
            <div class="category">
                <div class="category-header">
                    <div class="category-title">${category.name}</div>
                    <div class="category-stats">
                        <span class="stat passed">通過 ${category.passed}</span>
                        <span class="stat failed">失敗 ${category.failed}</span>
                        <span class="stat skipped">跳過 ${category.skipped}</span>
                    </div>
                </div>
                <div class="test-list">
                    ${category.tests.map(test => `
                        <div class="test-item">
                            <div>
                                <div class="test-name">${test.name}</div>
                                ${test.error ? `<div class="error">錯誤: ${test.error}</div>` : ''}
                            </div>
                            <div class="test-meta">
                                <span class="duration">${test.duration}ms</span>
                                <span class="status ${test.status}">${test.status === 'passed' ? '通過' : test.status === 'failed' ? '失敗' : '跳過'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
        
        <div class="footer">
            <p>測試執行時間: ${Math.round(testData.summary.duration / 1000)}秒</p>
            <p>測試環境: ${testData.environment.platform} | Node.js ${testData.environment.nodeVersion}</p>
            <p>報告生成時間: ${new Date().toLocaleString('zh-TW')}</p>
        </div>
    </div>
</body>
</html>`;
  }

  // 生成 JSON 報告
  async generateJSONReport(testData) {
    console.log('📄 生成 JSON 報告...');
    
    const jsonPath = path.join(this.reportDir, `test-report-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(testData, null, 2));
    
    return jsonPath;
  }

  // 生成 Markdown 報告
  async generateMarkdownReport(testData) {
    console.log('📝 生成 Markdown 報告...');
    
    const markdownContent = this.generateMarkdownContent(testData);
    const markdownPath = path.join(this.reportDir, `test-report-${Date.now()}.md`);
    
    await fs.writeFile(markdownPath, markdownContent);
    
    return markdownPath;
  }

  // 生成 Markdown 內容
  generateMarkdownContent(testData) {
    return `# 🌙 璐娜的 GIF 動畫製作器 - 測試報告

**生成時間:** ${testData.environment.timestamp}  
**測試環境:** ${testData.environment.platform} | Node.js ${testData.environment.nodeVersion}

## 📊 測試摘要

| 指標 | 數值 |
|------|------|
| 總測試數 | ${testData.summary.total} |
| ✅ 通過 | ${testData.summary.passed} |
| ❌ 失敗 | ${testData.summary.failed} |
| ⏭️ 跳過 | ${testData.summary.skipped} |
| 🎯 成功率 | ${testData.summary.successRate}% |
| ⏱️ 執行時間 | ${Math.round(testData.summary.duration / 1000)}秒 |

## 📋 詳細結果

${testData.categories.map(category => `
### ${category.name}

**統計:** 通過 ${category.passed} | 失敗 ${category.failed} | 跳過 ${category.skipped}

${category.tests.map(test => `
- **${test.name}**
  - 狀態: ${test.status === 'passed' ? '✅ 通過' : test.status === 'failed' ? '❌ 失敗' : '⏭️ 跳過'}
  - 耗時: ${test.duration}ms
  ${test.error ? `- 錯誤: ${test.error}` : ''}
`).join('')}
`).join('')}

## 🎉 測試完成

報告生成於 ${new Date().toLocaleString('zh-TW')}
`;
  }

  // 生成 CSV 報告
  async generateCSVReport(testData) {
    console.log('📊 生成 CSV 報告...');
    
    const csvContent = this.generateCSVContent(testData);
    const csvPath = path.join(this.reportDir, `test-report-${Date.now()}.csv`);
    
    await fs.writeFile(csvPath, csvContent);
    
    return csvPath;
  }

  // 生成 CSV 內容
  generateCSVContent(testData) {
    let csv = 'Category,Test Name,Status,Duration (ms),Error\n';
    
    testData.categories.forEach(category => {
      category.tests.forEach(test => {
        csv += `"${category.name}","${test.name}","${test.status}",${test.duration},"${test.error || ''}"\n`;
      });
    });
    
    return csv;
  }

  // 生成摘要報告
  async generateSummaryReport(testData) {
    console.log('📋 生成摘要報告...');
    
    const summary = {
      timestamp: testData.timestamp,
      overall: testData.summary,
      categories: testData.categories.map(cat => ({
        name: cat.name,
        total: cat.total,
        passed: cat.passed,
        failed: cat.failed,
        skipped: cat.skipped,
        successRate: Math.round((cat.passed / cat.total) * 100)
      })),
      failedTests: []
    };

    // 收集失敗的測試
    testData.categories.forEach(category => {
      category.tests.forEach(test => {
        if (test.status === 'failed') {
          summary.failedTests.push({
            category: category.name,
            name: test.name,
            error: test.error,
            duration: test.duration
          });
        }
      });
    });

    const summaryPath = path.join(this.reportDir, `test-summary-${Date.now()}.json`);
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    return summaryPath;
  }

  // 顯示報告路徑
  showReportPaths() {
    console.log('\n📁 報告檔案位置:');
    console.log(`   ${this.reportDir}`);
    console.log('\n📋 生成的報告格式:');
    console.log('   🌐 HTML - 互動式網頁報告');
    console.log('   📄 JSON - 結構化數據報告');
    console.log('   📝 Markdown - 文檔格式報告');
    console.log('   📊 CSV - 表格數據報告');
    console.log('   📋 Summary - 摘要報告');
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const generator = new LunaReportGenerator();
  generator.generateReport().catch(console.error);
}

module.exports = LunaReportGenerator;
