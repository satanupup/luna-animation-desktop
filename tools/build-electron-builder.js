/**
 * 🚀 璐娜的 GIF 動畫製作器 - Electron Builder 構建腳本
 * 使用 electron-builder 創建可分發的應用程式，更好的依賴處理
 */

const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');

console.log('🌙 璐娜的 GIF 動畫製作器 - Electron Builder 構建');
console.log('=' .repeat(50));

async function buildApp() {
  try {
    console.log('📦 開始使用 Electron Builder 構建...');
    
    // 構建配置
    const config = {
      appId: 'com.luna.gif-animator',
      productName: '璐娜的GIF動畫製作器',
      directories: {
        output: 'dist-builder'
      },
      files: [
        'src/**/*',
        'assets/**/*',
        'ffmpeg-master-latest-win64-gpl-shared/**/*',
        'node_modules/**/*',
        'package.json'
      ],
      extraResources: [
        {
          from: 'ffmpeg-master-latest-win64-gpl-shared',
          to: 'ffmpeg-master-latest-win64-gpl-shared'
        }
      ],
      win: {
        target: [
          {
            target: 'portable',
            arch: ['x64']
          }
        ],
        sign: false,
        verifyUpdateCodeSignature: false,
        publisherName: 'Luna Animation',
        requestedExecutionLevel: 'asInvoker'
      },
      portable: {
        artifactName: '璐娜GIF動畫製作器-便攜版-v${version}.exe'
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        artifactName: '璐娜GIF動畫製作器-安裝版-v${version}.exe'
      }
    };
    
    console.log('⚙️ 構建配置:');
    console.log(`  產品名稱: ${config.productName}`);
    console.log(`  輸出目錄: ${config.directories.output}`);
    console.log(`  目標平台: Windows x64`);
    console.log(`  目標格式: Portable`);
    
    // 執行構建
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget(),
      config: config
    });
    
    console.log('✅ 構建完成！');
    console.log('📁 輸出檔案:');
    
    // 檢查輸出目錄
    const outputDir = 'dist-builder';
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      files.forEach(file => {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
          console.log(`  📄 ${file} (${sizeMB} MB)`);
        }
      });
    }
    
    console.log('\n🎉 Electron Builder 構建完成！');
    console.log('💡 使用方法:');
    console.log('  1. 檢查 dist-builder 目錄');
    console.log('  2. 執行便攜版 .exe 檔案');
    console.log('  3. 包含完整的依賴和 FFmpeg');
    
  } catch (error) {
    console.error('❌ 構建失敗:', error);
    process.exit(1);
  }
}

// 執行構建
buildApp();
