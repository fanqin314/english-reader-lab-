// deep_parse.js - 深度解析功能
(function() {
    ModuleRegistry.register('DeepParse', ['ErrorHandler', 'Performance', 'EventBus', 'Security'], function(ErrorHandler, Performance, EventBus, Security) {
        function deepParse() {
            return ErrorHandler.wrapAsyncFunction(async function() {
                const textarea = document.getElementById('articleInput');
                if (!textarea) {
                    throw new Error('未找到文本输入框');
                }
                const text = textarea.value.trim();
                if (!text) {
                    ErrorHandler.handleValidationError('请输入文章');
                    return;
                }
                if (!window.SentenceSplitter) {
                    throw new Error('分句模块未加载，请刷新页面重试');
                }
                if (!window.SentenceRenderer) {
                    throw new Error('渲染模块未加载，请刷新页面重试');
                }
                
                const sentences = window.SentenceSplitter.split(text);
                console.log('[deepParse] 分句结果:', sentences.length);
                
                // 保存句子数据到缓存管理器
                if (window.CacheManager) {
                    window.CacheManager.setSentences(sentences);
                }
                
                // 深度解析模式：使用新的容器
                let container = document.getElementById('deepParseSentencesContainer');
                if (!container) {
                    // 降级处理
                    container = document.getElementById('sentencesContainer');
                }
                if (container) {
                    window.SentenceRenderer.setContainer(container);
                } else {
                    throw new Error('sentencesContainer 元素未找到');
                }
                window.SentenceRenderer.setSentencesData(sentences, {});
                window.SentenceRenderer.renderAll();

                // 显示右栏（句子卡片）
                const twoColumnContainer = document.querySelector('.two-column-container');
                if (twoColumnContainer) {
                    twoColumnContainer.classList.add('show-right', 'has-sentences');
                    const rightColumn = twoColumnContainer.querySelector('.right-column');
                    if (rightColumn) rightColumn.classList.add('visible');
                }

                // 调用全文翻译
                if (window.FullTranslation) {
                    await window.FullTranslation.fetch(text);
                }
                
                // 不再触发 analysisCompleted 事件，避免自动保存历史记录
                // EventBus.emit('analysisCompleted', { text });
            })();
        }

        // 导出全局接口（保持向后兼容）
        window.deepParse = deepParse;

        return {
            deepParse
        };
    });
})();