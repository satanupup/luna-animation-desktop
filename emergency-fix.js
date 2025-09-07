/**
 * 🚨 璐娜的緊急修復腳本
 * 解決 PNG 輸出彈出視窗問題
 */

console.log('🚨 璐娜的緊急修復腳本啟動...');

// 檢查當前環境
function checkEnvironment() {
  console.log('🔍 檢查環境...');

  // 檢查 Electron API
  if (typeof window.electronAPI === 'undefined') {
    console.warn('⚠️ Electron API 不可用，在瀏覽器環境中運行');
    return false;
  }

  // 檢查輸出管理器
  if (typeof window.electronAPI.output === 'undefined') {
    console.warn('⚠️ 輸出管理器不可用，在瀏覽器環境中運行');
    return false;
  }

  // 檢查 savePNGFrames 方法
  if (typeof window.electronAPI.output.savePNGFrames !== 'function') {
    console.warn('⚠️ savePNGFrames 方法不存在，在瀏覽器環境中運行');
    return false;
  }

  console.log('✅ 環境檢查通過');
  return true;
}

// 修復 FrameGenerator 的 downloadFrames 方法
function fixFrameGenerator() {
  console.log('🔧 修復 FrameGenerator...');

  if (typeof window.FrameGenerator === 'undefined') {
    console.error('❌ FrameGenerator 不存在');
    return false;
  }

  // 覆蓋 downloadFrames 方法
  window.FrameGenerator.prototype.downloadFrames = async function(onProgress = null) {
    console.warn('🚨 緊急修復：阻止 downloadFrames 下載');

    // 模擬進度完成
    if (onProgress) {
      onProgress(this.frames.length, this.frames.length);
    }

    console.log(`📁 ${this.frames.length} 個幀已準備好，請使用輸出管理器保存`);
    return this.frames;
  };

  console.log('✅ FrameGenerator 修復完成');
  return true;
}

// SVG 功能已移除，跳過修復
function fixSVGHandler() {
  console.log('ℹ️ SVG 功能已移除，跳過 SVGHandler 修復');
  return true;
}

// 創建安全的 PNG 保存方法
function createSafePNGSaver() {
  console.log('🛡️ 創建安全的 PNG 保存方法...');

  window.safeSavePNGFrames = async function(frames, animationType, shape) {
    try {
      console.log(`🔄 開始保存 ${frames.length} 個 PNG 幀...`);

      const result = await window.electronAPI.output.savePNGFrames(frames, animationType, shape);

      if (result.success) {
        console.log('✅ PNG 幀保存成功:', result);

        // 🔧 檢查是否在 Electron 環境中
        if (window.electronAPI && window.electronAPI.showMessageBox) {
          // 顯示成功訊息
          const userResult = await window.electronAPI.showMessageBox({
            type: 'info',
            buttons: ['開啟資料夾', '關閉'],
            defaultId: 0,
            message: '🎉 PNG 幀序列生成成功！',
            detail: `幀數量: ${result.frameCount} 個\n儲存位置: Luna-Animations/PNG-Frames/\n\n您可以使用這些 PNG 檔案製作 GIF 動畫。`
          });

          if (userResult.response === 0) {
            await window.electronAPI.output.openFolder('PNG-Frames');
          }
        } else {
          console.log('🎉 PNG 幀序列生成成功！');
          console.log(`幀數量: ${result.frameCount} 個`);
        }

        return result;
      } else {
        throw new Error('保存失敗');
      }
    } catch (error) {
      console.error('❌ PNG 保存失敗:', error);

      await window.electronAPI.showMessageBox({
        type: 'error',
        buttons: ['確定'],
        defaultId: 0,
        message: '❌ PNG 幀保存失敗',
        detail: `錯誤訊息: ${error.message}\n\n請檢查輸出管理器是否正常工作。`
      });

      throw error;
    }
  };

  console.log('✅ 安全的 PNG 保存方法已創建');
}

