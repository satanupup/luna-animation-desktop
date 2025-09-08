/**
 * 🧪 測試實際的 SVG 和 FFmpeg 輸出
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class ActualOutputTest {
  constructor() {
    this.testDir = path.join(__dirname, 'test-output');
  }

  async runTests() {
    console.log('🧪 開始實際輸出測試...');
    
    try {
      // 創建測試目錄
      await this.setupTestDirectory();
      
      // 測試 SVG 生成
      await this.testSVGGeneration();
      
      // 測試 FFmpeg 可用性
      await this.testFFmpegAvailability();
      
      // 測試 PNG 幀生成
      await this.testPNGFrameGeneration();
      
      // 測試 FFmpeg GIF 生成
      await this.testFFmpegGIFGeneration();
      
      console.log('✅ 所有測試完成');
      
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  }

  async setupTestDirectory() {
    console.log('📁 設定測試目錄...');
    await fs.mkdir(this.testDir, { recursive: true });
  }

  async testSVGGeneration() {
    console.log('\n🎨 測試 SVG 生成...');
    
    // 生成實際的 SVG 動畫
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="none"/>
  <circle cx="150" cy="100" r="20" fill="#ff3b30">
    <animateTransform 
      attributeName="transform" 
      type="translate" 
      values="0,0; 0,-60; 0,0" 
      dur="1s" 
      repeatCount="indefinite"/>
  </circle>
</svg>`;

    const svgPath = path.join(this.testDir, 'test-animation.svg');
    await fs.writeFile(svgPath, svgContent);
    
    console.log('✅ SVG 檔案已生成:', svgPath);
    
    // 檢查檔案
    const stats = await fs.stat(svgPath);
    console.log(`📊 SVG 檔案大小: ${stats.size} bytes`);
    
    // 讀取並驗證內容
    const content = await fs.readFile(svgPath, 'utf8');
    if (content.includes('animateTransform') && content.includes('repeatCount')) {
      console.log('✅ SVG 動畫結構正確');
    } else {
      console.log('❌ SVG 動畫結構有問題');
    }
  }

  async testFFmpegAvailability() {
    console.log('\n🎯 測試 FFmpeg 可用性...');
    
    const ffmpegPath = path.join(__dirname, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');
    
    try {
      await fs.access(ffmpegPath);
      console.log('✅ FFmpeg 檔案存在:', ffmpegPath);
      
      // 測試 FFmpeg 版本
      return new Promise((resolve, reject) => {
        const child = spawn(ffmpegPath, ['-version'], { stdio: 'pipe' });
        
        let output = '';
        child.stdout.on('data', (data) => output += data.toString());
        child.stderr.on('data', (data) => output += data.toString());
        
        child.on('close', (code) => {
          if (code === 0 && output.includes('ffmpeg version')) {
            console.log('✅ FFmpeg 可以正常執行');
            console.log('📋 版本資訊:', output.split('\n')[0]);
            resolve();
          } else {
            console.log('❌ FFmpeg 執行失敗');
            reject(new Error('FFmpeg 執行失敗'));
          }
        });
        
        setTimeout(() => {
          child.kill();
          reject(new Error('FFmpeg 版本查詢超時'));
        }, 10000);
      });
      
    } catch (error) {
      console.log('❌ FFmpeg 檔案不存在:', ffmpegPath);
      throw error;
    }
  }

  async testPNGFrameGeneration() {
    console.log('\n📸 測試 PNG 幀生成...');
    
    // 生成測試用的 PNG 幀
    const frameCount = 15;
    
    for (let i = 0; i < frameCount; i++) {
      const filename = `frame_${i.toString().padStart(4, '0')}.png`;
      const filepath = path.join(this.testDir, filename);
      
      // 創建一個簡單的 PNG 檔案（實際應用中會是真實的圖像數據）
      const fakePNGData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 簽名
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 像素
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
        0x60, 0x82
      ]);
      
      await fs.writeFile(filepath, fakePNGData);
    }
    
    console.log(`✅ 已生成 ${frameCount} 個測試 PNG 幀`);
  }

  async testFFmpegGIFGeneration() {
    console.log('\n🎬 測試 FFmpeg GIF 生成...');
    
    const ffmpegPath = path.join(__dirname, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');
    const inputPattern = path.join(this.testDir, 'frame_%04d.png');
    const outputPath = path.join(this.testDir, 'test-output.gif');
    const palettePath = path.join(this.testDir, 'palette.png');
    
    try {
      // 第一步：生成調色板
      console.log('🎨 生成調色板...');
      await this.runFFmpegCommand([
        ffmpegPath,
        '-y',
        '-framerate', '15',
        '-i', inputPattern,
        '-vf', 'palettegen=stats_mode=diff',
        palettePath
      ]);
      
      console.log('✅ 調色板生成完成');
      
      // 第二步：生成 GIF
      console.log('🎯 生成 GIF...');
      await this.runFFmpegCommand([
        ffmpegPath,
        '-y',
        '-framerate', '15',
        '-i', inputPattern,
        '-i', palettePath,
        '-lavfi', 'paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
        outputPath
      ]);
      
      console.log('✅ GIF 生成完成');
      
      // 檢查輸出檔案
      const stats = await fs.stat(outputPath);
      console.log(`📊 GIF 檔案大小: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        console.log('✅ GIF 檔案生成成功');
      } else {
        console.log('❌ GIF 檔案為空');
      }
      
    } catch (error) {
      console.log('❌ FFmpeg GIF 生成失敗:', error.message);
    }
  }

  async runFFmpegCommand(args) {
    return new Promise((resolve, reject) => {
      const child = spawn(args[0], args.slice(1), { stdio: 'pipe' });
      
      let output = '';
      child.stdout.on('data', (data) => output += data.toString());
      child.stderr.on('data', (data) => output += data.toString());
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`FFmpeg 執行失敗 (代碼: ${code})\n${output}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`FFmpeg 執行錯誤: ${error.message}`));
      });
      
      // 設定超時
      setTimeout(() => {
        child.kill();
        reject(new Error('FFmpeg 執行超時'));
      }, 30000);
    });
  }
}

// 執行測試
const tester = new ActualOutputTest();
tester.runTests().catch(console.error);
