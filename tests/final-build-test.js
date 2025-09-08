/**
 * 🎯 最終編譯測試
 * 
 * 這個腳本執行完整的編譯、修復和驗證流程
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FinalBuildTest {
    constructor() {
        this.results = {
            steps: [],
            issues: [],
            success: false
        };
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'step': '🔄',
            'final': '🎯'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runFinalTest() {
        this.log('開始最終編譯測試流程...', 'final');
        
        try {
            await this.step1_CleanEnvironment();
            await this.step2_BuildApplication();
            await this.step3_CopyFFmpeg();
            await this.step4_VerifyBuild();
            await this.step5_TestGifOutput();
            await this.step6_FinalValidation();
            
            this.results.success = this.results.issues.length === 0;
            await this.generateFinalReport();
            
        } catch (error) {
            this.log(`測試流程發生錯誤: ${error.message}`, 'error');
            this.results.issues.push(`流程錯誤: ${error.message}`);
        }
    }

    async step1_CleanEnvironment() {
        this.log('步驟 1: 清理編譯環境...', 'step');
        
        try {
            // 清理舊的編譯文件
            const dirsToClean = ['dist'];
            for (const dir of dirsToClean) {
                if (fs.existsSync(dir)) {
                    fs.rmSync(dir, { recursive: true, force: true });
                    this.log(`✓ 清理目錄: ${dir}`, 'success');
                }
            }
            
            this.results.steps.push({ step: 1, name: '清理環境', status: 'success' });
        } catch (error) {
            this.log(`清理環境失敗: ${error.message}`, 'error');
            this.results.issues.push(`清理環境失敗: ${error.message}`);
            this.results.steps.push({ step: 1, name: '清理環境', status: 'failed', error: error.message });
        }
    }

    async step2_BuildApplication() {
        this.log('步驟 2: 編譯應用程式...', 'step');
        
        try {
            this.log('執行 electron-packager 編譯...', 'info');
            execSync('npm run build:packager', { stdio: 'inherit' });
            
            // 檢查編譯結果
            const buildPath = 'dist/璐娜的 GIF 動畫製作器-win32-x64';
            if (fs.existsSync(buildPath)) {
                this.log('✓ 應用程式編譯成功', 'success');
                this.results.steps.push({ step: 2, name: '編譯應用程式', status: 'success' });
            } else {
                throw new Error('編譯輸出目錄不存在');
            }
            
        } catch (error) {
            this.log(`應用程式編譯失敗: ${error.message}`, 'error');
            this.results.issues.push(`應用程式編譯失敗: ${error.message}`);
            this.results.steps.push({ step: 2, name: '編譯應用程式', status: 'failed', error: error.message });
        }
    }

    async step3_CopyFFmpeg() {
        this.log('步驟 3: 複製 FFmpeg...', 'step');
        
        try {
            execSync('npm run copy:ffmpeg', { stdio: 'inherit' });
            
            // 驗證 FFmpeg 複製
            const ffmpegPath = 'dist/璐娜的 GIF 動畫製作器-win32-x64/ffmpeg.exe';
            if (fs.existsSync(ffmpegPath)) {
                this.log('✓ FFmpeg 複製成功', 'success');
                this.results.steps.push({ step: 3, name: '複製 FFmpeg', status: 'success' });
            } else {
                throw new Error('FFmpeg 複製失敗');
            }
            
        } catch (error) {
            this.log(`FFmpeg 複製失敗: ${error.message}`, 'error');
            this.results.issues.push(`FFmpeg 複製失敗: ${error.message}`);
            this.results.steps.push({ step: 3, name: '複製 FFmpeg', status: 'failed', error: error.message });
        }
    }

    async step4_VerifyBuild() {
        this.log('步驟 4: 驗證編譯結果...', 'step');
        
        try {
            execSync('npm run verify:build', { stdio: 'inherit' });
            this.log('✓ 編譯結果驗證完成', 'success');
            this.results.steps.push({ step: 4, name: '驗證編譯結果', status: 'success' });
            
        } catch (error) {
            this.log(`編譯結果驗證失敗: ${error.message}`, 'error');
            this.results.issues.push(`編譯結果驗證失敗: ${error.message}`);
            this.results.steps.push({ step: 4, name: '驗證編譯結果', status: 'failed', error: error.message });
        }
    }

    async step5_TestGifOutput() {
        this.log('步驟 5: 測試 GIF 輸出功能...', 'step');
        
        try {
            execSync('npm run test:gif:output', { stdio: 'inherit' });
            this.log('✓ GIF 輸出功能測試完成', 'success');
            this.results.steps.push({ step: 5, name: '測試 GIF 輸出', status: 'success' });
            
        } catch (error) {
            this.log(`GIF 輸出功能測試失敗: ${error.message}`, 'error');
            this.results.issues.push(`GIF 輸出功能測試失敗: ${error.message}`);
            this.results.steps.push({ step: 5, name: '測試 GIF 輸出', status: 'failed', error: error.message });
        }
    }

    async step6_FinalValidation() {
        this.log('步驟 6: 最終驗證...', 'step');
        
        try {
            const validationResults = {
                appExists: false,
                ffmpegExists: false,
                appSize: 0,
                ffmpegSize: 0
            };

            // 檢查主要文件
            const appPath = 'dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe';
            const ffmpegPath = 'dist/璐娜的 GIF 動畫製作器-win32-x64/ffmpeg.exe';

            if (fs.existsSync(appPath)) {
                validationResults.appExists = true;
                validationResults.appSize = fs.statSync(appPath).size;
                this.log(`✓ 主程式存在 (${this.formatFileSize(validationResults.appSize)})`, 'success');
            } else {
                this.results.issues.push('主程式文件不存在');
            }

            if (fs.existsSync(ffmpegPath)) {
                validationResults.ffmpegExists = true;
                validationResults.ffmpegSize = fs.statSync(ffmpegPath).size;
                this.log(`✓ FFmpeg 存在 (${this.formatFileSize(validationResults.ffmpegSize)})`, 'success');
            } else {
                this.results.issues.push('FFmpeg 文件不存在');
            }

            if (validationResults.appExists && validationResults.ffmpegExists) {
                this.log('✓ 最終驗證通過', 'success');
                this.results.steps.push({ step: 6, name: '最終驗證', status: 'success', details: validationResults });
            } else {
                throw new Error('最終驗證失敗');
            }
            
        } catch (error) {
            this.log(`最終驗證失敗: ${error.message}`, 'error');
            this.results.issues.push(`最終驗證失敗: ${error.message}`);
            this.results.steps.push({ step: 6, name: '最終驗證', status: 'failed', error: error.message });
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async generateFinalReport() {
        const duration = Date.now() - this.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${(duration / 1000).toFixed(2)}s`,
            summary: {
                totalSteps: this.results.steps.length,
                successfulSteps: this.results.steps.filter(s => s.status === 'success').length,
                failedSteps: this.results.steps.filter(s => s.status === 'failed').length,
                totalIssues: this.results.issues.length,
                overallSuccess: this.results.success
            },
            details: this.results
        };

        // 保存報告
        const reportPath = 'tests/final-build-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`最終測試報告已保存: ${reportPath}`, 'info');
        
        // 顯示摘要
        this.displayFinalSummary(report);
    }

    displayFinalSummary(report) {
        console.log('\n' + '='.repeat(80));
        console.log('🎯 最終編譯測試摘要報告');
        console.log('='.repeat(80));
        
        console.log(`\n⏱️ 測試時間: ${report.duration}`);
        console.log(`📊 步驟統計: ${report.summary.successfulSteps}/${report.summary.totalSteps} 成功`);
        console.log(`🔍 發現問題: ${report.summary.totalIssues}`);
        console.log(`🎯 整體結果: ${report.summary.overallSuccess ? '✅ 成功' : '❌ 失敗'}`);

        console.log('\n📋 步驟詳情:');
        this.results.steps.forEach((step, index) => {
            const status = step.status === 'success' ? '✅' : '❌';
            console.log(`  ${step.step}. ${step.name}: ${status}`);
            if (step.error) {
                console.log(`     錯誤: ${step.error}`);
            }
        });

        if (this.results.issues.length > 0) {
            console.log('\n⚠️ 發現的問題:');
            this.results.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        console.log('\n🚀 後續步驟:');
        if (report.summary.overallSuccess) {
            console.log('  ✅ 編譯和修復完全成功！');
            console.log('  🎬 GIF 輸出功能已修復');
            console.log('  📱 可以啟動應用程式: dist/璐娜的 GIF 動畫製作器-win32-x64/璐娜的 GIF 動畫製作器.exe');
            console.log('  🧪 執行 UI 測試: npm run test:ui:click');
        } else {
            console.log('  🔧 需要解決發現的問題');
            console.log('  🔄 檢查錯誤訊息並重新執行相關步驟');
        }
        
        console.log('\n' + '='.repeat(80));
    }
}

// 執行最終測試
if (require.main === module) {
    const tester = new FinalBuildTest();
    tester.runFinalTest().catch(console.error);
}

module.exports = FinalBuildTest;
