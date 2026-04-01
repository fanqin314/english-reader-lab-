// 语法按钮.js - 处理句子卡片上语法结构按钮的点击事件

(function() {
    // 加载并显示语法结构数据
    async function loadAndDisplay(idx, panel) {
        // 检查 API 配置
        const apiConfig = window.getApiConfig ? window.getApiConfig() : null;
        if (!apiConfig || !apiConfig.apiKey) {
            showToast('请先配置 API Key');
            return;
        }
        
        // 检查缓存
        let cached = null;
        if (window.CacheManager) {
            cached = window.CacheManager.getSentenceCache(idx, 'syntax');
        }
        
        // 如果有缓存，直接显示
        if (cached) {
            displayInPanel(panel, cached);
            return;
        }
        
        // 获取句子文本
        let sentence = '';
        if (window.CacheManager) {
            const sentences = window.CacheManager.getSentences();
            if (sentences && sentences[idx]) {
                sentence = sentences[idx];
            }
        } else if (window.SentenceRenderer) {
            const data = window.SentenceRenderer.getSentencesData();
            if (data.sentences && data.sentences[idx]) {
                sentence = data.sentences[idx];
            }
        }
        
        if (!sentence) {
            showToast('无法获取句子内容');
            return;
        }
        
        // 显示加载提示
        showToast(`正在解析第 ${idx + 1} 句的语法结构...`);
        
        try {
            // 调用 API 请求语法结构
            const result = await window.APIRequest.requestSyntax(sentence);
            
            // 保存到缓存
            if (window.CacheManager) {
                window.CacheManager.setSentenceCache(idx, 'syntax', result);
            }
            
            // 显示结果
            displayInPanel(panel, result);
            
            showToast(`语法结构解析完成`);
        } catch (error) {
            console.error('语法结构解析失败:', error);
            showToast(`解析失败: ${error.message}`);
        }
    }
    
    // 在面板中显示语法结构数据
    function displayInPanel(panel, data) {
        if (!panel) return;
        
        let syntaxText = data;
        
        // 如果数据是 JSON 字符串，尝试提取 syntax 字段
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (parsed.syntax) {
                    syntaxText = parsed.syntax;
                }
            } catch (e) {
                // 不是 JSON，直接使用原文本
            }
        } else if (data && typeof data === 'object' && data.syntax) {
            syntaxText = data.syntax;
        }
        
        // 转义 HTML 防止 XSS
        syntaxText = escapeHtml(syntaxText);
        
        panel.innerHTML = `
            <strong>语法结构</strong>
            <div>${syntaxText}</div>
        `;
    }
    
    // 显示提示消息
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }
    
    // HTML 转义
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // 导出接口
    window.SyntaxButton = {
        loadAndDisplay
    };
    
    // 全局回调（供句子卡片调用）
   window.onLoadSyntax = window.SyntaxButton.loadAndDisplay;
})();