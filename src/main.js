const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const Store = require('electron-store');

// 智能命令分割函數，正確處理引號
function parseCommand(command) {
  const args = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      // 開始引號
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      // 結束引號
      inQuotes = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuotes) {
      // 空格且不在引號內，分割參數
      if (current.trim()) {
        args.push(current.trim());
        current = '';
      }
    } else {
      // 普通字符
      current += char;
    }
  }

  // 添加最後一個參數
  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}
const OutputManager = require('./output-manager');

// 應用程式配置
const APP_CONFIG = {
  name: "璐娜的 GIF 動畫製作器",
  version: "1.0.0",
  window: {
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600
  }
};

// 設定存儲
const store = new Store();

// 初始化輸出管理器
let outputManager;

let mainWindow;

// 創建主視窗
function createMainWindow() {
  // 獲取上次的視窗位置和大小
  const windowBounds = store.get('windowBounds', {
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height
  });

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: windowBounds.x,
    y: windowBounds.y,
    minWidth: APP_CONFIG.window.minWidth,
    minHeight: APP_CONFIG.window.minHeight,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: APP_CONFIG.name,
    show: false, // 先不顯示，等載入完成後再顯示
    titleBarStyle: 'default'
  });

  // 載入主頁面
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 視窗準備好後顯示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // 預設開啟開發者工具（方便 debug）
    mainWindow.webContents.openDevTools();

    // 可以通過環境變數控制是否開啟開發者工具
    // 如果不想要開發者工具，可以設定 NO_DEVTOOLS=1
    if (!process.env.NO_DEVTOOLS) {
      console.log('🔧 開發者工具已開啟，方便 debug');
    }
  });

  // 保存視窗位置和大小
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  // 處理視窗關閉
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 處理外部連結
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

