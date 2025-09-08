@echo off
chcp 65001 >nul
echo ========================================
echo 璐娜 GIF 動畫製作器 - 完整編譯腳本
echo ========================================
echo.

echo 🧹 清理舊的編譯文件...
if exist "dist" rmdir /s /q "dist"
echo ✅ 清理完成

echo.
echo 🏗️ 開始編譯應用程式...
npm run build:packager
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 編譯失敗
    pause
    exit /b 1
)
echo ✅ 應用程式編譯完成

echo.
echo 📁 複製 FFmpeg 到編譯目錄...
npm run copy:ffmpeg
if %ERRORLEVEL% NEQ 0 (
    echo ❌ FFmpeg 複製失敗
    pause
    exit /b 1
)
echo ✅ FFmpeg 複製完成

echo.
echo 🧪 測試 GIF 輸出功能...
npm run test:gif:output
if %ERRORLEVEL% NEQ 0 (
    echo ❌ GIF 輸出測試失敗
    pause
    exit /b 1
)
echo ✅ GIF 輸出功能測試通過

echo.
echo ========================================
echo 🎉 編譯完成！
echo ========================================
echo.
echo 📁 輸出目錄: dist\璐娜的 GIF 動畫製作器-win32-x64
echo 🚀 執行檔案: dist\璐娜的 GIF 動畫製作器-win32-x64\璐娜的 GIF 動畫製作器.exe
echo 🎬 GIF 輸出功能已修復並可正常使用
echo.
echo 💡 後續步驟:
echo   1. 測試應用程式功能
echo   2. 執行 UI 測試: npm run test:ui:click
echo   3. 如需要，創建安裝包: npm run build:nsis
echo.

pause
