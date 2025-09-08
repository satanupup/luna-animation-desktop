/**
 * 🚀 璐娜的 GIF 動畫製作器 - 創建發布包
 * 將構建結果打包成可分發的壓縮檔案
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌙 璐娜的 GIF 動畫製作器 - 創建發布包');
console.log('=' .repeat(50));

function createRelease() {
  try {
    const appDir = 'dist-simple/璐娜的GIF動畫製作器-win32-x64';
    const version = '1.0.0';
    const releaseDir = 'release';
    
    // 檢查構建目錄是否存在
    if (!fs.existsSync(appDir)) {
      console.error('❌ 找不到構建目錄，請先執行構建');
      process.exit(1);
    }
    
    // 創建發布目錄
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }
    
    console.log('📦 創建發布包...');
    
    // 創建便攜版壓縮檔案
    const portableZip = `${releaseDir}/璐娜GIF動畫製作器-便攜版-v${version}.zip`;
    
    try {
      // 使用 PowerShell 創建 ZIP 檔案
      const command = `Compress-Archive -Path "${appDir}\\*" -DestinationPath "${portableZip}" -Force`;
      execSync(`powershell -Command "${command}"`, { stdio: 'inherit' });
      
      console.log('✅ 便攜版創建完成');
      
      // 檢查檔案大小
      const stats = fs.statSync(portableZip);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`📄 檔案大小: ${sizeMB} MB`);
      
    } catch (error) {
      console.error('❌ 創建壓縮檔案失敗:', error.message);
      console.log('💡 請確保您有 PowerShell 權限');
    }
    
    // 複製使用說明
    const readmeSrc = 'dist-simple/README.txt';
    const readmeDest = `${releaseDir}/使用說明.txt`;
    
    if (fs.existsSync(readmeSrc)) {
      fs.copyFileSync(readmeSrc, readmeDest);
      console.log('📄 已複製使用說明');
    }
    
    // 創建發布說明
    const releaseNotes = `# 璐娜的 GIF 動畫製作器 v${version}

## 📦 發布檔案

### 便攜版 (推薦)
- **檔案**: 璐娜GIF動畫製作器-便攜版-v${version}.zip
- **大小**: ${fs.existsSync(portableZip) ? (fs.statSync(portableZip).size / 1024 / 1024).toFixed(1) + ' MB' : '未知'}
- **使用方法**: 解壓縮後直接執行 .exe 檔案

## ✨ 主要特色

- 🎨 40+ 種形狀選擇
- 🎬 8 種動畫效果
- 🌟 透明背景支援
- 🔧 內建 FFmpeg，無需額外安裝
- 📱 高品質 GIF 輸出
- 🎯 直觀的用戶介面

## 💻 系統需求

- Windows 10 或更新版本
- 4GB RAM (推薦 8GB)
- 200MB 硬碟空間

## 🚀 安裝步驟

1. 下載 璐娜GIF動畫製作器-便攜版-v${version}.zip
2. 解壓縮到任意目錄
3. 執行 "璐娜的GIF動畫製作器.exe"
4. 開始創作您的 GIF 動畫！

## 📁 輸出位置

生成的檔案會自動保存到：
\`C:\\Users\\[您的用戶名]\\Luna-Animations\\\`

- GIF 動畫: Luna-Animations/GIF/
- PNG 幀序列: Luna-Animations/PNG-Frames/
- SVG 檔案: Luna-Animations/SVG/

## 🛠️ 故障排除

**Q: 應用程式無法啟動**
A: 請確保您的 Windows 版本為 10 或更新，並嘗試以系統管理員身分執行

**Q: 找不到生成的 GIF 檔案**
A: 檔案保存在用戶目錄，請檢查 C:\\Users\\[您的用戶名]\\Luna-Animations\\GIF\\

**Q: 需要安裝 FFmpeg 嗎？**
A: 不需要！FFmpeg 已經內建在應用程式中

## 📞 技術支援

如有問題請聯繫技術支援。

---
璐娜的 GIF 動畫製作器 v${version}
讓動畫創作變得簡單而美好 🌙
`;

    fs.writeFileSync(`${releaseDir}/發布說明.md`, releaseNotes, 'utf8');
    console.log('📄 已創建發布說明');
    
    console.log('\n🎉 發布包創建完成！');
    console.log('📁 發布檔案位置:');
    
    const releaseFiles = fs.readdirSync(releaseDir);
    releaseFiles.forEach(file => {
      const filePath = path.join(releaseDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.isFile() ? ` (${(stats.size / 1024 / 1024).toFixed(1)} MB)` : '';
      console.log(`  📄 ${file}${size}`);
    });
    
    console.log('\n💡 分發說明:');
    console.log('  1. 將 release 目錄中的檔案提供給客戶');
    console.log('  2. 客戶無需安裝 FFmpeg 或其他依賴');
    console.log('  3. 支援 Windows 10+ 系統');
    console.log('  4. 解壓縮後即可使用');
    
  } catch (error) {
    console.error('❌ 創建發布包失敗:', error);
    process.exit(1);
  }
}

createRelease();
