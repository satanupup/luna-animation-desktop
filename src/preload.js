const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 應用程式資訊
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),

  // 對話框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // 外部連結
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // 使用者偏好設定
  getUserPreferences: () => ipcRenderer.invoke('get-user-preferences'),
  saveUserPreferences: (preferences) => ipcRenderer.invoke('save-user-preferences', preferences),

  // FFmpeg 相關功能（通過 IPC 安全調用）
  ffmpeg: {
    checkAvailability: () => ipcRenderer.invoke('ffmpeg-check-availability'),
    createTempDirectory: () => ipcRenderer.invoke('ffmpeg-create-temp-directory'),
    saveFramesToTemp: (frames, tempDir) => ipcRenderer.invoke('ffmpeg-save-frames-to-temp', frames, tempDir),
    runCommand: (command) => ipcRenderer.invoke('ffmpeg-run-command', command),
    checkTempDirectory: (tempDir) => ipcRenderer.invoke('ffmpeg-check-temp-directory', tempDir),
    cleanupTempDirectory: (tempDir) => ipcRenderer.invoke('ffmpeg-cleanup-temp-directory', tempDir)
  },

  // 選單事件監聽
  onMenuNewAnimation: (callback) => {
    ipcRenderer.on('menu-new-animation', callback);
  },

  onMenuShowHelp: (callback) => {
    ipcRenderer.on('menu-show-help', callback);
  },

  // 輸出管理器
  output: {
    saveGIF: (buffer, animationType, shape) => ipcRenderer.invoke('output-save-gif', buffer, animationType, shape),
    saveGIFFromFile: (sourceFilePath, animationType, shape) => ipcRenderer.invoke('output-save-gif-from-file', sourceFilePath, animationType, shape),
    saveSVG: (svgContent, animationType, shape) => ipcRenderer.invoke('output-save-svg', svgContent, animationType, shape),
    savePNGFrames: (frames, animationType, shape) => ipcRenderer.invoke('output-save-png-frames', frames, animationType, shape),
    openFolder: (subFolder) => ipcRenderer.invoke('output-open-folder', subFolder),
    openFile: (filePath) => ipcRenderer.invoke('output-open-file', filePath),
    getStats: () => ipcRenderer.invoke('output-get-stats')
  },

  // 移除監聽器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// 在視窗載入時設定一些基本資訊
window.addEventListener('DOMContentLoaded', () => {
  // 設定應用程式標題
  document.title = '璐娜的 GIF 動畫製作器 🌙';

  // 添加 Electron 環境標識
  document.body.classList.add('electron-app');

  // 禁用右鍵選單（可選）
  // document.addEventListener('contextmenu', (e) => {
  //   e.preventDefault();
  // });

  // 禁用拖放檔案（防止意外導航）
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
  });
});