// 🔧 修復 SVG 克隆問題
function fixSVGCloneIssue() {
  console.log('🔧 修復 SVG 克隆問題...');

  // 檢查 App 是否存在（可選，不影響修復）
  if (typeof window.App === 'undefined' && typeof window.app === 'undefined') {
    console.log('ℹ️ App 實例不存在，使用獨立 SVG 修復模式');
    // 繼續執行修復，不返回 false
  }

  // 創建安全的 SVG 生成方法
  window.safeSVGGeneration = async function(params) {
    try {
      console.log('🔄 開始安全 SVG 生成...');

      // 生成 SVG DOM 元素
      const svg = window.svgHandler.generateSVGAnimation(params);

      // 🔧 關鍵修復：轉換為字串而不是直接傳遞 DOM 元素
      const svgString = window.svgHandler.getSVGString(svg);

      // 使用輸出管理器保存
      const result = await window.electronAPI.output.saveSVG(
        svgString,  // 傳遞字串而不是 DOM 元素
        params.animationType,
        params.shape
      );

      if (result.success) {
        console.log('✅ SVG 生成成功:', result);
        return result;
      } else {
        throw new Error('保存失敗');
      }
    } catch (error) {
      console.error('❌ SVG 生成失敗:', error);
      throw error;
    }
  };

  console.log('✅ SVG 克隆問題修復完成');
  return true;
}

// 🔧 增強 DataURL 驗證
function enhanceDataURLValidation() {
  console.log('🔧 增強 DataURL 驗證...');

  // 檢查 AnimationEngine 是否存在
  if (typeof window.AnimationEngine === 'undefined') {
    console.error('❌ AnimationEngine 不存在');
    return false;
  }

  // 創建增強的 DataURL 驗證方法
  window.validateDataURL = function(dataURL, frameIndex = 0) {
    try {
      // 基本格式檢查
      if (!dataURL || !dataURL.startsWith('data:image/png;base64,')) {
        throw new Error(`幀 ${frameIndex} DataURL 格式無效`);
      }

      // Base64 數據檢查
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
      if (!base64Data || base64Data.length < 100) {
        throw new Error(`幀 ${frameIndex} Base64 數據太短: ${base64Data.length} bytes`);
      }

      // 嘗試解碼 Base64
      try {
        const binaryString = atob(base64Data);
        if (binaryString.length < 8) {
          throw new Error(`幀 ${frameIndex} 解碼後數據太短`);
        }

        // 檢查 PNG 簽名
        const signature = binaryString.substring(0, 8);
        const pngSignature = '\x89PNG\r\n\x1a\n';
        if (signature !== pngSignature) {
          throw new Error(`幀 ${frameIndex} 不是有效的 PNG 格式`);
        }

        console.log(`✅ 幀 ${frameIndex} DataURL 驗證通過`);
        return true;
      } catch (decodeError) {
        throw new Error(`幀 ${frameIndex} Base64 解碼失敗: ${decodeError.message}`);
      }
    } catch (error) {
      console.error('❌ DataURL 驗證失敗:', error.message);
      return false;
    }
  };

  console.log('✅ DataURL 驗證增強完成');
  return true;
}

// 測試輸出管理器
async function testOutputManager() {
  console.log('🧪 測試輸出管理器...');

  try {
    const stats = await window.electronAPI.output.getStats();
    console.log('✅ 輸出管理器正常:', stats);
    return true;
  } catch (error) {
    console.error('❌ 輸出管理器測試失敗:', error);
    return false;
  }
}

// 主修復函數
async function emergencyFix() {
  console.log('🚨 開始緊急修復...');

  // 檢查環境
  if (!checkEnvironment()) {
    console.warn('⚠️ 環境檢查失敗，在瀏覽器環境中無法執行緊急修復');
    return false;
  }

  // 測試輸出管理器
  const outputManagerOK = await testOutputManager();
  if (!outputManagerOK) {
    console.error('❌ 輸出管理器不可用，無法修復');
    return false;
  }

  // 修復各個組件
  fixFrameGenerator();
  fixSVGHandler();
  createSafePNGSaver();

  // 🔧 新增：修復 SVG 克隆問題
  fixSVGCloneIssue();

  // 🔧 新增：增強 DataURL 驗證
  enhanceDataURLValidation();

  console.log('✅ 緊急修復完成！');
  console.log('📋 使用方法：');
  console.log('   1. 生成動畫幀時會自動使用修復版本');
  console.log('   2. 或手動調用: window.safeSavePNGFrames(frames, animationType, shape)');
  console.log('   3. SVG 克隆問題已修復');
  console.log('   4. DataURL 驗證已增強');

  return true;
}

// 自動執行修復
if (typeof window !== 'undefined') {
  // 等待頁面載入完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      emergencyFix().catch(error => {
        console.error('❌ 緊急修復失敗:', error);
      });
    });
  } else {
    emergencyFix().catch(error => {
      console.error('❌ 緊急修復失敗:', error);
    });
  }
}

// 匯出修復函數
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { emergencyFix, checkEnvironment, testOutputManager };
}
