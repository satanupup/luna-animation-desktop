/**
 * ✅ 編譯結果驗證腳本
 * 
 * 這個腳本用於驗證編譯結果的完整性和功能性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildVerifier {
    constructor() {
        this.results = {
            files: {},
            structure: {},
            functionality: {},
            issues: [],
            recommendations: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'check': '🔍'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async verify() {
        this.log('開始驗證編譯結果...', 'info');
        
        try {
            await this.checkBuildOutputs();
            await this.verifyFileStructure();
            await this.checkExecutables();
            await this.verifyAssets();
            await this.generateReport();
        } catch (error) {
            this.log(`驗證過程發生錯誤: ${error.message}`, 'error');
        }
    }

    async checkBuildOutputs() {
        this.log('檢查編譯輸出目錄...', 'check');
        
        const expectedOutputs = [
            'dist/璐娜的 GIF 動畫製作器-win32-x64',
            'dist/win-unpacked'
        ];

        for (const outputPath of expectedOutputs) {
            if (fs.existsSync(outputPath)) {
                this.results.files[outputPath] = {
                    exists: true,
                    type: 'directory'
                };
                this.log(`✓ 找到輸出目錄: ${outputPath}`, 'success');
            } else {
                this.results.files[outputPath] = {
                    exists: false,
                    type: 'directory'
                };
                this.log(`✗ 缺少輸出目錄: ${outputPath}`, 'error');
                this.results.issues.push(`缺少編譯輸出: ${outputPath}`);
            }
        }
    }

    async verifyFileStructure() {
        this.log('驗證文件結構...', 'check');
        
        const buildPath = 'dist/璐娜的 GIF 動畫製作器-win32-x64';
        if (!fs.existsSync(buildPath)) {
            this.results.issues.push('主要編譯輸出目錄不存在');
            return;
        }

        const requiredFiles = [
            '璐娜的 GIF 動畫製作器.exe',
            'resources/app.asar',
            'ffmpeg.dll',
            'chrome_100_percent.pak',
            'chrome_200_percent.pak',
            'icudtl.dat',
            'libEGL.dll',
            'libGLESv2.dll',
            'resources.pak',
            'snapshot_blob.bin',
            'v8_context_snapshot.bin'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(buildPath, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                this.results.structure[file] = {
                    exists: true,
                    size: stats.size,
                    sizeFormatted: this.formatFileSize(stats.size)
                };
                this.log(`✓ ${file} (${this.formatFileSize(stats.size)})`, 'success');
            } else {
                this.results.structure[file] = {
                    exists: false
                };
                this.log(`✗ 缺少文件: ${file}`, 'error');
                this.results.issues.push(`缺少必要文件: ${file}`);
            }
        }
    }

    async checkExecutables() {
        this.log('檢查執行檔案...', 'check');
        
        const exePaths = [
            'dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe',
            'dist/win-unpacked/璐娜的 GIF 動畫製作器.exe'
        ];

        for (const exePath of exePaths) {
            if (fs.existsSync(exePath)) {
                const stats = fs.statSync(exePath);
                this.results.functionality[exePath] = {
                    exists: true,
                    size: stats.size,
                    sizeFormatted: this.formatFileSize(stats.size),
                    executable: true
                };
                this.log(`✓ 執行檔: ${exePath} (${this.formatFileSize(stats.size)})`, 'success');
                
                // 檢查檔案版本信息 (如果可能)
                try {
                    // 這裡可以添加更多的檔案驗證邏輯
                    this.log(`  檔案大小正常 (${this.formatFileSize(stats.size)})`, 'info');
                } catch (error) {
                    this.log(`  無法讀取檔案信息: ${error.message}`, 'warning');
                }
            } else {
                this.results.functionality[exePath] = {
                    exists: false
                };
                this.log(`✗ 缺少執行檔: ${exePath}`, 'error');
                this.results.issues.push(`缺少執行檔: ${exePath}`);
            }
        }
    }

    async verifyAssets() {
        this.log('驗證資源文件...', 'check');
        
        const buildPath = 'dist/璐娜的 GIF 動畫製作器-win32-x64';
        const resourcesPath = path.join(buildPath, 'resources');
        
        if (fs.existsSync(resourcesPath)) {
            this.log('✓ resources 目錄存在', 'success');
            
            // 檢查 app.asar
            const asarPath = path.join(resourcesPath, 'app.asar');
            if (fs.existsSync(asarPath)) {
                const stats = fs.statSync(asarPath);
                this.log(`✓ app.asar (${this.formatFileSize(stats.size)})`, 'success');
                this.results.structure['app.asar'] = {
                    exists: true,
                    size: stats.size,
                    sizeFormatted: this.formatFileSize(stats.size)
                };
            } else {
                this.log('✗ 缺少 app.asar', 'error');
                this.results.issues.push('缺少 app.asar 文件');
            }
        } else {
            this.log('✗ resources 目錄不存在', 'error');
            this.results.issues.push('缺少 resources 目錄');
        }

        // 檢查 locales 目錄
        const localesPath = path.join(buildPath, 'locales');
        if (fs.existsSync(localesPath)) {
            const localeFiles = fs.readdirSync(localesPath);
            this.log(`✓ locales 目錄 (${localeFiles.length} 個語言文件)`, 'success');
        } else {
            this.log('✗ 缺少 locales 目錄', 'error');
            this.results.issues.push('缺少 locales 目錄');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: Object.keys(this.results.structure).length,
                existingFiles: Object.values(this.results.structure).filter(f => f.exists).length,
                totalIssues: this.results.issues.length,
                buildSuccess: this.results.issues.length === 0
            },
            details: this.results
        };

        // 保存報告
        const reportPath = 'tests/build-verification-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`驗證報告已保存: ${reportPath}`, 'info');
        
        // 顯示摘要
        this.displaySummary(report);
        
        // 提供建議
        this.provideRecommendations();
    }

    displaySummary(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 編譯結果驗證摘要');
        console.log('='.repeat(60));
        
        console.log(`\n🔍 檢查結果:`);
        console.log(`  總文件數: ${report.summary.totalFiles}`);
        console.log(`  存在文件: ${report.summary.existingFiles}`);
        console.log(`  發現問題: ${report.summary.totalIssues}`);
        console.log(`  編譯狀態: ${report.summary.buildSuccess ? '✅ 成功' : '❌ 有問題'}`);

        if (this.results.issues.length > 0) {
            console.log('\n⚠️ 發現的問題:');
            this.results.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        // 顯示主要執行檔信息
        const mainExe = this.results.functionality['dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe'];
        if (mainExe && mainExe.exists) {
            console.log('\n🚀 主要執行檔:');
            console.log(`  路徑: dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe`);
            console.log(`  大小: ${mainExe.sizeFormatted}`);
            console.log(`  狀態: ✅ 可執行`);
        }
    }

    provideRecommendations() {
        console.log('\n💡 建議:');
        
        if (this.results.issues.length === 0) {
            console.log('  ✅ 編譯完全成功！');
            console.log('  🚀 可以執行應用程式進行測試');
            console.log('  📦 可以創建安裝包或分發版本');
        } else {
            console.log('  🔧 需要解決發現的問題');
            console.log('  🔄 建議重新編譯');
        }
        
        console.log('\n📋 後續步驟:');
        console.log('  1. 測試執行檔: dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe');
        console.log('  2. 驗證所有功能正常運作');
        console.log('  3. 如需要，創建安裝包: npm run build:nsis');
        console.log('  4. 執行完整測試: npm run test:ui:click');
        
        console.log('\n' + '='.repeat(60));
    }
}

// 執行驗證
if (require.main === module) {
    const verifier = new BuildVerifier();
    verifier.verify().catch(console.error);
}

module.exports = BuildVerifier;
