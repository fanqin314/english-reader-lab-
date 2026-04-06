// 知识点按钮.js - 处理句子卡片上知识点按钮的点击事件

(function() {
    ModuleRegistry.register('KnowledgeButton', ['Security', 'ErrorHandler', 'Performance', 'BaseAnalysisButton', 'GlobalManager'], function(Security, ErrorHandler, Performance, BaseAnalysisButton, GlobalManager) {
        
        class KnowledgeButton extends BaseAnalysisButton.BaseAnalysisButton {
            constructor(security, errorHandler, performance, globalManager) {
                super({
                    security,
                    errorHandler,
                    performance,
                    cacheType: 'knowledge',
                    typeName: '知识点'
                });
                this.globalManager = globalManager;
            }

            async callApi(sentence) {
                const apiRequest = this.globalManager.getGlobalObject('APIRequest');
                return await apiRequest.requestKnowledge(sentence);
            }

            displayInPanel(panel, data) {
                if (!panel) return;
                
                try {
                    panel.innerHTML = '';
                    
                    const title = document.createElement('strong');
                    title.textContent = '📌 知识点';
                    panel.appendChild(title);
                    
                    const contentDiv = document.createElement('div');
                    
                    let knowledgeText = data;
                    
                    if (typeof data === 'string') {
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.knowledge) {
                                knowledgeText = parsed.knowledge;
                            }
                        } catch (e) {
                        }
                    } else if (data && typeof data === 'object' && data.knowledge) {
                        knowledgeText = data.knowledge;
                    }
                    
                    let formatted = this.security.escapeHtml(knowledgeText);
                    formatted = formatted.replace(/[；;]\s*/g, '<br>');
                    formatted = formatted.replace(/(重点搭配|金句|写作建议|短语|句型)/g, '<strong>$1</strong>');
                    formatted = formatted.replace(/\n/g, '<br>');
                    
                    contentDiv.innerHTML = formatted;
                    panel.appendChild(contentDiv);
                    panel.classList.add('show');
                } catch (e) {
                    console.error('显示知识点数据失败:', e);
                    panel.innerHTML = '<strong>📌 知识点</strong><div>数据格式错误</div>';
                    panel.classList.add('show');
                }
            }
        }
        
        const knowledgeButton = new KnowledgeButton(Security, ErrorHandler, Performance, GlobalManager);
        
        window.KnowledgeButton = {
            loadAndDisplay: knowledgeButton.loadAndDisplay.bind(knowledgeButton)
        };
        
        window.onLoadKnowledge = window.KnowledgeButton.loadAndDisplay;
    });
})();