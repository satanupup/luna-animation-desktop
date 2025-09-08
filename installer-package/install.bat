@echo off
chcp 65001 >nul
echo 🌙 璐娜的 GIF 動畫製作器 - 自動安裝程式
echo ================================================

echo.
echo 📋 檢查系統需求...

:: 檢查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，請先安裝 Node.js
    echo 💡 下載地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安裝
node --version

:: 檢查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 npm
    pause
    exit /b 1
)

echo ✅ npm 已安裝
npm --version

echo.
echo 📦 開始安裝璐娜的 GIF 動畫製作器...

:: 創建安裝目錄
set INSTALL_DIR=%USERPROFILE%\Luna-GIF-Animator
echo 📁 安裝目錄: %INSTALL_DIR%

if exist "%INSTALL_DIR%" (
    echo 🔄 發現現有安裝，正在更新...
    rmdir /s /q "%INSTALL_DIR%" 2>nul
)

mkdir "%INSTALL_DIR%" 2>nul

:: 複製應用程式檔案
echo 📋 複製應用程式檔案...
xcopy /E /I /H /Y "app\*" "%INSTALL_DIR%\" >nul

:: 進入安裝目錄並安裝依賴
cd /d "%INSTALL_DIR%"

echo 📦 安裝依賴套件...
npm install --production

if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗
    pause
    exit /b 1
)

echo ✅ 依賴安裝完成

:: 創建桌面快捷方式
echo 🔗 創建桌面快捷方式...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\璐娜的GIF動畫製作器.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d "%INSTALL_DIR%" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\assets\icon.ico'; $Shortcut.Save()"

:: 創建開始選單快捷方式
echo 🔗 創建開始選單快捷方式...
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\璐娜的GIF動畫製作器.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d "%INSTALL_DIR%" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\assets\icon.ico'; $Shortcut.Save()"

echo.
echo 🎉 安裝完成！
echo.
echo 📁 安裝位置: %INSTALL_DIR%
echo 🖥️  桌面快捷方式: 璐娜的GIF動畫製作器
echo 📋 開始選單: 璐娜的GIF動畫製作器
echo.
echo 🚀 使用方法:
echo   1. 雙擊桌面快捷方式啟動
echo   2. 或在開始選單中找到並啟動
echo   3. 或手動執行: cd "%INSTALL_DIR%" && npm start
echo.
echo 📁 輸出檔案位置: %USERPROFILE%\Luna-Animations\
echo.
pause
