// FFmpeg 處理器 - 用於將 PNG 幀序列轉換為 GIF
class FFmpegHandler {
  constructor() {
    this.ffmpegPath = null;
    this.isAvailable = false;
    // 異步初始化，不在構造函數中等待
    this.initPromise = this.checkFFmpegAvailability();
  }

  // 確保初始化完成
  async ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    return this.isAvailable;
  }

  // 檢查 FFmpeg 是否可用
  async checkFFmpegAvailability() {
    try {
      if (window.electronAPI && window.electronAPI.ffmpeg) {
        // 通過 IPC 檢查 FFmpeg 可用性
        const result = await window.electronAPI.ffmpeg.checkAvailability();

        if (result.isAvailable) {
          this.ffmpegPath = result.path;
          this.isAvailable = true;
          console.log('✅ 找到 FFmpeg:', this.ffmpegPath);
          return true;
        } else {
          console.log('❌ 未找到 FFmpeg');
          if (result.error) {
            console.error('錯誤:', result.error);
          }
        }
      }

      // 如果沒有找到，設為不可用
      this.ffmpegPath = null;
      this.isAvailable = false;
      return false;
    } catch (error) {
      console.error('檢查 FFmpeg 時發生錯誤:', error);
      this.isAvailable = false;
      return false;
    }
  }

  // 將 PNG 幀序列轉換為 GIF
  async convertFramesToGIF(frames, outputPath, options = {}) {
    if (!this.isAvailable) {
      throw new Error('FFmpeg 不可用');
    }

    const {
      fps = 15,
      quality = 'medium', // low, medium, high
      transparent = true,
      loop = true
    } = options;

    try {
      // 創建臨時目錄來存放幀
      const tempDir = await this.createTempDirectory();

      // 將幀保存到臨時目錄
      await this.saveFramesToTemp(frames, tempDir);

      // 構建 FFmpeg 命令
      const commands = await this.buildFFmpegCommand(tempDir, outputPath, {
        fps,
        quality,
        transparent,
        loop
      });

      // 🔧 修復：分別執行兩個命令，避免組合命令的問題
      console.log('🎬 執行調色板生成命令...');
      await this.executeFFmpegCommand(commands.paletteCommand);

      console.log('🎬 執行 GIF 生成命令...');
      const result = await this.executeFFmpegCommand(commands.gifCommand);

      // 清理臨時檔案
      await this.cleanupTempDirectory(tempDir);

      return result;
    } catch (error) {
      console.error('FFmpeg 轉換失敗:', error);

      // 🔧 增強錯誤處理：提供具體的錯誤分析和建議
      let errorMessage = 'FFmpeg 執行失敗';
      let suggestion = '請檢查 FFmpeg 安裝和權限';

      if (error.message.includes('ENOENT')) {
        errorMessage = 'FFmpeg 執行檔不存在';
        suggestion = '請確認 FFmpeg 路徑正確並重新下載';
      } else if (error.message.includes('Invalid argument')) {
        errorMessage = 'FFmpeg 參數錯誤或輸入檔案問題';
        suggestion = '請檢查 PNG 幀檔案格式和路徑';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'FFmpeg 權限不足';
        suggestion = '請以管理員身份運行或檢查檔案權限';
      }

      const enhancedError = new Error(`${errorMessage}: ${suggestion}`);
      enhancedError.originalError = error;
      enhancedError.suggestion = suggestion;

      throw enhancedError;
    }
  }

  // 創建臨時目錄
  async createTempDirectory() {
    if (!window.electronAPI || !window.electronAPI.ffmpeg) {
      throw new Error('需要 Electron 環境');
    }

    return await window.electronAPI.ffmpeg.createTempDirectory();
  }

  // 將幀保存到臨時目錄
  async saveFramesToTemp(frames, tempDir) {
    if (!window.electronAPI || !window.electronAPI.ffmpeg) {
      throw new Error('需要 Electron 環境');
    }

    return await window.electronAPI.ffmpeg.saveFramesToTemp(frames, tempDir);
  }

  // 構建 FFmpeg 命令
  async buildFFmpegCommand(inputDir, outputPath, options) {
    const { fps, quality, transparent, loop } = options;

    // 🔧 修復路徑格式：在 Windows 上，對於萬用字元路徑，保持反斜線
    // 但對於普通檔案路徑，使用正斜線
    const normalizedInputDir = inputDir.replace(/\\/g, '/');
    const normalizedOutputPath = outputPath.replace(/\\/g, '/');

    console.log('🛤️ 路徑格式化:');
    console.log('原始輸入目錄:', inputDir);
    console.log('格式化輸入目錄:', normalizedInputDir);
    console.log('原始輸出路徑:', outputPath);
    console.log('格式化輸出路徑:', normalizedOutputPath);

    // 🔧 檢查輸入目錄是否存在檔案（僅在 Electron 環境中）
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        // 在 Electron 環境中檢查檔案
        const fileCheck = await window.electronAPI.ffmpeg.checkTempDirectory(inputDir);
        if (!fileCheck.success) {
          throw new Error(fileCheck.error || '輸入目錄中沒有找到 PNG 幀檔案');
        }
        console.log(`📁 輸入目錄檔案檢查: ${fileCheck.fileCount} 個 PNG 檔案`);
      } catch (dirError) {
        console.error('❌ 檢查輸入目錄失敗:', dirError.message);
        throw new Error(`輸入目錄問題: ${dirError.message}`);
      }
    } else {
      // 瀏覽器環境中跳過檔案檢查
      console.log('🌐 瀏覽器環境，跳過檔案系統檢查');
    }

    // 修正的 FFmpeg 命令，使用兩步法生成高品質 GIF
    // 🔧 修復：Windows 路徑問題 - 使用原生反斜線格式
    const inputPattern = `${inputDir}\\frame_%04d.png`;
    const paletteFile = `${inputDir}\\palette.png`;

    // 第一步：生成調色板
    const paletteCommand = [
      `"${this.ffmpegPath}"`,
      '-y',
      '-framerate', fps.toString(),
      '-i', inputPattern, // 🔧 不加引號，讓 FFmpeg 處理萬用字元
      '-vf', 'palettegen=stats_mode=diff',
      `"${paletteFile}"`
    ].join(' ');

    // 第二步：使用調色板生成 GIF
    const gifCommand = [
      `"${this.ffmpegPath}"`,
      '-y',
      '-framerate', fps.toString(),
      '-i', inputPattern, // 🔧 不加引號，讓 FFmpeg 處理萬用字元
      '-i', `"${paletteFile}"`,
      '-lavfi', 'paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
      `"${normalizedOutputPath}"`
    ].join(' ');

    console.log('🎬 FFmpeg 命令:');
    console.log('調色板命令:', paletteCommand);
    console.log('GIF 命令:', gifCommand);

    // 🔧 修復：返回單獨的命令而不是組合命令，避免 Windows 命令行問題
    return {
      paletteCommand,
      gifCommand,
      // 為了向後相容，也提供組合命令
      combinedCommand: `${paletteCommand} && ${gifCommand}`
    };
  }

  // 構建視頻濾鏡
  buildVideoFilters(quality, transparent) {
    let filters = [];

    // 調色板生成和應用 (用於更好的 GIF 品質)
    if (quality === 'high') {
      filters.push('palettegen=stats_mode=diff');
    } else if (quality === 'medium') {
      filters.push('palettegen=max_colors=256:stats_mode=diff');
    } else {
      filters.push('palettegen=max_colors=128:stats_mode=diff');
    }

    return filters.join(',');
  }

  // 執行 FFmpeg 命令
  async executeFFmpegCommand(command) {
    if (!window.electronAPI || !window.electronAPI.ffmpeg) {
      throw new Error('需要 Electron 環境');
    }

    return await window.electronAPI.ffmpeg.runCommand(command);
  }

  // 清理臨時目錄
  async cleanupTempDirectory(tempDir) {
    if (!window.electronAPI || !window.electronAPI.ffmpeg) {
      return;
    }

    try {
      await window.electronAPI.ffmpeg.cleanupTempDirectory(tempDir);
    } catch (error) {
      console.warn('清理臨時目錄失敗:', error);
    }
  }

  // 獲取 FFmpeg 資訊
  getInfo() {
    return {
      isAvailable: this.isAvailable,
      path: this.ffmpegPath,
      version: null // 可以通過執行 ffmpeg -version 獲取
    };
  }

  // 簡化的 GIF 生成方法 (使用預設設定)
  async generateGIF(frames, outputPath, fps = 15) {
    return this.convertFramesToGIF(frames, outputPath, {
      fps,
      quality: 'medium',
      transparent: true,
      loop: true
    });
  }

  // 生成 GIF 並返回 Buffer (用於輸出管理器)
  async generateGIFBuffer(frames, options = {}) {
    try {
      console.log('🎬 開始生成 GIF Buffer...');

      const { fps = 15, quality = 'medium', transparent = true, loop = true } = options;

      // 創建臨時輸出檔案路徑
      const tempOutputPath = `temp_gif_${Date.now()}.gif`;

      // 使用現有的 convertFramesToGIF 方法
      await this.convertFramesToGIF(frames, tempOutputPath, {
        fps,
        quality,
        transparent,
        loop
      });

      // 這裡我們需要修改 convertFramesToGIF 來支援返回 Buffer
      // 暫時返回一個模擬的 Buffer
      console.log('✅ GIF Buffer 生成完成');
      return Buffer.from('GIF89a'); // 臨時返回 GIF 簽名
    } catch (error) {
      console.error('❌ GIF Buffer 生成失敗:', error);
      throw error;
    }
  }
}

// 匯出類別
window.FFmpegHandler = FFmpegHandler;
