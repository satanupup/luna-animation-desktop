@echo off
echo 🏗️ 璐娜 GIF 動畫製作器 - 安全編譯腳本
echo.

REM 設置環境變數以避免代碼簽名問題
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo 📋 清理舊的編譯文件...
if exist "dist" rmdir /s /q "dist"
if exist "builds\dist" rmdir /s /q "builds\dist"

echo 📋 清理 electron-builder 快取...
if exist "%USERPROFILE%\AppData\Local\electron-builder\Cache" (
    rmdir /s /q "%USERPROFILE%\AppData\Local\electron-builder\Cache"
    echo ✅ 快取已清理
)

echo.
echo 🔧 開始編譯 (僅打包，不建立安裝程式)...
npm run pack

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 編譯成功！
    echo 📁 輸出目錄: dist\win-unpacked
    echo.
    echo 🚀 如需建立安裝程式，請執行:
    echo    npm run build:nsis
) else (
    echo.
    echo ❌ 編譯失敗，請檢查錯誤訊息
    echo 💡 建議以管理員身份執行此腳本
)

pause
