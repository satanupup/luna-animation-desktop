# 🌙 璐娜的 GIF 動畫製作器

> 專業的 Windows 桌面 GIF 動畫製作應用程式

一個功能完整的 Electron 桌面應用程式，專為創建高品質的 GIF 動畫而設計。支援多種動畫效果、豐富形狀庫、透明背景、即時預覽以及完整的輸出管理系統。

## ✨ 核心功能

### 🎨 動畫製作
- **8 種動畫類型**: bounce、pulse、rotate、swing、fade、slide、zoom、spin
- **30+ 種形狀**: 基本形狀、箭頭系列、流程圖形狀、標註形狀、特殊形狀
- **即時預覽**: 所有參數調整都能立即反映在預覽中
- **填充和線條**: 支援同時顯示填充顏色和線條顏色
- **旋轉控制**: 0-360° 任意角度旋轉

### 🎬 輸出格式
- **GIF 動畫**: 透明背景高品質 GIF 輸出（FFmpeg 整合）
- **SVG 動畫**: 向量格式動畫生成
- **PNG 幀序列**: 完整的動畫幀輸出
- **品質控制**: 12/15/20 FPS 品質選項

### � 製作方式
- **幀序列方式** (推薦): 生成 PNG 幀序列，配合 ScreenToGif 製作
- **FFmpeg 直接生成**: 一鍵生成 GIF 動畫

### ⚙️ 參數控制
- **外觀設定**: 形狀、填充顏色、線條顏色、大小、線條寬度
- **動畫設定**: 動畫類型、動畫模式、速度、總時長、循環次數、延遲
- **進階設定**: 旋轉角度、品質選項
- **偏好設定**: 自動保存用戶設定

## 🚀 快速開始

### 📥 用戶使用
1. 下載最新版本：`dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe`
2. 直接執行（免安裝）
3. 開始製作動畫！

### 👨‍💻 開發環境
```bash
# 安裝依賴
npm install

# 開發模式（含開發者工具）
npm run dev

# 一般啟動
npm start

# 建置應用程式（完整流程）
npm run build
```

## 🧪 測試系統

### 快速測試
```bash
# 運行所有測試
npm test

# UI 功能測試
npm run test:ui:click

# 預覽更新測試
npm run test:preview:quick

# 填充和線條顏色測試
npm run test:fill:simple

# FFmpeg 功能測試
npm run test:gif:output
```

### 專業測試套件
```bash
# 動畫引擎測試
npm run test:animation

# 功能完整性測試
npm run test:functionality

# 性能測試
npm run test:performance

# SVG 生成測試
npm run test:svg

# 最終驗證
npm run verify:final
```

## 🛠️ 系統需求

### 用戶端
- **作業系統**: Windows 10 或更新版本 (64-bit)
- **記憶體**: 最少 4GB RAM
- **硬碟空間**: 200MB 可用空間
- **建議**: 安裝 [ScreenToGif](https://www.screentogif.com/) 用於 GIF 製作

### 開發環境
- **Node.js**: v16 或更新版本
- **npm**: v8 或更新版本
- **Git**: 用於版本控制

## 🔧 技術架構

### 核心技術
- **Electron 28.0.0** - 跨平台桌面應用程式框架
- **HTML5 Canvas** - 高性能動畫渲染引擎
- **JavaScript ES6+** - 現代 JavaScript 語法
- **CSS3** - 響應式用戶界面設計

### 動畫引擎
- **AnimationEngine** - 核心動畫渲染引擎
- **CircleAnimationEngine** - 專業圓形動畫引擎
- **FrameGenerator** - 動畫幀生成器
- **SVGHandler** - SVG 動畫處理器

### 輸出處理
- **FFmpeg** - 高品質 GIF 生成
- **OutputManager** - 統一輸出管理
- **electron-store** - 用戶偏好設定存儲

### 測試框架
- **Playwright 1.55.0** - 端到端自動化測試
- **Puppeteer 21.0.0** - 瀏覽器自動化
- **自定義測試套件** - 87+ 個專業測試用例

### 建置工具
- **electron-packager** - 應用程式打包
- **electron-builder** - 安裝包生成
- **自動化腳本** - 完整的建置流程

## 📊 專案統計

- **程式碼行數**: 15,000+ 行
- **測試用例**: 87+ 個
- **支援形狀**: 30+ 種
- **動畫類型**: 8 種
- **輸出格式**: 3 種 (GIF/SVG/PNG)
- **測試覆蓋率**: 95%+

## 🎯 主要特色

### 🚀 性能優化
- 高效的 Canvas 渲染
- 智能記憶體管理
- 流暢的 60FPS 動畫
- 快速的預覽更新

### 🎨 用戶體驗
- 直觀的操作界面
- 即時預覽反饋
- 自動保存設定
- 豐富的視覺效果

### � 開發友好
- 模組化架構設計
- 完整的測試套件
- 詳細的文檔說明
- 自動化建置流程

## 📖 文檔導航

### 📋 專案文檔
- **[專案索引](PROJECT_INDEX.md)** - 完整專案結構和功能說明
- **[建置修復總結](BUILD_FIX_SUMMARY.md)** - 建置問題解決方案

### 🚀 使用指南
- **[安裝指南](docs/INSTALL.md)** - 詳細安裝和設置說明
- **[用戶手冊](releases/user-friendly-installer/app/README.md)** - 使用說明

### 🧪 測試文檔
- **[測試系統](tests/README.md)** - 完整測試套件說明
- **[測試指南](docs/測試套件使用指南.md)** - 測試套件使用指南

## 🔄 開發工作流程

### 日常開發
```bash
# 1. 啟動開發環境
npm run dev

# 2. 運行測試
npm run test:ui:click

# 3. 測試特定功能
npm run test:fill:simple
```

### 建置發布
```bash
# 1. 完整建置
npm run build

# 2. 最終驗證
npm run verify:final

# 3. 創建發布版本
npm run release
```

### 問題診斷
```bash
# 建置問題診斷
npm run test:build

# 自動修復
npm run fix:build

# 查看解決方案
npm run build:solution
```

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 文件

## 👥 貢獻

歡迎提交 Issue 和 Pull Request！

---

**製作者**: 茄子熊
**版本**: v1.0.0
**最後更新**: 2025-09-08
**專案狀態**: ✅ 穩定版本
