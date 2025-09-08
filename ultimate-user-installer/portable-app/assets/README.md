# 資源檔案說明

## 圖示檔案

### icon.png
- 應用程式主要圖示 (PNG 格式)
- 建議尺寸: 512x512 像素
- 用於 Linux 和 macOS

### icon.ico
- Windows 應用程式圖示 (ICO 格式)
- 包含多種尺寸: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- 用於 Windows 系統

## 圖示設計建議

璐娜的 GIF 動畫製作器圖示應該包含：
- 🌙 月亮元素 (代表璐娜)
- 🎬 動畫/影片元素
- 💫 動態感的設計
- 溫暖的色調 (紫色、藍色漸層)

## 製作圖示

你可以使用以下工具製作圖示：
1. **線上工具**: Canva, Figma
2. **桌面軟體**: GIMP, Photoshop, Illustrator
3. **圖示轉換**: 使用 ImageMagick 或線上轉換工具將 PNG 轉為 ICO

### 轉換命令範例 (ImageMagick)
```bash
# 將 PNG 轉換為 ICO
magick icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

## 暫時圖示

在沒有自訂圖示的情況下，Electron 會使用預設圖示。
應用程式仍然可以正常運行。
