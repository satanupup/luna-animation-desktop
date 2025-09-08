/**
 * 🚨 錯誤處理和警告檢測測試
 */

const { spawn } = require('child_process');
const path = require('path');

class ErrorHandlingTest {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.consoleMessages = [];
  }

  async runTests() {
    console.log('🚨 開始錯誤處理和警告檢測測試...');
    
    try {
      // 啟動應用程式並監控錯誤
      await this.testApplicationStartup();
      
      // 檢測結果
      this.analyzeResults();
      
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  }

  async testApplicationStartup() {
    console.log('\n🔧 啟動應用程式並監控錯誤...');
    
    return new Promise((resolve, reject) => {
      const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');
      const appPath = '.';
      
      const child = spawn(electronPath, [appPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: __dirname
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.parseConsoleOutput(output);
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        this.parseErrorOutput(output);
      });

      // 讓應用程式運行 10 秒來檢測錯誤
      setTimeout(() => {
        child.kill();
        resolve({
          stdout,
          stderr,
          errors: this.errors,
          warnings: this.warnings,
          consoleMessages: this.consoleMessages
        });
      }, 10000);

      child.on('error', (error) => {
        this.errors.push({
          type: 'process_error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      });

      child.on('close', (code) => {
        if (code !== 0 && code !== null) {
          this.errors.push({
            type: 'exit_code',
            message: `應用程式異常退出，代碼: ${code}`,
            timestamp: new Date().toISOString()
          });
        }
        resolve({
          stdout,
          stderr,
          errors: this.errors,
          warnings: this.warnings,
          consoleMessages: this.consoleMessages
        });
      });
    });
  }

  parseConsoleOutput(output) {
    const lines = output.split('\n');
    
    lines.forEach(line => {
      if (line.trim()) {
        this.consoleMessages.push({
          type: 'stdout',
          message: line.trim(),
          timestamp: new Date().toISOString()
        });

        // 檢測特定的成功訊息
        if (line.includes('✅') || line.includes('找到 FFmpeg')) {
          console.log('✅', line.trim());
        }
      }
    });
  }

  parseErrorOutput(output) {
    const lines = output.split('\n');
    
    lines.forEach(line => {
      if (line.trim()) {
        this.consoleMessages.push({
          type: 'stderr',
          message: line.trim(),
          timestamp: new Date().toISOString()
        });

        // 檢測錯誤
        if (this.isError(line)) {
          this.errors.push({
            type: 'runtime_error',
            message: line.trim(),
            timestamp: new Date().toISOString()
          });
          console.error('❌', line.trim());
        }
        
        // 檢測警告
        else if (this.isWarning(line)) {
          this.warnings.push({
            type: 'runtime_warning',
            message: line.trim(),
            timestamp: new Date().toISOString()
          });
          console.warn('⚠️', line.trim());
        }
      }
    });
  }

  isError(line) {
    const errorPatterns = [
      /Error:/i,
      /ReferenceError:/i,
      /TypeError:/i,
      /SyntaxError:/i,
      /module not found/i,
      /Cannot read property/i,
      /Cannot access before initialization/i,
      /require is not defined/i,
      /Uncaught/i
    ];

    return errorPatterns.some(pattern => pattern.test(line));
  }

  isWarning(line) {
    const warningPatterns = [
      /Warning:/i,
      /Electron Security Warning/i,
      /Content-Security-Policy/i,
      /unsafe-eval/i,
      /deprecated/i,
      /DeprecationWarning/i
    ];

    return warningPatterns.some(pattern => pattern.test(line));
  }

  analyzeResults() {
    console.log('\n📊 錯誤和警告分析結果:');
    
    // 錯誤統計
    console.log(`\n🚨 錯誤統計:`);
    console.log(`總錯誤數: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 發現的錯誤:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
      });
    } else {
      console.log('✅ 沒有發現錯誤');
    }

    // 警告統計
    console.log(`\n⚠️ 警告統計:`);
    console.log(`總警告數: ${this.warnings.length}`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 發現的警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
      });
    } else {
      console.log('✅ 沒有發現警告');
    }

    // 特定問題檢查
    this.checkSpecificIssues();

    // 總結
    this.generateSummary();
  }

  checkSpecificIssues() {
    console.log('\n🔍 特定問題檢查:');

    // 檢查 require 錯誤
    const requireErrors = this.errors.filter(error => 
      error.message.includes('require is not defined')
    );
    
    if (requireErrors.length > 0) {
      console.log('❌ 發現 require 相關錯誤 - preload.js 配置問題');
    } else {
      console.log('✅ 沒有 require 相關錯誤');
    }

    // 檢查 CSP 警告
    const cspWarnings = this.warnings.filter(warning => 
      warning.message.includes('Content-Security-Policy')
    );
    
    if (cspWarnings.length > 0) {
      console.log('⚠️ 發現 CSP 安全警告 - 需要設定 Content Security Policy');
    } else {
      console.log('✅ 沒有 CSP 安全警告');
    }

    // 檢查模組載入錯誤
    const moduleErrors = this.errors.filter(error => 
      error.message.includes('module not found')
    );
    
    if (moduleErrors.length > 0) {
      console.log('❌ 發現模組載入錯誤 - 依賴項問題');
    } else {
      console.log('✅ 沒有模組載入錯誤');
    }

    // 檢查 FFmpeg 相關錯誤
    const ffmpegErrors = this.errors.filter(error => 
      error.message.toLowerCase().includes('ffmpeg')
    );
    
    if (ffmpegErrors.length > 0) {
      console.log('❌ 發現 FFmpeg 相關錯誤');
    } else {
      console.log('✅ 沒有 FFmpeg 相關錯誤');
    }
  }

  generateSummary() {
    console.log('\n🎯 測試總結:');
    
    const totalIssues = this.errors.length + this.warnings.length;
    
    if (totalIssues === 0) {
      console.log('🎉 完美！沒有發現任何錯誤或警告');
      console.log('✅ 應用程式運行狀態良好');
    } else {
      console.log(`⚠️ 發現 ${totalIssues} 個問題 (${this.errors.length} 個錯誤, ${this.warnings.length} 個警告)`);
      
      if (this.errors.length > 0) {
        console.log('🔧 建議優先修復錯誤問題');
      }
      
      if (this.warnings.length > 0) {
        console.log('💡 建議處理警告以提升安全性和穩定性');
      }
    }

    // 建議
    console.log('\n💡 修復建議:');
    
    if (this.errors.some(e => e.message.includes('require is not defined'))) {
      console.log('1. 修復 preload.js 中的 require 問題 - 使用 IPC 通訊');
    }
    
    if (this.warnings.some(w => w.message.includes('Content-Security-Policy'))) {
      console.log('2. 添加 Content-Security-Policy 到 HTML head');
    }
    
    if (this.errors.some(e => e.message.includes('module not found'))) {
      console.log('3. 檢查並安裝缺失的依賴項');
    }

    console.log('\n🔧 測試完成時間:', new Date().toISOString());
  }
}

// 執行測試
const tester = new ErrorHandlingTest();
tester.runTests().catch(console.error);
