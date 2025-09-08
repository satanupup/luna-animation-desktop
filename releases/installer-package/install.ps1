# 璐娜的 GIF 動畫製作器 - PowerShell 安裝腳本
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
$installDir = "$env:USERPROFILE\Luna-GIF-Animator"
Write-Host "📁 安裝目錄: $installDir" -ForegroundColor Cyan

if (Test-Path $installDir) {
    Write-Host "🔄 發現現有安裝，正在更新..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $installDir -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path $installDir -Force | Out-Null

# 複製應用程式檔案
Write-Host "📋 複製應用程式檔案..." -ForegroundColor Yellow
Copy-Item -Recurse -Force "app\*" $installDir

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
Write-Host "📁 輸出檔案位置: $env:USERPROFILE\Luna-Animations\" -ForegroundColor Cyan
Write-Host ""
Read-Host "按 Enter 鍵退出"
