/**
 * 🚀 璐娜的 GIF 動畫製作器 - 安裝包創建器
 * 創建完整的分發安裝包，包含所有必要檔案和自動安裝腳本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 璐娜的 GIF 動畫製作器 - 創建分發安裝包');
console.log('=' .repeat(50));

async function createInstaller() {
  try {
    const installerDir = 'installer-package';
    const version = '1.1.0';

    console.log('📦 準備安裝包目錄...');

    // 創建安裝包目錄
    if (fs.existsSync(installerDir)) {
      fs.rmSync(installerDir, { recursive: true, force: true });
    }
    fs.mkdirSync(installerDir, { recursive: true });

    // 創建子目錄
    fs.mkdirSync(path.join(installerDir, 'app'), { recursive: true });
    fs.mkdirSync(path.join(installerDir, 'scripts'), { recursive: true });

    console.log('📋 複製應用程式檔案...');

    // 複製主要應用程式檔案（排除大檔案和臨時檔案）
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      'README.md',
      'build-simple.js',
      'fix-dependencies.js',
      'create-release.js',
      '.gitignore'
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

    console.log('📝 創建安裝腳本...');

    // 創建 Windows 批次安裝腳本
    const installBat = `@echo off
chcp 65001 >nul
echo Luna GIF Animator - Auto Installer
echo ================================================

echo.
echo Checking system requirements...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js first
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js installed
node --version

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

echo [OK] npm installed
npm --version

echo.
echo Installing Luna GIF Animator...

:: Create installation directory
set INSTALL_DIR=%USERPROFILE%\\Luna-GIF-Animator
echo Install directory: %INSTALL_DIR%

if exist "%INSTALL_DIR%" (
    echo Found existing installation, updating...
    rmdir /s /q "%INSTALL_DIR%" 2>nul
)

mkdir "%INSTALL_DIR%" 2>nul

:: Copy application files
echo Copying application files...
xcopy /E /I /H /Y "app\\*" "%INSTALL_DIR%\\" >nul

:: Enter installation directory and install dependencies
cd /d "%INSTALL_DIR%"

echo Installing dependencies...
npm install --production

if %errorlevel% neq 0 (
    echo [ERROR] Dependencies installation failed
    pause
    exit /b 1
)

echo [OK] Dependencies installed

:: Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Luna GIF Animator.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d \"%INSTALL_DIR%\" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\\assets\\icon.ico'; $Shortcut.Save()"

:: Create start menu shortcut
echo Creating start menu shortcut...
set START_MENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\\Luna GIF Animator.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d \"%INSTALL_DIR%\" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\\assets\\icon.ico'; $Shortcut.Save()"

echo.
echo Installation completed!
echo.
echo Install location: %INSTALL_DIR%
echo Desktop shortcut: Luna GIF Animator
echo Start menu: Luna GIF Animator
echo.
echo How to use:
echo   1. Double-click desktop shortcut to start
echo   2. Or find in start menu and launch
echo   3. Or manually run: cd "%INSTALL_DIR%" && npm start
echo.
echo Output files location: %USERPROFILE%\\Luna-Animations\\
echo.
pause
`;

    fs.writeFileSync(path.join(installerDir, 'install.bat'), installBat, 'utf8');

    // 創建簡化的中文安裝腳本
    const installSimpleBat = `@echo off
echo.
echo Luna GIF Animator Installer
echo.
echo Please wait while installing...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Install
set INSTALL_DIR=%USERPROFILE%\\Luna-GIF-Animator
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%" 2>nul
xcopy /E /I /H /Y "app\\*" "%INSTALL_DIR%\\" >nul
cd /d "%INSTALL_DIR%"
npm install --production >nul 2>&1

:: Create shortcuts
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Luna GIF Animator.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d \"%INSTALL_DIR%\" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()" >nul 2>&1

echo.
echo Installation completed!
echo Desktop shortcut created: Luna GIF Animator
echo.
pause
`;

    fs.writeFileSync(path.join(installerDir, 'install-simple.bat'), installSimpleBat, 'utf8');

    // 創建 PowerShell 安裝腳本
    const installPs1 = `# 璐娜的 GIF 動畫製作器 - PowerShell 安裝腳本
Write-Host "🌙 璐娜的 GIF 動畫製作器 - 自動安裝程式" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 檢查系統需求..." -ForegroundColor Yellow

# 檢查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安裝: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 Node.js，請先安裝 Node.js" -ForegroundColor Red
    Write-Host "💡 下載地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按 Enter 鍵退出"
    exit 1
}

# 檢查 npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 已安裝: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 npm" -ForegroundColor Red
    Read-Host "按 Enter 鍵退出"
    exit 1
}

Write-Host ""
Write-Host "📦 開始安裝璐娜的 GIF 動畫製作器..." -ForegroundColor Yellow

# 設定安裝目錄
$installDir = "$env:USERPROFILE\\Luna-GIF-Animator"
Write-Host "📁 安裝目錄: $installDir" -ForegroundColor Cyan

if (Test-Path $installDir) {
    Write-Host "🔄 發現現有安裝，正在更新..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $installDir -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path $installDir -Force | Out-Null

# 複製應用程式檔案
Write-Host "📋 複製應用程式檔案..." -ForegroundColor Yellow
Copy-Item -Recurse -Force "app\\*" $installDir

# 安裝依賴
Set-Location $installDir
Write-Host "📦 安裝依賴套件..." -ForegroundColor Yellow

try {
    npm install --production
    Write-Host "✅ 依賴安裝完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 依賴安裝失敗" -ForegroundColor Red
    Read-Host "按 Enter 鍵退出"
    exit 1
}

Write-Host ""
Write-Host "🎉 安裝完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📁 安裝位置: $installDir" -ForegroundColor Cyan
Write-Host "🚀 啟動命令: cd '$installDir' && npm start" -ForegroundColor Cyan
Write-Host "📁 輸出檔案位置: $env:USERPROFILE\\Luna-Animations\\" -ForegroundColor Cyan
Write-Host ""
Read-Host "按 Enter 鍵退出"
`;

    fs.writeFileSync(path.join(installerDir, 'install.ps1'), installPs1, 'utf8');

    console.log('📄 創建說明文件...');

    // 創建安裝說明
    const readme = `# 璐娜的 GIF 動畫製作器 - 安裝包

## 🚀 快速安裝

### 方法 1：使用批次檔案（推薦）
1. 雙擊 \`install.bat\`
2. 按照提示完成安裝
3. 安裝完成後可在桌面找到快捷方式

### 方法 2：使用 PowerShell
1. 右鍵點擊 \`install.ps1\`
2. 選擇「使用 PowerShell 執行」
3. 按照提示完成安裝

## 📋 系統需求

- Windows 10 或更新版本
- Node.js 16.0 或更新版本
- 4GB RAM（推薦 8GB）
- 500MB 硬碟空間

## 📁 安裝位置

- **程式檔案**：\`%USERPROFILE%\\Luna-GIF-Animator\`
- **輸出檔案**：\`%USERPROFILE%\\Luna-Animations\`

## 🚀 使用方法

安裝完成後：
1. 雙擊桌面的「璐娜的GIF動畫製作器」快捷方式
2. 或從開始選單啟動
3. 或手動執行：
   \`\`\`
   cd "%USERPROFILE%\\Luna-GIF-Animator"
   npm start
   \`\`\`

## 🎨 功能特色

- 🎨 40+ 種形狀選擇
- 🎬 8 種動畫效果
- 🌈 獨立填充和線條顏色控制
- 📏 線條粗細調整
- 🌟 透明背景支援
- 🔧 內建 FFmpeg（無需額外安裝）
- 📱 高品質 GIF 輸出

## 🔧 故障排除

### Node.js 未安裝
下載並安裝 Node.js：https://nodejs.org/

### 權限問題
以系統管理員身分執行安裝腳本

### 安裝失敗
1. 檢查網路連線
2. 確保有足夠的硬碟空間
3. 關閉防毒軟體後重試

## 📞 技術支援

如有問題請聯繫技術支援。

---
璐娜的 GIF 動畫製作器 v${version}
讓動畫創作變得簡單而美好 🌙
`;

    fs.writeFileSync(path.join(installerDir, 'README.md'), readme, 'utf8');

    console.log('🎯 創建版本資訊...');

    // 創建版本資訊檔案
    const versionInfo = {
      name: "璐娜的 GIF 動畫製作器",
      version: version,
      buildDate: new Date().toISOString(),
      description: "Windows 離線桌面 GIF 動畫製作應用程式",
      author: "Luna Animation Team",
      features: [
        "40+ 種形狀選擇",
        "8 種動畫效果",
        "獨立顏色控制",
        "透明背景支援",
        "內建 FFmpeg",
        "高品質輸出"
      ],
      systemRequirements: {
        os: "Windows 10+",
        nodejs: "16.0+",
        ram: "4GB (推薦 8GB)",
        storage: "500MB"
      }
    };

    fs.writeFileSync(
      path.join(installerDir, 'version.json'),
      JSON.stringify(versionInfo, null, 2),
      'utf8'
    );

    console.log('📦 創建最終安裝包...');

    // 創建壓縮檔案
    const zipName = `璐娜GIF動畫製作器-安裝包-v${version}.zip`;

    try {
      const command = `Compress-Archive -Path "${installerDir}\\*" -DestinationPath "${zipName}" -Force`;
      execSync(`powershell -Command "${command}"`, { stdio: 'inherit' });

      console.log('✅ 安裝包創建完成');

      // 檢查檔案大小
      const stats = fs.statSync(zipName);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`📄 檔案大小: ${sizeMB} MB`);

    } catch (error) {
      console.error('❌ 創建壓縮檔案失敗:', error.message);
    }

    console.log('\n🎉 分發安裝包創建完成！');
    console.log('📁 安裝包檔案:');
    console.log(`  📦 ${zipName}`);
    console.log(`  📁 ${installerDir}/`);

    console.log('\n💡 分發說明:');
    console.log('1. 將 ZIP 檔案提供給客戶');
    console.log('2. 客戶解壓縮後執行 install.bat');
    console.log('3. 自動安裝並創建桌面快捷方式');
    console.log('4. 無需手動安裝 FFmpeg 或其他依賴');

  } catch (error) {
    console.error('❌ 創建安裝包失敗:', error);
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

createInstaller();
