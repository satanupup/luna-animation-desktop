@echo off
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
    echo 📁 輸出目錄: dist\璐娜的 GIF 動畫製作器-win32-x64
    echo 🚀 執行檔案: dist\璐娜的 GIF 動畫製作器-win32-x64\璐娜的 GIF 動畫製作器.exe
) else (
    echo.
    echo ❌ 編譯失敗，請檢查錯誤訊息
)

pause