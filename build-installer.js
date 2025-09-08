/**
 * 🚀 璐娜的 GIF 動畫製作器 - 構建腳本
 * 自動化構建安裝檔案，包含 FFmpeg
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌙 璐娜的 GIF 動畫製作器 - 構建安裝檔案');
console.log('=' .repeat(50));

// 檢查必要檔案
function checkRequiredFiles() {
  console.log('📋 檢查必要檔案...');
  
  const requiredFiles = [
    'src/main.js',
    'src/app.js',
    'src/preload.js',
    'ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少必要檔案: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ 所有必要檔案都存在');
}

// 清理舊的構建檔案
function cleanBuild() {
  console.log('🧹 清理舊的構建檔案...');
  
  try {
    if (fs.existsSync('dist')) {
      execSync('rmdir /s /q dist', { stdio: 'inherit' });
    }
    console.log('✅ 清理完成');
  } catch (error) {
    console.log('⚠️ 清理失敗，繼續構建...');
  }
}

// 安裝依賴
function installDependencies() {
  console.log('📦 安裝構建依賴...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依賴安裝完成');
  } catch (error) {
    console.error('❌ 依賴安裝失敗:', error.message);
    process.exit(1);
  }
}

// 構建安裝檔案
function buildInstaller() {
  console.log('🔨 構建安裝檔案...');
  
  try {
    // 構建 NSIS 安裝檔案
    console.log('📦 構建 NSIS 安裝檔案...');
    execSync('npm run build:nsis', { stdio: 'inherit' });
    
    // 構建便攜版
    console.log('📦 構建便攜版...');
    execSync('npm run build:portable', { stdio: 'inherit' });
    
    console.log('✅ 構建完成');
  } catch (error) {
    console.error('❌ 構建失敗:', error.message);
    process.exit(1);
  }
}

// 顯示構建結果
function showResults() {
  console.log('\n🎉 構建完成！');
  console.log('=' .repeat(50));
  
  const distDir = 'dist';
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    
    console.log('📁 構建檔案:');
    files.forEach(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`  📄 ${file} (${size} MB)`);
    });
    
    console.log('\n💡 使用說明:');
    console.log('  🔧 安裝版: 雙擊 .exe 檔案安裝到系統');
    console.log('  🎒 便攜版: 直接執行，無需安裝');
    console.log('  📦 包含 FFmpeg: 客戶無需額外安裝');
    
  } else {
    console.log('❌ 找不到構建檔案');
  }
}

// 主函數
function main() {
  try {
    checkRequiredFiles();
    cleanBuild();
    installDependencies();
    buildInstaller();
    showResults();
  } catch (error) {
    console.error('❌ 構建過程發生錯誤:', error.message);
    process.exit(1);
  }
}

// 執行構建
main();
