// 缓存管理.js - 统一管理句子解析缓存、全文翻译等

(function() {
    // 缓存键名
    const SENTENCE_DATA_KEY = 'sentenceDataCache';
    const FULL_TRANSLATION_KEY = 'fullTranslationCache';
    const SAVE_TIMEOUT_DELAY = 1000; // 提取魔法数字为常量
    
    let saveTimeout = null;
    let isDirty = false; // 标记数据是否已修改

    // 内存缓存（用于当前会话）
    let memoryCache = {
        sentences: [],
        sentenceData: {},
        fullTranslation: ''
    };

    // 从 localStorage 加载缓存（初始化时调用）
    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(SENTENCE_DATA_KEY);
            if (saved) {
                memoryCache.sentenceData = JSON.parse(saved);
            } else {
                memoryCache.sentenceData = {};
            }
            const trans = localStorage.getItem(FULL_TRANSLATION_KEY);
            if (trans) {
                memoryCache.fullTranslation = trans;
            } else {
                memoryCache.fullTranslation = '';
            }
        } catch(e) {
            console.warn('加载缓存失败', e);
            memoryCache.sentenceData = {};
            memoryCache.fullTranslation = '';
            // 显示友好的错误提示
            if (typeof showToast === 'function') {
                showToast('加载缓存失败，将使用新的缓存');
            }
        }
    }

    // 保存所有缓存到 localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem(SENTENCE_DATA_KEY, JSON.stringify(memoryCache.sentenceData));
            localStorage.setItem(FULL_TRANSLATION_KEY, memoryCache.fullTranslation);
            isDirty = false;
        } catch(e) {
            console.warn('保存缓存失败', e);
            // 显示友好的错误提示
            if (typeof showToast === 'function') {
                if (e.name === 'QuotaExceededError') {
                    showToast('存储空间不足，请清理部分数据');
                } else if (e.name === 'SecurityError') {
                    showToast('安全错误：无法访问存储');
                } else {
                    showToast('保存缓存失败，请重试');
                }
            }
        }
    }

    // 防抖保存
    function debouncedSave() {
        isDirty = true;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (isDirty) {
                saveToLocalStorage();
            }
        }, SAVE_TIMEOUT_DELAY);
    }

    // 获取句子解析缓存（某一句的某一项）
    function getSentenceCache(idx, type) {
        if (!memoryCache.sentenceData[idx]) return null;
        return memoryCache.sentenceData[idx][type] || null;
    }

    // 设置句子解析缓存（某一句的某一项）
    function setSentenceCache(idx, type, data) {
        if (!memoryCache.sentenceData[idx]) memoryCache.sentenceData[idx] = {};
        memoryCache.sentenceData[idx][type] = data;
        debouncedSave();
    }

    // 批量设置句子解析缓存（减少写入次数）
    function batchSetSentenceCache(updates) {
        updates.forEach(({ idx, type, data }) => {
            if (!memoryCache.sentenceData[idx]) memoryCache.sentenceData[idx] = {};
            memoryCache.sentenceData[idx][type] = data;
        });
        debouncedSave();
    }

    // 清除某一句的所有缓存
    function clearSentenceCache(idx) {
        if (memoryCache.sentenceData[idx]) {
            delete memoryCache.sentenceData[idx];
            debouncedSave();
        }
    }

    // 清除所有句子缓存（但保留全文翻译）
    function clearAllSentenceCache() {
        memoryCache.sentenceData = {};
        debouncedSave();
    }

    // 获取全文翻译
    function getFullTranslation() {
        return memoryCache.fullTranslation;
    }

    // 设置全文翻译
    function setFullTranslation(translation) {
        memoryCache.fullTranslation = translation;
        debouncedSave();
    }

    // 清除全文翻译
    function clearFullTranslation() {
        memoryCache.fullTranslation = '';
        debouncedSave();
    }

    // 获取句子数组（仅内存，不持久化）
    function getSentences() {
        return memoryCache.sentences;
    }

    function setSentences(sentencesArray) {
        memoryCache.sentences = sentencesArray;
    }

    // 重置所有缓存（清空所有）
    function resetAllCache() {
        memoryCache.sentences = [];
        memoryCache.sentenceData = {};
        memoryCache.fullTranslation = '';
        debouncedSave();
    }

    // 强制立即保存（用于页面卸载前）
    function forceSave() {
        if (isDirty) {
            clearTimeout(saveTimeout);
            saveToLocalStorage();
        }
    }

    // 导出全局对象
    window.CacheManager = {
        loadFromLocalStorage,
        getSentenceCache,
        setSentenceCache,
        batchSetSentenceCache,
        clearSentenceCache,
        clearAllSentenceCache,
        getFullTranslation,
        setFullTranslation,
        clearFullTranslation,
        getSentences,
        setSentences,
        resetAllCache,
        forceSave
    };

    // 页面加载时自动加载已有缓存
    loadFromLocalStorage();

    // 页面卸载前强制保存
    window.addEventListener('beforeunload', forceSave);
})();