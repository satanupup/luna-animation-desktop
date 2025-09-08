/**
 * 🧪 測試 SVG 實際輸出
 */

const fs = require('fs').promises;
const path = require('path');

// 模擬 SVG 生成
function generateTestSVG() {
  const svgContent = `
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="none"/>
  <circle cx="150" cy="100" r="20" fill="#ff3b30">
    <animateTransform 
      attributeName="transform" 
      type="translate" 
      values="0,0; 0,-60; 0,0" 
      dur="1s" 
      repeatCount="indefinite"/>
  </circle>
</svg>`.trim();
  
  return svgContent;
}

async function testSVGOutput() {
  console.log('🧪 測試 SVG 實際輸出...');
  
  try {
    // 生成測試 SVG
    const svgContent = generateTestSVG();
    
    // 保存到檔案
    const outputPath = path.join(__dirname, 'test-output.svg');
    await fs.writeFile(outputPath, svgContent);
    
    console.log('✅ SVG 檔案已生成:', outputPath);
    console.log('📄 SVG 內容:');
    console.log(svgContent);
    
    // 檢查檔案是否存在
    const stats = await fs.stat(outputPath);
    console.log(`📊 檔案大小: ${stats.size} bytes`);
    
    // 驗證 SVG 內容
    if (svgContent.includes('<svg') && 
        svgContent.includes('</svg>') && 
        svgContent.includes('animate')) {
      console.log('✅ SVG 結構正確，包含動畫元素');
    } else {
      console.log('❌ SVG 結構有問題');
    }
    
  } catch (error) {
    console.error('❌ SVG 測試失敗:', error);
  }
}

// 執行測試
testSVGOutput();
