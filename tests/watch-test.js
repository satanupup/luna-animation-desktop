/**
 * 👀 璐娜的 GIF 動畫製作器 - 監視測試
 * 監視檔案變化並自動執行相關測試
 */

const chokidar = require('chokidar');
const path = require('path');
const { spawn } = require('child_process');

class LunaWatchTest {
  constructor() {
    this.watchers = [];
    this.testQueue = [];
    this.isRunning = false;
    this.debounceTimeout = null;
    this.debounceDelay = 2000; // 2秒防抖
  }

  // 開始監視
  async startWatching() {
    console.log('👀 開始監視檔案變化...');
    console.log('=' .repeat(50));

    try {
      // 設定監視規則
      await this.setupWatchers();
      
      console.log('✅ 檔案監視已啟動');
      console.log('📝 監視的檔案類型:');
      console.log('  - JavaScript 檔案 (*.js)');
      console.log('  - HTML 檔案 (*.html)');
      console.log('  - CSS 檔案 (*.css)');
      console.log('  - JSON 檔案 (*.json)');
      console.log('\n🔄 檔案變化時將自動執行相關測試...');
      console.log('按 Ctrl+C 停止監視\n');
      
      // 保持程序運行
      process.on('SIGINT', () => {
        this.stopWatching();
      });
      
    } catch (error) {
      console.error('❌ 檔案監視啟動失敗:', error.message);
    }
  }

  // 設定監視器
  async setupWatchers() {
    const projectRoot = path.join(__dirname, '..');
    
    // 監視源碼檔案
    const sourceWatcher = chokidar.watch([
      path.join(projectRoot, 'src/**/*.js'),
      path.join(projectRoot, 'src/**/*.html'),
      path.join(projectRoot, 'src/**/*.css')
    ], {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });

    sourceWatcher.on('change', (filePath) => {
      this.handleFileChange(filePath, 'source');
    });

    // 監視測試檔案
    const testWatcher = chokidar.watch([
      path.join(__dirname, '**/*.js')
    ], {
      persistent: true,
      ignoreInitial: true
    });

    testWatcher.on('change', (filePath) => {
      this.handleFileChange(filePath, 'test');
    });

    // 監視配置檔案
    const configWatcher = chokidar.watch([
      path.join(projectRoot, 'package.json'),
      path.join(projectRoot, '*.json')
    ], {
      persistent: true,
      ignoreInitial: true
    });

    configWatcher.on('change', (filePath) => {
      this.handleFileChange(filePath, 'config');
    });

    this.watchers = [sourceWatcher, testWatcher, configWatcher];
  }

  // 處理檔案變化
  handleFileChange(filePath, type) {
    const relativePath = path.relative(process.cwd(), filePath);
    const fileName = path.basename(filePath);
    
    console.log(`📝 檔案變化: ${relativePath}`);
    
    // 清除之前的防抖計時器
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    // 設定新的防抖計時器
    this.debounceTimeout = setTimeout(() => {
      this.queueTests(filePath, type);
    }, this.debounceDelay);
  }

  // 將測試加入佇列
  queueTests(filePath, type) {
    const fileName = path.basename(filePath);
    const tests = this.determineTestsToRun(fileName, type);
    
    console.log(`🎯 觸發測試: ${tests.join(', ')}`);
    
    // 將測試加入佇列
    tests.forEach(test => {
      if (!this.testQueue.includes(test)) {
        this.testQueue.push(test);
      }
    });
    
    // 執行佇列中的測試
    this.runQueuedTests();
  }

  // 決定要執行的測試
  determineTestsToRun(fileName, type) {
    const tests = [];
    
    switch (type) {
      case 'source':
        if (fileName.includes('app.js')) {
          tests.push('test:ui:click', 'test:functionality');
        } else if (fileName.includes('animation-engine.js')) {
          tests.push('test:animation', 'test:performance');
        } else if (fileName.includes('ffmpeg-handler.js')) {
          tests.push('test:ffmpeg');
        } else if (fileName.includes('svg-handler.js')) {
          tests.push('test:svg');
        } else if (fileName.includes('.css')) {
          tests.push('test:ui:visual');
        } else if (fileName.includes('.html')) {
          tests.push('test:ui:click', 'test:ui:visual');
        } else {
          tests.push('test:functionality');
        }
        break;
        
      case 'test':
        if (fileName.includes('ui-click-test.js')) {
          tests.push('test:ui:click');
        } else if (fileName.includes('animation-test.js')) {
          tests.push('test:animation');
        } else if (fileName.includes('ffmpeg-test.js')) {
          tests.push('test:ffmpeg');
        } else if (fileName.includes('svg-test.js')) {
          tests.push('test:svg');
        } else if (fileName.includes('performance-test.js')) {
          tests.push('test:performance');
        } else if (fileName.includes('visual-regression-test.js')) {
          tests.push('test:ui:visual');
        } else {
          tests.push('test:functionality');
        }
        break;
        
      case 'config':
        tests.push('test:functionality');
        break;
        
      default:
        tests.push('test:functionality');
    }
    
    return tests;
  }

