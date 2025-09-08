# 璐娜 GIF 動畫製作器 - PowerShell 編譯腳本
Write-Host "🏗️ 璐娜 GIF 動畫製作器 - 安全編譯腳本" -ForegroundColor Cyan
Write-Host ""

# 設置環境變數
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""

Write-Host "📋 清理舊的編譯文件..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path "builds\dist") { Remove-Item "builds\dist" -Recurse -Force }

Write-Host "📋 清理 electron-builder 快取..." -ForegroundColor Yellow
$cacheDir = "$env:USERPROFILE\AppData\Local\electron-builder\Cache"
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
    Write-Host "📁 輸出目錄: dist\win-unpacked" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 如需建立安裝程式，請執行:" -ForegroundColor Cyan
    Write-Host "   npm run build:nsis" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ 編譯失敗，請檢查錯誤訊息" -ForegroundColor Red
    Write-Host "💡 建議以管理員身份執行 PowerShell" -ForegroundColor Yellow
}

Read-Host "按 Enter 鍵繼續..."
