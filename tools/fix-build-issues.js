/**
 * 🔧 編譯問題修復腳本
 * 
 * 這個腳本用於自動修復常見的 Electron 編譯問題
 * 特別針對 Windows 符號連結權限和 electron-builder 問題
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class BuildFixer {
    constructor() {
        this.fixes = [];
        this.log('🔧 編譯問題修復工具啟動', 'info');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'fix': '🔧'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runFixes() {
        this.log('開始執行修復程序...', 'info');
        
        try {
            await this.fixElectronBuilderCache();
            await this.fixPackageJsonConfig();
            await this.fixPermissions();
            await this.installMissingDependencies();
            await this.createAlternativeBuildScript();
            await this.testBuild();
            
            this.log('所有修復程序執行完成', 'success');
            this.displaySummary();
        } catch (error) {
            this.log(`修復過程發生錯誤: ${error.message}`, 'error');
        }
    }

    async fixElectronBuilderCache() {
        this.log('修復 electron-builder 快取問題...', 'fix');
        
        const cachePaths = [
            path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache'),
            path.join(os.homedir(), '.cache', 'electron-builder'),
            'dist',
            'builds/dist'
        ];

        for (const cachePath of cachePaths) {
            try {
                if (fs.existsSync(cachePath)) {
                    this.log(`清理快取目錄: ${cachePath}`, 'info');
                    fs.rmSync(cachePath, { recursive: true, force: true });
                    this.fixes.push(`清理快取: ${cachePath}`);
                }
            } catch (error) {
                this.log(`清理快取失敗: ${cachePath} - ${error.message}`, 'warning');
            }
        }

        // 重新創建乾淨的輸出目錄
        const outputDirs = ['dist', 'builds'];
        for (const dir of outputDirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log(`創建輸出目錄: ${dir}`, 'success');
            }
        }
    }

    async fixPackageJsonConfig() {
        this.log('修復 package.json 編譯配置...', 'fix');
        
        const packageJsonPath = 'package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 修復編譯配置以避免符號連結問題
        if (packageJson.build) {
            // 禁用代碼簽名
            packageJson.build.forceCodeSigning = false;
            packageJson.build.afterSign = null;
            
            // 修復 Windows 配置
            if (packageJson.build.win) {
                packageJson.build.win.sign = false;
                packageJson.build.win.verifyUpdateCodeSignature = false;
                packageJson.build.win.certificateFile = null;
                packageJson.build.win.certificatePassword = null;
            }

            // 添加環境變數配置
            if (!packageJson.build.env) {
                packageJson.build.env = {};
            }
            packageJson.build.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';

            // 修復文件包含配置
            if (packageJson.build.files) {
                // 確保排除問題文件
                const excludePatterns = [
                    '!**/node_modules/**/*',
                    '!tests/**/*',
                    '!tools/**/*',
                    '!builds/**/*',
                    '!releases/**/*',
                    '!archive/**/*',
                    '!*.log',
                    '!temp_*',
                    '!test-*',
                    '!debug-*'
                ];
                
                packageJson.build.files = [
                    ...packageJson.build.files.filter(f => !f.startsWith('!')),
                    ...excludePatterns
                ];
            }

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            this.fixes.push('修復 package.json 編譯配置');
            this.log('package.json 配置已修復', 'success');
        }
    }

    async fixPermissions() {
        this.log('檢查和修復文件權限...', 'fix');
        
        if (os.platform() === 'win32') {
            try {
                // 檢查是否有管理員權限
                execSync('net session', { stdio: 'ignore' });
                this.log('檢測到管理員權限', 'success');
            } catch (error) {
                this.log('未檢測到管理員權限，建議以管理員身份重新執行', 'warning');
                this.fixes.push('建議: 以管理員身份執行以避免符號連結問題');
            }
        }

        // 檢查關鍵目錄權限
        const criticalPaths = ['src', 'assets', 'ffmpeg-master-latest-win64-gpl-shared'];
        for (const dirPath of criticalPaths) {
            try {
                if (fs.existsSync(dirPath)) {
                    fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
                    this.log(`✓ ${dirPath} 權限正常`, 'success');
                } else {
                    this.log(`✗ ${dirPath} 目錄不存在`, 'error');
                }
            } catch (error) {
                this.log(`✗ ${dirPath} 權限問題: ${error.message}`, 'error');
            }
        }
    }

    async installMissingDependencies() {
        this.log('檢查和安裝缺失的依賴...', 'fix');
        
        const requiredDeps = {
            'electron': 'devDependencies',
            'electron-builder': 'devDependencies'
        };

        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        for (const [dep, type] of Object.entries(requiredDeps)) {
            const isInstalled = packageJson[type] && packageJson[type][dep];
            const existsInNodeModules = fs.existsSync(path.join('node_modules', dep));
            
            if (!isInstalled || !existsInNodeModules) {
                this.log(`安裝缺失的依賴: ${dep}`, 'fix');
                try {
                    execSync(`npm install ${dep} --save-dev`, { stdio: 'inherit' });
                    this.fixes.push(`安裝依賴: ${dep}`);
                } catch (error) {
                    this.log(`安裝 ${dep} 失敗: ${error.message}`, 'error');
                }
            }
        }
    }

    async createAlternativeBuildScript() {
        this.log('創建替代編譯腳本...', 'fix');
        
        const buildScript = `@echo off
echo 🏗️ 璐娜 GIF 動畫製作器 - 安全編譯腳本
echo.

REM 設置環境變數以避免代碼簽名問題
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo 📋 清理舊的編譯文件...
if exist "dist" rmdir /s /q "dist"
if exist "builds\\dist" rmdir /s /q "builds\\dist"

echo 📋 清理 electron-builder 快取...
if exist "%USERPROFILE%\\AppData\\Local\\electron-builder\\Cache" (
    rmdir /s /q "%USERPROFILE%\\AppData\\Local\\electron-builder\\Cache"
    echo ✅ 快取已清理
)

echo.
echo 🔧 開始編譯 (僅打包，不建立安裝程式)...
npm run pack

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 編譯成功！
    echo 📁 輸出目錄: dist\\win-unpacked
    echo.
    echo 🚀 如需建立安裝程式，請執行:
    echo    npm run build:nsis
) else (
    echo.
    echo ❌ 編譯失敗，請檢查錯誤訊息
    echo 💡 建議以管理員身份執行此腳本
)

pause
`;

        fs.writeFileSync('safe-build.bat', buildScript);
        this.fixes.push('創建安全編譯腳本: safe-build.bat');
        this.log('安全編譯腳本已創建: safe-build.bat', 'success');

        // 創建 PowerShell 版本
        const psScript = `# 璐娜 GIF 動畫製作器 - PowerShell 編譯腳本
Write-Host "🏗️ 璐娜 GIF 動畫製作器 - 安全編譯腳本" -ForegroundColor Cyan
Write-Host ""

# 設置環境變數
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""

Write-Host "📋 清理舊的編譯文件..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path "builds\\dist") { Remove-Item "builds\\dist" -Recurse -Force }

Write-Host "📋 清理 electron-builder 快取..." -ForegroundColor Yellow
$cacheDir = "$env:USERPROFILE\\AppData\\Local\\electron-builder\\Cache"
if (Test-Path $cacheDir) {
    Remove-Item $cacheDir -Recurse -Force
    Write-Host "✅ 快取已清理" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 開始編譯 (僅打包，不建立安裝程式)..." -ForegroundColor Cyan
npm run pack

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 編譯成功！" -ForegroundColor Green
    Write-Host "📁 輸出目錄: dist\\win-unpacked" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 如需建立安裝程式，請執行:" -ForegroundColor Cyan
    Write-Host "   npm run build:nsis" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ 編譯失敗，請檢查錯誤訊息" -ForegroundColor Red
    Write-Host "💡 建議以管理員身份執行 PowerShell" -ForegroundColor Yellow
}

Read-Host "按 Enter 鍵繼續..."
`;

        fs.writeFileSync('safe-build.ps1', psScript);
        this.fixes.push('創建 PowerShell 編譯腳本: safe-build.ps1');
        this.log('PowerShell 編譯腳本已創建: safe-build.ps1', 'success');
    }

    async testBuild() {
        this.log('測試修復後的編譯...', 'fix');
        
        try {
            // 設置環境變數
            process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
            process.env.WIN_CSC_LINK = '';
            process.env.WIN_CSC_KEY_PASSWORD = '';
            
            this.log('執行測試編譯 (僅打包)...', 'info');
            execSync('npm run pack', { stdio: 'inherit' });
            
            this.log('✅ 測試編譯成功！', 'success');
            this.fixes.push('測試編譯成功');
            
            // 檢查輸出
            const outputDir = 'dist/win-unpacked';
            if (fs.existsSync(outputDir)) {
                this.log(`✅ 編譯輸出已生成: ${outputDir}`, 'success');
                
                // 檢查主要文件
                const mainExe = path.join(outputDir, '璐娜的 GIF 動畫製作器.exe');
                if (fs.existsSync(mainExe)) {
                    this.log('✅ 主執行文件已生成', 'success');
                }
            }
            
        } catch (error) {
            this.log(`測試編譯失敗: ${error.message}`, 'error');
            this.log('請使用 safe-build.bat 或 safe-build.ps1 手動編譯', 'warning');
        }
    }

    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🔧 編譯問題修復摘要');
        console.log('='.repeat(60));
        
        if (this.fixes.length > 0) {
            console.log('\n✅ 已執行的修復:');
            this.fixes.forEach((fix, index) => {
                console.log(`  ${index + 1}. ${fix}`);
            });
        }

        console.log('\n📋 後續建議:');
        console.log('  1. 使用 safe-build.bat 或 safe-build.ps1 進行安全編譯');
        console.log('  2. 如果仍有問題，請以管理員身份執行');
        console.log('  3. 執行 npm run test:build 進行完整測試');
        console.log('  4. 檢查 tests/build-test-report.json 獲取詳細信息');
        
        console.log('\n' + '='.repeat(60));
    }
}

// 執行修復
if (require.main === module) {
    const fixer = new BuildFixer();
    fixer.runFixes().catch(console.error);
}

module.exports = BuildFixer;
