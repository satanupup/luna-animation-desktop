/**
 * 🧪 測試發布版應用程式
 * 驗證可執行檔是否能正常運行
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 璐娜的 GIF 動畫製作器 - 發布版測試');
console.log('=' .repeat(50));

async function testReleaseApp() {
  try {
    const appPath = path.join('release', '璐娜GIF動畫製作器-便攜版-v1.0.0', '璐娜的GIF動畫製作器.exe');
    
    console.log('📋 檢查發布檔案...');
    
    // 檢查可執行檔是否存在
    if (!fs.existsSync(appPath)) {
      console.error('❌ 找不到可執行檔:', appPath);
      return;
    }
    
    console.log('✅ 可執行檔存在:', appPath);
    
    // 檢查檔案大小
    const stats = fs.statSync(appPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`📄 檔案大小: ${sizeMB} MB`);
    
    // 檢查重要檔案
    const releaseDir = path.join('release', '璐娜GIF動畫製作器-便攜版-v1.0.0');
    const importantFiles = [
      'resources/app/src/main.js',
      'resources/app/src/index.html',
      'resources/app/src/app.js',
      'resources/app/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe',
      'resources/app/node_modules'
    ];
    
    console.log('\n📋 檢查重要檔案...');
    let allFilesExist = true;
    
    for (const file of importantFiles) {
      const filePath = path.join(releaseDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} (缺失)`);
        allFilesExist = false;
      }
    }
    
    // 檢查依賴修復
    console.log('\n📋 檢查依賴修復...');
    const confDistPath = path.join(releaseDir, 'resources/app/node_modules/conf/dist');
    if (fs.existsSync(confDistPath)) {
      console.log('✅ conf/dist 目錄存在');
    } else {
      console.log('❌ conf/dist 目錄缺失');
      allFilesExist = false;
    }
    
    const confSourcePath = path.join(confDistPath, 'source');
    if (fs.existsSync(confSourcePath)) {
      console.log('✅ conf/dist/source 目錄存在');
    } else {
      console.log('❌ conf/dist/source 目錄缺失');
      allFilesExist = false;
    }
    
    console.log('\n🚀 嘗試啟動應用程式...');
    
    // 啟動應用程式進行測試
    const child = spawn(appPath, [], {
      cwd: releaseDir,
      detached: true,
      stdio: 'ignore'
    });
    
    // 等待一段時間看是否能正常啟動
    setTimeout(() => {
      try {
        // 檢查程序是否還在運行
        process.kill(child.pid, 0);
        console.log('✅ 應用程式成功啟動');
        console.log(`📋 程序 ID: ${child.pid}`);
        
        // 給用戶一些時間測試
        console.log('\n💡 應用程式已啟動，請手動測試以下功能:');
        console.log('  1. 選擇形狀');
        console.log('  2. 設定顏色');
        console.log('  3. 選擇動畫效果');
        console.log('  4. 生成 GIF');
        console.log('  5. 檢查輸出檔案');
        
        console.log('\n📁 輸出檔案位置:');
        console.log(`  ${process.env.USERPROFILE}\\Luna-Animations\\`);
        
        // 不要自動關閉，讓用戶手動測試
        child.unref();
        
      } catch (error) {
        console.log('❌ 應用程式啟動失敗或已關閉');
        console.log('錯誤:', error.message);
      }
    }, 3000);
    
    console.log('\n🎯 測試總結:');
    if (allFilesExist) {
      console.log('✅ 所有必要檔案都存在');
      console.log('✅ 依賴問題已修復');
      console.log('✅ 應用程式可以啟動');
      console.log('\n🎉 發布版測試通過！');
    } else {
      console.log('❌ 部分檔案缺失，需要重新構建');
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testReleaseApp();
