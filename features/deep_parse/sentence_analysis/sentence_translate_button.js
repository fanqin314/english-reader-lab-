// sentence_translation.js - 句子翻译功能
(function() {
    ModuleRegistry.register('SentenceTranslation', ['ErrorHandler', 'Performance', 'EventBus', 'Security', 'GlobalManager', 'Utils'], function(ErrorHandler, Performance, EventBus, Security, GlobalManager, Utils) {
        function translateSentence(sentence) {
            return ErrorHandler.wrapAsyncFunction(async function() {
                const apiConfig = Security.getApiConfig();
                if (!Utils.checkApiConfig(apiConfig)) {
                    ErrorHandler.handleValidationError('请先配置 API Key');
                    return null;
                }
                
                if (!sentence) {
                    ErrorHandler.handleValidationError('无法获取句子内容');
                    return null;
                }
                
                try {
                    const apiRequest = GlobalManager.getGlobalObject('APIRequest');
                    if (!apiRequest) {
                        ErrorHandler.handleValidationError('API请求服务未初始化');
                        return null;
                    }
                    
                    if (!apiRequest.requestTranslation) {
                        ErrorHandler.handleValidationError('API请求服务功能不完整');
                        return null;
                    }
                    
                    const translation = await apiRequest.requestTranslation(sentence);
                    return translation;
                } catch (error) {
                    console.error('翻译失败:', error);
                    const errorMessage = Utils.handleApiError(error);
                    ErrorHandler.handleApiError(errorMessage);
                    return null;
                }
            })();
        }

        function onLoadTranslation(idx, panel) {
            return ErrorHandler.wrapAsyncFunction(async function() {
                const cacheManager = GlobalManager.getGlobalObject('CacheManager');
                const sentenceRenderer = GlobalManager.getGlobalObject('SentenceRenderer');
                const sentence = Utils.getSentence(idx, cacheManager, sentenceRenderer);
                
                if (!sentence) {
                    ErrorHandler.handleValidationError('无法获取句子内容');
                    if (panel) {
                        panel.innerHTML = `<strong>🌐 翻译</strong><div>无法获取句子内容</div>`;
                        panel.classList.add('show');
                    }
                    return;
                }
                
                try {
                    const translation = await translateSentence(sentence);
                    if (panel) {
                        if (translation) {
                            panel.innerHTML = `<strong>🌐 翻译</strong><div>${Security.escapeHtml(translation)}</div>`;
                        } else {
                            panel.innerHTML = `<strong>🌐 翻译</strong><div>翻译失败，请检查API配置</div>`;
                        }
                        // 显示面板
                        panel.classList.add('show');
                    }
                } catch (error) {
                    console.error('翻译失败:', error);
                    const errorMessage = Utils.handleApiError(error);
                    ErrorHandler.handleApiError(errorMessage);
                    if (panel) {
                        panel.innerHTML = `<strong>🌐 翻译</strong><div>翻译失败，请检查API配置</div>`;
                        // 显示面板
                        panel.classList.add('show');
                    }
                }
            })();
        }

        // 导出全局接口（保持向后兼容）
        window.SentenceTranslation = {
            translate: translateSentence,
            onLoad: onLoadTranslation
        };

        return {
            translate: translateSentence,
            onLoad: onLoadTranslation
        };
    });
})();