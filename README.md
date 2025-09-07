# 璐娜的 GIF 動畫製作器 - Windows 桌面版 🌙

專為璐娜設計的透明背景圓形動畫製作工具，現在有了專業的 Windows 桌面應用程式版本！

## ✨ 特色功能

- 🖥️ **原生 Windows 應用程式** - 不需要瀏覽器，獨立運行
- 🎯 **專業介面** - 精心設計的桌面應用程式介面
- 💾 **設定記憶** - 自動儲存你的偏好設定
- 📁 **檔案管理** - 整合系統檔案管理功能
- 🔗 **外部工具整合** - 一鍵開啟 ScreenToGif 和下載資料夾
- ⚙️ **進階設定** - 更多自訂選項和控制

## 🚀 快速開始

### 方法一：下載已編譯版本 (推薦)
1. 前往 [Releases](../../releases) 頁面
2. 下載最新版本的安裝包或便攜版
3. 執行安裝程式或直接執行便攜版
4. 開始製作動畫！

### 方法二：從原始碼建置
```bash
# 1. 複製專案
git clone <repository-url>
cd luna-animation-desktop

# 2. 安裝依賴
npm install

# 3. 開發模式運行
npm run dev

# 4. 建置 Windows 版本
npm run build:win
```

## 📦 建置選項

```bash
# 開發模式
npm start              # 一般啟動
npm run dev           # 開發模式 (含開發者工具)

# 建置
npm run build         # 建置所有平台
npm run build:win     # 僅建置 Windows 版本
npm run build:nsis    # 建置 NSIS 安裝包
npm run build:portable # 建置便攜版

# 測試
npm run pack          # 打包但不建立安裝程式
```

## 🎨 使用說明

### 基本操作
1. **選擇製作方式**：幀序列方式 (推薦) 或 FFmpeg 直接生成
2. **調整動畫參數**：顏色、大小、動畫類型、速度等
3. **即時預覽**：在畫布中查看動畫效果
4. **生成動畫**：點擊按鈕開始製作

### 幀序列方式 (推薦)
- 自動生成並下載所有 PNG 動畫幀
- 使用 ScreenToGif 載入 PNG 檔案組合成 GIF
- 品質最佳，完全透明背景

### 螢幕錄製方式
- 直接用 ScreenToGif 錄製動畫預覽
- 操作簡單，適合快速製作

## 🛠️ 系統需求

- **作業系統**: Windows 10 或更新版本
- **記憶體**: 最少 4GB RAM
- **硬碟空間**: 100MB 可用空間
- **其他**: 建議安裝 [ScreenToGif](https://www.screentogif.com/) 用於 GIF 製作

## 📁 專案結構

```
luna-animation-desktop/
├── src/                    # 原始碼
│   ├── main.js            # Electron 主程序
│   ├── preload.js         # 預載腳本
│   ├── index.html         # 主介面
│   ├── styles.css         # 樣式表
│   ├── animation-engine.js # 動畫引擎
│   └── app.js             # 應用程式邏輯
├── assets/                 # 資源檔案
│   ├── icon.png           # 應用程式圖示
│   └── icon.ico           # Windows 圖示
├── dist/                   # 建置輸出 (自動生成)
├── package.json           # 專案配置
└── README.md              # 說明文件
```

## 🔧 開發說明

### 技術棧
- **Electron**: 跨平台桌面應用程式框架
- **HTML5 Canvas**: 動畫渲染
- **CSS3**: 現代化介面設計
- **JavaScript ES6+**: 應用程式邏輯
- **electron-store**: 設定儲存
- **electron-builder**: 應用程式打包

### 開發環境設定
1. 安裝 Node.js (建議 v16 或更新版本)
2. 複製專案並安裝依賴
3. 使用 `npm run dev` 啟動開發模式
4. 修改 `src/` 目錄下的檔案
5. 應用程式會自動重新載入

### 建置配置
建置設定位於 `package.json` 的 `build` 區段：
- 支援 NSIS 安裝包和便攜版
- 自動程式碼簽名 (需要憑證)
- 壓縮和最佳化

## 🐛 問題回報

如果遇到問題，請提供以下資訊：
1. 作業系統版本
2. 應用程式版本
3. 錯誤訊息或截圖
4. 重現步驟

## 📄 授權

MIT License - 詳見 LICENSE 檔案

## 🙏 致謝

- 感謝璐娜提供需求和測試回饋
- 感謝 Electron 社群提供優秀的框架
- 感謝 ScreenToGif 提供 GIF 製作工具

---

**製作者**: 茄子熊
**版本**: 1.0.0
**最後更新**: 2025-09-07
