/**
 * 🚀 璐娜的 GIF 動畫製作器 - 一鍵分發構建
 * 為客戶創建完整的分發安裝包
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 璐娜的 GIF 動畫製作器 - 一鍵分發構建');
console.log('=' .repeat(50));

async function buildDistribution() {
  try {
    console.log('🔧 步驟 1: 構建應用程式...');
    execSync('node build-simple.js', { stdio: 'inherit' });
    
    console.log('🔧 步驟 2: 修復依賴...');
    execSync('node fix-dependencies.js', { stdio: 'inherit' });
    
    console.log('🔧 步驟 3: 創建發布包...');
    execSync('node create-release.js', { stdio: 'inherit' });
    
    console.log('🔧 步驟 4: 創建分發安裝包...');
    execSync('node create-installer.js', { stdio: 'inherit' });
    
    console.log('\n🎉 分發構建完成！');
    
    // 檢查生成的檔案
    const files = [
      '璐娜GIF動畫製作器-安裝包-v1.1.0.zip',
      'release/璐娜GIF動畫製作器-完整版-v1.1.0.zip'
    ];
    
    console.log('\n📦 生成的分發檔案:');
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        console.log(`  ✅ ${file} (${sizeMB} MB)`);
      } else {
        console.log(`  ❌ ${file} (未生成)`);
      }
    });
    
    console.log('\n💡 分發說明:');
    console.log('📦 給客戶的檔案: 璐娜GIF動畫製作器-安裝包-v1.1.0.zip');
    console.log('📋 客戶使用步驟:');
    console.log('  1. 解壓縮 ZIP 檔案');
    console.log('  2. 雙擊 install.bat');
    console.log('  3. 等待自動安裝完成');
    console.log('  4. 使用桌面快捷方式啟動');
    
  } catch (error) {
    console.error('❌ 構建失敗:', error.message);
    process.exit(1);
  }
}

buildDistribution();
