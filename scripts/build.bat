@echo off
echo 璐娜的 GIF 動畫製作器 - 建置腳本
echo ================================
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

echo 選擇建置類型:
echo 1. NSIS 安裝包 (推薦)
echo 2. 便攜版
echo 3. 兩者都建置
echo.
set /p choice=請輸入選擇 (1-3): 

if "%choice%"=="1" (
    echo 正在建置 NSIS 安裝包...
    npm run build:nsis
) else if "%choice%"=="2" (
    echo 正在建置便攜版...
    npm run build:portable
) else if "%choice%"=="3" (
    echo 正在建置所有版本...
    npm run build:win
) else (
    echo 無效的選擇
    pause
    exit /b 1
)

if %errorlevel% equ 0 (
    echo.
    echo 建置完成！
    echo 輸出檔案位於 dist/ 資料夾
    echo.
    echo 是否要開啟輸出資料夾? (Y/N)
    set /p open=
    if /i "%open%"=="Y" (
        start explorer dist
    )
) else (
    echo.
    echo 建置失敗！
)

pause
