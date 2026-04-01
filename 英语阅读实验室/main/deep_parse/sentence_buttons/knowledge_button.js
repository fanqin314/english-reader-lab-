// 知识点按钮.js - 处理句子卡片上知识点按钮的点击事件

(function() {
    // 加载并显示知识点数据
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
            cached = window.CacheManager.getSentenceCache(idx, 'knowledge');
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
        showToast(`正在解析第 ${idx + 1} 句的知识点...`);
        
        try {
            // 调用 API 请求知识点
            const result = await window.APIRequest.requestKnowledge(sentence);
            
            // 保存到缓存
            if (window.CacheManager) {
                window.CacheManager.setSentenceCache(idx, 'knowledge', result);
            }
            
            // 显示结果
            displayInPanel(panel, result);
            
            showToast(`知识点解析完成`);
        } catch (error) {
            console.error('知识点解析失败:', error);
            showToast(`解析失败: ${error.message}`);
        }
    }
    
    // 在面板中显示知识点数据
    function displayInPanel(panel, data) {
        if (!panel) return;
        
        let knowledgeText = data;
        
        // 如果数据是 JSON 字符串，尝试提取 knowledge 字段
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (parsed.knowledge) {
                    knowledgeText = parsed.knowledge;
                }
            } catch (e) {
                // 不是 JSON，直接使用原文本
            }
        } else if (data && typeof data === 'object' && data.knowledge) {
            knowledgeText = data.knowledge;
        }
        
        // 格式化知识点：将常见分隔符转为换行，高亮关键词
        let formatted = escapeHtml(knowledgeText);
        formatted = formatted.replace(/[；;]\s*/g, '<br>');
        formatted = formatted.replace(/(重点搭配|金句|写作建议|短语|句型)/g, '<strong>$1</strong>');
        // 处理换行符
        formatted = formatted.replace(/\n/g, '<br>');
        
        panel.innerHTML = `
            <strong>📌 知识点</strong>
            <div>${formatted}</div>
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
    window.KnowledgeButton = {
        loadAndDisplay
    };
    
    // 全局回调（供句子卡片调用）
    window.onLoadKnowledge = window.KnowledgeButton.loadAndDisplay;
})();