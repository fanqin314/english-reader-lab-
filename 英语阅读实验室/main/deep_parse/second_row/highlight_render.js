// 高亮渲染.js - 给单词添加词性颜色高亮

(function() {
    // 词性到CSS类名的映射
    const posClassMap = {
        'n': 'pos-n',
        'v': 'pos-v',
        'adj': 'pos-adj',
        'adv': 'pos-adv',
        'pron': 'pos-pron',
        'prep': 'pos-prep',
        'conj': 'pos-conj',
        'interj': 'pos-interj',
        'art': 'pos-art',
        'num': 'pos-num'
    };
    
    // 获取当前高亮词性配置（从全局或localStorage）
    function getHighlightPosMap() {
        const saved = localStorage.getItem('highlightPosMap');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch(e) {
                return null;
            }
        }
        return null;
    }
    
    // 默认高亮所有词性
    const defaultHighlightMap = {
        n: true, v: true, adj: true, adv: true, pron: true, 
        prep: true, conj: true, interj: true, art: true, num: true
    };
    
    let highlightPosMap = getHighlightPosMap() || { ...defaultHighlightMap };
    
    // 保存高亮配置
    function saveHighlightPosMap() {
        localStorage.setItem('highlightPosMap', JSON.stringify(highlightPosMap));
    }
    
    // 更新高亮配置
    function updateHighlightPosMap(newMap) {
        highlightPosMap = { ...newMap };
        saveHighlightPosMap();
        
        // 如果高亮已开启，重新应用
        if (window.HighlightSwitch && window.HighlightSwitch.isEnabled()) {
            applyHighlightToAll();
        }
    }
    
    // 获取当前高亮配置
    function getHighlightPosMapConfig() {
        return { ...highlightPosMap };
    }
    
    // 清除所有单词的高亮样式
    function clearAllHighlight() {
        document.querySelectorAll('.word-span').forEach(span => {
            span.className = 'word-span';
        });
    }
    
    // 高亮单个句子中的单词
    function highlightSentenceWords(sentenceElementId, sentenceData) {
        const sentenceDiv = document.getElementById(sentenceElementId);
        if (!sentenceDiv) return;
        
        // 获取词性列表
        let posList = [];
        if (sentenceData && sentenceData.pos) {
            if (Array.isArray(sentenceData.pos)) {
                posList = sentenceData.pos;
            } else if (sentenceData.pos.pos) {
                posList = sentenceData.pos.pos;
            }
        }
        
        if (posList.length === 0) return;
        
        // 获取句子中的所有单词 span
        const spans = sentenceDiv.querySelectorAll('.word-span');
        
        spans.forEach(span => {
            const word = span.dataset.word;
            if (!word) return;
            
            // 查找匹配的词性项
            const posItem = posList.find(p => 
                p.word && p.word.toLowerCase() === word.toLowerCase()
            );
            
            if (posItem && highlightPosMap[posItem.pos]) {
                const className = posClassMap[posItem.pos];
                if (className) {
                    span.classList.add(className);
                }
            }
        });
    }
    
    // 高亮所有句子中的所有单词
    function applyHighlightToAll() {
        // 先清除所有高亮
        clearAllHighlight();
        
        // 获取句子数据
        let sentenceData = {};
        if (window.CacheManager) {
            // 从缓存管理器获取
            for (let i = 0; ; i++) {
                const posCache = window.CacheManager.getSentenceCache(i, 'pos');
                if (!posCache) break;
                try {
                    const parsed = typeof posCache === 'string' ? JSON.parse(posCache) : posCache;
                    sentenceData[i] = { pos: parsed };
                } catch(e) {
                    // 忽略解析错误
                }
            }
        } else if (window.SentenceRenderer) {
            const data = window.SentenceRenderer.getSentencesData();
            sentenceData = data.sentenceData;
        }
        
        // 遍历所有句子进行高亮
        for (let idx in sentenceData) {
            const data = sentenceData[idx];
            if (data && data.pos) {
                highlightSentenceWords(`sentence-${idx}`, data);
            }
        }
    }
    
    // 导出接口
    window.HighlightRenderer = {
        clearAllHighlight,
        highlightSentenceWords,
        applyHighlightToAll,
        getHighlightPosMap: getHighlightPosMapConfig,
        updateHighlightPosMap
    };
})();