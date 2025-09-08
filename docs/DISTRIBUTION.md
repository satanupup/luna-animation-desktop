# 🚀 璐娜的 GIF 動畫製作器 - 分發指南

## 📦 為客戶創建分發包

### 一鍵構建分發包

```bash
npm run build:distribution
```

這個命令會自動執行：
1. 構建應用程式 (`build-simple.js`)
2. 修復依賴 (`fix-dependencies.js`)
3. 創建發布包 (`create-release.js`)
4. 創建安裝包 (`create-installer.js`)

### 手動步驟（如果需要）

```bash
# 1. 構建應用程式
npm run build

# 2. 創建安裝包
npm run create:installer
```

## 📁 生成的分發檔案

### 給客戶的檔案
- **檔案**：`璐娜GIF動畫製作器-安裝包-v1.1.0.zip` (約 80MB)
- **內容**：完整應用程式 + FFmpeg + 自動安裝腳本

### 檔案結構
```
璐娜GIF動畫製作器-安裝包-v1.1.0.zip
├── install.bat                    # Windows 自動安裝腳本
├── install.ps1                    # PowerShell 安裝腳本
├── README.md                      # 客戶使用說明
├── version.json                   # 版本資訊
└── app/                          # 應用程式檔案
    ├── package.json              # Node.js 配置
    ├── src/                      # 源代碼
    ├── assets/                   # 資源檔案
    ├── ffmpeg-master-latest-win64-gpl-shared/  # FFmpeg
    └── [其他構建腳本]
```

## 🎯 客戶使用步驟

### 超簡單安裝
1. **解壓縮** ZIP 檔案
2. **雙擊** `install.bat`
3. **等待** 自動安裝完成
4. **使用** 桌面快捷方式啟動

### 自動安裝功能
- ✅ 檢查系統需求
- ✅ 安裝到用戶目錄
- ✅ 安裝 Node.js 依賴
- ✅ 創建桌面快捷方式
- ✅ 創建開始選單項目

## 💻 系統需求

### 客戶電腦需要
- **作業系統**：Windows 10+
- **Node.js**：16.0+（安裝腳本會檢查）
- **記憶體**：4GB RAM
- **硬碟**：500MB 空間

### 完全包含
- ✅ FFmpeg 執行檔和庫
- ✅ 所有 Node.js 依賴
- ✅ 應用程式源代碼
- ✅ 自動安裝腳本

## 🔧 開發者使用

### 構建新版本
```bash
# 更新版本號（如果需要）
# 編輯 package.json 中的 version

# 構建分發包
npm run build:distribution

# 檢查生成的檔案
ls -la *.zip
```

### 測試安裝包
```bash
# 解壓縮到測試目錄
unzip "璐娜GIF動畫製作器-安裝包-v1.1.0.zip" -d test-install

# 測試安裝腳本
cd test-install
./install.bat
```

## 📋 分發檢查清單

### 構建前確認
- [ ] 所有功能測試通過
- [ ] FFmpeg 路徑正確
- [ ] 版本號已更新
- [ ] 依賴完整安裝

### 構建後確認
- [ ] 安裝包大小約 80MB
- [ ] 包含 FFmpeg 執行檔
- [ ] 安裝腳本可執行
- [ ] 說明文件完整

### 客戶交付
- [ ] 提供 ZIP 檔案
- [ ] 提供安裝說明
- [ ] 確認系統需求
- [ ] 提供技術支援聯繫

## 🛠️ 故障排除

### 構建失敗
```bash
# 清理並重新安裝依賴
rm -rf node_modules
npm install

# 重新構建
npm run build:distribution
```

### FFmpeg 缺失
確保 `../ffmpeg-master-latest-win64-gpl-shared/` 目錄存在

### 安裝包過小
檢查是否包含 FFmpeg：
```bash
unzip -l "璐娜GIF動畫製作器-安裝包-v1.1.0.zip" | grep ffmpeg
```

## 📞 技術支援

### 客戶問題
- Node.js 未安裝：提供下載連結 https://nodejs.org/
- 權限問題：以系統管理員身分執行
- 網路問題：檢查防火牆設定

### 開發問題
- 構建失敗：檢查依賴和路徑
- 檔案缺失：確認所有源檔案存在
- 版本問題：更新 package.json

---

**🌙 璐娜的 GIF 動畫製作器 - 讓分發變得簡單！**
