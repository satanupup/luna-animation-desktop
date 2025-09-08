@echo off
chcp 65001 >nul
echo Luna GIF Animator - Auto Installer
echo ================================================

echo.
echo Checking system requirements...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js first
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js installed
node --version

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

echo [OK] npm installed
npm --version

echo.
echo Installing Luna GIF Animator...

:: Create installation directory
set INSTALL_DIR=%USERPROFILE%\Luna-GIF-Animator
echo Install directory: %INSTALL_DIR%

if exist "%INSTALL_DIR%" (
    echo Found existing installation, updating...
    rmdir /s /q "%INSTALL_DIR%" 2>nul
)

mkdir "%INSTALL_DIR%" 2>nul

:: Copy application files
echo Copying application files...
xcopy /E /I /H /Y "app\*" "%INSTALL_DIR%\" >nul

:: Enter installation directory and install dependencies
cd /d "%INSTALL_DIR%"

echo Installing dependencies...
npm install --production

if %errorlevel% neq 0 (
    echo [ERROR] Dependencies installation failed
    pause
    exit /b 1
)

echo [OK] Dependencies installed

:: Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Luna GIF Animator.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d "%INSTALL_DIR%" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\assets\icon.ico'; $Shortcut.Save()"

:: Create start menu shortcut
echo Creating start menu shortcut...
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\Luna GIF Animator.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d "%INSTALL_DIR%" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\assets\icon.ico'; $Shortcut.Save()"

echo.
echo Installation completed!
echo.
echo Install location: %INSTALL_DIR%
echo Desktop shortcut: Luna GIF Animator
echo Start menu: Luna GIF Animator
echo.
echo How to use:
echo   1. Double-click desktop shortcut to start
echo   2. Or find in start menu and launch
echo   3. Or manually run: cd "%INSTALL_DIR%" && npm start
echo.
echo Output files location: %USERPROFILE%\Luna-Animations\
echo.
pause
