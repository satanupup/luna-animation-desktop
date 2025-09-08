# 🔧 璐娜的 GIF 動畫製作器 - Debug 設定說明

## 🎯 開發者工具預設開啟

### ✅ 已設定預設開啟 F12

現在每次啟動應用程式時，開發者工具（F12）會自動開啟，方便璐娜進行 debug！

## 🚀 啟動方式

### 1. **一般啟動（預設開啟 F12）**
```bash
npm start
```
- ✅ 自動開啟開發者工具
- ✅ 可以查看 Console 訊息
- ✅ 可以檢查 Elements 結構
- ✅ 可以監控 Network 請求

### 2. **開發模式啟動**
```bash
npm run dev
```
- ✅ 開發模式標記
- ✅ 自動開啟開發者工具
- ✅ 額外的開發功能

### 3. **Node.js Debug 模式**
```bash
npm run debug
```
- ✅ 啟用 Node.js 檢查器
- ✅ 可以在 Chrome 中 debug 主程序
- ✅ 連接埠：9229

### 4. **Node.js Debug 中斷模式**
```bash
npm run debug-brk
```
- ✅ 啟動時立即中斷
- ✅ 等待 debugger 連接
- ✅ 適合調試啟動問題

### 5. **關閉開發者工具模式**
```bash
npm run no-devtools
```
- ❌ 不開啟開發者工具
- ✅ 正常使用者體驗
- ✅ 適合最終測試

## 🔧 Debug 功能

### 📱 前端 Debug（渲染程序）

#### **Console 面板**
```javascript
// 在瀏覽器 Console 中可以使用：
console.log('Debug 訊息');
console.error('錯誤訊息');
console.warn('警告訊息');

// 檢查全域物件
window.app          // 主應用程式物件
window.engine       // 動畫引擎
window.svgHandler   // SVG 處理器
window.ffmpegHandler // FFmpeg 處理器
```

#### **Elements 面板**
- ✅ 檢查 HTML 結構
- ✅ 修改 CSS 樣式
- ✅ 查看 Canvas 元素
- ✅ 檢查事件監聽器

#### **Network 面板**
- ✅ 監控檔案載入
- ✅ 檢查 API 請求
- ✅ 查看資源載入時間

#### **Sources 面板**
- ✅ 設定中斷點
- ✅ 單步執行程式碼
- ✅ 查看變數值
- ✅ 修改程式碼即時測試

### 🖥️ 後端 Debug（主程序）

#### **Node.js Inspector**
1. 啟動 debug 模式：
   ```bash
   npm run debug
   ```

2. 在 Chrome 中開啟：
   ```
   chrome://inspect
   ```

3. 點擊 "Open dedicated DevTools for Node"

4. 可以 debug：
   - ✅ main.js 主程序
   - ✅ IPC 通訊
   - ✅ 檔案系統操作
   - ✅ Electron API 呼叫

## 🎯 常用 Debug 技巧

### 1. **檢查動畫引擎狀態**
```javascript
// 在 Console 中執行
console.log('動畫參數:', window.engine.params);
console.log('Canvas 大小:', window.engine.width, 'x', window.engine.height);
console.log('當前幀數:', window.engine.currentFrame);
```

### 2. **監控 Canvas 渲染**
```javascript
// 檢查 Canvas 內容
const canvas = document.getElementById('preview-canvas');
console.log('Canvas 內容:', canvas.toDataURL());
```

### 3. **測試 SVG 生成**
```javascript
// 測試 SVG 輸出
const svg = window.svgHandler.generateSVGAnimation(window.app.params);
console.log('SVG 內容:', window.svgHandler.svgToString(svg));
```

### 4. **檢查 FFmpeg 命令**
```javascript
// 查看 FFmpeg 命令
const command = window.ffmpegHandler.buildFFmpegCommand(
  'test-dir', 
  'output.gif', 
  { fps: 15, quality: 'high' }
);
console.log('FFmpeg 命令:', command);
```

### 5. **監控效能**
```javascript
// 效能監控
console.time('動畫生成');
// ... 執行動畫生成 ...
console.timeEnd('動畫生成');
```

## 🔍 Debug 快捷鍵

### **開發者工具快捷鍵**
- `F12` - 開啟/關閉開發者工具
- `Ctrl+Shift+I` - 開啟/關閉開發者工具
- `Ctrl+Shift+J` - 直接開啟 Console
- `Ctrl+Shift+C` - 元素選擇器
- `F5` - 重新載入頁面
- `Ctrl+F5` - 強制重新載入

### **Debug 快捷鍵**
- `F8` - 繼續執行
- `F10` - 單步執行（跳過函數）
- `F11` - 單步執行（進入函數）
- `Shift+F11` - 跳出函數
- `Ctrl+F8` - 停用/啟用所有中斷點

## 🚨 常見 Debug 場景

### 1. **動畫不顯示**
```javascript
// 檢查 Canvas 是否正確初始化
console.log('Canvas:', document.getElementById('preview-canvas'));
console.log('Context:', window.engine.ctx);
console.log('動畫參數:', window.engine.params);
```

### 2. **SVG 輸出問題**
```javascript
// 檢查 SVG 生成
const svg = window.svgHandler.generateSVGAnimation(window.app.params);
document.body.appendChild(svg); // 直接顯示在頁面上
```

### 3. **FFmpeg 執行失敗**
```javascript
// 檢查 FFmpeg 路徑和命令
console.log('FFmpeg 路徑:', window.ffmpegHandler.ffmpegPath);
console.log('是否可用:', window.ffmpegHandler.isAvailable);
```

### 4. **效能問題**
```javascript
// 監控記憶體使用
console.log('記憶體使用:', performance.memory);

// 監控幀率
let frameCount = 0;
setInterval(() => {
  console.log('FPS:', frameCount);
  frameCount = 0;
}, 1000);
```

## 🎊 Debug 最佳實踐

### ✅ 建議做法

1. **使用有意義的 console.log**
   ```javascript
   console.log('🎯 開始生成動畫，參數:', params);
   console.log('✅ 動畫生成完成，幀數:', frameCount);
   console.log('❌ 錯誤:', error.message);
   ```

2. **設定條件中斷點**
   ```javascript
   if (frameIndex === 10) {
     debugger; // 只在第 10 幀時中斷
   }
   ```

3. **使用 try-catch 捕獲錯誤**
   ```javascript
   try {
     // 可能出錯的程式碼
   } catch (error) {
     console.error('🚨 捕獲錯誤:', error);
     debugger; // 自動中斷到 debugger
   }
   ```

### ❌ 避免做法

1. 不要在生產環境留下 `debugger` 語句
2. 不要過度使用 `console.log`，會影響效能
3. 不要忘記移除測試用的程式碼

## 🎉 開始 Debug

現在璐娜可以：

1. **啟動應用程式**
   ```bash
   npm start
   ```

2. **F12 會自動開啟**，可以立即開始 debug

3. **在 Console 中測試**任何功能

4. **設定中斷點**來詳細檢查程式執行

5. **監控效能**和錯誤訊息

**Happy Debugging! 🔧✨**

---

**設定完成時間：** 2025-09-07  
**修改檔案：** `src/main.js`, `package.json`  
**Debug 狀態：** ✅ 預設開啟
