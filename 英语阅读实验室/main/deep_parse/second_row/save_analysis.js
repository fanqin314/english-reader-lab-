// 保存当前分析.js - 保存当前句子列表和解析缓存到 localStorage

(function() {
    // 保存当前分析数据
    function saveCurrentAnalysis() {
        // 获取当前句子数据
        let sentences = [];
        let sentenceData = {};
        let fullTranslation = '';
        
        // 从 CacheManager 获取数据
        if (window.CacheManager) {
            sentences = window.CacheManager.getSentences();
            fullTranslation = window.CacheManager.getFullTranslation();
            
            // 收集所有句子缓存
            for (let i = 0; ; i++) {
                const pos = window.CacheManager.getSentenceCache(i, 'pos');
                const syntax = window.CacheManager.getSentenceCache(i, 'syntax');
                const knowledge = window.CacheManager.getSentenceCache(i, 'knowledge');
                const translation = window.CacheManager.getSentenceCache(i, 'translation');
                
                if (!pos && !syntax && !knowledge && !translation) {
                    // 如果所有类型都为空，且 i 大于 0，说明已经到末尾
                    if (i > 0) break;
                    continue;
                }
                
                sentenceData[i] = {};
                if (pos) sentenceData[i].pos = pos;
                if (syntax) sentenceData[i].syntax = syntax;
                if (knowledge) sentenceData[i].knowledge = knowledge;
                if (translation) sentenceData[i].translation = translation;
            }
        } 
        // 备选：从 SentenceRenderer 获取
        else if (window.SentenceRenderer) {
            const data = window.SentenceRenderer.getSentencesData();
            sentences = data.sentences;
            sentenceData = data.sentenceData;
            if (window.FullTranslation) {
                fullTranslation = window.FullTranslation.get();
            }
        } 
        else {
            showToast('无法获取当前分析数据');
            return;
        }
        
        // 保存到 localStorage
        const dataToSave = {
            sentences: sentences,
            sentenceData: sentenceData,
            fullTranslation: fullTranslation,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('savedAnalysis', JSON.stringify(dataToSave));
            showToast('✅ 当前分析已保存');
        } catch (e) {
            console.error('保存失败:', e);
            showToast('保存失败: ' + e.message);
        }
    }
    
    // 加载已保存的分析
    function loadSavedAnalysis() {
        const saved = localStorage.getItem('savedAnalysis');
        if (!saved) {
            return false;
        }
        
        try {
            const data = JSON.parse(saved);
            
            // 恢复句子列表
            if (data.sentences && data.sentences.length) {
                // 更新 CacheManager
                if (window.CacheManager) {
                    window.CacheManager.setSentences(data.sentences);
                    
                    // 恢复句子缓存
                    for (let idx in data.sentenceData) {
                        const sentData = data.sentenceData[idx];
                        for (let type in sentData) {
                            window.CacheManager.setSentenceCache(parseInt(idx), type, sentData[type]);
                        }
                    }
                    
                    // 恢复全文翻译
                    if (data.fullTranslation) {
                        window.CacheManager.setFullTranslation(data.fullTranslation);
                    }
                }
                
                // 更新 SentenceRenderer
                if (window.SentenceRenderer) {
                    window.SentenceRenderer.setSentencesData(data.sentences, data.sentenceData);
                    window.SentenceRenderer.renderAll();
                }
                
                // 更新全文翻译显示
                if (window.FullTranslation && data.fullTranslation) {
                    window.FullTranslation.init();
                    if (window.FullTranslation.set) {
                        window.FullTranslation.set(data.fullTranslation);
                    }
                    const translationArea = document.getElementById('fullTranslationArea');
                    const translationText = document.getElementById('fullTranslationText');
                    if (translationArea && translationText && data.fullTranslation) {
                        translationText.innerText = data.fullTranslation;
                        translationArea.style.display = 'block';
                    }
                }
                
                showToast('已恢复上次分析');
                return true;
            }
        } catch (e) {
            console.error('加载失败:', e);
            showToast('加载失败: ' + e.message);
        }
        
        return false;
    }
    
    // 清除保存的分析
    function clearSavedAnalysis() {
        localStorage.removeItem('savedAnalysis');
        showToast('已清除保存的分析');
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
    
    // 导出接口
    window.SavedAnalysis = {
        save: saveCurrentAnalysis,
        load: loadSavedAnalysis,
        clear: clearSavedAnalysis
    };
    
    // 全局回调（供第二行按钮调用）
    window.onSaveAnalysis = saveCurrentAnalysis;
    
    // 页面加载时自动尝试恢复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // 延迟加载，等待其他模块初始化完成
            setTimeout(() => {
                loadSavedAnalysis();
            }, 500);
        });
    } else {
        setTimeout(() => {
            loadSavedAnalysis();
        }, 500);
    }
})();