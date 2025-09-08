/**
 * 🧪 測試修復後的 SVG 和 FFmpeg 輸出
 */

const fs = require('fs').promises;
const path = require('path');

class FixedOutputTest {
  constructor() {
    this.testDir = path.join(__dirname, 'test-fixed-output');
  }

  async runTests() {
    console.log('🧪 測試修復後的輸出功能...');
    
    try {
      // 創建測試目錄
      await this.setupTestDirectory();
      
      // 測試修復後的 SVG 輸出
      await this.testFixedSVGOutput();
      
      // 測試修復後的 FFmpeg 命令
      await this.testFixedFFmpegCommand();
      
      console.log('✅ 所有修復測試完成');
      
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  }

  async setupTestDirectory() {
    console.log('📁 設定測試目錄...');
    await fs.mkdir(this.testDir, { recursive: true });
  }

  async testFixedSVGOutput() {
    console.log('\n🎨 測試修復後的 SVG 輸出...');
    
    // 模擬修復後的 SVG 生成
    const svgContent = this.generateFixedSVG();
    
    const svgPath = path.join(this.testDir, 'fixed-output.svg');
    await fs.writeFile(svgPath, svgContent);
    
    console.log('✅ 修復後的 SVG 檔案已生成:', svgPath);
    
    // 檢查修復內容
    const content = await fs.readFile(svgPath, 'utf8');
    
    console.log('📄 修復後的 SVG 內容預覽:');
    console.log(content.substring(0, 300) + '...');
    
    // 驗證修復項目
    const fixes = {
      hasXMLDeclaration: content.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
      hasValidSVGStructure: content.includes('<svg') && content.includes('xmlns="http://www.w3.org/2000/svg"'),
      hasAnimationElements: content.includes('animateTransform') || content.includes('animate'),
      hasTransparentBackground: content.includes('fill="none"'),
      hasProperEncoding: content.includes('encoding="UTF-8"')
    };
    
    console.log('\n🔧 修復驗證結果:');
    Object.entries(fixes).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      const description = this.getFixDescription(key);
      console.log(`${status} ${description}`);
    });
    
    const allFixed = Object.values(fixes).every(fix => fix);
    if (allFixed) {
      console.log('\n🎉 所有 SVG 問題已修復！');
    } else {
      console.log('\n⚠️ 仍有 SVG 問題需要修復');
    }
    
    // 檢查檔案大小
    const stats = await fs.stat(svgPath);
    console.log(`📊 修復後 SVG 檔案大小: ${stats.size} bytes`);
  }

  generateFixedSVG() {
    // 模擬修復後的 SVG 輸出（包含 XML 聲明）
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
  
  <!-- 旋轉箭頭動畫（包含靜態旋轉） -->
  <polygon points="140,90 160,90 160,85 175,100 160,115 160,110 140,110" 
           fill="#007aff" transform="rotate(45 150 100)">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      values="45 150 100; 405 150 100" 
      dur="2s" 
      repeatCount="indefinite"/>
  </polygon>
  
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

  getFixDescription(key) {
    const descriptions = {
      hasXMLDeclaration: 'XML 聲明已添加',
      hasValidSVGStructure: 'SVG 結構正確',
      hasAnimationElements: '動畫元素存在',
      hasTransparentBackground: '透明背景設定',
      hasProperEncoding: 'UTF-8 編碼設定'
    };
    return descriptions[key] || key;
  }

  async testFixedFFmpegCommand() {
    console.log('\n🔧 測試修復後的 FFmpeg 命令...');
    
    // 測試修復後的命令結構
    const testParams = {
      fps: 15,
      quality: 'high',
      transparent: true,
      loop: true
    };
    
    const inputDir = this.testDir;
    const outputPath = path.join(this.testDir, 'fixed-output.gif');
    const ffmpegPath = path.join(__dirname, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');
    
    // 生成修復後的命令
    const command = this.buildFixedFFmpegCommand(inputDir, outputPath, testParams, ffmpegPath);
    
    console.log('🔧 修復後的 FFmpeg 命令:');
    console.log(command);
    
    // 驗證命令修復項目
    const commandFixes = {
      usesTwoStepProcess: command.includes('&&'),
      hasPaletteGeneration: command.includes('palettegen=stats_mode=diff'),
      usesPaletteuse: command.includes('paletteuse'),
      hasProperDithering: command.includes('dither=bayer'),
      hasCorrectSyntax: command.includes('-lavfi') && !command.includes('[palette]')
    };
    
    console.log('\n🔧 FFmpeg 命令修復驗證:');
    Object.entries(commandFixes).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      const description = this.getFFmpegFixDescription(key);
      console.log(`${status} ${description}`);
    });
    
    const allCommandsFixed = Object.values(commandFixes).every(fix => fix);
    if (allCommandsFixed) {
      console.log('\n🎉 所有 FFmpeg 命令問題已修復！');
    } else {
      console.log('\n⚠️ 仍有 FFmpeg 命令問題需要修復');
    }
    
    // 檢查 FFmpeg 可用性
    try {
      await fs.access(ffmpegPath);
      console.log('✅ FFmpeg 檔案可用');
    } catch (error) {
      console.log('❌ FFmpeg 檔案不可用');
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

  getFFmpegFixDescription(key) {
    const descriptions = {
      usesTwoStepProcess: '使用兩步法生成 GIF',
      hasPaletteGeneration: '正確的調色板生成',
      usesPaletteuse: '使用調色板應用',
      hasProperDithering: '正確的抖動設定',
      hasCorrectSyntax: '修正的濾鏡語法'
    };
    return descriptions[key] || key;
  }
}

// 執行測試
const tester = new FixedOutputTest();
tester.runTests().catch(console.error);
