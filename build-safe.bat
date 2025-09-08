@echo off
chcp 65001 >nul
echo Building Luna GIF Animation Desktop App...
echo.

REM Set environment variables to disable code signing
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo Cleaning cache...
if exist "dist" rmdir /s /q "dist"
if exist "%USERPROFILE%\AppData\Local\electron-builder\Cache" rmdir /s /q "%USERPROFILE%\AppData\Local\electron-builder\Cache"

echo.
echo Starting build (pack only)...
npm run pack

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build successful!
    echo Output directory: dist\win-unpacked
) else (
    echo.
    echo Build failed. Please check the error messages above.
)

pause
