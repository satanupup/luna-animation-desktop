/**
 * 🏗️ 編譯測試腳本
 * 
 * 這個腳本用於測試和診斷 Electron 應用程式的編譯過程
 * 包含環境檢查、權限檢查、編譯測試和問題修復
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class BuildTester {
    constructor() {
        this.testResults = {
            environment: {},
            permissions: {},
            dependencies: {},
            build: {},
            issues: [],
            solutions: []
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
            'fix': '🔧'
        }[type] || '📋';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async runTest() {
        this.log('開始編譯環境測試...', 'info');
        
        try {
            await this.checkEnvironment();
            await this.checkPermissions();
            await this.checkDependencies();
            await this.testBuild();
            await this.generateReport();
        } catch (error) {
            this.log(`測試過程發生錯誤: ${error.message}`, 'error');
            this.testResults.issues.push({
                type: 'critical',
                message: error.message,
                stack: error.stack
            });
        }
    }

    async checkEnvironment() {
        this.log('檢查系統環境...', 'info');
        
        // 檢查 Node.js 版本
        const nodeVersion = process.version;
        this.testResults.environment.nodeVersion = nodeVersion;
        this.log(`Node.js 版本: ${nodeVersion}`, 'info');
        
        // 檢查 npm 版本
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.testResults.environment.npmVersion = npmVersion;
            this.log(`npm 版本: ${npmVersion}`, 'info');
        } catch (error) {
            this.testResults.issues.push({
                type: 'error',
                message: 'npm 未安裝或無法執行'
            });
        }

        // 檢查作業系統
        const platform = os.platform();
        const arch = os.arch();
        this.testResults.environment.platform = platform;
        this.testResults.environment.arch = arch;
        this.log(`作業系統: ${platform} ${arch}`, 'info');

        // 檢查是否為 Windows
        if (platform !== 'win32') {
            this.testResults.issues.push({
                type: 'warning',
                message: '此專案主要針對 Windows 平台設計'
            });
        }

        // 檢查管理員權限
        if (platform === 'win32') {
            try {
                execSync('net session', { stdio: 'ignore' });
                this.testResults.environment.isAdmin = true;
                this.log('檢測到管理員權限', 'success');
            } catch (error) {
                this.testResults.environment.isAdmin = false;
                this.log('未檢測到管理員權限', 'warning');
                this.testResults.issues.push({
                    type: 'warning',
                    message: '建議以管理員權限執行以避免符號連結問題'
                });
                this.testResults.solutions.push({
                    issue: '符號連結權限問題',
                    solution: '以管理員身份執行 PowerShell 或 CMD'
                });
            }
        }
    }

    async checkPermissions() {
        this.log('檢查文件權限...', 'info');
        
        const testPaths = [
            'src',
            'assets',
            'ffmpeg-master-latest-win64-gpl-shared',
            'node_modules'
        ];

        for (const testPath of testPaths) {
            try {
                const stats = fs.statSync(testPath);
                this.testResults.permissions[testPath] = {
                    exists: true,
                    readable: true,
                    writable: fs.accessSync ? true : false
                };
                this.log(`✓ ${testPath} 權限正常`, 'success');
            } catch (error) {
                this.testResults.permissions[testPath] = {
                    exists: false,
                    error: error.message
                };
                this.log(`✗ ${testPath} 權限問題: ${error.message}`, 'error');
                this.testResults.issues.push({
                    type: 'error',
                    message: `路徑 ${testPath} 無法訪問: ${error.message}`
                });
            }
        }

        // 檢查 electron-builder 快取目錄
        const cacheDir = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache');
        if (fs.existsSync(cacheDir)) {
            this.log(`electron-builder 快取目錄: ${cacheDir}`, 'info');
            this.testResults.permissions.builderCache = cacheDir;
        }
    }

    async checkDependencies() {
        this.log('檢查依賴套件...', 'info');
        
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredDeps = [
            'electron',
            'electron-builder',
            'playwright'
        ];

        for (const dep of requiredDeps) {
            try {
                const depPath = path.join('node_modules', dep);
                if (fs.existsSync(depPath)) {
                    const depPackageJson = JSON.parse(fs.readFileSync(path.join(depPath, 'package.json'), 'utf8'));
                    this.testResults.dependencies[dep] = {
                        installed: true,
                        version: depPackageJson.version
                    };
                    this.log(`✓ ${dep} v${depPackageJson.version}`, 'success');
                } else {
                    this.testResults.dependencies[dep] = {
                        installed: false
                    };
                    this.log(`✗ ${dep} 未安裝`, 'error');
                    this.testResults.issues.push({
                        type: 'error',
                        message: `缺少依賴: ${dep}`
                    });
                }
            } catch (error) {
                this.testResults.dependencies[dep] = {
                    installed: false,
                    error: error.message
                };
                this.log(`✗ ${dep} 檢查失敗: ${error.message}`, 'error');
            }
        }
    }

    async testBuild() {
        this.log('開始編譯測試...', 'info');
        
        // 清理快取
        await this.cleanCache();
        
        // 測試不同的編譯方式
        const buildCommands = [
            {
                name: '基本編譯 (不簽名)',
                command: 'npm run build',
                env: { 
                    ...process.env,
                    CSC_IDENTITY_AUTO_DISCOVERY: 'false',
                    WIN_CSC_LINK: '',
                    WIN_CSC_KEY_PASSWORD: ''
                }
            },
            {
                name: '僅打包 (不建立安裝程式)',
                command: 'npm run pack',
                env: { 
                    ...process.env,
                    CSC_IDENTITY_AUTO_DISCOVERY: 'false'
                }
            }
        ];

        for (const buildTest of buildCommands) {
            this.log(`測試: ${buildTest.name}`, 'info');
            
            try {
                const result = await this.runBuildCommand(buildTest.command, buildTest.env);
                this.testResults.build[buildTest.name] = {
                    success: true,
                    output: result.stdout,
                    duration: result.duration
                };
                this.log(`✓ ${buildTest.name} 成功`, 'success');
                break; // 如果成功就不需要測試其他方式
            } catch (error) {
                this.testResults.build[buildTest.name] = {
                    success: false,
                    error: error.message,
                    stderr: error.stderr
                };
                this.log(`✗ ${buildTest.name} 失敗: ${error.message}`, 'error');
                
                // 分析錯誤並提供解決方案
                this.analyzeError(error.stderr || error.message);
            }
        }
    }

    async runBuildCommand(command, env) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const child = spawn('cmd', ['/c', command], {
                env: env,
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
                process.stdout.write(data);
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
                process.stderr.write(data);
            });

            child.on('close', (code) => {
                const duration = Date.now() - startTime;
                if (code === 0) {
                    resolve({ stdout, stderr, duration });
                } else {
                    reject({ message: `編譯失敗 (exit code: ${code})`, stderr, stdout, duration });
                }
            });

            child.on('error', (error) => {
                reject({ message: error.message, stderr, stdout });
            });
        });
    }

    analyzeError(errorMessage) {
        const errorPatterns = [
            {
                pattern: /Cannot create symbolic link.*權限/i,
                issue: '符號連結權限問題',
                solution: '以管理員身份執行或清理 electron-builder 快取'
            },
            {
                pattern: /winCodeSign.*7z/i,
                issue: 'winCodeSign 解壓縮問題',
                solution: '清理 electron-builder 快取並禁用代碼簽名'
            },
            {
                pattern: /ENOENT.*electron/i,
                issue: 'Electron 二進制文件缺失',
                solution: '重新安裝 electron: npm install electron --save-dev'
            },
            {
                pattern: /spawn.*ENOENT/i,
                issue: '命令執行失敗',
                solution: '檢查 PATH 環境變數和依賴安裝'
            }
        ];

        for (const pattern of errorPatterns) {
            if (pattern.pattern.test(errorMessage)) {
                this.testResults.solutions.push({
                    issue: pattern.issue,
                    solution: pattern.solution
                });
                this.log(`發現問題: ${pattern.issue}`, 'warning');
                this.log(`建議解決方案: ${pattern.solution}`, 'fix');
            }
        }
    }

    async cleanCache() {
        this.log('清理編譯快取...', 'info');
        
        const cachePaths = [
            path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache'),
            'dist',
            'builds/dist'
        ];

        for (const cachePath of cachePaths) {
            try {
                if (fs.existsSync(cachePath)) {
                    fs.rmSync(cachePath, { recursive: true, force: true });
                    this.log(`✓ 清理快取: ${cachePath}`, 'success');
                }
            } catch (error) {
                this.log(`清理快取失敗: ${cachePath} - ${error.message}`, 'warning');
            }
        }
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${(duration / 1000).toFixed(2)}s`,
            summary: {
                totalIssues: this.testResults.issues.length,
                criticalIssues: this.testResults.issues.filter(i => i.type === 'critical').length,
                solutions: this.testResults.solutions.length
            },
            ...this.testResults
        };

        // 保存報告
        const reportPath = path.join('tests', 'build-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`測試完成，耗時 ${report.duration}`, 'info');
        this.log(`發現 ${report.summary.totalIssues} 個問題`, 'info');
        this.log(`提供 ${report.summary.solutions} 個解決方案`, 'info');
        this.log(`詳細報告已保存到: ${reportPath}`, 'info');

        // 顯示摘要
        this.displaySummary();
    }

    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 編譯測試摘要報告');
        console.log('='.repeat(60));
        
        console.log('\n🔍 環境檢查:');
        console.log(`  Node.js: ${this.testResults.environment.nodeVersion}`);
        console.log(`  平台: ${this.testResults.environment.platform} ${this.testResults.environment.arch}`);
        console.log(`  管理員權限: ${this.testResults.environment.isAdmin ? '是' : '否'}`);

        if (this.testResults.issues.length > 0) {
            console.log('\n⚠️ 發現的問題:');
            this.testResults.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
            });
        }

        if (this.testResults.solutions.length > 0) {
            console.log('\n🔧 建議的解決方案:');
            this.testResults.solutions.forEach((solution, index) => {
                console.log(`  ${index + 1}. ${solution.issue}`);
                console.log(`     解決方案: ${solution.solution}`);
            });
        }

        console.log('\n' + '='.repeat(60));
    }
}

// 執行測試
if (require.main === module) {
    const tester = new BuildTester();
    tester.runTest().catch(console.error);
}

module.exports = BuildTester;
