@echo off
title 璐娜的 GIF 動畫製作器 - 安裝程式
color 0A
cls

echo.
echo     ========================================
echo     璐娜的 GIF 動畫製作器 - 自動安裝
echo     ========================================
echo.
echo     正在準備安裝...
echo.

:: 隱藏技術細節，只顯示用戶需要知道的
echo     [1/4] 檢查系統環境...
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
    echo     請按照以下步驟操作：
    echo     1. 按任意鍵開啟 Node.js 下載頁面
    echo     2. 下載並安裝 Node.js
    echo     3. 安裝完成後重新執行本安裝程式
    echo.
    pause
    start https://nodejs.org/
    exit
)

echo     [2/4] 準備安裝目錄...
set INSTALL_DIR=%USERPROFILE%\璐娜GIF動畫製作器
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%" 2>nul

echo     [3/4] 複製程式檔案...
xcopy /E /I /H /Y "app\*" "%INSTALL_DIR%\" >nul 2>&1

echo     [4/4] 安裝程式組件...
cd /d "%INSTALL_DIR%"
npm install --production >nul 2>&1

:: 創建桌面快捷方式
echo     正在創建桌面快捷方式...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\璐娜GIF動畫製作器.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d "%INSTALL_DIR%" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.WindowStyle = 7; $Shortcut.Save()" >nul 2>&1

cls
echo.
echo     ========================================
echo     安裝完成！
echo     ========================================
echo.
echo     🎉 璐娜的 GIF 動畫製作器已成功安裝
echo.
echo     📁 安裝位置：%USERPROFILE%\璐娜GIF動畫製作器
echo     🖥️  桌面快捷方式：璐娜GIF動畫製作器
echo.
echo     🚀 使用方法：
echo        雙擊桌面上的「璐娜GIF動畫製作器」圖示
echo.
echo     📁 您的作品將保存在：
echo        %USERPROFILE%\Luna-Animations\
echo.
echo     按任意鍵關閉安裝程式...
pause >nul
