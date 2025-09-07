/**
 * 🔍 璐娜的動畫製作器 - 診斷和測試腳本
 * 用於診斷 FFmpeg 和 SVG 問題
 */

console.log('🔍 璐娜的診斷腳本啟動...');

// 診斷環境
function diagnoseEnvironment() {
  console.log('🔍 診斷環境...');

  const results = {
    electronAPI: typeof window.electronAPI !== 'undefined',
    ffmpegHandler: typeof window.FFmpegHandler !== 'undefined',

    animationEngine: typeof window.AnimationEngine !== 'undefined',
    frameGenerator: typeof window.FrameGenerator !== 'undefined',
    outputManager: typeof window.electronAPI?.output !== 'undefined'
  };

  console.log('環境檢查結果:', results);

  const allOK = Object.values(results).every(v => v);
  if (allOK) {
    console.log('✅ 環境檢查通過');
  } else {
    console.log('❌ 環境檢查失敗');
  }

  return results;
}

// 測試 Canvas DataURL 生成
async function testCanvasDataURL() {
  console.log('🧪 測試 Canvas DataURL 生成...');

  try {
    // 創建測試 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // 繪製測試圖形
    ctx.clearRect(0, 0, 300, 200);
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(150, 100, 20, 0, Math.PI * 2);
    ctx.fill();

    // 生成 DataURL
    const dataURL = canvas.toDataURL('image/png');

    // 驗證 DataURL
    if (window.validateDataURL) {
      const isValid = window.validateDataURL(dataURL, 'test');
      console.log('DataURL 驗證結果:', isValid);
    }

    console.log('✅ Canvas DataURL 測試通過');
    console.log('DataURL 長度:', dataURL.length);
    console.log('DataURL 前綴:', dataURL.substring(0, 50) + '...');

    return { success: true, dataURL };
  } catch (error) {
    console.error('❌ Canvas DataURL 測試失敗:', error);
    return { success: false, error: error.message };
  }
}

// SVG 功能已移除
async function testSVGGeneration() {
  console.log('ℹ️ SVG 功能已移除，跳過測試');
  return { success: true, message: 'SVG 功能已移除' };
}

// 測試 FFmpeg 可用性
async function testFFmpegAvailability() {
  console.log('🧪 測試 FFmpeg 可用性...');

  try {
    if (!window.electronAPI?.ffmpeg) {
      throw new Error('FFmpeg API 不存在');
    }

    const result = await window.electronAPI.ffmpeg.checkAvailability();

    if (result.isAvailable) {
      console.log('✅ FFmpeg 可用性測試通過');
      console.log('FFmpeg 路徑:', result.path);
    } else {
      console.log('❌ FFmpeg 不可用');
      console.log('錯誤:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ FFmpeg 可用性測試失敗:', error);
    return { isAvailable: false, error: error.message };
  }
}

// 測試幀生成
async function testFrameGeneration() {
  console.log('🧪 測試幀生成...');

  try {
    if (!window.FrameGenerator) {
      throw new Error('FrameGenerator 不存在');
    }

    // 創建測試 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;

    const frameGenerator = new window.FrameGenerator(canvas);

    const testParams = {
      shape: 'circle',
      color: '#ff3b30',
      size: 40,
      type: 'bounce',
      speed: 1000,
      duration: 1,
      fps: 5  // 只生成 5 幀用於測試
    };

    const frames = await frameGenerator.generateFrames(testParams);

    console.log('✅ 幀生成測試通過');
    console.log('生成幀數:', frames.length);

    // 驗證每個幀
    let validFrames = 0;
    for (let i = 0; i < frames.length; i++) {
      if (window.validateDataURL && window.validateDataURL(frames[i].dataURL, i)) {
        validFrames++;
      }
    }

    console.log('有效幀數:', validFrames, '/', frames.length);

    return { success: true, frameCount: frames.length, validFrames, frames };
  } catch (error) {
    console.error('❌ 幀生成測試失敗:', error);
    return { success: false, error: error.message };
  }
}

// 運行完整診斷
async function runFullDiagnosis() {
  console.log('🔍 開始完整診斷...');

  const results = {
    environment: diagnoseEnvironment(),
    canvasDataURL: await testCanvasDataURL(),
    svgGeneration: await testSVGGeneration(),
    ffmpegAvailability: await testFFmpegAvailability(),
    frameGeneration: await testFrameGeneration()
  };

  console.log('🔍 診斷完成，結果摘要:');
  console.log('環境:', results.environment);
  console.log('Canvas DataURL:', results.canvasDataURL.success ? '✅' : '❌');
  console.log('SVG 生成:', results.svgGeneration.message || (results.svgGeneration.success ? '✅' : '❌'));
  console.log('FFmpeg 可用性:', results.ffmpegAvailability.isAvailable ? '✅' : '❌');
  console.log('幀生成:', results.frameGeneration.success ? '✅' : '❌');

  return results;
}

// 匯出診斷函數
window.lunaDebug = {
  diagnoseEnvironment,
  testCanvasDataURL,
  testSVGGeneration,
  testFFmpegAvailability,
  testFrameGeneration,
  runFullDiagnosis
};

console.log('🔍 診斷腳本載入完成');
console.log('使用方法：');
console.log('  window.lunaDebug.runFullDiagnosis() - 運行完整診斷');
console.log('  window.lunaDebug.testCanvasDataURL() - 測試 Canvas');
console.log('  window.lunaDebug.testSVGGeneration() - SVG 功能已移除');
console.log('  window.lunaDebug.testFFmpegAvailability() - 測試 FFmpeg');
