@echo off
echo.
echo Luna GIF Animator Installer
echo.
echo Please wait while installing...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Install
set INSTALL_DIR=%USERPROFILE%\Luna-GIF-Animator
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%" 2>nul
xcopy /E /I /H /Y "app\*" "%INSTALL_DIR%\" >nul
cd /d "%INSTALL_DIR%"
npm install --production >nul 2>&1

:: Create shortcuts
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Luna GIF Animator.lnk'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d "%INSTALL_DIR%" && npm start'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()" >nul 2>&1

echo.
echo Installation completed!
echo Desktop shortcut created: Luna GIF Animator
echo.
pause
