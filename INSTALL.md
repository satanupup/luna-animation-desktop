# 安裝指南 📦

## 🎯 給璐娜的快速安裝指南

### 方法一：使用已編譯版本 (最簡單)

1. **下載應用程式**
   - 前往專案的 Releases 頁面
   - 下載最新版本的安裝包 (`璐娜GIF動畫製作器-安裝包-1.0.0.exe`)
   - 或下載便攜版 (`璐娜GIF動畫製作器-便攜版-1.0.0.exe`)

2. **安裝應用程式**
   - **安裝包版本**: 雙擊 `.exe` 檔案，按照安裝精靈指示完成安裝
   - **便攜版**: 直接雙擊 `.exe` 檔案即可運行，無需安裝

3. **開始使用**
   - 從開始選單或桌面捷徑啟動應用程式
   - 開始製作你的透明背景動畫！

### 方法二：從原始碼建置 (開發者)

#### 前置需求
- Windows 10 或更新版本
- Node.js (v16 或更新版本)
- Git (可選)

#### 安裝步驟

1. **取得原始碼**
   ```bash
   # 使用 Git 複製
   git clone <repository-url>
   cd luna-animation-desktop
   
   # 或直接下載 ZIP 檔案並解壓縮
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **開發模式運行**
   ```bash
   # 方法 1: 使用 npm 指令
   npm run dev
   
   # 方法 2: 使用批次檔案 (Windows)
   scripts\dev.bat
   ```

4. **建置應用程式**
   ```bash
   # 建置所有版本
   npm run build:win
   
   # 或使用批次檔案
   scripts\build.bat
   ```

## 🔧 建置選項詳解

### NPM 指令
- `npm start` - 一般啟動
- `npm run dev` - 開發模式 (含開發者工具)
- `npm run build` - 建置所有平台
- `npm run build:win` - 建置 Windows 版本
- `npm run build:nsis` - 建置 NSIS 安裝包
- `npm run build:portable` - 建置便攜版
- `npm run pack` - 打包但不建立安裝程式

### 輸出檔案
建置完成後，檔案會出現在 `dist/` 資料夾：
- `璐娜GIF動畫製作器-安裝包-1.0.0.exe` - NSIS 安裝包
- `璐娜GIF動畫製作器-便攜版-1.0.0.exe` - 便攜版執行檔

## 🐛 常見問題

### Q: 安裝時出現安全警告？
**A**: 這是正常的，因為應用程式沒有數位簽名。點擊「更多資訊」→「仍要執行」即可。

### Q: 應用程式無法啟動？
**A**: 
1. 確認 Windows 版本 (需要 Windows 10 或更新)
2. 嘗試以系統管理員身分執行
3. 檢查防毒軟體是否阻擋

### Q: 建置失敗？
**A**:
1. 確認 Node.js 版本 (需要 v16+)
2. 刪除 `node_modules` 資料夾並重新執行 `npm install`
3. 確認網路連線正常

### Q: 缺少圖示？
**A**: 應用程式會使用預設圖示，功能不受影響。可以自行添加 `assets/icon.ico` 檔案。

## 📋 系統需求

### 最低需求
- Windows 10 (64-bit)
- 4GB RAM
- 100MB 可用硬碟空間

### 建議需求
- Windows 11 (64-bit)
- 8GB RAM
- 500MB 可用硬碟空間
- 已安裝 ScreenToGif

## 🔗 相關工具

### ScreenToGif
- **下載**: https://www.screentogif.com/
- **用途**: 將 PNG 幀序列組合成 GIF
- **建議**: 安裝後可透過應用程式選單直接開啟

### 開發工具 (僅開發者需要)
- **Node.js**: https://nodejs.org/
- **Git**: https://git-scm.com/
- **Visual Studio Code**: https://code.visualstudio.com/ (推薦編輯器)

## 🆘 需要幫助？

如果遇到問題：
1. 查看本文件的常見問題區段
2. 檢查專案的 Issues 頁面
3. 聯繫開發者 (茄子熊)

---

**祝璐娜使用愉快！** 🌙✨
