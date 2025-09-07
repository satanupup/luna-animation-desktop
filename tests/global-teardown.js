/**
 * 🎭 Playwright 全域清理
 * 在所有測試結束後執行的清理
 */

const fs = require('fs').promises;
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Playwright 全域清理開始...');
  
  try {
    // 生成測試摘要
    await generateTestSummary();
    
    // 清理臨時檔案（可選）
    // await cleanupTempFiles();
    
    console.log('✅ Playwright 全域清理完成');
    
  } catch (error) {
    console.error('❌ Playwright 全域清理失敗:', error);
  }
}

// 生成測試摘要
async function generateTestSummary() {
  try {
    const resultsPath = path.join(__dirname, '..', 'test-results', 'playwright-results.json');
    
    // 檢查結果檔案是否存在
    try {
      await fs.access(resultsPath);
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
      
      const summary = {
        totalTests: results.suites?.reduce((total, suite) => total + (suite.specs?.length || 0), 0) || 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: results.stats?.duration || 0
      };
      
      // 計算統計
      if (results.suites) {
        for (const suite of results.suites) {
          if (suite.specs) {
            for (const spec of suite.specs) {
              if (spec.tests) {
                for (const test of spec.tests) {
                  if (test.results) {
                    for (const result of test.results) {
                      switch (result.status) {
                        case 'passed':
                          summary.passed++;
                          break;
                        case 'failed':
                          summary.failed++;
                          break;
                        case 'skipped':
                          summary.skipped++;
                          break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      console.log('\n📊 Playwright 測試摘要:');
      console.log(`總測試數: ${summary.totalTests}`);
      console.log(`✅ 通過: ${summary.passed}`);
      console.log(`❌ 失敗: ${summary.failed}`);
      console.log(`⏭️ 跳過: ${summary.skipped}`);
      console.log(`⏱️ 執行時間: ${(summary.duration / 1000).toFixed(1)}秒`);
      
      if (summary.totalTests > 0) {
        const successRate = ((summary.passed / summary.totalTests) * 100).toFixed(1);
        console.log(`📈 成功率: ${successRate}%`);
      }
      
    } catch (error) {
      console.log('⚠️ 無法讀取測試結果檔案');
    }
    
  } catch (error) {
    console.error('❌ 生成測試摘要失敗:', error);
  }
}

// 清理臨時檔案
async function cleanupTempFiles() {
  try {
    const tempDirs = [
      path.join(__dirname, '..', 'test-results', 'temp'),
      path.join(__dirname, 'temp-outputs')
    ];
    
    for (const dir of tempDirs) {
      try {
        await fs.rmdir(dir, { recursive: true });
        console.log(`🗑️ 清理臨時目錄: ${dir}`);
      } catch (error) {
        // 目錄可能不存在，忽略錯誤
      }
    }
    
  } catch (error) {
    console.error('❌ 清理臨時檔案失敗:', error);
  }
}

module.exports = globalTeardown;
