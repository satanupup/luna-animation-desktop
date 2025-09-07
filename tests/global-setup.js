/**
 * 🎭 Playwright 全域設定
 * 在所有測試開始前執行的設定
 */

const fs = require('fs').promises;
const path = require('path');

async function globalSetup(config) {
  console.log('🔧 Playwright 全域設定開始...');
  
  try {
    // 創建必要的目錄
    const dirs = [
      'test-results',
      'test-results/playwright-output',
      'test-results/playwright-report',
      'tests/screenshots',
      'tests/test-outputs',
      'tests/baselines'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
    }
    
    // 檢查 FFmpeg 是否存在
    const ffmpegPath = path.join(__dirname, '..', 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');
    try {
      await fs.access(ffmpegPath);
      console.log('✅ FFmpeg 可用');
    } catch (error) {
      console.log('⚠️ FFmpeg 不可用，某些測試可能會失敗');
    }
    
    // 創建測試基準檔案（如果不存在）
    await createTestBaselines();
    
    console.log('✅ Playwright 全域設定完成');
    
  } catch (error) {
    console.error('❌ Playwright 全域設定失敗:', error);
    throw error;
  }
}

// 創建測試基準檔案
async function createTestBaselines() {
  const baselineDir = path.join(__dirname, 'baselines');
  
  // 創建一個簡單的基準 PNG 檔案
  const simplePNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 簽名
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 像素
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF,
    0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND
  ]);
  
  const baselineFiles = [
    'app-header.png',
    'controls-panel.png',
    'preview-canvas.png',
    'full-app.png'
  ];
  
  for (const filename of baselineFiles) {
    const filepath = path.join(baselineDir, filename);
    try {
      await fs.access(filepath);
    } catch (error) {
      // 檔案不存在，創建基準檔案
      await fs.writeFile(filepath, simplePNG);
      console.log(`📸 創建基準檔案: ${filename}`);
    }
  }
}

module.exports = globalSetup;
