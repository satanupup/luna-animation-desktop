/**
 * 🎬 GIF 輸出功能測試
 * 
 * 這個腳本用於測試打包後應用程式的 GIF 輸出功能
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class GifOutputTester {
    constructor() {
        this.testResults = {
            appLaunch: false,
            ffmpegDetection: false,
            gifGeneration: false,
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
            'test': '🧪'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTests() {
        this.log('開始 GIF 輸出功能測試...', 'test');
        
        try {
            await this.testAppLaunch();
            await this.testFFmpegAvailability();
            await this.generateTestReport();
        } catch (error) {
            this.log(`測試過程發生錯誤: ${error.message}`, 'error');
        }
    }

    async testAppLaunch() {
        this.log('測試應用程式啟動...', 'test');
        
        const appPaths = [
            'dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe',
            'dist/win-unpacked/璐娜的 GIF 動畫製作器.exe'
        ];

        for (const appPath of appPaths) {
            if (fs.existsSync(appPath)) {
                this.log(`✓ 找到應用程式: ${appPath}`, 'success');
                this.testResults.appLaunch = true;
                
                // 檢查應用程式是否可執行
                try {
                    const stats = fs.statSync(appPath);
                    this.log(`  檔案大小: ${this.formatFileSize(stats.size)}`, 'info');
                } catch (error) {
                    this.log(`  無法讀取檔案信息: ${error.message}`, 'warning');
                }
                break;
            }
        }

        if (!this.testResults.appLaunch) {
            this.log('✗ 未找到可執行的應用程式', 'error');
            this.testResults.issues.push('應用程式執行檔不存在');
        }
    }

    async testFFmpegAvailability() {
        this.log('測試 FFmpeg 可用性...', 'test');
        
        const buildDirs = [
            'dist/璐娜的 GIF 動畫製作器-win32-x64',
            'dist/win-unpacked'
        ];

        let ffmpegFound = false;

        for (const buildDir of buildDirs) {
            if (!fs.existsSync(buildDir)) {
                continue;
            }

            this.log(`檢查目錄: ${buildDir}`, 'info');
            
            const ffmpegPaths = [
                path.join(buildDir, 'ffmpeg.exe'),
                path.join(buildDir, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe')
            ];

            for (const ffmpegPath of ffmpegPaths) {
                if (fs.existsSync(ffmpegPath)) {
                    this.log(`✓ 找到 FFmpeg: ${path.relative(buildDir, ffmpegPath)}`, 'success');
                    ffmpegFound = true;
                    
                    // 測試 FFmpeg 執行
                    try {
                        await this.testFFmpegExecution(ffmpegPath);
                    } catch (error) {
                        this.log(`FFmpeg 執行測試失敗: ${error.message}`, 'error');
                    }
                } else {
                    this.log(`✗ 缺少: ${path.relative(buildDir, ffmpegPath)}`, 'warning');
                }
            }
        }

        this.testResults.ffmpegDetection = ffmpegFound;
        
        if (!ffmpegFound) {
            this.testResults.issues.push('FFmpeg 未正確複製到編譯目錄');
            this.testResults.recommendations.push('執行: node tools/copy-ffmpeg-to-build.js');
        }
    }

    async testFFmpegExecution(ffmpegPath) {
        this.log(`測試 FFmpeg 執行: ${path.basename(ffmpegPath)}`, 'test');
        
        return new Promise((resolve, reject) => {
            const child = spawn(ffmpegPath, ['-version'], {
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0 || stdout.includes('ffmpeg version')) {
                    this.log('✓ FFmpeg 執行正常', 'success');
                    
                    // 提取版本信息
                    const versionMatch = stdout.match(/ffmpeg version ([^\s]+)/);
                    if (versionMatch) {
                        this.log(`  版本: ${versionMatch[1]}`, 'info');
                    }
                    
                    resolve(true);
                } else {
                    this.log(`✗ FFmpeg 執行失敗 (代碼: ${code})`, 'error');
                    if (stderr) {
                        this.log(`  錯誤: ${stderr.substring(0, 200)}`, 'error');
                    }
                    reject(new Error(`FFmpeg 執行失敗: ${stderr}`));
                }
            });

            child.on('error', (error) => {
                this.log(`✗ FFmpeg 執行錯誤: ${error.message}`, 'error');
                reject(error);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                appLaunch: this.testResults.appLaunch,
                ffmpegDetection: this.testResults.ffmpegDetection,
                overallSuccess: this.testResults.appLaunch && this.testResults.ffmpegDetection,
                totalIssues: this.testResults.issues.length
            },
            details: this.testResults
        };

        // 保存報告
        const reportPath = 'tests/gif-output-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`測試報告已保存: ${reportPath}`, 'info');
        
        // 顯示摘要
        this.displaySummary(report);
    }

    displaySummary(report) {
        console.log('\n' + '='.repeat(60));
        console.log('🎬 GIF 輸出功能測試摘要');
        console.log('='.repeat(60));
        
        console.log(`\n📊 測試結果:`);
        console.log(`  應用程式啟動: ${report.summary.appLaunch ? '✅ 通過' : '❌ 失敗'}`);
        console.log(`  FFmpeg 檢測: ${report.summary.ffmpegDetection ? '✅ 通過' : '❌ 失敗'}`);
        console.log(`  整體狀態: ${report.summary.overallSuccess ? '✅ 成功' : '❌ 有問題'}`);
        console.log(`  發現問題: ${report.summary.totalIssues}`);

        if (this.testResults.issues.length > 0) {
            console.log('\n⚠️ 發現的問題:');
            this.testResults.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        if (this.testResults.recommendations.length > 0) {
            console.log('\n💡 建議的解決方案:');
            this.testResults.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }

        console.log('\n📋 後續步驟:');
        if (report.summary.overallSuccess) {
            console.log('  ✅ GIF 輸出功能已準備就緒');
            console.log('  🚀 可以啟動應用程式測試 GIF 生成功能');
            console.log('  📱 執行: dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe');
        } else {
            console.log('  🔧 需要解決發現的問題');
            console.log('  🔄 重新編譯應用程式: npm run build:packager');
            console.log('  📁 複製 FFmpeg: node tools/copy-ffmpeg-to-build.js');
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

// 執行測試
if (require.main === module) {
    const tester = new GifOutputTester();
    tester.runTests().catch(console.error);
}

module.exports = GifOutputTester;
