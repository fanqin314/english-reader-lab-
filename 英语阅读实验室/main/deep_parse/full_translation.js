// 全文翻译.js - 请求并显示全文翻译

(function() {
    let translationArea = null;
    let translationTextSpan = null;
    let currentTranslation = '';

    function init() {
        translationArea = document.getElementById('fullTranslationArea');
        translationTextSpan = document.getElementById('fullTranslationText');
        if (window.CacheManager) {
            const cached = window.CacheManager.getFullTranslation();
            if (cached) {
                currentTranslation = cached;
                if (translationTextSpan) translationTextSpan.innerText = cached;
                if (translationArea) translationArea.style.display = 'block';
            }
        }
    }

    async function fetchFullTranslation(text) {
        if (!text || text.trim() === '') return null;
        const apiConfig = window.getApiConfig ? window.getApiConfig() : null;
        if (!apiConfig || !apiConfig.apiKey) {
            showToast('请先配置 API Key');
            return null;
        }
        showToast('正在翻译全文...');
        try {
            const translation = await window.APIRequest.requestFullTranslation(text);
            if (translation) {
                currentTranslation = translation;
                if (translationTextSpan) translationTextSpan.innerText = translation;
                if (translationArea) translationArea.style.display = 'block';
                if (window.CacheManager) window.CacheManager.setFullTranslation(translation);
                showToast('全文翻译完成');
                return translation;
            } else {
                throw new Error('翻译结果为空');
            }
        } catch (error) {
            console.error('全文翻译失败:', error);
            showToast(`翻译失败: ${error.message}`);
            return null;
        }
    }

    function getCurrentTranslation() { return currentTranslation; }
    function clearTranslation() {
        currentTranslation = '';
        if (translationTextSpan) translationTextSpan.innerText = '';
        if (translationArea) translationArea.style.display = 'none';
        if (window.CacheManager) window.CacheManager.clearFullTranslation();
    }
    function hideTranslation() { if (translationArea) translationArea.style.display = 'none'; }
    function showTranslation() { if (translationArea && currentTranslation) translationArea.style.display = 'block'; }
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }

    window.FullTranslation = {
        init, fetch: fetchFullTranslation, get: getCurrentTranslation,
        clear: clearTranslation, hide: hideTranslation, show: showTranslation
    };
    
    // 深度解析入口函数
    window.deepParse = async function() {
        const textarea = document.getElementById('articleInput');
        if (!textarea) {
            console.error('未找到文本输入框');
            return;
        }
        const text = textarea.value.trim();
        if (!text) {
            alert('请输入文章');
            return;
        }
        // 检查依赖
        if (!window.SentenceSplitter) {
            console.error('SentenceSplitter 未加载');
            alert('分句模块未加载，请刷新页面重试');
            return;
        }
        if (!window.SentenceRenderer) {
            console.error('SentenceRenderer 未加载');
            alert('渲染模块未加载，请刷新页面重试');
            return;
        }
        // 分句
        const sentences = window.SentenceSplitter.split(text);
        console.log('[deepParse] 分句结果:', sentences.length);
        // 设置容器并渲染
        const container = document.getElementById('sentencesContainer');
        if (container) {
            window.SentenceRenderer.setContainer(container);
        } else {
            console.error('sentencesContainer 元素未找到');
            return;
        }
        window.SentenceRenderer.setSentencesData(sentences, {});
        window.SentenceRenderer.renderAll();
        // 请求全文翻译
        await window.FullTranslation.fetch(text);
    };

    // 统一处理句子按钮点击
    window.onLoadSentenceDetail = function(idx, type) {
        const panel = document.getElementById(`${type}-panel-${idx}`);
        if (!panel) {
            console.error(`面板 ${type}-panel-${idx} 未找到`);
            return;
        }
        switch(type) {
            case 'pos':
                if (window.onLoadPos) window.onLoadPos(idx, panel);
                else console.error('onLoadPos 未定义');
                break;
            case 'syntax':
                if (window.onLoadSyntax) window.onLoadSyntax(idx, panel);
                else console.error('onLoadSyntax 未定义');
                break;
            case 'knowledge':
                if (window.onLoadKnowledge) window.onLoadKnowledge(idx, panel);
                else console.error('onLoadKnowledge 未定义');
                break;
            case 'translation':
                if (window.onLoadTranslation) window.onLoadTranslation(idx, panel);
                else console.error('onLoadTranslation 未定义');
                break;
            default: console.warn('未知按钮类型:', type);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();