// 創建應用程式選單
function createMenu() {
  const template = [
    {
      label: '檔案',
      submenu: [
        {
          label: '新增動畫',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-animation');
          }
        },
        {
          label: '開啟 ScreenToGif',
          click: () => {
            shell.openExternal('https://www.screentogif.com/');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '編輯',
      submenu: [
        { role: 'undo', label: '復原' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪下' },
        { role: 'copy', label: '複製' },
        { role: 'paste', label: '貼上' }
      ]
    },
    {
      label: '檢視',
      submenu: [
        { role: 'reload', label: '重新載入' },
        { role: 'forceReload', label: '強制重新載入' },
        { role: 'toggleDevTools', label: '開發者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重設縮放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '縮小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全螢幕' }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '開啟下載資料夾',
          click: () => {
            const downloadsPath = app.getPath('downloads');
            shell.openPath(downloadsPath);
          }
        },
        {
          label: '清除設定',
          click: () => {
            const result = dialog.showMessageBoxSync(mainWindow, {
              type: 'question',
              buttons: ['取消', '確定'],
              defaultId: 0,
              message: '確定要清除所有設定嗎？',
              detail: '這將重設所有偏好設定和視窗位置。'
            });

            if (result === 1) {
              store.clear();
              dialog.showMessageBoxSync(mainWindow, {
                type: 'info',
                message: '設定已清除',
                detail: '請重新啟動應用程式以套用變更。'
              });
            }
          }
        }
      ]
    },
    {
      label: '說明',
      submenu: [
        {
          label: '使用說明',
          click: () => {
            mainWindow.webContents.send('menu-show-help');
          }
        },
        {
          label: '關於 ScreenToGif',
          click: () => {
            shell.openExternal('https://www.screentogif.com/');
          }
        },
        { type: 'separator' },
        {
          label: `關於 ${APP_CONFIG.name}`,
          click: () => {
            dialog.showMessageBoxSync(mainWindow, {
              type: 'info',
              title: `關於 ${APP_CONFIG.name}`,
              message: APP_CONFIG.name,
              detail: `版本: ${APP_CONFIG.version}\n製作者: 茄子熊\n\n專為璐娜設計的透明背景圓形動畫製作工具`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 應用程式事件處理
app.whenReady().then(() => {
  createMainWindow();
  createMenu();

  // 初始化輸出管理器
  outputManager = new OutputManager();
  console.log('📁 輸出管理器已初始化');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 事件處理
ipcMain.handle('get-app-version', () => {
  return APP_CONFIG.version;
});

ipcMain.handle('get-downloads-path', () => {
  return app.getPath('downloads');
});

ipcMain.handle('show-save-dialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message-box', async (_event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('open-external', async (_event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('get-user-preferences', () => {
  return store.get('userPreferences', {
    defaultColor: '#ff3b30',
    defaultSize: 40,
    defaultAnimationType: 'bounce',
    defaultSpeed: 1000,
    defaultDuration: 3,
    defaultQuality: 15
  });
});

ipcMain.handle('save-user-preferences', (_event, preferences) => {
  store.set('userPreferences', preferences);
  return true;
});

// FFmpeg 相關 IPC 處理器
ipcMain.handle('ffmpeg-check-availability', async () => {
  try {
    const appPath = process.cwd();
    const projectFFmpegPath = path.join(appPath, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');

    if (fs.existsSync(projectFFmpegPath)) {
      console.log('✅ 找到 FFmpeg:', projectFFmpegPath);
      return { isAvailable: true, path: projectFFmpegPath };
    }

    console.log('❌ 未找到 FFmpeg');
    return { isAvailable: false, path: null };
  } catch (error) {
    console.error('檢查 FFmpeg 時發生錯誤:', error);
    return { isAvailable: false, path: null, error: error.message };
  }
});

ipcMain.handle('ffmpeg-create-temp-directory', async () => {
  try {
    const tempDir = path.join(os.tmpdir(), 'luna-animation-' + Date.now());
    await fs.promises.mkdir(tempDir, { recursive: true });
    return tempDir;
  } catch (error) {
    throw new Error(`創建臨時目錄失敗: ${error.message}`);
  }
});

ipcMain.handle('ffmpeg-save-frames-to-temp', async (_event, frames, tempDir) => {
  try {
    console.log(`開始保存 ${frames.length} 個幀到目錄: ${tempDir}`);

    // 確保目錄存在
    if (!fs.existsSync(tempDir)) {
      console.log('臨時目錄不存在，創建目錄:', tempDir);
      await fs.promises.mkdir(tempDir, { recursive: true });
    }

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const filename = `frame_${i.toString().padStart(4, '0')}.png`;
      const filepath = path.join(tempDir, filename);

      console.log(`保存幀 ${i + 1}/${frames.length}: ${filename}`);

      // 🔧 增強 DataURL 格式驗證
      if (!frame.dataURL || !frame.dataURL.startsWith('data:image/png;base64,')) {
        console.error(`❌ 幀 ${i} 的 DataURL 格式無效:`, frame.dataURL ? frame.dataURL.substring(0, 50) + '...' : 'undefined');
        throw new Error(`幀 ${i} 的 DataURL 格式無效`);
      }

      // 將 DataURL 轉換為 Buffer
      const base64Data = frame.dataURL.replace(/^data:image\/png;base64,/, '');

      // 🔧 增強 Base64 數據驗證
      if (!base64Data || base64Data.length < 100) {
        console.error(`❌ 幀 ${i} 的 Base64 數據太短:`, base64Data.length, 'bytes');
        throw new Error(`幀 ${i} 的 Base64 數據無效`);
      }

      // 🔧 驗證 Base64 格式
      try {
        const buffer = Buffer.from(base64Data, 'base64');

        // 驗證 PNG 檔案簽名 (89 50 4E 47)
        if (buffer.length < 8 ||
            buffer[0] !== 0x89 || buffer[1] !== 0x50 ||
            buffer[2] !== 0x4E || buffer[3] !== 0x47) {
          console.error(`❌ 幀 ${i} 不是有效的 PNG 格式，檔案簽名:`,
            buffer.slice(0, 8).toString('hex'));
          throw new Error(`幀 ${i} 不是有效的 PNG 格式`);
        }

        console.log(`✅ 幀 ${i} PNG 格式驗證通過，大小: ${buffer.length} bytes`);

        // 🔧 使用已驗證的 buffer，不需要重新創建
        await fs.promises.writeFile(filepath, buffer);

        // 🔧 驗證檔案是否成功寫入
        const stats = await fs.promises.stat(filepath);
        console.log(`✅ 檔案已保存: ${filename}, 大小: ${stats.size} bytes`);

      } catch (bufferError) {
        console.error(`❌ 幀 ${i} Base64 解碼失敗:`, bufferError.message);
        throw new Error(`幀 ${i} Base64 解碼失敗: ${bufferError.message}`);
      }



      // 驗證檔案是否成功創建
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        console.log(`✅ 幀 ${filename} 已保存，大小: ${stats.size} bytes`);

        // 額外驗證：讀取檔案並檢查 PNG 簽名
        const savedBuffer = fs.readFileSync(filepath);
        if (savedBuffer.length >= 8 && savedBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
          console.log(`✅ 幀 ${filename} PNG 格式驗證通過`);
        } else {
          console.error(`❌ 幀 ${filename} PNG 格式驗證失敗`);
        }
      } else {
        console.error(`❌ 幀 ${filename} 保存失敗`);
      }
    }

    // 列出目錄中的所有檔案
    const files = fs.readdirSync(tempDir);
    console.log(`臨時目錄中的檔案: ${files.join(', ')}`);

    return { success: true, frameCount: frames.length, files: files };
  } catch (error) {
    console.error('保存幀時發生錯誤:', error);
    throw new Error(`保存幀到臨時目錄失敗: ${error.message}`);
  }
});

// 新增：執行單個 FFmpeg 命令
ipcMain.handle('ffmpeg-run-single-command', async (_event, ffmpegPath, args) => {
  return new Promise((resolve, reject) => {
    console.log('執行單個 FFmpeg 命令:', ffmpegPath, args);

    const childProcess = spawn(ffmpegPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ FFmpeg 單個命令執行成功');
        resolve({ success: true, stdout, stderr });
      } else {
        console.error('❌ FFmpeg 單個命令執行失敗:', stderr);
        reject(new Error(`FFmpeg 執行失敗 (代碼 ${code}): ${stderr}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(new Error(`FFmpeg 執行錯誤: ${error.message}`));
    });
  });
});

// 修改：執行複合 FFmpeg 命令（分解為兩個單獨命令）
ipcMain.handle('ffmpeg-run-command', async (_event, command) => {
  console.log('執行 FFmpeg 命令:', command);

  // 檢查是否是複合命令（包含 &&）
  if (command.includes('&&')) {
    // 分解複合命令為兩個單獨的命令
    const commands = command.split('&&').map(cmd => cmd.trim());

    for (let i = 0; i < commands.length; i++) {
      const singleCommand = commands[i];
      console.log(`執行第 ${i + 1} 個命令:`, singleCommand);

      // 解析命令
      const args = singleCommand.split(' ').filter(arg => arg.trim() !== '');
      const ffmpegPath = args[0].replace(/"/g, '');
      const ffmpegArgs = args.slice(1);

      try {
        const result = await new Promise((resolve, reject) => {
          const childProcess = spawn(ffmpegPath, ffmpegArgs, {
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf8'
          });

          let stdout = '';
          let stderr = '';

          childProcess.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          childProcess.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          childProcess.on('close', (code) => {
            if (code === 0) {
              console.log(`✅ 第 ${i + 1} 個命令執行成功`);
              resolve({ success: true, stdout, stderr });
            } else {
              console.error(`❌ 第 ${i + 1} 個命令執行失敗:`, stderr);
              reject(new Error(`FFmpeg 執行失敗 (代碼 ${code}): ${stderr}`));
            }
          });

          childProcess.on('error', (error) => {
            reject(new Error(`FFmpeg 執行錯誤: ${error.message}`));
          });
        });
      } catch (error) {
        throw error;
      }
    }

    return { success: true, message: '複合命令執行完成' };
  } else {
    // 單一命令處理 - 智能分割命令，正確處理引號
    const args = parseCommand(command);
    const ffmpegPath = args[0].replace(/"/g, '');
    let ffmpegArgs = args.slice(1);

    // 🔧 修復：處理相對路徑的輸出檔案，轉換為絕對路徑
    for (let i = 0; i < ffmpegArgs.length; i++) {
      const arg = ffmpegArgs[i];
      if (arg.startsWith('temp_gif_') && arg.endsWith('.gif')) {
        // 將相對路徑轉換為絕對路徑
        ffmpegArgs[i] = path.join(process.cwd(), arg);
        console.log(`🔧 輸出路徑轉換: ${arg} -> ${ffmpegArgs[i]}`);
      }
    }

    return new Promise((resolve, reject) => {
      const childProcess = spawn(ffmpegPath, ffmpegArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ FFmpeg 執行成功');
          resolve({ success: true, stdout, stderr });
        } else {
          console.error('❌ FFmpeg 執行失敗:', stderr);
          reject(new Error(`FFmpeg 執行失敗 (代碼 ${code}): ${stderr}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(new Error(`FFmpeg 執行錯誤: ${error.message}`));
      });
    });
  }
});

// FFmpeg 檢查臨時目錄
ipcMain.handle('ffmpeg-check-temp-directory', async (_event, tempDir) => {
  try {
    if (!fs.existsSync(tempDir)) {
      return { success: false, error: '臨時目錄不存在' };
    }

    const files = await fs.promises.readdir(tempDir);
    const pngFiles = files.filter(f => f.endsWith('.png') && f.startsWith('frame_'));

    console.log(`📁 檢查臨時目錄: ${tempDir}`);
    console.log(`📋 PNG 檔案數量: ${pngFiles.length}`);

    if (pngFiles.length === 0) {
      return { success: false, error: '臨時目錄中沒有找到 PNG 幀檔案' };
    }

    return { success: true, fileCount: pngFiles.length, files: pngFiles };
  } catch (error) {
    console.error('檢查臨時目錄失敗:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ffmpeg-cleanup-temp-directory', async (_event, tempDir) => {
  try {
    await fs.promises.rmdir(tempDir, { recursive: true });
    return { success: true };
  } catch (error) {
    console.warn('清理臨時目錄失敗:', error);
    return { success: false, error: error.message };
  }
});

// 輸出管理器 IPC 處理器
ipcMain.handle('output-save-gif', async (_event, buffer, animationType, shape) => {
  try {
    const result = await outputManager.saveGIF(buffer, animationType, shape);
    return result;
  } catch (error) {
    throw new Error(`保存 GIF 失敗: ${error.message}`);
  }
});

// 路徑工具 IPC 處理器
ipcMain.handle('path-join', async (_event, ...paths) => {
  return path.join(...paths);
});

ipcMain.handle('path-get-cwd', async (_event) => {
  return process.cwd();
});

// 新增：從已生成的檔案保存 GIF
ipcMain.handle('output-save-gif-from-file', async (_event, sourceFilePath, animationType, shape) => {
  try {
    console.log('🔄 開始保存 GIF 檔案...');
    console.log('  源檔案路徑:', sourceFilePath);
    console.log('  動畫類型:', animationType);
    console.log('  形狀:', shape);

    // 檢查源檔案是否存在
    try {
      const sourceStats = await fs.promises.stat(sourceFilePath);
      console.log('  源檔案大小:', sourceStats.size, 'bytes');
    } catch (error) {
      console.error('❌ 源檔案不存在:', sourceFilePath);
      throw new Error(`源檔案不存在: ${sourceFilePath}`);
    }

    const outputDir = path.join(os.homedir(), 'Luna-Animations', 'GIF');
    console.log('  輸出目錄:', outputDir);

    await fs.promises.mkdir(outputDir, { recursive: true });
    console.log('✅ 輸出目錄已創建');

    const filename = `luna-animation-${shape}-${animationType}-${Date.now()}.gif`;
    const targetFilePath = path.join(outputDir, filename);
    console.log('  目標檔案路徑:', targetFilePath);

    // 複製檔案到輸出目錄
    await fs.promises.copyFile(sourceFilePath, targetFilePath);
    console.log('✅ 檔案複製完成');

    const stats = await fs.promises.stat(targetFilePath);
    console.log('  目標檔案大小:', stats.size, 'bytes');

    // 清理臨時檔案
    try {
      await fs.promises.unlink(sourceFilePath);
      console.log(`✅ 臨時檔案已清理: ${sourceFilePath}`);
    } catch (cleanupError) {
      console.warn('⚠️ 清理臨時檔案失敗:', cleanupError);
    }

    console.log('🎉 GIF 檔案保存成功!');
    return { success: true, filename, path: targetFilePath, size: stats.size };
  } catch (error) {
    console.error('從檔案保存 GIF 失敗:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('output-save-svg', async (_event, svgContent, animationType, shape) => {
  try {
    const result = await outputManager.saveSVG(svgContent, animationType, shape);
    return result;
  } catch (error) {
    throw new Error(`保存 SVG 失敗: ${error.message}`);
  }
});

ipcMain.handle('output-save-png-frames', async (_event, frames, animationType, shape) => {
  try {
    const result = await outputManager.savePNGFrames(frames, animationType, shape);
    return result;
  } catch (error) {
    throw new Error(`保存 PNG 幀失敗: ${error.message}`);
  }
});

ipcMain.handle('output-open-folder', async (_event, subFolder = null) => {
  try {
    const result = await outputManager.openOutputFolder(subFolder);
    return result;
  } catch (error) {
    throw new Error(`開啟資料夾失敗: ${error.message}`);
  }
});

ipcMain.handle('output-open-file', async (_event, filePath) => {
  try {
    const result = await outputManager.openFile(filePath);
    return result;
  } catch (error) {
    throw new Error(`開啟檔案失敗: ${error.message}`);
  }
});

ipcMain.handle('output-get-stats', async (_event) => {
  try {
    const stats = outputManager.getOutputStats();
    return stats;
  } catch (error) {
    throw new Error(`獲取統計失敗: ${error.message}`);
  }
});

// 錯誤處理
process.on('uncaughtException', (error) => {
  console.error('未捕獲的異常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
});
