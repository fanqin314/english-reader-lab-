// 一键添加所有词性按钮.js - 将当前文章中指定词性的单词批量添加到生词本

(function() {
    // 执行批量添加
    async function execute(posMap) {
        // 获取当前选中的词性
        const selectedPos = Object.keys(posMap).filter(code => posMap[code] === true);
        if (selectedPos.length === 0) {
            showToast('请至少选择一个词性');
            return;
        }
        
        // 获取生词本数据
        if (!window.VocabData) {
            showToast('生词本模块未加载');
            return;
        }
        
        // 获取当前生词本
        const currentNotebookId = window.VocabData.getCurrentNotebookId();
        if (!currentNotebookId) {
            showToast('请先选择一个生词本');
            return;
        }
        
        // 获取所有已解析的句子数据
        let allPosData = [];
        if (window.CacheManager) {
            // 从缓存管理器中收集所有词性数据
            for (let i = 0; ; i++) {
                const posCache = window.CacheManager.getSentenceCache(i, 'pos');
                if (!posCache) break;
                try {
                    const parsed = typeof posCache === 'string' ? JSON.parse(posCache) : posCache;
                    if (parsed.pos && Array.isArray(parsed.pos)) {
                        allPosData.push(...parsed.pos);
                    }
                } catch(e) {
                    // 忽略解析错误
                }
            }
        } else if (window.SentenceRenderer) {
            const data = window.SentenceRenderer.getSentencesData();
            const sentenceData = data.sentenceData;
            for (let idx in sentenceData) {
                const sent = sentenceData[idx];
                if (sent && sent.pos) {
                    const posData = typeof sent.pos === 'string' ? JSON.parse(sent.pos) : sent.pos;
                    if (posData.pos && Array.isArray(posData.pos)) {
                        allPosData.push(...posData.pos);
                    }
                }
            }
        }
        
        // 提取指定词性的单词
        const wordsToAdd = new Set();
        allPosData.forEach(item => {
            if (selectedPos.includes(item.pos)) {
                wordsToAdd.add(item.word);
            }
        });
        
        if (wordsToAdd.size === 0) {
            showToast('当前文章中没有这些词性的单词');
            return;
        }
        
        // 获取当前生词本
        const notebook = window.VocabData.getNotebook(currentNotebookId);
        if (!notebook) {
            showToast('生词本不存在');
            return;
        }
        
        // 获取已存在的单词
        const existingWords = new Set(notebook.words.map(w => w.word));
        
        // 添加新单词
        let addedCount = 0;
        const skippedCount = wordsToAdd.size;
        
        for (let word of wordsToAdd) {
            if (!existingWords.has(word)) {
                // 尝试获取单词释义
                let meaning = '';
                let pos = '';
                
                // 从词库服务获取释义
                if (window.DictService) {
                    const dictResult = await window.DictService.getWordMeaning(word, {
                        apiCall: async (w) => {
                            if (window.APIRequest && window.APIRequest.requestWordMeaning) {
                                return await window.APIRequest.requestWordMeaning(w);
                            }
                            return null;
                        }
                    });
                    if (dictResult) {
                        meaning = dictResult.meaning;
                        pos = dictResult.pos;
                    }
                }
                
                // 添加到生词本
                window.VocabData.addWord(currentNotebookId, {
                    word: word,
                    meaning: meaning,
                    pos: pos,
                    context: '',
                    timestamp: Date.now()
                });
                addedCount++;
            }
        }
        
        // 显示结果
        if (addedCount > 0) {
            showToast(`✅ 已添加 ${addedCount} 个新单词到生词本“${notebook.name}”`);
        } else {
            showToast(`所有单词已存在于生词本“${notebook.name}”中`);
        }
        
        // 刷新生词本界面（如果当前在生词本模式）
        if (window.VocabInterface && window.VocabInterface.refresh) {
            window.VocabInterface.refresh();
        }
    }
    
    // 显示提示消息
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        } else {
            console.log(msg);
        }
    }
    
    // 导出接口
    window.AddAllPosToVocab = {
        execute
    };
})();