  // 執行佇列中的測試
  async runQueuedTests() {
    if (this.isRunning || this.testQueue.length === 0) {
      return;
    }
    
    this.isRunning = true;
    
    console.log('\n🚀 開始執行測試...');
    console.log('=' .repeat(30));
    
    while (this.testQueue.length > 0) {
      const test = this.testQueue.shift();
      await this.runSingleTest(test);
    }
    
    console.log('=' .repeat(30));
    console.log('✅ 測試執行完成\n');
    
    this.isRunning = false;
  }

  // 執行單個測試
  async runSingleTest(testCommand) {
    return new Promise((resolve) => {
      console.log(`🧪 執行: ${testCommand}`);
      
      const child = spawn('npm', ['run', testCommand], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let hasOutput = false;

      child.stdout.on('data', (data) => {
        output += data.toString();
        hasOutput = true;
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
        hasOutput = true;
      });

      // 設定超時
      const timeout = setTimeout(() => {
        child.kill();
        console.log(`⏰ ${testCommand}: 測試超時`);
        resolve();
      }, 60000); // 60秒超時

      child.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          console.log(`✅ ${testCommand}: 測試通過`);
        } else {
          console.log(`❌ ${testCommand}: 測試失敗 (代碼: ${code})`);
          
          // 如果有輸出且測試失敗，顯示錯誤摘要
          if (hasOutput && output.length > 0) {
            const errorLines = output.split('\n')
              .filter(line => line.includes('❌') || line.includes('Error') || line.includes('Failed'))
              .slice(0, 3); // 只顯示前3行錯誤
            
            if (errorLines.length > 0) {
              console.log('   錯誤摘要:');
              errorLines.forEach(line => {
                console.log(`   ${line.trim()}`);
              });
            }
          }
        }
        
        resolve();
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        console.log(`❌ ${testCommand}: 執行錯誤 - ${error.message}`);
        resolve();
      });
    });
  }

  // 停止監視
  stopWatching() {
    console.log('\n🛑 停止檔案監視...');
    
    // 關閉所有監視器
    this.watchers.forEach(watcher => {
      watcher.close();
    });
    
    // 清除計時器
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    console.log('✅ 檔案監視已停止');
    process.exit(0);
  }

  // 顯示幫助資訊
  showHelp() {
    console.log('👀 璐娜的 GIF 動畫製作器 - 監視測試');
    console.log('=' .repeat(50));
    console.log('');
    console.log('📋 功能說明:');
    console.log('  - 監視源碼檔案變化');
    console.log('  - 自動執行相關測試');
    console.log('  - 即時反饋測試結果');
    console.log('');
    console.log('🎯 監視規則:');
    console.log('  app.js 變化 → UI 點擊測試 + 功能測試');
    console.log('  animation-engine.js 變化 → 動畫測試 + 性能測試');
    console.log('  ffmpeg-handler.js 變化 → FFmpeg 測試');
    console.log('  svg-handler.js 變化 → SVG 測試');
    console.log('  CSS 檔案變化 → 視覺回歸測試');
    console.log('  HTML 檔案變化 → UI 測試');
    console.log('');
    console.log('⌨️ 快捷鍵:');
    console.log('  Ctrl+C - 停止監視');
    console.log('');
    console.log('🚀 使用方式:');
    console.log('  npm run test:watch');
    console.log('');
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const watcher = new LunaWatchTest();
  
  // 檢查命令行參數
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    watcher.showHelp();
  } else {
    watcher.startWatching().catch(console.error);
  }
}

module.exports = LunaWatchTest;
