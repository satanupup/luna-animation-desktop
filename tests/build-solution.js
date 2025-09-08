/**
 * 🎯 編譯問題最終解決方案
 * 
 * 這個腳本提供了針對 Windows 符號連結權限問題的完整解決方案
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class BuildSolution {
    constructor() {
        this.log('🎯 編譯問題最終解決方案', 'info');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'fix': '🔧',
            'solution': '🎯'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async provideSolution() {
        this.log('分析編譯問題並提供解決方案...', 'solution');
        
        console.log('\n' + '='.repeat(80));
        console.log('🎯 璐娜 GIF 動畫製作器 - 編譯問題解決方案');
        console.log('='.repeat(80));
        
        console.log('\n📋 問題診斷:');
        console.log('  ❌ Windows 符號連結權限問題');
        console.log('  ❌ electron-builder winCodeSign 解壓縮失敗');
        console.log('  ❌ 7-Zip 無法創建符號連結');
        
        console.log('\n🔍 根本原因:');
        console.log('  1. Windows 系統預設不允許一般用戶創建符號連結');
        console.log('  2. electron-builder 的 winCodeSign 包含 macOS 符號連結');
        console.log('  3. 7-Zip 嘗試解壓縮時遇到權限限制');
        
        console.log('\n🎯 解決方案 (按優先順序):');
        
        console.log('\n  方案 1: 使用替代建置工具 (推薦)');
        console.log('    npm install electron-packager --save-dev');
        console.log('    npm run build:packager');
        
        console.log('\n  方案 2: 以管理員身份執行');
        console.log('    1. 以管理員身份開啟 PowerShell 或 CMD');
        console.log('    2. 導航到專案目錄');
        console.log('    3. 執行: npm run pack');
        
        console.log('\n  方案 3: 啟用開發者模式 (Windows 10/11)');
        console.log('    1. 開啟 設定 > 更新與安全性 > 開發人員選項');
        console.log('    2. 啟用 "開發人員模式"');
        console.log('    3. 重新啟動電腦');
        console.log('    4. 執行: npm run pack');
        
        console.log('\n  方案 4: 修改 electron-builder 配置');
        console.log('    在 package.json 中添加:');
        console.log('    "build": {');
        console.log('      "electronDownload": {');
        console.log('        "cache": "./electron-cache"');
        console.log('      }');
        console.log('    }');
        
        await this.implementSolution1();
        await this.createAlternativeScripts();
        
        console.log('\n' + '='.repeat(80));
        console.log('📋 後續步驟:');
        console.log('  1. 嘗試執行: npm run build:packager');
        console.log('  2. 如果失敗，以管理員身份執行: npm run pack');
        console.log('  3. 檢查輸出目錄: dist/win-unpacked/');
        console.log('  4. 測試應用程式: dist/win-unpacked/璐娜的 GIF 動畫製作器.exe');
        console.log('='.repeat(80));
    }

    async implementSolution1() {
        this.log('實施方案 1: 安裝 electron-packager...', 'solution');
        
        try {
            // 檢查是否已安裝 electron-packager
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (!packageJson.devDependencies || !packageJson.devDependencies['electron-packager']) {
                this.log('安裝 electron-packager...', 'fix');
                execSync('npm install electron-packager --save-dev', { stdio: 'inherit' });
                this.log('electron-packager 安裝完成', 'success');
            } else {
                this.log('electron-packager 已安裝', 'success');
            }
            
            // 添加 packager 腳本到 package.json
            if (!packageJson.scripts['build:packager']) {
                packageJson.scripts['build:packager'] = 'electron-packager . "璐娜的 GIF 動畫製作器" --platform=win32 --arch=x64 --out=dist --overwrite --asar';
                fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
                this.log('添加 build:packager 腳本到 package.json', 'success');
            }
            
        } catch (error) {
            this.log(`安裝 electron-packager 失敗: ${error.message}`, 'error');
        }
    }

    async createAlternativeScripts() {
        this.log('創建替代編譯腳本...', 'solution');
        
        // 創建 electron-packager 腳本
        const packagerScript = `@echo off
chcp 65001 >nul
echo 🎯 使用 electron-packager 編譯璐娜 GIF 動畫製作器
echo.

echo 清理舊的編譯文件...
if exist "dist" rmdir /s /q "dist"

echo.
echo 開始編譯 (使用 electron-packager)...
npm run build:packager

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 編譯成功！
    echo 📁 輸出目錄: dist\\璐娜的 GIF 動畫製作器-win32-x64
    echo 🚀 執行檔案: dist\\璐娜的 GIF 動畫製作器-win32-x64\\璐娜的 GIF 動畫製作器.exe
) else (
    echo.
    echo ❌ 編譯失敗，請檢查錯誤訊息
)

pause`;

        fs.writeFileSync('build-packager.bat', packagerScript);
        this.log('創建 build-packager.bat', 'success');

        // 創建管理員編譯腳本
        const adminScript = `@echo off
echo 🔐 管理員權限編譯腳本
echo.

net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 檢測到管理員權限
) else (
    echo ❌ 需要管理員權限
    echo 請以管理員身份執行此腳本
    pause
    exit /b 1
)

echo.
echo 清理 electron-builder 快取...
if exist "%USERPROFILE%\\AppData\\Local\\electron-builder\\Cache" (
    rmdir /s /q "%USERPROFILE%\\AppData\\Local\\electron-builder\\Cache"
    echo ✅ 快取已清理
)

echo.
echo 設定環境變數...
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo.
echo 開始編譯...
npm run pack

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 編譯成功！
    echo 📁 輸出目錄: dist\\win-unpacked
) else (
    echo.
    echo ❌ 編譯失敗
)

pause`;

        fs.writeFileSync('build-admin.bat', adminScript);
        this.log('創建 build-admin.bat', 'success');

        // 創建開發者模式檢查腳本
        const devModeScript = `@echo off
echo 🔍 檢查 Windows 開發者模式狀態
echo.

reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense >nul 2>&1
if %errorLevel% == 0 (
    for /f "tokens=3" %%a in ('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense ^| find "AllowDevelopmentWithoutDevLicense"') do set devmode=%%a
    if "!devmode!"=="0x1" (
        echo ✅ 開發者模式已啟用
        echo 可以嘗試直接編譯: npm run pack
    ) else (
        echo ❌ 開發者模式未啟用
        echo 建議啟用開發者模式或以管理員身份執行
    )
) else (
    echo ❓ 無法檢查開發者模式狀態
)

echo.
echo 💡 啟用開發者模式的步驟:
echo 1. 開啟 設定 ^> 更新與安全性 ^> 開發人員選項
echo 2. 選擇 "開發人員模式"
echo 3. 重新啟動電腦

pause`;

        fs.writeFileSync('check-devmode.bat', devModeScript);
        this.log('創建 check-devmode.bat', 'success');
    }
}

// 執行解決方案
if (require.main === module) {
    const solution = new BuildSolution();
    solution.provideSolution().catch(console.error);
}

module.exports = BuildSolution;
