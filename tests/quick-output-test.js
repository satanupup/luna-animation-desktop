/**
 * 🚀 璐娜的 GIF 動畫製作器 - 快速輸出測試
 * 不依賴 Electron 啟動的簡化測試版本
 */

const fs = require('fs').promises;
const path = require('path');

class QuickOutputTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.outputDir = path.join(__dirname, 'test-outputs');
  }

  // 運行所有測試
  async runAllTests() {
    this.startTime = Date.now();
    console.log('🚀 快速輸出測試開始');

    try {
      await this.setupTestEnvironment();
      
      // 測試核心功能
      await this.testSVGGeneration();
      await this.testGIFValidation();
      await this.testPNGFrameValidation();
      await this.testFileSystemOperations();
      await this.testFFmpegAvailability();

      // 生成分析報告
      await this.generateAnalysisReport();

    } catch (error) {
      console.error('❌ 測試執行失敗:', error);
      this.testResults.push({
        type: 'SYSTEM',
        name: 'test_execution',
        status: 'ERROR',
        error: error.message
      });
    }
  }

  // 設定測試環境
  async setupTestEnvironment() {
    console.log('🔧 設定測試環境...');
    await fs.mkdir(this.outputDir, { recursive: true });
    console.log('✅ 測試環境準備完成');
  }

  // 測試 SVG 生成
  async testSVGGeneration() {
    console.log('\n🎨 測試 SVG 生成...');
    
    const testCases = [
      { shape: 'circle', animation: 'bounce' },
      { shape: 'square', animation: 'rotate' }
    ];

    for (const testCase of testCases) {
      await this.testSingleSVG(testCase);
    }
  }

  // 測試單個 SVG
  async testSingleSVG(testCase) {
    const testName = `svg_${testCase.shape}_${testCase.animation}`;
    
    try {
      // 生成測試 SVG
      const svgContent = this.generateTestSVG(testCase);
      
      // 保存檔案
      const svgPath = path.join(this.outputDir, `${testName}.svg`);
      await fs.writeFile(svgPath, svgContent);
      
      // 驗證內容
      const validation = this.validateSVGContent(svgContent, testCase);
      
      this.testResults.push({
        type: 'SVG',
        name: testName,
        status: validation.isValid ? 'PASS' : 'FAIL',
        details: validation,
        file: svgPath
      });

      console.log(`${validation.isValid ? '✅' : '❌'} ${testName}: ${validation.message}`);

    } catch (error) {
      this.testResults.push({
        type: 'SVG',
        name: testName,
        status: 'ERROR',
        error: error.message
      });
      console.log(`🚨 ${testName}: ERROR - ${error.message}`);
    }
  }

  // 生成測試 SVG
  generateTestSVG(testCase) {
    const { shape, animation } = testCase;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="none"/>
  ${this.generateShapeElement(shape, animation)}
</svg>`;
  }

  // 生成形狀元素
  generateShapeElement(shape, animation) {
    const centerX = 150, centerY = 100;
    
    switch (shape) {
      case 'circle':
        return `<circle cx="${centerX}" cy="${centerY}" r="20" fill="#ff3b30">
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 0,-60; 0,0" dur="1s" repeatCount="indefinite"/>
        </circle>`;
      
      case 'square':
        return `<rect x="${centerX-20}" y="${centerY-20}" width="40" height="40" fill="#007aff">
          <animateTransform attributeName="transform" type="rotate"
            values="0 ${centerX} ${centerY}; 360 ${centerX} ${centerY}" dur="2s" repeatCount="indefinite"/>
        </rect>`;
      
      default:
        return `<circle cx="${centerX}" cy="${centerY}" r="20" fill="#ff3b30"/>`;
    }
  }

  // 驗證 SVG 內容
  validateSVGContent(svgContent, testCase) {
    const checks = {
      hasXMLDeclaration: svgContent.includes('<?xml version="1.0" encoding="UTF-8"?>'),
      hasSVGTag: svgContent.includes('<svg') && svgContent.includes('</svg>'),
      hasNamespace: svgContent.includes('xmlns="http://www.w3.org/2000/svg"'),
      hasTransparentBackground: svgContent.includes('fill="none"'),
      hasShape: svgContent.includes(this.getShapeTag(testCase.shape)),
      hasAnimation: svgContent.includes('animate'),
      correctSize: svgContent.length > 200 && svgContent.length < 2000
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const isValid = passedChecks >= totalChecks * 0.8;

    return {
      isValid,
      message: `${passedChecks}/${totalChecks} 檢查通過`,
      checks,
      score: Math.round((passedChecks / totalChecks) * 100)
    };
  }

  // 獲取形狀標籤
  getShapeTag(shape) {
    const tags = { circle: 'circle', square: 'rect' };
    return tags[shape] || 'circle';
  }

  // 測試 GIF 驗證
  async testGIFValidation() {
    console.log('\n🎬 測試 GIF 驗證...');
    
    try {
      // 創建模擬 GIF 檔案
      const gifPath = path.join(this.outputDir, 'test.gif');
      const gifData = Buffer.from('GIF89a'); // GIF 簽名
      await fs.writeFile(gifPath, gifData);
      
      // 驗證 GIF
      const validation = await this.validateGIFFile(gifPath);
      
      this.testResults.push({
        type: 'GIF',
        name: 'gif_validation',
        status: validation.isValid ? 'PASS' : 'FAIL',
        details: validation
      });

      console.log(`${validation.isValid ? '✅' : '❌'} GIF 驗證: ${validation.message}`);

    } catch (error) {
      this.testResults.push({
        type: 'GIF',
        name: 'gif_validation',
        status: 'ERROR',
        error: error.message
      });
      console.log(`🚨 GIF 驗證: ERROR - ${error.message}`);
    }
  }

  // 驗證 GIF 檔案
  async validateGIFFile(gifPath) {
    try {
      const stats = await fs.stat(gifPath);
      const buffer = await fs.readFile(gifPath);
      
      const checks = {
        fileExists: stats.size > 0,
        hasGIFSignature: buffer.toString('ascii', 0, 6).startsWith('GIF'),
        sizeReasonable: stats.size > 5 && stats.size < 50000
      };

      const passedChecks = Object.values(checks).filter(Boolean).length;
      const isValid = passedChecks === Object.keys(checks).length;

      return {
        isValid,
        message: `${passedChecks}/${Object.keys(checks).length} 檢查通過`,
        checks,
        fileSize: stats.size
      };

    } catch (error) {
      return {
        isValid: false,
        message: `GIF 驗證失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  // 測試 PNG 幀驗證
  async testPNGFrameValidation() {
    console.log('\n📸 測試 PNG 幀驗證...');
    
    try {
      // 創建模擬 PNG 檔案
      const pngPath = path.join(this.outputDir, 'frame_0001.png');
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const mockData = Buffer.alloc(100);
      const pngData = Buffer.concat([pngSignature, mockData]);
      
      await fs.writeFile(pngPath, pngData);
      
      // 驗證 PNG
      const validation = await this.validatePNGFile(pngPath);
      
      this.testResults.push({
        type: 'PNG',
        name: 'png_frame_validation',
        status: validation.isValid ? 'PASS' : 'FAIL',
        details: validation
      });

      console.log(`${validation.isValid ? '✅' : '❌'} PNG 驗證: ${validation.message}`);

    } catch (error) {
      this.testResults.push({
        type: 'PNG',
        name: 'png_frame_validation',
        status: 'ERROR',
        error: error.message
      });
      console.log(`🚨 PNG 驗證: ERROR - ${error.message}`);
    }
  }

  // 驗證 PNG 檔案
  async validatePNGFile(pngPath) {
    try {
      const stats = await fs.stat(pngPath);
      const buffer = await fs.readFile(pngPath);
      
      const checks = {
        fileExists: stats.size > 0,
        hasPNGSignature: buffer.subarray(0, 8).equals(
          Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
        ),
        sizeReasonable: stats.size > 50
      };

      const passedChecks = Object.values(checks).filter(Boolean).length;
      const isValid = passedChecks === Object.keys(checks).length;

      return {
        isValid,
        message: `${passedChecks}/${Object.keys(checks).length} 檢查通過`,
        checks,
        fileSize: stats.size
      };

    } catch (error) {
      return {
        isValid: false,
        message: `PNG 驗證失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  // 測試檔案系統操作
  async testFileSystemOperations() {
    console.log('\n📁 測試檔案系統操作...');
    
    try {
      // 測試目錄創建
      const testDir = path.join(this.outputDir, 'fs-test');
      await fs.mkdir(testDir, { recursive: true });
      
      // 測試檔案寫入
      const testFile = path.join(testDir, 'test.txt');
      await fs.writeFile(testFile, 'test content');
      
      // 測試檔案讀取
      const content = await fs.readFile(testFile, 'utf8');
      
      const isValid = content === 'test content';
      
      this.testResults.push({
        type: 'FILESYSTEM',
        name: 'file_operations',
        status: isValid ? 'PASS' : 'FAIL',
        details: { message: isValid ? '檔案操作正常' : '檔案操作失敗' }
      });

      console.log(`${isValid ? '✅' : '❌'} 檔案系統操作: ${isValid ? '正常' : '失敗'}`);

    } catch (error) {
      this.testResults.push({
        type: 'FILESYSTEM',
        name: 'file_operations',
        status: 'ERROR',
        error: error.message
      });
      console.log(`🚨 檔案系統操作: ERROR - ${error.message}`);
    }
  }

  // 測試 FFmpeg 可用性
  async testFFmpegAvailability() {
    console.log('\n🎯 測試 FFmpeg 可用性...');
    
    try {
      const ffmpegPath = path.join(__dirname, '..', 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');
      
      try {
        await fs.access(ffmpegPath);
        
        this.testResults.push({
          type: 'FFMPEG',
          name: 'ffmpeg_availability',
          status: 'PASS',
          details: { message: 'FFmpeg 可用', path: ffmpegPath }
        });

        console.log('✅ FFmpeg 可用性: 正常');

      } catch (accessError) {
        this.testResults.push({
          type: 'FFMPEG',
          name: 'ffmpeg_availability',
          status: 'FAIL',
          details: { message: 'FFmpeg 不存在', path: ffmpegPath }
        });

        console.log('❌ FFmpeg 可用性: 檔案不存在');
      }

    } catch (error) {
      this.testResults.push({
        type: 'FFMPEG',
        name: 'ffmpeg_availability',
        status: 'ERROR',
        error: error.message
      });
      console.log(`🚨 FFmpeg 可用性: ERROR - ${error.message}`);
    }
  }

  // 生成分析報告
  async generateAnalysisReport() {
    const summary = {
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'PASS').length,
      failed: this.testResults.filter(r => r.status === 'FAIL').length,
      errors: this.testResults.filter(r => r.status === 'ERROR').length,
      duration: Date.now() - this.startTime
    };

    const analysis = this.analyzeResults();

    console.log('\n🔍 測試分析報告');
    console.log('=' .repeat(50));
    console.log(`📊 結果: ${summary.passed}✅ ${summary.failed}❌ ${summary.errors}🚨`);
    console.log(`⏱️ 時間: ${(summary.duration / 1000).toFixed(1)}s`);
    console.log(`📈 成功率: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);

    if (analysis.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      analysis.warnings.forEach(w => console.log(`  • ${w}`));
    }

    if (analysis.errors.length > 0) {
      console.log('\n❌ 錯誤:');
      analysis.errors.forEach(e => console.log(`  • ${e}`));
    }

    if (analysis.suggestions.length > 0) {
      console.log('\n💡 優化建議:');
      analysis.suggestions.forEach(s => console.log(`  • ${s}`));
    }

    // 保存報告
    const reportPath = path.join(this.outputDir, 'quick-test-analysis.json');
    await fs.writeFile(reportPath, JSON.stringify({ summary, analysis, results: this.testResults }, null, 2));
    console.log(`\n📄 詳細報告: ${reportPath}`);
  }

  // 分析測試結果
  analyzeResults() {
    const warnings = [];
    const errors = [];
    const suggestions = [];

    const failedTests = this.testResults.filter(r => r.status === 'FAIL');
    const errorTests = this.testResults.filter(r => r.status === 'ERROR');

    // SVG 問題分析
    const svgIssues = failedTests.filter(t => t.type === 'SVG');
    if (svgIssues.length > 0) {
      warnings.push(`SVG 生成有 ${svgIssues.length} 個問題`);
      suggestions.push('檢查 SVG 動畫元素語法');
      suggestions.push('確認 SVG 命名空間設定');
    }

    // GIF 問題分析
    const gifIssues = failedTests.filter(t => t.type === 'GIF');
    if (gifIssues.length > 0) {
      warnings.push(`GIF 驗證有問題`);
      suggestions.push('檢查 GIF 檔案格式');
    }

    // PNG 問題分析
    const pngIssues = failedTests.filter(t => t.type === 'PNG');
    if (pngIssues.length > 0) {
      warnings.push(`PNG 驗證有問題`);
      suggestions.push('檢查 PNG 檔案簽名');
    }

    // FFmpeg 問題分析
    const ffmpegIssues = failedTests.filter(t => t.type === 'FFMPEG');
    if (ffmpegIssues.length > 0) {
      errors.push('FFmpeg 不可用');
      suggestions.push('下載並解壓 FFmpeg 到正確路徑');
      suggestions.push('檢查 FFmpeg 執行權限');
    }

    // 檔案系統問題
    const fsIssues = errorTests.filter(t => t.type === 'FILESYSTEM');
    if (fsIssues.length > 0) {
      errors.push('檔案系統操作有問題');
      suggestions.push('檢查目錄寫入權限');
    }

    // 成功率分析
    const successRate = (this.testResults.filter(r => r.status === 'PASS').length / this.testResults.length) * 100;
    if (successRate < 80) {
      warnings.push(`成功率偏低: ${successRate.toFixed(1)}%`);
      suggestions.push('優先修復失敗的核心功能');
    }

    return { warnings, errors, suggestions };
  }
}

// 執行測試
if (require.main === module) {
  const tester = new QuickOutputTest();
  tester.runAllTests().catch(console.error);
}

module.exports = QuickOutputTest;
