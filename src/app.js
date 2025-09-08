// 檢查必要的類別是否已載入（延遲檢查）
setTimeout(() => {
  console.log('🔍 檢查類別載入狀態:');
  console.log('- CircleAnimationEngine:', typeof CircleAnimationEngine !== 'undefined' ? '✅' : '❌');
  console.log('- FrameGenerator:', typeof FrameGenerator !== 'undefined' ? '✅' : '❌');
  console.log('- FFmpegHandler:', typeof FFmpegHandler !== 'undefined' ? '✅' : '❌');
}, 50);

// 主應用程式邏輯
class LunaAnimationApp {
  constructor() {
    this.initializeElements();
    this.initializeEngine();
    this.initializeParams();
    this.initializeEventListeners();
    this.loadUserPreferences();
    this.updateUI();
  }

  // 初始化 DOM 元素
  initializeElements() {
    // 畫布和引擎
    this.canvas = document.getElementById('canvas');

    // 控制項
    this.shapeSelect = document.getElementById('shape');
    this.colorInput = document.getElementById('color');
    this.sizeInput = document.getElementById('size');
    this.sizeValue = document.getElementById('sizeValue');
    this.filledCheckbox = document.getElementById('filled');
    this.strokeWidthInput = document.getElementById('strokeWidth');
    this.strokeWidthValue = document.getElementById('strokeWidthValue');
    this.strokeWidthContainer = document.getElementById('strokeWidthContainer');
    this.animationModeSelect = document.getElementById('animationMode');
    this.animationTypeSelect = document.getElementById('animationType');
    this.speedInput = document.getElementById('speed');
    this.speedValue = document.getElementById('speedValue');
    this.durationInput = document.getElementById('duration');
    this.durationValue = document.getElementById('durationValue');
    this.loopsSelect = document.getElementById('loops');
    this.delayInput = document.getElementById('delay');
    this.delayValue = document.getElementById('delayValue');
    this.rotationInput = document.getElementById('rotation');
    this.rotationValue = document.getElementById('rotationValue');
    this.qualitySelect = document.getElementById('quality');

    // 按鈕
    this.generateBtn = document.getElementById('generateBtn');
    this.helpBtn = document.getElementById('helpBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.closeHelpBtn = document.getElementById('closeHelpBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.openScreenToGifBtn = document.getElementById('openScreenToGifBtn');
    this.openDownloadsFolderBtn = document.getElementById('openDownloadsFolderBtn');
    this.resetSettingsBtn = document.getElementById('resetSettingsBtn');

    // 面板
    this.helpPanel = document.getElementById('helpPanel');
    this.settingsPanel = document.getElementById('settingsPanel');

    // 進度和狀態
    this.progressContainer = document.getElementById('progressContainer');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.status = document.getElementById('status');

    // 方式選擇
    this.methodButtons = document.querySelectorAll('.method-btn');
    this.methodDesc = document.getElementById('methodDesc');

    // 設定項目
    this.autoSavePreferences = document.getElementById('autoSavePreferences');
    this.showProgressDetails = document.getElementById('showProgressDetails');
  }

  // 初始化動畫引擎
  initializeEngine() {
    this.animationEngine = new CircleAnimationEngine(this.canvas);
    this.frameGenerator = new FrameGenerator(this.animationEngine);

    // 延遲初始化 FFmpegHandler，確保類別已載入
    this.ffmpegHandler = null;
  }

  // 確保 FFmpegHandler 已初始化
  ensureFFmpegHandler() {
    if (!this.ffmpegHandler) {
      if (typeof FFmpegHandler === 'undefined') {
        console.warn('⚠️ FFmpegHandler 類別未載入，可能是腳本載入順序問題');
        // 返回一個模擬的處理器，避免應用程式崩潰
        return {
          isAvailable: false,
          checkFFmpegAvailability: async () => false,
          ensureInitialized: async () => false,
          generateGIFBuffer: async () => { throw new Error('FFmpeg 不可用'); }
        };
      }
      this.ffmpegHandler = new FFmpegHandler();
    }
    return this.ffmpegHandler;
  }

  // 初始化完成後的設定
  initializeParams() {
    // 動畫參數
    this.params = {
      shape: 'circle',
      color: '#ff3b30',
      size: 40,
      filled: true,
      strokeWidth: 4,
      mode: 'loop',
      type: 'bounce',
      speed: 1000,
      duration: 3,
      loops: 'infinite',
      delay: 0,
      rotation: 0,
      fps: 15,
      method: 'frames'
    };

    this.isGenerating = false;

    // 開始預覽動畫
    this.animationEngine.setParams(this.params);
    this.animationEngine.start();

    // 延遲檢查 FFmpeg 可用性，確保所有腳本都已載入
    setTimeout(() => {
      this.checkFFmpegStatus().catch(error => {
        console.warn('FFmpeg 狀態檢查失敗:', error);
      });
    }, 100);
  }

  // 檢查 FFmpeg 狀態
  async checkFFmpegStatus() {
    const ffmpegHandler = this.ensureFFmpegHandler();
    const isAvailable = await ffmpegHandler.checkFFmpegAvailability();
    const ffmpegButton = document.querySelector('[data-method="ffmpeg"]');

    if (isAvailable) {
      ffmpegButton.style.opacity = '1';
      ffmpegButton.title = 'FFmpeg 可用 - 可直接生成 GIF';
    } else {
      ffmpegButton.style.opacity = '0.6';
      ffmpegButton.title = 'FFmpeg 不可用 - 請確認 FFmpeg 已安裝';
    }
  }

  // 初始化事件監聽器
  initializeEventListeners() {
    // 控制項事件
    this.shapeSelect.addEventListener('change', (e) => {
      this.params.shape = e.target.value;
      this.updateEngine();
      this.savePreferences();
    });

    this.colorInput.addEventListener('input', (e) => {
      this.params.color = e.target.value;
      this.updateEngine();
      this.savePreferences();
    });

    this.sizeInput.addEventListener('input', (e) => {
      this.params.size = parseInt(e.target.value);
      this.updateUI();
      this.updateEngine();
      this.savePreferences();
    });

    this.filledCheckbox.addEventListener('change', (e) => {
      this.params.filled = e.target.checked;
      this.updateStrokeWidthVisibility();
      this.updateEngine();
      this.savePreferences();
    });

    this.strokeWidthInput.addEventListener('input', (e) => {
      this.params.strokeWidth = parseInt(e.target.value);
      this.updateUI();
      this.updateEngine();
      this.savePreferences();
    });

    this.animationModeSelect.addEventListener('change', (e) => {
      this.params.mode = e.target.value;
      this.updateEngine();
      this.savePreferences();
    });

    this.animationTypeSelect.addEventListener('change', (e) => {
      this.params.type = e.target.value;
      this.updateEngine();
      this.savePreferences();
    });

    this.speedInput.addEventListener('input', (e) => {
      this.params.speed = parseInt(e.target.value);
      this.updateUI();
      this.updateEngine();
      this.savePreferences();
    });

    this.durationInput.addEventListener('input', (e) => {
      this.params.duration = parseFloat(e.target.value);
      this.updateUI();
      this.savePreferences();
    });

    this.loopsSelect.addEventListener('change', (e) => {
      this.params.loops = e.target.value;
      this.updateEngine();
      this.savePreferences();
    });

    this.delayInput.addEventListener('input', (e) => {
      this.params.delay = parseInt(e.target.value);
      this.updateUI();
      this.updateEngine();
      this.savePreferences();
    });

    this.rotationInput.addEventListener('input', (e) => {
      this.params.rotation = parseInt(e.target.value);
      this.updateUI();
      this.updateEngine();
      this.savePreferences();
    });

    this.qualitySelect.addEventListener('change', (e) => {
      this.params.fps = parseInt(e.target.value);
      this.savePreferences();
    });

    // 方式選擇按鈕
    this.methodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectMethod(btn.dataset.method, btn);
      });
    });

    // 主要操作按鈕
    this.generateBtn.addEventListener('click', () => {
      this.generateAnimation();
    });

    // 面板控制
    this.helpBtn.addEventListener('click', () => {
      this.showPanel('help');
    });

    this.settingsBtn.addEventListener('click', () => {
      this.showPanel('settings');
    });

    this.closeHelpBtn.addEventListener('click', () => {
      this.hidePanel('help');
    });

    this.closeSettingsBtn.addEventListener('click', () => {
      this.hidePanel('settings');
    });

    // 外部連結
    this.openScreenToGifBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.openExternal('https://www.screentogif.com/');
      }
    });

    this.openDownloadsFolderBtn.addEventListener('click', async () => {
      if (window.electronAPI) {
        const downloadsPath = await window.electronAPI.getDownloadsPath();
        window.electronAPI.openExternal(`file://${downloadsPath}`);
      }
    });

    // 設定
    this.resetSettingsBtn.addEventListener('click', async () => {
      if (window.electronAPI) {
        const result = await window.electronAPI.showMessageBox({
          type: 'question',
          buttons: ['取消', '確定'],
          defaultId: 0,
          message: '確定要重設所有設定嗎？',
          detail: '這將清除所有偏好設定。'
        });

        if (result.response === 1) {
          this.resetToDefaults();
          this.showStatus('設定已重設', 'success');
        }
      }
    });

    // Electron 選單事件
    if (window.electronAPI) {
      window.electronAPI.onMenuNewAnimation(() => {
        this.resetToDefaults();
        this.animationEngine.restart();
      });

      window.electronAPI.onMenuShowHelp(() => {
        this.showPanel('help');
      });
    }
  }

  // 載入使用者偏好設定
  async loadUserPreferences() {
    if (window.electronAPI) {
      try {
        const preferences = await window.electronAPI.getUserPreferences();

        this.params.shape = preferences.defaultShape || 'circle';
        this.params.color = preferences.defaultColor || '#ff3b30';
        this.params.size = preferences.defaultSize || 40;
        this.params.filled = preferences.defaultFilled !== undefined ? preferences.defaultFilled : true;
        this.params.strokeWidth = preferences.defaultStrokeWidth || 4;
        this.params.mode = preferences.defaultAnimationMode || 'loop';
        this.params.type = preferences.defaultAnimationType || 'bounce';
        this.params.speed = preferences.defaultSpeed || 1000;
        this.params.duration = preferences.defaultDuration || 3;
        this.params.fps = preferences.defaultQuality || 15;

        this.updateUI();
        this.updateEngine();
      } catch (error) {
        console.error('載入偏好設定失敗:', error);
      }
    }
  }

  // 儲存使用者偏好設定
  async savePreferences() {
    if (window.electronAPI && this.autoSavePreferences.checked) {
      try {
        const preferences = {
          defaultShape: this.params.shape,
          defaultColor: this.params.color,
          defaultSize: this.params.size,
          defaultFilled: this.params.filled,
          defaultStrokeWidth: this.params.strokeWidth,
          defaultAnimationMode: this.params.mode,
          defaultAnimationType: this.params.type,
          defaultSpeed: this.params.speed,
          defaultDuration: this.params.duration,
          defaultQuality: this.params.fps
        };

        await window.electronAPI.saveUserPreferences(preferences);
      } catch (error) {
        console.error('儲存偏好設定失敗:', error);
      }
    }
  }

  // 更新 UI 顯示值
  updateUI() {
    this.shapeSelect.value = this.params.shape;
    this.colorInput.value = this.params.color;
    this.sizeInput.value = this.params.size;
    this.sizeValue.textContent = this.params.size + 'px';
    this.filledCheckbox.checked = this.params.filled;
    this.strokeWidthInput.value = this.params.strokeWidth;
    this.strokeWidthValue.textContent = this.params.strokeWidth + 'px';
    this.animationModeSelect.value = this.params.mode;
    this.animationTypeSelect.value = this.params.type;
    this.speedInput.value = this.params.speed;
    this.speedValue.textContent = (this.params.speed / 1000).toFixed(1) + '秒';
    this.durationInput.value = this.params.duration;
    this.durationValue.textContent = this.params.duration + '秒';
    this.loopsSelect.value = this.params.loops;
    this.delayInput.value = this.params.delay;
    this.delayValue.textContent = (this.params.delay / 1000).toFixed(1) + '秒';
    this.rotationInput.value = this.params.rotation;
    this.rotationValue.textContent = this.params.rotation + '°';
    this.qualitySelect.value = this.params.fps;
    this.updateStrokeWidthVisibility();
  }

  // 更新線條粗細控制項的可見性
  updateStrokeWidthVisibility() {
    if (this.params.filled) {
      this.strokeWidthContainer.style.display = 'none';
    } else {
      this.strokeWidthContainer.style.display = 'block';
    }
  }

  // 更新動畫引擎
  updateEngine() {
    this.animationEngine.setParams(this.params);
  }

  // 選擇製作方式
  selectMethod(method, clickedButton = null) {
    this.params.method = method;

    // 更新按鈕狀態
    this.methodButtons.forEach(btn => {
      btn.classList.remove('active');
    });

    if (clickedButton) {
      clickedButton.classList.add('active');
    }

    // 更新描述和按鈕文字
    if (method === 'frames') {
      this.methodDesc.textContent = '生成動畫幀序列並自動下載所有 PNG 檔案，然後用 ScreenToGif 組合成 GIF';
      this.generateBtn.textContent = '🎯 生成並下載動畫幀';
    } else if (method === 'ffmpeg') {
      this.methodDesc.textContent = '使用 FFmpeg 直接生成透明背景 GIF 檔案，一鍵完成！';
      this.generateBtn.textContent = '🎯 直接生成 GIF';
    }
  }

  // 生成動畫
  async generateAnimation() {
    if (this.isGenerating) return;

    // 🔧 添加性能監控
    const performanceStart = performance.now();
    const memoryStart = performance.memory ? performance.memory.usedJSHeapSize : 0;

    try {
      if (this.params.method === 'frames') {
        await this.generateFrames();
      } else if (this.params.method === 'ffmpeg') {
        await this.generateGIFWithFFmpeg();
      }

      // 🔧 記錄性能指標
      const performanceEnd = performance.now();
      const memoryEnd = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const duration = performanceEnd - performanceStart;
      const memoryUsed = memoryEnd - memoryStart;

      console.log(`⚡ 動畫生成性能: ${duration.toFixed(1)}ms, 記憶體使用: ${(memoryUsed / 1024 / 1024).toFixed(1)}MB`);

    } catch (error) {
      console.error('❌ 動畫生成失敗:', error);
      this.updateStatus('動畫生成失敗: ' + error.message, 'error');
    }
  }

  // 生成動畫幀序列
  async generateFrames() {
    this.isGenerating = true;
    this.generateBtn.disabled = true;
    this.generateBtn.textContent = '⏳ 準備中...';
    this.showProgress(true);

    try {
      this.showStatus('正在生成動畫幀...', 'working');

      // 停止預覽動畫
      this.animationEngine.stop();

      // 生成幀序列
      const frames = await this.frameGenerator.generateFrames(
        this.params,
        (current, total) => {
          const percent = Math.round((current / total) * 50);
          this.updateProgress(percent, `生成幀 ${current}/${total}`);
        }
      );

      this.updateProgress(75, '保存 PNG 幀...');

      // 🔧 檢查 electronAPI 是否可用
      let saveResult;
      if (window.electronAPI && window.electronAPI.output) {
        // 使用輸出管理器保存 PNG 幀
        saveResult = await window.electronAPI.output.savePNGFrames(
          frames,
          this.params.animationType,
          this.params.shape
        );
      } else {
        // 瀏覽器環境下的備用方案
        console.log('🌐 瀏覽器環境，使用備用 PNG 幀保存方案');
        saveResult = this.savePNGFramesInBrowser(frames);
      }

      if (saveResult.success) {
        this.updateProgress(100, '完成！');
        this.showStatus('✅ PNG 幀序列生成完成！', 'success');

        // 🔧 檢查是否在 Electron 環境中
        if (window.electronAPI && window.electronAPI.showMessageBox) {
          // 顯示成功對話框並提供選項
          const result = await window.electronAPI.showMessageBox({
            type: 'info',
            buttons: ['開啟資料夾', '關閉'],
            defaultId: 0,
            message: '🎉 PNG 幀序列生成成功！',
            detail: `幀數量: ${saveResult.frameCount} 個\n儲存位置: Luna-Animations/PNG-Frames/\n資料夾: ${saveResult.frameDir.split('\\').pop()}\n\n您可以使用這些 PNG 檔案製作 GIF 動畫。`
          });

          if (result.response === 0) {
            // 開啟 PNG 幀資料夾
            await window.electronAPI.output.openFolder('PNG-Frames');
          }
        } else {
          // 瀏覽器環境下的簡化提示
          console.log('🎉 PNG 幀序列生成成功！');
          if (saveResult.frameCount) {
            console.log(`幀數量: ${saveResult.frameCount} 個`);
          }
        }
      } else {
        this.showStatus('❌ 保存 PNG 幀失敗', 'error');
      }

    } catch (error) {
      console.error('生成動畫失敗:', error);
      this.showStatus('❌ 生成動畫時發生錯誤', 'error');
    } finally {
      // 重置狀態
      setTimeout(() => {
        this.isGenerating = false;
        this.generateBtn.disabled = false;
        this.generateBtn.textContent = '🎯 生成並下載動畫幀';
        this.showProgress(false);

        // 重新開始預覽動畫
        this.animationEngine.start();
      }, 3000);
    }
  }

  // 使用 FFmpeg 生成 GIF
  async generateGIFWithFFmpeg() {
    // 確保 FFmpegHandler 已初始化
    const ffmpegHandler = this.ensureFFmpegHandler();

    // 確保 FFmpeg 初始化完成
    await ffmpegHandler.ensureInitialized();

    if (!ffmpegHandler.isAvailable) {
      this.showStatus('❌ FFmpeg 不可用，請確認 FFmpeg 已正確安裝', 'error');
      return;
    }

    this.isGenerating = true;
    this.generateBtn.disabled = true;
    this.generateBtn.textContent = '⏳ 正在生成 GIF...';
    this.showProgress(true);

    try {
      this.showStatus('正在生成動畫幀...', 'working');

      // 停止預覽動畫
      this.animationEngine.stop();

      // 生成幀序列
      const frames = await this.frameGenerator.generateFrames(
        this.params,
        (current, total) => {
          const percent = Math.round((current / total) * 50);
          this.updateProgress(percent, `生成幀 ${current}/${total}`);
        }
      );

      this.updateProgress(75, '正在轉換為 GIF...');

      // 使用 FFmpeg 生成 GIF
      const gifResult = await ffmpegHandler.generateGIFBuffer(frames, {
        fps: this.params.fps,
        quality: this.params.quality,
        transparent: this.params.transparent,
        loop: this.params.loop
      });

      let saveResult;
      if (gifResult.success && gifResult.filePath) {
        // 🔧 修復：FFmpeg 已經生成了檔案，我們需要移動它到輸出目錄
        console.log('🔄 準備保存 GIF 檔案:', gifResult.filePath);

        try {
          // 使用輸出管理器處理已生成的 GIF 檔案
          saveResult = await window.electronAPI.output.saveGIFFromFile(
            gifResult.filePath,
            this.params.animationType,
            this.params.shape
          );
          console.log('✅ GIF 檔案保存結果:', saveResult);
        } catch (saveError) {
          console.error('❌ GIF 檔案保存失敗:', saveError);
          this.showStatus(`❌ GIF 保存失敗：${saveError.message}`, 'error');
          return;
        }
      } else {
        // 瀏覽器環境或其他情況的處理
        console.error('❌ GIF 生成結果無效:', gifResult);
        this.showStatus('❌ GIF 生成失敗：不支援的環境', 'error');
        return;
      }

      if (saveResult.success) {
        this.updateProgress(100, '完成！');
        this.showStatus(`✅ GIF 生成完成！檔案已保存到用戶目錄`, 'success');

        // 🔧 檢查是否在 Electron 環境中
        if (window.electronAPI && window.electronAPI.showMessageBox) {
          // 顯示成功對話框並提供選項
          const result = await window.electronAPI.showMessageBox({
            type: 'info',
            buttons: ['開啟檔案', '開啟資料夾', '關閉'],
            defaultId: 0,
            message: '🎉 GIF 動畫生成成功！',
            detail: `檔案名稱: ${saveResult.filename}\n檔案大小: ${(saveResult.size / 1024).toFixed(1)} KB\n\n📁 儲存位置:\n${saveResult.path}\n\n💡 提示: 檔案保存在用戶目錄的 Luna-Animations/GIF/ 資料夾中\n\n選擇您要執行的動作：`
          });

          if (result.response === 0) {
            // 開啟檔案
            await window.electronAPI.output.openFile(saveResult.path);
          } else if (result.response === 1) {
            // 🔧 修復：開啟用戶目錄的 GIF 資料夾，而不是應用程式目錄
            await window.electronAPI.output.openGIFFolder();
          }
        } else {
          // 瀏覽器環境下的簡化提示
          console.log('🎉 GIF 動畫生成成功！');
          if (saveResult.filename) {
            console.log(`檔案名稱: ${saveResult.filename}`);
          }
        }

        // 🔧 添加檔案位置提示
        console.log('📁 GIF 檔案保存位置說明:');
        console.log('  用戶目錄: C:\\Users\\[用戶名]\\Luna-Animations\\GIF\\');
        console.log('  不是應用程式目錄: 應用程式安裝目錄下的 Luna-Animations 資料夾');
        if (saveResult && saveResult.filename) {
          console.log('  檔案名稱:', saveResult.filename);
          console.log('  完整路徑:', saveResult.path);
        }
      } else {
        this.showStatus('❌ 保存 GIF 失敗', 'error');
      }

    } catch (error) {
      console.error('FFmpeg 生成 GIF 失敗:', error);
      this.showStatus(`❌ 生成 GIF 時發生錯誤: ${error.message}`, 'error');
    } finally {
      // 重置狀態
      setTimeout(() => {
        this.isGenerating = false;
        this.generateBtn.disabled = false;
        this.generateBtn.textContent = '🎯 直接生成 GIF';
        this.showProgress(false);

        // 重新開始預覽動畫
        this.animationEngine.start();
      }, 3000);
    }
  }



  // 瀏覽器環境下的 PNG 幀保存方案
  savePNGFramesInBrowser(frames) {
    try {
      console.log(`🌐 瀏覽器環境：準備下載 ${frames.length} 個 PNG 幀`);

      // 為每個幀創建下載連結
      frames.forEach((frame, index) => {
        // 將 DataURL 轉換為 Blob
        const base64Data = frame.dataURL.replace(/^data:image\/png;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luna-frame-${String(index + 1).padStart(4, '0')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      this.showStatus(`✅ ${frames.length} 個 PNG 幀已下載`, 'success');
      return {
        success: true,
        frameCount: frames.length,
        message: `${frames.length} 個 PNG 幀已下載`
      };
    } catch (error) {
      console.error('❌ 瀏覽器 PNG 幀保存失敗:', error);
      this.showStatus('❌ PNG 幀保存失敗: ' + error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  // 獲取 GIF 輸出路徑
  async getGIFOutputPath() {
    if (!window.electronAPI) {
      return null;
    }

    try {
      const result = await window.electronAPI.showSaveDialog({
        title: '儲存 GIF 動畫',
        defaultPath: `璐娜動畫_${this.params.shape}_${Date.now()}.gif`,
        filters: [
          { name: 'GIF 檔案', extensions: ['gif'] },
          { name: '所有檔案', extensions: ['*'] }
        ]
      });

      return result.canceled ? null : result.filePath;
    } catch (error) {
      console.error('獲取儲存路徑失敗:', error);
      return null;
    }
  }



  // 顯示/隱藏面板
  showPanel(type) {
    if (type === 'help') {
      this.helpPanel.classList.add('show');
      this.settingsPanel.classList.remove('show');
    } else if (type === 'settings') {
      this.settingsPanel.classList.add('show');
      this.helpPanel.classList.remove('show');
    }
  }

  hidePanel(type) {
    if (type === 'help') {
      this.helpPanel.classList.remove('show');
    } else if (type === 'settings') {
      this.settingsPanel.classList.remove('show');
    }
  }

  // 顯示進度
  showProgress(show) {
    this.progressContainer.style.display = show ? 'block' : 'none';
    if (!show) {
      this.progressFill.style.width = '0%';
      this.progressText.textContent = '';
    }
  }

  // 更新進度
  updateProgress(percent, text) {
    this.progressFill.style.width = percent + '%';
    this.progressText.textContent = text;
  }

  // 顯示狀態訊息
  showStatus(message, type) {
    if (!message) {
      this.status.style.display = 'none';
      return;
    }

    this.status.textContent = message;
    this.status.className = `status-message ${type}`;
    this.status.style.display = 'block';

    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        this.status.style.display = 'none';
      }, 8000);
    }
  }

  // 重設為預設值
  resetToDefaults() {
    this.params = {
      shape: 'circle',
      color: '#ff3b30',
      size: 40,
      filled: true,
      strokeWidth: 4,
      mode: 'loop',
      type: 'bounce',
      speed: 1000,
      duration: 3,
      fps: 15,
      method: 'frames'
    };

    this.updateUI();
    this.updateEngine();
    this.selectMethod('frames', this.methodButtons[0]);
  }
}

// 當 DOM 載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
  window.lunaApp = new LunaAnimationApp();
});
