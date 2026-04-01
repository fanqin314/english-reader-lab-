// 词性按钮.js - 处理句子卡片上词性按钮的点击事件

(function() {
    // 加载并显示词性数据
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
            cached = window.CacheManager.getSentenceCache(idx, 'pos');
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
        showToast(`正在解析第 ${idx + 1} 句的词性...`);
        
        try {
            // 调用 API 请求词性
            const result = await window.APIRequest.requestPos(sentence);
            
            // 保存到缓存
            if (window.CacheManager) {
                window.CacheManager.setSentenceCache(idx, 'pos', result);
            }
            
            // 显示结果
            displayInPanel(panel, result);
            
            // 如果高亮已开启，重新应用高亮
            if (window.HighlightSwitch && window.HighlightSwitch.isEnabled()) {
                if (window.HighlightRenderer) {
                    // 更新当前句子的高亮
                    window.HighlightRenderer.highlightSentenceWords(`sentence-${idx}`, result);
                }
            }
            
            showToast(`词性解析完成`);
        } catch (error) {
            console.error('词性解析失败:', error);
            showToast(`解析失败: ${error.message}`);
        }
    }
    
    // 在面板中显示词性数据
    function displayInPanel(panel, data) {
        if (!panel) return;
        
        try {
            // 解析数据（可能是字符串或对象）
            let posData = data;
            if (typeof data === 'string') {
                posData = JSON.parse(data);
            }
            
            const posList = posData.pos || [];
            
            if (posList.length === 0) {
                panel.innerHTML = '<strong>词性列表</strong><div>暂无数据</div>';
                return;
            }
            
            // 生成词性列表 HTML
            const html = `
                <strong>词性列表</strong>
                <div class="pos-list">
                    ${posList.map(p => `
                        <span class="pos-badge">
                            ${escapeHtml(p.word)} 
                            <span style="color:#3b82f6;">[${escapeHtml(p.pos)}]</span>
                            ${p.meaning ? '· ' + escapeHtml(p.meaning) : ''}
                        </span>
                    `).join('')}
                </div>
            `;
            
            panel.innerHTML = html;
        } catch (e) {
            console.error('显示词性数据失败:', e);
            panel.innerHTML = '<strong>词性列表</strong><div>数据格式错误</div>';
        }
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
    window.PosButton = {
        loadAndDisplay
    };
    
    // 全局回调（供句子卡片调用）
    window.onLoadPos = window.PosButton.loadAndDisplay;
})();