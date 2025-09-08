@echo off
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
if exist "%USERPROFILE%\AppData\Local\electron-builder\Cache" (
    rmdir /s /q "%USERPROFILE%\AppData\Local\electron-builder\Cache"
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
    echo 📁 輸出目錄: dist\win-unpacked
) else (
    echo.
    echo ❌ 編譯失敗
)

pause