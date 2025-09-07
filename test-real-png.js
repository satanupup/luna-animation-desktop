/**
 * 🧪 測試真實 PNG 生成和 FFmpeg 轉換
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas } = require('canvas');

class RealPNGTest {
  constructor() {
    this.testDir = path.join(__dirname, 'test-real-output');
  }

  async runTests() {
    console.log('🧪 開始真實 PNG 和 FFmpeg 測試...');
    
    try {
      // 創建測試目錄
      await this.setupTestDirectory();
      
      // 生成真實的 PNG 幀
      await this.generateRealPNGFrames();
      
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

  async generateRealPNGFrames() {
    console.log('\n📸 生成真實 PNG 幀...');
    
    const frameCount = 15;
    const width = 300;
    const height = 200;
    
    for (let i = 0; i < frameCount; i++) {
      // 創建 Canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      // 清除背景（透明）
      ctx.clearRect(0, 0, width, height);
      
      // 計算動畫進度
      const progress = i / frameCount;
      const bounceY = progress < 0.5 ? progress * 2 : (1 - (progress - 0.5) * 2);
      const eased = 0.5 * (1 - Math.cos(Math.PI * bounceY));
      const y = 100 - 60 + eased * 120;
      
      // 繪製圓形
      ctx.fillStyle = '#ff3b30';
      ctx.beginPath();
      ctx.arc(150, y, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // 保存 PNG
      const filename = `frame_${i.toString().padStart(4, '0')}.png`;
      const filepath = path.join(this.testDir, filename);
      
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(filepath, buffer);
    }
    
    console.log(`✅ 已生成 ${frameCount} 個真實 PNG 幀`);
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
      
      // 檢查調色板檔案
      const paletteStats = await fs.stat(palettePath);
      console.log(`📊 調色板檔案大小: ${paletteStats.size} bytes`);
      
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
        console.log(`📁 GIF 檔案位置: ${outputPath}`);
      } else {
        console.log('❌ GIF 檔案為空');
      }
      
    } catch (error) {
      console.log('❌ FFmpeg GIF 生成失敗:', error.message);
    }
  }

  async runFFmpegCommand(args) {
    return new Promise((resolve, reject) => {
      console.log('🔧 執行命令:', args.join(' '));
      
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
const tester = new RealPNGTest();
tester.runTests().catch(console.error);
