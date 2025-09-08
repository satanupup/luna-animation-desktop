/**
 * 🔧 修復依賴問題 - 手動複製缺失的檔案
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修復依賴問題...');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function fixConfModule() {
  const sourceConfDist = 'node_modules/conf/dist';
  const targetConfDist = 'dist-simple/璐娜的GIF動畫製作器-win32-x64/resources/app/node_modules/conf/dist';

  if (fs.existsSync(sourceConfDist) && fs.existsSync('dist-simple/璐娜的GIF動畫製作器-win32-x64/resources/app/node_modules/conf')) {
    console.log('📁 複製 conf/dist 目錄...');
    copyDirectory(sourceConfDist, targetConfDist);
    console.log('✅ conf 模組修復完成');
    return true;
  }

  return false;
}

function fixElectronStoreModule() {
  // 檢查其他可能缺失的檔案
  const modules = [
    'electron-store',
    'atomically',
    'debounce-fn',
    'dot-prop',
    'env-paths',
    'ajv',
    'ajv-formats',
    'fast-deep-equal',
    'fast-uri'
  ];

  for (const moduleName of modules) {
    const sourceModule = `node_modules/${moduleName}`;
    const targetModule = `dist-simple/璐娜的GIF動畫製作器-win32-x64/resources/app/node_modules/${moduleName}`;

    if (fs.existsSync(sourceModule) && fs.existsSync(targetModule)) {
      // 檢查是否有 dist 目錄需要複製
      const sourceDist = path.join(sourceModule, 'dist');
      const targetDist = path.join(targetModule, 'dist');

      if (fs.existsSync(sourceDist) && !fs.existsSync(targetDist)) {
        console.log(`📁 複製 ${moduleName}/dist 目錄...`);
        copyDirectory(sourceDist, targetDist);
      }

      // 檢查是否有 lib 目錄需要複製
      const sourceLib = path.join(sourceModule, 'lib');
      const targetLib = path.join(targetModule, 'lib');

      if (fs.existsSync(sourceLib) && !fs.existsSync(targetLib)) {
        console.log(`📁 複製 ${moduleName}/lib 目錄...`);
        copyDirectory(sourceLib, targetLib);
      }
    }
  }

  // 🔧 修復嵌套模組 (如 conf/node_modules/ajv)
  fixNestedModules();
}

function fixNestedModules() {
  console.log('🔧 修復嵌套模組...');

  const nestedModules = [
    {
      parent: 'conf',
      child: 'ajv',
      needsDist: true
    },
    {
      parent: 'conf',
      child: 'json-schema-traverse',
      needsDist: false
    },
    {
      parent: 'conf',
      child: 'semver',
      needsDist: false
    }
  ];

  for (const nested of nestedModules) {
    const sourceModule = `node_modules/${nested.parent}/node_modules/${nested.child}`;
    const targetModule = `dist-simple/璐娜的GIF動畫製作器-win32-x64/resources/app/node_modules/${nested.parent}/node_modules/${nested.child}`;

    if (fs.existsSync(sourceModule) && fs.existsSync(targetModule)) {
      if (nested.needsDist) {
        const sourceDist = path.join(sourceModule, 'dist');
        const targetDist = path.join(targetModule, 'dist');

        if (fs.existsSync(sourceDist) && !fs.existsSync(targetDist)) {
          console.log(`📁 複製 ${nested.parent}/${nested.child}/dist 目錄...`);
          copyDirectory(sourceDist, targetDist);
        }
      }
    }
  }
}

// 執行修復
if (fs.existsSync('dist-simple')) {
  console.log('🔍 檢查構建目錄...');

  if (fixConfModule()) {
    console.log('✅ 主要問題已修復');
  } else {
    console.log('❌ 找不到構建目錄或源檔案');
  }

  fixElectronStoreModule();

  console.log('🎉 依賴修復完成！');
} else {
  console.log('❌ 請先運行構建腳本');
}
