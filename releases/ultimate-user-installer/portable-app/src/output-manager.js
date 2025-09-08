/**
 * 🗂️ 璐娜的 GIF 動畫製作器 - 輸出管理器
 * 統一管理所有輸出檔案，提供更好的用戶體驗
 */

const path = require('path');
const fs = require('fs');
const { shell } = require('electron');

class OutputManager {
  constructor() {
    this.appDir = process.cwd();
    this.outputDir = path.join(this.appDir, 'Luna-Animations');
    this.initializeOutputDirectory();
  }

  /**
   * 初始化輸出目錄
   */
  initializeOutputDirectory() {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
        console.log('✅ 創建輸出目錄:', this.outputDir);
      }

      // 創建子目錄
      const subDirs = ['GIF', 'SVG', 'PNG-Frames'];
      subDirs.forEach(dir => {
        const subDirPath = path.join(this.outputDir, dir);
        if (!fs.existsSync(subDirPath)) {
          fs.mkdirSync(subDirPath, { recursive: true });
        }
      });

      console.log('📁 輸出目錄結構已準備完成');
    } catch (error) {
      console.error('❌ 初始化輸出目錄失敗:', error);
    }
  }

  /**
   * 獲取輸出檔案路徑
   */
  getOutputPath(type, filename) {
    const typeMap = {
      'gif': 'GIF',
      'svg': 'SVG',
      'png': 'PNG-Frames'
    };

    const subDir = typeMap[type.toLowerCase()] || type;
    return path.join(this.outputDir, subDir, filename);
  }

  /**
   * 生成唯一的檔案名
   */
  generateUniqueFilename(baseName, extension, type) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .substring(0, 19);
    
    const filename = `${baseName}_${timestamp}.${extension}`;
    return this.getOutputPath(type, filename);
  }

  /**
   * 保存 GIF 檔案
   */
  async saveGIF(buffer, animationType, shape) {
    try {
      const baseName = `璐娜動畫_${shape}_${animationType}`;
      const outputPath = this.generateUniqueFilename(baseName, 'gif', 'gif');
      
      await fs.promises.writeFile(outputPath, buffer);
      
      const result = {
        success: true,
        path: outputPath,
        filename: path.basename(outputPath),
        size: buffer.length,
        type: 'GIF'
      };

      console.log('✅ GIF 檔案已保存:', outputPath);
      return result;
    } catch (error) {
      console.error('❌ 保存 GIF 檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 保存 SVG 檔案
   */
  async saveSVG(svgContent, animationType, shape) {
    try {
      const baseName = `璐娜動畫_${shape}_${animationType}`;
      const outputPath = this.generateUniqueFilename(baseName, 'svg', 'svg');
      
      await fs.promises.writeFile(outputPath, svgContent, 'utf8');
      
      const result = {
        success: true,
        path: outputPath,
        filename: path.basename(outputPath),
        size: svgContent.length,
        type: 'SVG'
      };

      console.log('✅ SVG 檔案已保存:', outputPath);
      return result;
    } catch (error) {
      console.error('❌ 保存 SVG 檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 保存 PNG 幀序列
   */
  async savePNGFrames(frames, animationType, shape) {
    try {
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .substring(0, 19);
      
      const frameDir = path.join(this.outputDir, 'PNG-Frames', `${shape}_${animationType}_${timestamp}`);
      
      if (!fs.existsSync(frameDir)) {
        fs.mkdirSync(frameDir, { recursive: true });
      }

      const savedFrames = [];
      
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const filename = `frame_${i.toString().padStart(4, '0')}.png`;
        const framePath = path.join(frameDir, filename);

        // 將 DataURL 轉換為 Buffer
        const base64Data = frame.dataURL.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        await fs.promises.writeFile(framePath, buffer);
        savedFrames.push({
          filename,
          path: framePath,
          size: buffer.length
        });
      }

      const result = {
        success: true,
        frameDir,
        frameCount: frames.length,
        frames: savedFrames,
        type: 'PNG-Frames'
      };

      console.log(`✅ ${frames.length} 個 PNG 幀已保存到:`, frameDir);
      return result;
    } catch (error) {
      console.error('❌ 保存 PNG 幀失敗:', error);
      throw error;
    }
  }

  /**
   * 開啟輸出資料夾
   */
  async openOutputFolder(subFolder = null) {
    try {
      const targetPath = subFolder ? 
        path.join(this.outputDir, subFolder) : 
        this.outputDir;
      
      await shell.openPath(targetPath);
      console.log('📂 已開啟輸出資料夾:', targetPath);
      return true;
    } catch (error) {
      console.error('❌ 開啟輸出資料夾失敗:', error);
      return false;
    }
  }

  /**
   * 開啟特定檔案
   */
  async openFile(filePath) {
    try {
      await shell.openPath(filePath);
      console.log('📄 已開啟檔案:', filePath);
      return true;
    } catch (error) {
      console.error('❌ 開啟檔案失敗:', error);
      return false;
    }
  }

  /**
   * 獲取輸出統計
   */
  getOutputStats() {
    try {
      const stats = {
        outputDir: this.outputDir,
        totalFiles: 0,
        byType: {
          GIF: 0,
          SVG: 0,
          'PNG-Frames': 0
        }
      };

      const subDirs = ['GIF', 'SVG', 'PNG-Frames'];
      
      subDirs.forEach(dir => {
        const dirPath = path.join(this.outputDir, dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          stats.byType[dir] = files.length;
          stats.totalFiles += files.length;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ 獲取輸出統計失敗:', error);
      return null;
    }
  }

  /**
   * 清理舊檔案（可選功能）
   */
  async cleanupOldFiles(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let cleanedCount = 0;
      const subDirs = ['GIF', 'SVG', 'PNG-Frames'];

      for (const dir of subDirs) {
        const dirPath = path.join(this.outputDir, dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime < cutoffDate) {
              if (stats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true });
              } else {
                fs.unlinkSync(filePath);
              }
              cleanedCount++;
            }
          }
        }
      }

      console.log(`🧹 已清理 ${cleanedCount} 個舊檔案`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ 清理舊檔案失敗:', error);
      return 0;
    }
  }

  /**
   * 創建輸出摘要
   */
  createOutputSummary(results) {
    const summary = {
      timestamp: new Date().toLocaleString('zh-TW'),
      outputs: results,
      totalSize: results.reduce((sum, result) => sum + (result.size || 0), 0),
      outputDir: this.outputDir
    };

    return summary;
  }
}

module.exports = OutputManager;
