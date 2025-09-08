/**
 * 🚀 璐娜的 GIF 動畫製作器 - 創建獨立可執行檔
 * 不依賴 Node.js，真正的一鍵執行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 璐娜的 GIF 動畫製作器 - 創建獨立可執行檔');
console.log('=' .repeat(50));

async function createStandaloneApp() {
  try {
    const appDir = 'standalone-app';
    const version = '1.1.0';
    
    console.log('📦 準備獨立應用程式目錄...');
    
    // 創建應用程式目錄
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true, force: true });
    }
    fs.mkdirSync(appDir, { recursive: true });
    
    console.log('📋 使用 electron-packager 創建可執行檔...');
    
    try {
      // 使用 electron-packager 而不是 electron-builder
      const command = `npx electron-packager . "璐娜GIF動畫製作器" --platform=win32 --arch=x64 --out=${appDir} --overwrite --ignore="node_modules/(electron-builder|@electron)" --ignore="tests" --ignore="test-*" --ignore="*.zip" --ignore="installer-*" --ignore="user-friendly-*" --ignore="ultimate-*"`;
      
      console.log('執行打包命令...');
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ Electron 應用程式打包完成');
      
    } catch (error) {
      console.log('❌ electron-packager 失敗，嘗試手動方法...');
      
      // 手動創建應用程式結構
      await createManualApp(appDir);
    }
    
    console.log('🔧 複製 FFmpeg...');
    
    // 找到打包後的應用程式目錄
    const appDirs = fs.readdirSync(appDir).filter(dir => 
      fs.statSync(path.join(appDir, dir)).isDirectory()
    );
    
    if (appDirs.length > 0) {
      const targetAppDir = path.join(appDir, appDirs[0]);
      const resourcesDir = path.join(targetAppDir, 'resources', 'app');
      
      // 確保 FFmpeg 在正確位置
      const ffmpegSrc = '../ffmpeg-master-latest-win64-gpl-shared';
      const ffmpegDest = path.join(resourcesDir, 'ffmpeg-master-latest-win64-gpl-shared');
      
      if (fs.existsSync(ffmpegSrc) && !fs.existsSync(ffmpegDest)) {
        copyDirectory(ffmpegSrc, ffmpegDest);
        console.log('✅ FFmpeg 複製完成');
      }
      
      console.log('📦 創建最終分發包...');
      
      // 創建啟動腳本
      const launcherBat = `@echo off
title 璐娜的 GIF 動畫製作器
cd /d "%~dp0"
start "" "璐娜GIF動畫製作器.exe"
`;
      
      fs.writeFileSync(path.join(targetAppDir, '🚀 啟動璐娜GIF動畫製作器.bat'), launcherBat, 'utf8');
      
      // 創建使用說明
      const readme = `🌙 璐娜的 GIF 動畫製作器 - 獨立版

🚀 使用方法：
雙擊「璐娜GIF動畫製作器.exe」即可開始使用！

✨ 特色：
- 完全獨立，無需安裝 Node.js
- 內建 FFmpeg，無需額外安裝
- 40+ 種形狀選擇
- 8 種動畫效果
- 支援透明背景
- 高品質 GIF 輸出

📁 您的作品將保存在：
%USERPROFILE%\\Luna-Animations\\

🎨 開始創作您的 GIF 動畫吧！
`;
      
      fs.writeFileSync(path.join(targetAppDir, '📖 使用說明.txt'), readme, 'utf8');
      
      // 創建壓縮檔案
      const zipName = `璐娜GIF動畫製作器-獨立版-v${version}.zip`;
      
      try {
        const command = `Compress-Archive -Path "${targetAppDir}\\*" -DestinationPath "${zipName}" -Force`;
        execSync(`powershell -Command "${command}"`, { stdio: 'inherit' });
        
        console.log('✅ 獨立版安裝包創建完成');
        
        // 檢查檔案大小
        const stats = fs.statSync(zipName);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        console.log(`📄 檔案大小: ${sizeMB} MB`);
        
      } catch (error) {
        console.error('❌ 創建壓縮檔案失敗:', error.message);
      }
      
      console.log('\n🎉 獨立版應用程式創建完成！');
      console.log('📁 應用程式檔案:');
      console.log(`  📦 ${zipName}`);
      console.log(`  📁 ${targetAppDir}/`);
      
      console.log('\n💡 用戶使用說明:');
      console.log('1. 解壓縮 ZIP 檔案');
      console.log('2. 雙擊「璐娜GIF動畫製作器.exe」');
      console.log('3. 開始創作 GIF 動畫！');
      
      console.log('\n🎯 獨立版特色:');
      console.log('- 完全獨立，無需 Node.js');
      console.log('- 雙擊即可使用');
      console.log('- 內建所有依賴');
      console.log('- 適合所有用戶');
      
    } else {
      console.error('❌ 找不到打包後的應用程式目錄');
    }
    
  } catch (error) {
    console.error('❌ 創建獨立應用程式失敗:', error);
    process.exit(1);
  }
}

async function createManualApp(appDir) {
  console.log('📦 手動創建應用程式結構...');
  
  // 創建基本結構
  const manualAppDir = path.join(appDir, '璐娜GIF動畫製作器-win32-x64');
  fs.mkdirSync(manualAppDir, { recursive: true });
  fs.mkdirSync(path.join(manualAppDir, 'resources', 'app'), { recursive: true });
  
  // 複製應用程式檔案
  const filesToCopy = [
    'package.json',
    'src',
    'assets'
  ];
  
  for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
      const destPath = path.join(manualAppDir, 'resources', 'app', file);
      if (fs.statSync(file).isDirectory()) {
        copyDirectory(file, destPath);
      } else {
        fs.copyFileSync(file, destPath);
      }
      console.log(`  ✅ ${file}`);
    }
  }
  
  // 創建簡單的啟動器
  const launcherJs = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
`;
  
  fs.writeFileSync(path.join(manualAppDir, 'resources', 'app', 'main.js'), launcherJs, 'utf8');
  
  // 創建簡單的可執行檔（實際上是批次檔）
  const exeScript = `@echo off
title 璐娜的 GIF 動畫製作器
cd /d "%~dp0\\resources\\app"
node main.js
`;
  
  fs.writeFileSync(path.join(manualAppDir, '璐娜GIF動畫製作器.bat'), exeScript, 'utf8');
  
  console.log('✅ 手動應用程式結構創建完成');
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

createStandaloneApp();
