@echo off
title 系統需求檢查
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
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo     Windows 版本：%VERSION%

:: 檢查 Node.js
echo     檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Node.js 已安裝
    node --version
) else (
    echo     ❌ 需要安裝 Node.js
    echo.
    echo     請先安裝 Node.js：https://nodejs.org/
)

:: 檢查硬碟空間
echo     檢查硬碟空間...
for /f "tokens=3" %%a in ('dir /-c %SystemDrive% ^| find "bytes free"') do set FREE_SPACE=%%a
echo     可用空間：%FREE_SPACE% bytes

echo.
echo     檢查完成！
echo.
pause
