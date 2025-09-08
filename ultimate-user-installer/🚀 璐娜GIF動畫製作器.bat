@echo off
title 璐娜的 GIF 動畫製作器
color 0A
cls

echo.
echo     ========================================
echo     璐娜的 GIF 動畫製作器 - 便攜版
echo     ========================================
echo.
echo     正在啟動程式...
echo.

:: 檢查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    cls
    echo.
    echo     ========================================
    echo     需要安裝 Node.js
    echo     ========================================
    echo.
    echo     您的電腦需要先安裝 Node.js 才能使用本軟體
    echo.
    echo     按任意鍵開啟 Node.js 下載頁面...
    pause >nul
    start https://nodejs.org/
    echo.
    echo     安裝 Node.js 後請重新執行本程式
    pause
    exit
)

:: 檢查依賴是否已安裝
if not exist "portable-app\node_modules" (
    echo     首次使用，正在準備程式組件...
    cd portable-app
    npm install --production >nul 2>&1
    cd ..
    echo     準備完成！
    echo.
)

:: 啟動應用程式
echo     正在啟動璐娜的 GIF 動畫製作器...
cd portable-app
start /min cmd /c "npm start"
cd ..

echo.
echo     程式已啟動！
echo     如果沒有看到程式視窗，請檢查工作列。
echo.
echo     按任意鍵關閉此視窗...
pause >nul
