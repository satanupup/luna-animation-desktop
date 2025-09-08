@echo off
title 系統檢查
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
echo     檢查 Windows 版本...
ver | find "10." >nul
if %errorlevel% equ 0 (
    echo     ✅ Windows 10 或更新版本
) else (
    ver | find "11." >nul
    if %errorlevel% equ 0 (
        echo     ✅ Windows 11
    ) else (
        echo     ⚠️  建議使用 Windows 10 或更新版本
    )
)

:: 檢查 Node.js
echo     檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Node.js 已安裝
    for /f "delims=" %%i in ('node --version') do echo        版本：%%i
) else (
    echo     ❌ 需要安裝 Node.js
    echo        請到 https://nodejs.org/ 下載安裝
)

:: 檢查記憶體（簡化版）
echo     檢查系統記憶體...
wmic computersystem get TotalPhysicalMemory /value | find "=" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ 記憶體檢查通過
) else (
    echo     ⚠️  無法檢查記憶體，建議至少 4GB RAM
)

echo.
echo     ========================================
echo     檢查完成！
echo     ========================================
echo.

node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     🎉 您的電腦可以運行璐娜的 GIF 動畫製作器！
    echo.
    echo     使用方法：
    echo     雙擊「🚀 璐娜GIF動畫製作器.bat」即可開始使用
) else (
    echo     ⚠️  請先安裝 Node.js 才能使用本軟體
    echo.
    echo     安裝步驟：
    echo     1. 按任意鍵開啟 Node.js 下載頁面
    echo     2. 下載並安裝 Node.js
    echo     3. 重新執行系統檢查
    echo.
    pause
    start https://nodejs.org/
)

echo.
pause
