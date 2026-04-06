// sentence_translation.js - 句子翻译功能
(function() {
    ModuleRegistry.register('SentenceTranslation', ['ErrorHandler', 'Performance', 'EventBus', 'Security', 'GlobalManager'], function(ErrorHandler, Performance, EventBus, Security, GlobalManager) {
        function translateSentence(sentence) {
            return ErrorHandler.wrapAsyncFunction(async function() {
                const apiConfig = Security.getApiConfig();
                if (!apiConfig || !apiConfig.apiKey) {
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
                    
                    if (error.message.includes('401')) {
                        ErrorHandler.handleApiError('API Key 无效或已过期，请重新配置');
                    } else if (error.message.includes('403')) {
                        ErrorHandler.handleApiError('API 访问被拒绝，请检查权限设置');
                    } else if (error.message.includes('429')) {
                        ErrorHandler.handleApiError('API 请求过于频繁，请稍后再试');
                    } else if (error.message.includes('500')) {
                        ErrorHandler.handleApiError('API 服务器内部错误，请稍后再试');
                    } else {
                        ErrorHandler.handleApiError('翻译失败，请检查网络连接或 API 配置');
                    }
                    
                    return null;
                }
            })();
        }

        function onLoadTranslation(idx, panel) {
            return ErrorHandler.wrapAsyncFunction(async function() {
                let sentence = '';
                try {
                    const cacheManager = GlobalManager.getGlobalObject('CacheManager');
                    if (cacheManager) {
                        const sentences = cacheManager.getSentences();
                        if (sentences && sentences[idx]) {
                            sentence = sentences[idx];
                        }
                    } else {
                        const sentenceRenderer = GlobalManager.getGlobalObject('SentenceRenderer');
                        if (sentenceRenderer) {
                            const data = sentenceRenderer.getSentencesData();
                            if (data.sentences && data.sentences[idx]) {
                                sentence = data.sentences[idx];
                            }
                        } else {
                            ErrorHandler.handleValidationError('句子渲染服务未初始化');
                            if (panel) {
                                panel.innerHTML = `<strong>🌐 翻译</strong><div>句子渲染服务未初始化</div>`;
                                panel.classList.add('show');
                            }
                            return;
                        }
                    }
                } catch (e) {
                    console.error('获取句子内容失败:', e);
                    ErrorHandler.handleValidationError('无法获取句子内容');
                    if (panel) {
                        panel.innerHTML = `<strong>🌐 翻译</strong><div>无法获取句子内容</div>`;
                        panel.classList.add('show');
                    }
                    return;
                }
                
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
                    ErrorHandler.handleApiError(error);
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