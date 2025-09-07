@echo off
echo 璐娜的 GIF 動畫製作器 - 開發模式啟動
echo =====================================
echo.

REM 檢查 Node.js 是否安裝
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 錯誤: 未找到 Node.js
    echo 請先安裝 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 檢查是否已安裝依賴
if not exist "node_modules" (
    echo 正在安裝依賴...
    npm install
    if %errorlevel% neq 0 (
        echo 錯誤: 依賴安裝失敗
        pause
        exit /b 1
    )
)

echo 啟動開發模式...
npm run dev

pause
