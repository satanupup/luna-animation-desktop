/**
 * 🔧 複製 FFmpeg 到編譯目錄
 * 
 * 這個腳本用於將 FFmpeg 複製到打包後的應用程式目錄中
 */

const fs = require('fs');
const path = require('path');

class FFmpegCopier {
    constructor() {
        this.log('🔧 FFmpeg 複製工具啟動', 'info');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'copy': '📁'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async copyFFmpeg() {
        this.log('開始複製 FFmpeg 到編譯目錄...', 'info');
        
        try {
            const sourceDir = 'ffmpeg-master-latest-win64-gpl-shared';
            const buildDirs = [
                'dist/璐娜的 GIF 動畫製作器-win32-x64',
                'dist/win-unpacked'
            ];

            // 檢查源目錄
            if (!fs.existsSync(sourceDir)) {
                this.log(`源目錄不存在: ${sourceDir}`, 'error');
                return false;
            }

            for (const buildDir of buildDirs) {
                if (fs.existsSync(buildDir)) {
                    await this.copyFFmpegToDir(sourceDir, buildDir);
                } else {
                    this.log(`編譯目錄不存在: ${buildDir}`, 'warning');
                }
            }

            this.log('FFmpeg 複製完成', 'success');
            return true;
        } catch (error) {
            this.log(`複製過程發生錯誤: ${error.message}`, 'error');
            return false;
        }
    }

    async copyFFmpegToDir(sourceDir, targetDir) {
        this.log(`複製 FFmpeg 到: ${targetDir}`, 'copy');
        
        const targetFFmpegDir = path.join(targetDir, 'ffmpeg-master-latest-win64-gpl-shared');
        
        // 創建目標目錄
        if (!fs.existsSync(targetFFmpegDir)) {
            fs.mkdirSync(targetFFmpegDir, { recursive: true });
        }

        // 複製整個 FFmpeg 目錄
        await this.copyDirectory(sourceDir, targetFFmpegDir);
        
        // 額外複製 ffmpeg.exe 到根目錄以便快速訪問
        const sourceExe = path.join(sourceDir, 'bin', 'ffmpeg.exe');
        const targetExe = path.join(targetDir, 'ffmpeg.exe');
        
        if (fs.existsSync(sourceExe)) {
            fs.copyFileSync(sourceExe, targetExe);
            this.log(`✓ 複製 ffmpeg.exe 到根目錄`, 'success');
        }

        this.log(`✓ 完成複製到: ${targetDir}`, 'success');
    }

    async copyDirectory(source, target) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source);
        
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);
            
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                await this.copyDirectory(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }

    async verifyFFmpeg() {
        this.log('驗證 FFmpeg 複製結果...', 'info');
        
        const buildDirs = [
            'dist/璐娜的 GIF 動畫製作器-win32-x64',
            'dist/win-unpacked'
        ];

        let allSuccess = true;

        for (const buildDir of buildDirs) {
            if (!fs.existsSync(buildDir)) {
                continue;
            }

            const ffmpegPaths = [
                path.join(buildDir, 'ffmpeg.exe'),
                path.join(buildDir, 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe')
            ];

            this.log(`檢查目錄: ${buildDir}`, 'info');
            
            for (const ffmpegPath of ffmpegPaths) {
                if (fs.existsSync(ffmpegPath)) {
                    const stats = fs.statSync(ffmpegPath);
                    this.log(`✓ ${path.relative(buildDir, ffmpegPath)} (${this.formatFileSize(stats.size)})`, 'success');
                } else {
                    this.log(`✗ 缺少: ${path.relative(buildDir, ffmpegPath)}`, 'error');
                    allSuccess = false;
                }
            }
        }

        return allSuccess;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 執行複製
if (require.main === module) {
    const copier = new FFmpegCopier();
    copier.copyFFmpeg()
        .then(() => copier.verifyFFmpeg())
        .then((success) => {
            if (success) {
                console.log('\n🎉 FFmpeg 複製和驗證完成！');
            } else {
                console.log('\n⚠️ FFmpeg 複製完成，但驗證發現問題');
            }
        })
        .catch(console.error);
}

module.exports = FFmpegCopier;
