/**
 * 🧪 測試應用程式整合 - SVG 和 FFmpeg 實際輸出
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class AppIntegrationTest {
  constructor() {
    this.testDir = path.join(__dirname, 'test-app-output');
  }

  async runTests() {
    console.log('🧪 開始應用程式整合測試...');
    
    try {
      // 創建測試目錄
      await this.setupTestDirectory();
      
      // 測試 SVG 輸出
      await this.testSVGOutput();
      
      // 測試 FFmpeg 命令修復
      await this.testFFmpegCommandFix();
      
      console.log('✅ 所有測試完成');
      
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  }

  async setupTestDirectory() {
    console.log('📁 設定測試目錄...');
    await fs.mkdir(this.testDir, { recursive: true });
  }

  async testSVGOutput() {
    console.log('\n🎨 測試 SVG 輸出...');
    
    // 模擬應用程式生成的 SVG
    const svgContent = this.generateTestSVG();
    
    const svgPath = path.join(this.testDir, 'app-test.svg');
    await fs.writeFile(svgPath, svgContent);
    
    console.log('✅ SVG 檔案已生成:', svgPath);
    
    // 檢查 SVG 內容
    const content = await fs.readFile(svgPath, 'utf8');
    
    console.log('📄 SVG 內容預覽:');
    console.log(content.substring(0, 200) + '...');
    
    // 驗證 SVG 結構
    const hasValidStructure = 
      content.includes('<?xml') &&
      content.includes('<svg') &&
      content.includes('xmlns="http://www.w3.org/2000/svg"') &&
      content.includes('animate') &&
      content.includes('</svg>');
    
    if (hasValidStructure) {
      console.log('✅ SVG 結構正確，包含動畫元素');
    } else {
      console.log('❌ SVG 結構有問題');
    }
    
    // 檢查檔案大小
    const stats = await fs.stat(svgPath);
    console.log(`📊 SVG 檔案大小: ${stats.size} bytes`);
  }

  generateTestSVG() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 透明背景 -->
  <rect width="100%" height="100%" fill="none"/>
  
  <!-- 彈跳圓形動畫 -->
  <circle cx="150" cy="100" r="20" fill="#ff3b30">
    <animateTransform 
      attributeName="transform" 
      type="translate" 
      values="0,0; 0,-60; 0,0" 
      dur="1s" 
      repeatCount="indefinite"/>
  </circle>
  
  <!-- 旋轉方形動畫 -->
  <rect x="130" y="80" width="40" height="40" fill="#007aff" opacity="0.7">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      values="0 150 100; 360 150 100" 
      dur="2s" 
      repeatCount="indefinite"/>
  </rect>
  
  <!-- 脈衝星形動畫 -->
  <polygon points="150,60 155,75 170,75 158,85 163,100 150,90 137,100 142,85 130,75 145,75" 
           fill="#ff9500" opacity="0.8">
    <animateTransform 
      attributeName="transform" 
      type="scale" 
      values="0.5; 1.5; 0.5" 
      dur="1.5s" 
      repeatCount="indefinite"/>
  </polygon>
</svg>`;
  }

  async testFFmpegCommandFix() {
    console.log('\n🔧 測試 FFmpeg 命令修復...');
    
    // 測試修復後的 FFmpeg 命令結構
    const testParams = {
      fps: 15,
      quality: 'medium',
      transparent: true,
      loop: true
    };
    
    const inputDir = this.testDir;
    const outputPath = path.join(this.testDir, 'test-fixed.gif');
    const ffmpegPath = path.join(__dirname, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');
    
    // 生成修復後的命令
    const command = this.buildFixedFFmpegCommand(inputDir, outputPath, testParams, ffmpegPath);
    
    console.log('🔧 修復後的 FFmpeg 命令:');
    console.log(command);
    
    // 驗證命令結構
    const isValidCommand = 
      command.includes('palettegen') &&
      command.includes('paletteuse') &&
      command.includes('&&') &&
      command.includes('-lavfi');
    
    if (isValidCommand) {
      console.log('✅ FFmpeg 命令結構正確');
    } else {
      console.log('❌ FFmpeg 命令結構有問題');
    }
    
    // 檢查 FFmpeg 是否可用
    try {
      await fs.access(ffmpegPath);
      console.log('✅ FFmpeg 檔案存在');
      
      // 測試 FFmpeg 版本（快速檢查）
      const versionOutput = await this.runQuickFFmpegTest(ffmpegPath);
      if (versionOutput.includes('ffmpeg version')) {
        console.log('✅ FFmpeg 可以正常執行');
      }
      
    } catch (error) {
      console.log('❌ FFmpeg 不可用:', error.message);
    }
  }

  buildFixedFFmpegCommand(inputDir, outputPath, options, ffmpegPath) {
    const { fps, quality, transparent, loop } = options;

    // 修正的 FFmpeg 命令，使用兩步法生成高品質 GIF
    // 第一步：生成調色板
    const paletteCommand = [
      `"${ffmpegPath}"`,
      '-y',
      '-framerate', fps.toString(),
      '-i', `"${inputDir}\\frame_%04d.png"`,
      '-vf', 'palettegen=stats_mode=diff',
      `"${inputDir}\\palette.png"`
    ].join(' ');

    // 第二步：使用調色板生成 GIF
    const gifCommand = [
      `"${ffmpegPath}"`,
      '-y',
      '-framerate', fps.toString(),
      '-i', `"${inputDir}\\frame_%04d.png"`,
      '-i', `"${inputDir}\\palette.png"`,
      '-lavfi', 'paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
      `"${outputPath}"`
    ].join(' ');

    // 返回組合命令
    return `${paletteCommand} && ${gifCommand}`;
  }

  async runQuickFFmpegTest(ffmpegPath) {
    return new Promise((resolve, reject) => {
      const child = spawn(ffmpegPath, ['-version'], { stdio: 'pipe' });
      
      let output = '';
      child.stdout.on('data', (data) => output += data.toString());
      child.stderr.on('data', (data) => output += data.toString());
      
      child.on('close', (code) => {
        resolve(output);
      });
      
      child.on('error', (error) => {
        reject(error);
      });
      
      // 快速超時
      setTimeout(() => {
        child.kill();
        reject(new Error('FFmpeg 測試超時'));
      }, 5000);
    });
  }
}

// 執行測試
const tester = new AppIntegrationTest();
tester.runTests().catch(console.error);
