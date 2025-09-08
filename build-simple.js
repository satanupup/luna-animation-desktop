/**
 * 🚀 璐娜的 GIF 動畫製作器 - 簡單構建腳本
 * 使用 electron-packager 創建可分發的應用程式
 */

const packager = require('electron-packager');
const fs = require('fs');
const path = require('path');

console.log('🌙 璐娜的 GIF 動畫製作器 - 簡單構建');
console.log('=' .repeat(50));

async function buildApp() {
  try {
    console.log('📦 開始打包應用程式...');
    
    const options = {
      dir: '.',
      name: '璐娜的GIF動畫製作器',
      platform: 'win32',
      arch: 'x64',
      out: 'dist-simple',
      overwrite: true,
      asar: true,
      icon: null, // 暫時不使用圖標
      ignore: [
        /node_modules/,
        /tests/,
        /\.git/,
        /dist/,
        /dist-simple/,
        /temp_/,
        /\.log$/,
        /build-/
      ],
      extraResource: [
        'ffmpeg-master-latest-win64-gpl-shared'
      ]
    };
    
    console.log('⚙️ 打包選項:');
    console.log(`  名稱: ${options.name}`);
    console.log(`  平台: ${options.platform}`);
    console.log(`  架構: ${options.arch}`);
    console.log(`  輸出: ${options.out}`);
    
    const appPaths = await packager(options);
    
    console.log('✅ 打包完成！');
    console.log('📁 輸出路徑:');
    appPaths.forEach(appPath => {
      console.log(`  ${appPath}`);
      
      // 檢查檔案大小
      const stats = getDirectorySize(appPath);
      console.log(`  大小: ${(stats / 1024 / 1024).toFixed(1)} MB`);
    });
    
    // 創建使用說明
    createReadme();
    
    console.log('\n🎉 構建完成！');
    console.log('💡 使用方法:');
    console.log('  1. 進入 dist-simple 目錄');
    console.log('  2. 找到應用程式資料夾');
    console.log('  3. 執行 .exe 檔案');
    console.log('  4. 包含完整的 FFmpeg，無需額外安裝');
    
  } catch (error) {
    console.error('❌ 打包失敗:', error);
    process.exit(1);
  }
}

// 計算目錄大小
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    }
  }
  
  try {
    calculateSize(dirPath);
  } catch (error) {
    console.warn('⚠️ 無法計算目錄大小:', error.message);
  }
  
  return totalSize;
}

// 創建使用說明
function createReadme() {
  const readme = `# 璐娜的 GIF 動畫製作器

## 🚀 使用方法

1. 解壓縮到任意目錄
2. 執行 "璐娜的GIF動畫製作器.exe"
3. 開始創作您的 GIF 動畫！

## ✨ 特色功能

- 40+ 種形狀選擇
- 8 種動畫效果
- 透明背景支援
- 內建 FFmpeg，無需額外安裝
- 高品質 GIF 輸出

## 📁 輸出位置

生成的檔案會保存在：
C:\\Users\\[您的用戶名]\\Luna-Animations\\

## 💻 系統需求

- Windows 10 或更新版本
- 4GB RAM (推薦 8GB)
- 200MB 硬碟空間

## 📞 技術支援

如有問題請聯繫技術支援。

---
璐娜的 GIF 動畫製作器 v1.0.0
`;

  try {
    fs.writeFileSync('dist-simple/README.txt', readme, 'utf8');
    console.log('📄 已創建使用說明檔案');
  } catch (error) {
    console.warn('⚠️ 無法創建使用說明:', error.message);
  }
}

// 執行構建
buildApp();
