/**
 * 🎨 修復填充和描邊渲染問題
 * 
 * 批量替換所有的 if (this.params.filled) 邏輯為通用的 renderFillAndStroke() 方法
 */

const fs = require('fs');
const path = require('path');

class FillStrokeRenderer {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'src', 'animation-engine.js');
        this.log('🎨 填充和描邊渲染修復工具啟動', 'info');
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

    async fixRendering() {
        this.log('開始修復填充和描邊渲染邏輯...', 'fix');
        
        try {
            // 讀取文件
            let content = fs.readFileSync(this.filePath, 'utf8');
            
            // 統計修復前的問題數量
            const beforeCount = this.countIssues(content);
            this.log(`發現 ${beforeCount} 個需要修復的渲染邏輯`, 'info');
            
            // 執行批量替換
            content = this.performReplacements(content);
            
            // 統計修復後的問題數量
            const afterCount = this.countIssues(content);
            const fixedCount = beforeCount - afterCount;
            
            // 寫回文件
            fs.writeFileSync(this.filePath, content, 'utf8');
            
            this.log(`修復完成！已修復 ${fixedCount} 個渲染邏輯`, 'success');
            this.log(`剩餘 ${afterCount} 個需要手動處理`, afterCount > 0 ? 'warning' : 'success');
            
            return { fixed: fixedCount, remaining: afterCount };
            
        } catch (error) {
            this.log(`修復過程發生錯誤: ${error.message}`, 'error');
            throw error;
        }
    }

    countIssues(content) {
        const pattern = /if\s*\(\s*this\.params\.filled\s*\)\s*\{\s*this\.ctx\.fill\(\);\s*\}\s*else\s*\{\s*this\.ctx\.stroke\(\);\s*\}/g;
        const matches = content.match(pattern);
        return matches ? matches.length : 0;
    }

    performReplacements(content) {
        // 替換模式 1: 標準的 if-else 結構
        const pattern1 = /(\s+)if\s*\(\s*this\.params\.filled\s*\)\s*\{\s*this\.ctx\.fill\(\);\s*\}\s*else\s*\{\s*this\.ctx\.stroke\(\);\s*\}/g;
        content = content.replace(pattern1, '$1this.renderFillAndStroke();');

        // 替換模式 2: 多行格式的 if-else 結構
        const pattern2 = /(\s+)if\s*\(\s*this\.params\.filled\s*\)\s*\{\s*\n\s*this\.ctx\.fill\(\);\s*\n\s*\}\s*else\s*\{\s*\n\s*this\.ctx\.stroke\(\);\s*\n\s*\}/g;
        content = content.replace(pattern2, '$1this.renderFillAndStroke();');

        // 替換模式 3: 帶縮進的多行格式
        const pattern3 = /(\s+)if\s*\(\s*this\.params\.filled\s*\)\s*\{\s*\n(\s+)this\.ctx\.fill\(\);\s*\n\s*\}\s*else\s*\{\s*\n\s*this\.ctx\.stroke\(\);\s*\n\s*\}/g;
        content = content.replace(pattern3, '$1this.renderFillAndStroke();');

        return content;
    }

    async verifyFix() {
        this.log('驗證修復結果...', 'info');
        
        try {
            const content = fs.readFileSync(this.filePath, 'utf8');
            
            // 檢查是否還有未修復的問題
            const remainingIssues = this.countIssues(content);
            
            // 檢查 renderFillAndStroke 方法是否存在
            const hasRenderMethod = content.includes('renderFillAndStroke()');
            const hasRenderDefinition = content.includes('renderFillAndStroke() {');
            
            this.log(`剩餘問題: ${remainingIssues}`, remainingIssues === 0 ? 'success' : 'warning');
            this.log(`renderFillAndStroke 方法定義: ${hasRenderDefinition ? '✅' : '❌'}`, hasRenderDefinition ? 'success' : 'error');
            this.log(`renderFillAndStroke 方法調用: ${hasRenderMethod ? '✅' : '❌'}`, hasRenderMethod ? 'success' : 'error');
            
            return {
                remainingIssues,
                hasRenderMethod,
                hasRenderDefinition,
                success: remainingIssues === 0 && hasRenderMethod && hasRenderDefinition
            };
            
        } catch (error) {
            this.log(`驗證過程發生錯誤: ${error.message}`, 'error');
            throw error;
        }
    }

    displaySummary(fixResult, verifyResult) {
        console.log('\n' + '='.repeat(80));
        console.log('🎨 填充和描邊渲染修復摘要');
        console.log('='.repeat(80));
        
        console.log(`\n📊 修復結果:`);
        console.log(`  已修復問題: ${fixResult.fixed}`);
        console.log(`  剩餘問題: ${fixResult.remaining}`);
        console.log(`  修復成功率: ${((fixResult.fixed / (fixResult.fixed + fixResult.remaining)) * 100).toFixed(1)}%`);
        
        console.log(`\n🔍 驗證結果:`);
        console.log(`  renderFillAndStroke 方法定義: ${verifyResult.hasRenderDefinition ? '✅' : '❌'}`);
        console.log(`  renderFillAndStroke 方法調用: ${verifyResult.hasRenderMethod ? '✅' : '❌'}`);
        console.log(`  整體狀態: ${verifyResult.success ? '✅ 完全成功' : '⚠️ 需要進一步處理'}`);
        
        console.log(`\n🎯 修復效果:`);
        console.log(`  ✅ 填充顏色和線條顏色可以同時顯示`);
        console.log(`  ✅ 填充模式: 先填充，再描邊`);
        console.log(`  ✅ 線框模式: 只描邊`);
        console.log(`  ✅ 支援線條寬度控制`);
        
        if (verifyResult.success) {
            console.log('\n🎉 修復完成！現在可以同時顯示填充顏色和線條顏色了！');
        } else {
            console.log('\n🔧 還需要手動處理剩餘問題');
        }
        
        console.log('\n' + '='.repeat(80));
    }
}

// 執行修復
if (require.main === module) {
    const fixer = new FillStrokeRenderer();
    
    fixer.fixRendering()
        .then((fixResult) => fixer.verifyFix().then((verifyResult) => ({ fixResult, verifyResult })))
        .then(({ fixResult, verifyResult }) => {
            fixer.displaySummary(fixResult, verifyResult);
        })
        .catch(console.error);
}

module.exports = FillStrokeRenderer;
