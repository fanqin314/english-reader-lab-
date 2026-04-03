// 生词本数据.js - 生词本数据的增删改查、localStorage存储

(function() {
    // 存储键名
    const STORAGE_KEY = 'vocabData';
    
    // 数据结构
    let vocabData = {
        notebooks: {},      // { notebookId: { name, words: [{ word, meaning, pos, context, timestamp }] } }
        currentNotebookId: null
    };
    
    // 加载数据
    function loadData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                vocabData = parsed;
                // 确保数据结构完整
                if (!vocabData.notebooks) vocabData.notebooks = {};
                if (!vocabData.currentNotebookId) {
                    const firstId = Object.keys(vocabData.notebooks)[0];
                    vocabData.currentNotebookId = firstId || null;
                }
                // 确保每个生词本都有 words 数组
                for (let id in vocabData.notebooks) {
                    if (!vocabData.notebooks[id].words) {
                        vocabData.notebooks[id].words = [];
                    }
                }
            } catch(e) {
                console.error('加载生词本数据失败:', e);
                initDefaultData();
            }
        } else {
            initDefaultData();
        }
    }
    
    // 初始化默认数据
    function initDefaultData() {
        const defaultId = Date.now().toString();
        vocabData = {
            notebooks: {
                [defaultId]: {
                    name: '默认生词本',
                    words: []
                }
            },
            currentNotebookId: defaultId
        };
        saveData();
    }
    
    // 保存数据
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabData));
    }
    
    // 获取所有生词本
    function getAllNotebooks() {
        return vocabData.notebooks;
    }
    
    // 获取当前生词本ID
    function getCurrentNotebookId() {
        return vocabData.currentNotebookId;
    }
    
    // 设置当前生词本
    function setCurrentNotebookId(notebookId) {
        if (vocabData.notebooks[notebookId]) {
            vocabData.currentNotebookId = notebookId;
            saveData();
            return true;
        }
        return false;
    }
    
    // 获取生词本
    function getNotebook(notebookId) {
        return vocabData.notebooks[notebookId] || null;
    }
    
    // 获取当前生词本
    function getCurrentNotebook() {
        if (!vocabData.currentNotebookId) return null;
        return vocabData.notebooks[vocabData.currentNotebookId] || null;
    }
    
    // 创建生词本
    function createNotebook(name) {
        if (!name || name.trim() === '') {
            return { success: false, error: '生词本名称不能为空' };
        }
        
        const newId = Date.now().toString();
        vocabData.notebooks[newId] = {
            name: name.trim(),
            words: []
        };
        
        // 如果是第一个生词本，设置为当前
        if (Object.keys(vocabData.notebooks).length === 1) {
            vocabData.currentNotebookId = newId;
        }
        
        saveData();
        return { success: true, id: newId, name: name.trim() };
    }
    
    // 删除生词本
    function deleteNotebook(notebookId) {
        if (!vocabData.notebooks[notebookId]) {
            return { success: false, error: '生词本不存在' };
        }
        
        // 不允许删除最后一个生词本
        if (Object.keys(vocabData.notebooks).length === 1) {
            return { success: false, error: '不能删除最后一个生词本' };
        }
        
        delete vocabData.notebooks[notebookId];
        
        // 如果删除的是当前生词本，切换到第一个
        if (vocabData.currentNotebookId === notebookId) {
            const firstId = Object.keys(vocabData.notebooks)[0];
            vocabData.currentNotebookId = firstId;
        }
        
        saveData();
        return { success: true };
    }
    
    // 添加单词到生词本
    function addWord(notebookId, wordData) {
        const notebook = vocabData.notebooks[notebookId];
        if (!notebook) {
            return { success: false, error: '生词本不存在' };
        }
        
        const { word, meaning = '', pos = '', context = '', timestamp = Date.now() } = wordData;
        
        if (!word || word.trim() === '') {
            return { success: false, error: '单词不能为空' };
        }
        
        // 检查是否已存在（不区分大小写）
        const exists = notebook.words.some(w => w.word.toLowerCase() === word.toLowerCase());
        if (exists) {
            return { success: false, error: '单词已存在' };
        }
        
        notebook.words.push({
            word: word.trim(),
            meaning: meaning.trim(),
            pos: pos.trim(),
            context: context.trim(),
            timestamp: timestamp
        });
        
        saveData();
        return { success: true };
    }
    
    // 删除单词
    function deleteWord(notebookId, word) {
        const notebook = vocabData.notebooks[notebookId];
        if (!notebook) {
            return { success: false, error: '生词本不存在' };
        }
        
        const index = notebook.words.findIndex(w => w.word.toLowerCase() === word.toLowerCase());
        if (index === -1) {
            return { success: false, error: '单词不存在' };
        }
        
        notebook.words.splice(index, 1);
        saveData();
        return { success: true };
    }
    
    // 更新单词
    function updateWord(notebookId, word, updates) {
        const notebook = vocabData.notebooks[notebookId];
        if (!notebook) {
            return { success: false, error: '生词本不存在' };
        }
        
        const wordObj = notebook.words.find(w => w.word === word);
        if (!wordObj) {
            return { success: false, error: '单词不存在' };
        }
        
        Object.assign(wordObj, updates);
        saveData();
        return { success: true };
    }
    
    // 获取单词列表
    function getWords(notebookId) {
        const notebook = vocabData.notebooks[notebookId];
        return notebook ? [...notebook.words] : [];
    }
    
    // 获取当前生词本的单词列表
    function getCurrentWords() {
        const notebook = getCurrentNotebook();
        return notebook ? [...notebook.words] : [];
    }
    
    // 导出数据
    function exportData() {
        return JSON.stringify(vocabData, null, 2);
    }
    
    // 导入数据
    function importData(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            if (parsed.notebooks && typeof parsed.notebooks === 'object') {
                vocabData = parsed;
                if (!vocabData.currentNotebookId) {
                    const firstId = Object.keys(vocabData.notebooks)[0];
                    vocabData.currentNotebookId = firstId || null;
                }
                saveData();
                return { success: true };
            }
            return { success: false, error: '数据格式无效' };
        } catch(e) {
            return { success: false, error: e.message };
        }
    }
    
    // 导出接口
    window.VocabData = {
        loadData,
        saveData,
        getAllNotebooks,
        getCurrentNotebookId,
        setCurrentNotebookId,
        getNotebook,
        getCurrentNotebook,
        createNotebook,
        deleteNotebook,
        addWord,
        deleteWord,
        updateWord,
        getWords,
        getCurrentWords,
        exportData,
        importData
    };
    
    // 自动加载数据
    loadData();
})();
