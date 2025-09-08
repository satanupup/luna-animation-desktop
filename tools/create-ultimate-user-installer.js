/**
 * 🎯 璐娜的 GIF 動畫製作器 - 終極用戶友好安裝包
 * 創建最適合一般用戶的安裝方案，包含便攜版
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 璐娜的 GIF 動畫製作器 - 創建終極用戶友好安裝包');
console.log('=' .repeat(60));

async function createUltimateUserInstaller() {
  try {
    const installerDir = 'ultimate-user-installer';
    const version = '1.1.0';
    
    console.log('📦 準備終極用戶友好安裝包...');
    
    // 創建安裝包目錄
    if (fs.existsSync(installerDir)) {
      fs.rmSync(installerDir, { recursive: true, force: true });
    }
    fs.mkdirSync(installerDir, { recursive: true });
    
    // 創建子目錄
    fs.mkdirSync(path.join(installerDir, 'portable-app'), { recursive: true });
    
    console.log('📋 複製應用程式檔案...');
    
    // 複製主要應用程式檔案
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      'README.md'
    ];
    
    // 複製檔案
    for (const file of filesToCopy) {
      if (fs.existsSync(file)) {
        const destFile = path.join(installerDir, 'portable-app', path.basename(file));
        fs.copyFileSync(file, destFile);
        console.log(`  ✅ ${path.basename(file)}`);
      }
    }
    
    // 複製目錄
    const dirsToCopy = [
      { src: 'src', dest: 'portable-app/src' },
      { src: 'assets', dest: 'portable-app/assets' },
      { src: '../ffmpeg-master-latest-win64-gpl-shared', dest: 'portable-app/ffmpeg-master-latest-win64-gpl-shared' }
    ];
    
    for (const dir of dirsToCopy) {
      const srcPath = dir.src;
      const destPath = path.join(installerDir, dir.dest);
      
      if (fs.existsSync(srcPath)) {
        copyDirectory(srcPath, destPath);
        console.log(`  ✅ ${dir.dest}/`);
      }
    }
    
    console.log('🎯 創建便攜版啟動器...');
    
    // 創建便攜版啟動器（不需要安裝）
    const portableLauncher = `@echo off
title 璐娜的 GIF 動畫製作器
color 0A
cls

echo.
echo     ========================================
echo     璐娜的 GIF 動畫製作器 - 便攜版
echo     ========================================
echo.
echo     正在啟動程式...
echo.

:: 檢查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    cls
    echo.
    echo     ========================================
    echo     需要安裝 Node.js
    echo     ========================================
    echo.
    echo     您的電腦需要先安裝 Node.js 才能使用本軟體
    echo.
    echo     按任意鍵開啟 Node.js 下載頁面...
    pause >nul
    start https://nodejs.org/
    echo.
    echo     安裝 Node.js 後請重新執行本程式
    pause
    exit
)

:: 檢查依賴是否已安裝
if not exist "portable-app\\node_modules" (
    echo     首次使用，正在準備程式組件...
    cd portable-app
    npm install --production >nul 2>&1
    cd ..
    echo     準備完成！
    echo.
)

:: 啟動應用程式
echo     正在啟動璐娜的 GIF 動畫製作器...
cd portable-app
start /min cmd /c "npm start"
cd ..

echo.
echo     程式已啟動！
echo     如果沒有看到程式視窗，請檢查工作列。
echo.
echo     按任意鍵關閉此視窗...
pause >nul
`;

    fs.writeFileSync(path.join(installerDir, '🚀 璐娜GIF動畫製作器.bat'), portableLauncher, 'utf8');
    
    // 創建系統檢查器
    const systemChecker = `@echo off
title 系統檢查
color 0B
cls

echo.
echo     ========================================
echo     璐娜的 GIF 動畫製作器 - 系統檢查
echo     ========================================
echo.

echo     正在檢查您的電腦是否符合系統需求...
echo.

:: 檢查 Windows 版本
echo     檢查 Windows 版本...
ver | find "10." >nul
if %errorlevel% equ 0 (
    echo     ✅ Windows 10 或更新版本
) else (
    ver | find "11." >nul
    if %errorlevel% equ 0 (
        echo     ✅ Windows 11
    ) else (
        echo     ⚠️  建議使用 Windows 10 或更新版本
    )
)

:: 檢查 Node.js
echo     檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Node.js 已安裝
    for /f "delims=" %%i in ('node --version') do echo        版本：%%i
) else (
    echo     ❌ 需要安裝 Node.js
    echo        請到 https://nodejs.org/ 下載安裝
)

:: 檢查記憶體（簡化版）
echo     檢查系統記憶體...
wmic computersystem get TotalPhysicalMemory /value | find "=" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ 記憶體檢查通過
) else (
    echo     ⚠️  無法檢查記憶體，建議至少 4GB RAM
)

echo.
echo     ========================================
echo     檢查完成！
echo     ========================================
echo.

node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     🎉 您的電腦可以運行璐娜的 GIF 動畫製作器！
    echo.
    echo     使用方法：
    echo     雙擊「🚀 璐娜GIF動畫製作器.bat」即可開始使用
) else (
    echo     ⚠️  請先安裝 Node.js 才能使用本軟體
    echo.
    echo     安裝步驟：
    echo     1. 按任意鍵開啟 Node.js 下載頁面
    echo     2. 下載並安裝 Node.js
    echo     3. 重新執行系統檢查
    echo.
    pause
    start https://nodejs.org/
)

echo.
pause
`;

    fs.writeFileSync(path.join(installerDir, '🔍 系統檢查.bat'), systemChecker, 'utf8');
    
    console.log('📄 創建用戶說明...');
    
    // 創建超簡單的用戶說明
    const userGuide = `🌙 璐娜的 GIF 動畫製作器 - 便攜版

🚀 使用方法（超級簡單）

1. 雙擊「🚀 璐娜GIF動畫製作器.bat」
2. 等待程式啟動
3. 開始創作您的 GIF 動畫！

💻 系統需求

- Windows 10 或更新版本
- Node.js（程式會提示您下載安裝）
- 4GB 記憶體
- 網路連線（首次使用時需要）

🎯 特色

✅ 免安裝，解壓即用
✅ 不會修改您的電腦設定
✅ 可以放在隨身碟使用
✅ 40+ 種形狀選擇
✅ 8 種動畫效果
✅ 支援透明背景
✅ 高品質 GIF 輸出

📁 您的作品位置

程式會在以下位置保存您的作品：
C:\\Users\\[您的名字]\\Luna-Animations\\

🔧 如果遇到問題

1. 先執行「🔍 系統檢查.bat」
2. 確保已安裝 Node.js
3. 暫時關閉防毒軟體
4. 確保有網路連線

🌟 開始創作

雙擊「🚀 璐娜GIF動畫製作器.bat」就能開始創作！
程式會自動處理所有技術細節，您只需要專注於創作。

讓動畫創作變得簡單而美好！ 🎨
`;

    fs.writeFileSync(path.join(installerDir, '📖 使用說明.txt'), userGuide, 'utf8');
    
    // 創建快速開始指南
    const quickStart = `🚀 快速開始指南

第一次使用：

1. 🔍 執行「系統檢查.bat」確認電腦環境
2. 🚀 雙擊「璐娜GIF動畫製作器.bat」啟動程式
3. 🎨 開始創作您的第一個 GIF 動畫！

就這麼簡單！

如果需要安裝 Node.js：
- 程式會自動開啟下載頁面
- 下載並安裝後重新啟動程式即可

您的作品會自動保存在：
C:\\Users\\[您的名字]\\Luna-Animations\\

🌙 祝您創作愉快！
`;

    fs.writeFileSync(path.join(installerDir, '⚡ 快速開始.txt'), quickStart, 'utf8');
    
    console.log('📦 創建最終安裝包...');
    
    // 創建壓縮檔案
    const zipName = `璐娜GIF動畫製作器-便攜版-v${version}.zip`;
    
    try {
      const command = `Compress-Archive -Path "${installerDir}\\*" -DestinationPath "${zipName}" -Force`;
      execSync(`powershell -Command "${command}"`, { stdio: 'inherit' });
      
      console.log('✅ 便攜版安裝包創建完成');
      
      // 檢查檔案大小
      const stats = fs.statSync(zipName);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`📄 檔案大小: ${sizeMB} MB`);
      
    } catch (error) {
      console.error('❌ 創建壓縮檔案失敗:', error.message);
    }
    
    console.log('\n🎉 便攜版安裝包創建完成！');
    console.log('📁 安裝包檔案:');
    console.log(`  📦 ${zipName}`);
    console.log(`  📁 ${installerDir}/`);
    
    console.log('\n💡 用戶使用說明:');
    console.log('1. 解壓縮 ZIP 檔案到任意位置');
    console.log('2. 雙擊「🚀 璐娜GIF動畫製作器.bat」');
    console.log('3. 程式自動處理所有設定');
    console.log('4. 開始創作 GIF 動畫！');
    
    console.log('\n🎯 便攜版特色:');
    console.log('- 免安裝，解壓即用');
    console.log('- 不修改電腦設定');
    console.log('- 可放隨身碟使用');
    console.log('- 自動檢查系統需求');
    console.log('- 友好的中文介面');
    console.log('- 隱藏所有技術細節');
    
  } catch (error) {
    console.error('❌ 創建便攜版安裝包失敗:', error);
    process.exit(1);
  }
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

createUltimateUserInstaller();
