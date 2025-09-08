@echo off
echo 🔍 檢查 Windows 開發者模式狀態
echo.

reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense >nul 2>&1
if %errorLevel% == 0 (
    for /f "tokens=3" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense ^| find "AllowDevelopmentWithoutDevLicense"') do set devmode=%%a
    if "!devmode!"=="0x1" (
        echo ✅ 開發者模式已啟用
        echo 可以嘗試直接編譯: npm run pack
    ) else (
        echo ❌ 開發者模式未啟用
        echo 建議啟用開發者模式或以管理員身份執行
    )
) else (
    echo ❓ 無法檢查開發者模式狀態
)

echo.
echo 💡 啟用開發者模式的步驟:
echo 1. 開啟 設定 ^> 更新與安全性 ^> 開發人員選項
echo 2. 選擇 "開發人員模式"
echo 3. 重新啟動電腦

pause