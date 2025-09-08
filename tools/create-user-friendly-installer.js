/**
 * 🎯 璐娜的 GIF 動畫製作器 - 用戶友好安裝包創建器
 * 創建真正適合一般用戶的安裝方案
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 璐娜的 GIF 動畫製作器 - 創建用戶友好安裝包');
console.log('=' .repeat(50));

async function createUserFriendlyInstaller() {
  try {
    const installerDir = 'user-friendly-installer';
    const version = '1.1.0';
    
    console.log('📦 準備用戶友好安裝包...');
    
    // 創建安裝包目錄
    if (fs.existsSync(installerDir)) {
      fs.rmSync(installerDir, { recursive: true, force: true });
    }
    fs.mkdirSync(installerDir, { recursive: true });
    
    // 創建子目錄
    fs.mkdirSync(path.join(installerDir, 'app'), { recursive: true });
    
    console.log('📋 複製應用程式檔案...');
    
    // 複製主要應用程式檔案
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      'README.md',
      'build-simple.js',
      'fix-dependencies.js'
    ];
    
    // 複製檔案
    for (const file of filesToCopy) {
      if (fs.existsSync(file)) {
        const destFile = path.join(installerDir, 'app', path.basename(file));
        fs.copyFileSync(file, destFile);
        console.log(`  ✅ ${path.basename(file)}`);
      }
    }
    
    // 複製目錄
    const dirsToCopy = [
      { src: 'src', dest: 'app/src' },
      { src: 'assets', dest: 'app/assets' },
      { src: '../ffmpeg-master-latest-win64-gpl-shared', dest: 'app/ffmpeg-master-latest-win64-gpl-shared' }
    ];
    
    for (const dir of dirsToCopy) {
      const srcPath = dir.src;
      const destPath = path.join(installerDir, dir.dest);
      
      if (fs.existsSync(srcPath)) {
        copyDirectory(srcPath, destPath);
        console.log(`  ✅ ${dir.dest}/`);
      }
    }
    
    console.log('🎯 創建一鍵安裝程式...');
    
    // 創建超簡單的一鍵安裝腳本
    const oneClickInstaller = `@echo off
title 璐娜的 GIF 動畫製作器 - 安裝程式
color 0A
cls

echo.
echo     ========================================
echo     璐娜的 GIF 動畫製作器 - 自動安裝
echo     ========================================
echo.
echo     正在準備安裝...
echo.

:: 隱藏技術細節，只顯示用戶需要知道的
echo     [1/4] 檢查系統環境...
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
    echo     請按照以下步驟操作：
    echo     1. 按任意鍵開啟 Node.js 下載頁面
    echo     2. 下載並安裝 Node.js
    echo     3. 安裝完成後重新執行本安裝程式
    echo.
    pause
    start https://nodejs.org/
    exit
)

echo     [2/4] 準備安裝目錄...
set INSTALL_DIR=%USERPROFILE%\\璐娜GIF動畫製作器
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%" 2>nul

echo     [3/4] 複製程式檔案...
xcopy /E /I /H /Y "app\\*" "%INSTALL_DIR%\\" >nul 2>&1

echo     [4/4] 安裝程式組件...
cd /d "%INSTALL_DIR%"
npm install --production >nul 2>&1

:: 創建桌面快捷方式
echo     正在創建桌面快捷方式...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\璐娜GIF動畫製作器.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d \"%INSTALL_DIR%\" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.WindowStyle = 7; $Shortcut.Save()" >nul 2>&1

cls
echo.
echo     ========================================
echo     安裝完成！
echo     ========================================
echo.
echo     🎉 璐娜的 GIF 動畫製作器已成功安裝
echo.
echo     📁 安裝位置：%USERPROFILE%\\璐娜GIF動畫製作器
echo     🖥️  桌面快捷方式：璐娜GIF動畫製作器
echo.
echo     🚀 使用方法：
echo        雙擊桌面上的「璐娜GIF動畫製作器」圖示
echo.
echo     📁 您的作品將保存在：
echo        %USERPROFILE%\\Luna-Animations\\
echo.
echo     按任意鍵關閉安裝程式...
pause >nul
`;

    fs.writeFileSync(path.join(installerDir, '🚀 點我安裝.bat'), oneClickInstaller, 'utf8');
    
    console.log('📄 創建用戶說明...');
    
    // 創建超簡單的用戶說明
    const userGuide = `# 🌙 璐娜的 GIF 動畫製作器

## 🚀 安裝方法（超簡單）

### 只需要 1 步驟：
**雙擊「🚀 點我安裝.bat」檔案**

就這樣！程式會自動完成所有安裝步驟。

## 💻 系統需求

- Windows 10 或更新版本
- 網路連線（用於下載 Node.js，如果需要的話）

## 🎨 使用方法

安裝完成後：
1. 雙擊桌面上的「璐娜GIF動畫製作器」
2. 開始創作您的 GIF 動畫！

## 🔧 如果遇到問題

### 安裝失敗
- 確保您有系統管理員權限
- 暫時關閉防毒軟體
- 重新執行安裝程式

### 找不到桌面圖示
- 檢查桌面是否有「璐娜GIF動畫製作器」
- 或到「開始選單」尋找

### 需要 Node.js
- 安裝程式會自動開啟下載頁面
- 下載並安裝後重新執行安裝程式

## 📁 檔案位置

- **程式位置**：C:\\Users\\[您的名字]\\璐娜GIF動畫製作器\\
- **作品位置**：C:\\Users\\[您的名字]\\Luna-Animations\\

---

**🌙 讓動畫創作變得簡單而美好！**
`;

    fs.writeFileSync(path.join(installerDir, '📖 使用說明.txt'), userGuide, 'utf8');
    
    // 創建系統需求檢查器
    const systemChecker = `@echo off
title 系統需求檢查
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
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo     Windows 版本：%VERSION%

:: 檢查 Node.js
echo     檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Node.js 已安裝
    node --version
) else (
    echo     ❌ 需要安裝 Node.js
    echo.
    echo     請先安裝 Node.js：https://nodejs.org/
)

:: 檢查硬碟空間
echo     檢查硬碟空間...
for /f "tokens=3" %%a in ('dir /-c %SystemDrive%\ ^| find "bytes free"') do set FREE_SPACE=%%a
echo     可用空間：%FREE_SPACE% bytes

echo.
echo     檢查完成！
echo.
pause
`;

    fs.writeFileSync(path.join(installerDir, '🔍 系統檢查.bat'), systemChecker, 'utf8');
    
    console.log('📦 創建最終安裝包...');
    
    // 創建壓縮檔案
    const zipName = `璐娜GIF動畫製作器-用戶版-v${version}.zip`;
    
    try {
      const command = `Compress-Archive -Path "${installerDir}\\*" -DestinationPath "${zipName}" -Force`;
      execSync(`powershell -Command "${command}"`, { stdio: 'inherit' });
      
      console.log('✅ 用戶友好安裝包創建完成');
      
      // 檢查檔案大小
      const stats = fs.statSync(zipName);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`📄 檔案大小: ${sizeMB} MB`);
      
    } catch (error) {
      console.error('❌ 創建壓縮檔案失敗:', error.message);
    }
    
    console.log('\n🎉 用戶友好安裝包創建完成！');
    console.log('📁 安裝包檔案:');
    console.log(`  📦 ${zipName}`);
    console.log(`  📁 ${installerDir}/`);
    
    console.log('\n💡 用戶使用說明:');
    console.log('1. 解壓縮 ZIP 檔案');
    console.log('2. 雙擊「🚀 點我安裝.bat」');
    console.log('3. 等待自動安裝完成');
    console.log('4. 雙擊桌面圖示開始使用');
    
    console.log('\n🎯 特色:');
    console.log('- 一鍵安裝，無需技術知識');
    console.log('- 自動檢查系統需求');
    console.log('- 友好的中文介面');
    console.log('- 自動創建桌面快捷方式');
    console.log('- 隱藏所有技術細節');
    
  } catch (error) {
    console.error('❌ 創建用戶友好安裝包失敗:', error);
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

createUserFriendlyInstaller();
