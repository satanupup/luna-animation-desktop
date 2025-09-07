#!/usr/bin/env node

/**
 * 🚀 璐娜的 GIF 動畫製作器 - 快速測試腳本
 * 提供快速測試和驗證功能
 */

const { spawn } = require('child_process');
const path = require('path');

class QuickTest {
  constructor() {
    this.testCommands = {
      'ui': 'npm run test:ui:click',
      'func': 'npm run test:functionality', 
      'anim': 'npm run test:animation',
      'ffmpeg': 'npm run test:ffmpeg',
      'svg': 'npm run test:svg',
      'perf': 'npm run test:performance',
      'visual': 'npm run test:ui:visual',
      'all': 'npm test',
      'report': 'npm run test:report',
      'watch': 'npm run test:watch'
    };
  }

  // 顯示幫助資訊
  showHelp() {
    console.log('🚀 璐娜的 GIF 動畫製作器 - 快速測試');
    console.log('=' .repeat(50));
    console.log('');
    console.log('📋 使用方式:');
    console.log('  node quick-test.js [測試類型]');
    console.log('');
    console.log('🎯 可用的測試類型:');
    console.log('  ui      - UI 點擊測試');
    console.log('  func    - 功能測試');
    console.log('  anim    - 動畫測試');
    console.log('  ffmpeg  - FFmpeg 測試');
    console.log('  svg     - SVG 測試');
    console.log('  perf    - 性能測試');
    console.log('  visual  - 視覺回歸測試');
    console.log('  all     - 所有測試');
    console.log('  report  - 生成測試報告');
    console.log('  watch   - 監視模式');
    console.log('');
    console.log('💡 範例:');
    console.log('  node quick-test.js ui');
    console.log('  node quick-test.js all');
    console.log('  node quick-test.js watch');
    console.log('');
    console.log('🔧 其他選項:');
    console.log('  --help, -h    顯示此幫助資訊');
    console.log('  --list, -l    列出所有可用測試');
    console.log('  --status, -s  檢查測試環境狀態');
    console.log('');
  }

  // 列出所有測試
  listTests() {
    console.log('📋 可用的測試命令:');
    console.log('=' .repeat(40));
    
    Object.entries(this.testCommands).forEach(([key, command]) => {
      console.log(`  ${key.padEnd(8)} → ${command}`);
    });
    
    console.log('');
  }

  // 檢查測試環境狀態
  async checkStatus() {
    console.log('🔍 檢查測試環境狀態...');
    console.log('=' .repeat(40));
    
    // 檢查 Node.js 版本
    console.log(`Node.js 版本: ${process.version}`);
    console.log(`平台: ${process.platform}`);
    console.log(`架構: ${process.arch}`);
    
    // 檢查必要的檔案
    const fs = require('fs');
    const requiredFiles = [
      'tests/test-runner.js',
      'tests/ui-click-test.js',
      'tests/functionality-test.js',
      'tests/animation-test.js',
      'package.json'
    ];
    
    console.log('\n📁 檔案檢查:');
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    });
    
    // 檢查依賴
    console.log('\n📦 依賴檢查:');
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const devDeps = packageJson.devDependencies || {};
      
      const requiredDeps = ['electron', 'chokidar', 'chalk', 'fs-extra'];
      requiredDeps.forEach(dep => {
        const installed = dep in devDeps;
        console.log(`  ${installed ? '✅' : '❌'} ${dep}`);
      });
    } catch (error) {
      console.log('  ❌ 無法讀取 package.json');
    }
    
    console.log('\n🎯 測試目錄:');
    try {
      const testFiles = fs.readdirSync('tests').filter(f => f.endsWith('.js'));
      console.log(`  找到 ${testFiles.length} 個測試檔案`);
      testFiles.forEach(file => {
        console.log(`    - ${file}`);
      });
    } catch (error) {
      console.log('  ❌ 無法讀取測試目錄');
    }
    
    console.log('');
  }

  // 執行測試
  async runTest(testType) {
    const command = this.testCommands[testType];
    
    if (!command) {
      console.log(`❌ 未知的測試類型: ${testType}`);
      console.log('使用 --help 查看可用選項');
      return;
    }
    
    console.log(`🚀 執行測試: ${testType}`);
    console.log(`📝 命令: ${command}`);
    console.log('=' .repeat(50));
    
    return new Promise((resolve, reject) => {
      const child = spawn('cmd', ['/c', command], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      child.on('close', (code) => {
        console.log('\n' + '=' .repeat(50));
        if (code === 0) {
          console.log(`✅ 測試完成: ${testType}`);
        } else {
          console.log(`❌ 測試失敗: ${testType} (退出代碼: ${code})`);
        }
        resolve(code);
      });
      
      child.on('error', (error) => {
        console.log(`❌ 執行錯誤: ${error.message}`);
        reject(error);
      });
    });
  }

  // 主要執行邏輯
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showHelp();
      return;
    }
    
    const firstArg = args[0];
    
    // 處理選項
    if (firstArg === '--help' || firstArg === '-h') {
      this.showHelp();
      return;
    }
    
    if (firstArg === '--list' || firstArg === '-l') {
      this.listTests();
      return;
    }
    
    if (firstArg === '--status' || firstArg === '-s') {
      await this.checkStatus();
      return;
    }
    
    // 執行測試
    if (firstArg in this.testCommands) {
      try {
        const exitCode = await this.runTest(firstArg);
        process.exit(exitCode);
      } catch (error) {
        console.error('執行失敗:', error.message);
        process.exit(1);
      }
    } else {
      console.log(`❌ 未知的測試類型: ${firstArg}`);
      console.log('使用 --help 查看可用選項');
      process.exit(1);
    }
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const quickTest = new QuickTest();
  quickTest.run().catch(console.error);
}

module.exports = QuickTest;
