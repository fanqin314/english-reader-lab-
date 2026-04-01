// 词库服务.js - 加载外部词库，管理补充词库，查询单词释义

(function() {
    // 外部词库（从 dict.json 加载）
    let externalDict = {};
    // 补充词库（localStorage 存储，用户手动编辑或自动扩展）
    let supplementDict = {};

    const SUPPLEMENT_KEY = 'supplementDict';

    // 加载补充词库
    function loadSupplementDict() {
        try {
            const stored = localStorage.getItem(SUPPLEMENT_KEY);
            if (stored) {
                supplementDict = JSON.parse(stored);
            } else {
                supplementDict = {};
            }
        } catch(e) {
            console.warn('加载补充词库失败', e);
            supplementDict = {};
        }
    }

    // 保存补充词库
    function saveSupplementDict() {
        try {
            localStorage.setItem(SUPPLEMENT_KEY, JSON.stringify(supplementDict));
        } catch(e) {
            console.warn('保存补充词库失败', e);
        }
    }

    // 加载外部词库（异步）
    async function loadExternalDict(dictPath = 'dict.json') {
        try {
            const response = await fetch(dictPath);
            if (!response.ok) throw new Error('词库文件加载失败');
            externalDict = await response.json();
            console.log('外部词库加载成功，词条数:', Object.keys(externalDict).length);
            return true;
        } catch(e) {
            console.warn('外部词库加载失败:', e);
            externalDict = {};
            return false;
        }
    }

    // 获取单词释义（优先级：外部词库 > 补充词库 > 返回null）
    function getWordMeaningFromDict(word) {
        const lowerWord = word.toLowerCase();
        // 1. 外部词库
        if (externalDict[lowerWord]) {
            return {
                meaning: externalDict[lowerWord].meaning,
                pos: externalDict[lowerWord].pos || ''
            };
        }
        // 2. 补充词库
        if (supplementDict[lowerWord]) {
            return {
                meaning: supplementDict[lowerWord].meaning,
                pos: supplementDict[lowerWord].pos || ''
            };
        }
        return null;
    }

    // 添加或更新补充词库中的单词
    function addToSupplementDict(word, meaning, pos = '') {
        const lowerWord = word.toLowerCase();
        supplementDict[lowerWord] = { meaning, pos };
        saveSupplementDict();
    }

    // 删除补充词库中的单词
    function removeFromSupplementDict(word) {
        const lowerWord = word.toLowerCase();
        if (supplementDict[lowerWord]) {
            delete supplementDict[lowerWord];
            saveSupplementDict();
        }
    }

    // 获取所有补充词条（用于导出）
    function getAllSupplementWords() {
        return supplementDict;
    }

    // 导出全局对象
    window.DictService = {
        loadExternalDict,
        getWordMeaningFromDict,
        addToSupplementDict,
        removeFromSupplementDict,
        getAllSupplementWords,
        // 暴露补充词库供其他模块直接操作（可选）
        supplementDict: () => supplementDict
    };

    // 初始化：加载补充词库
    loadSupplementDict();
})();