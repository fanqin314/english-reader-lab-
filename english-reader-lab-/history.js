(function() {
    'use strict';

    const HISTORY_KEY = 'analysis_history';
    const MAX_HISTORY_ITEMS = 20;

    const HistoryManager = {
        saveHistory: function(analysisData) {
            try {
                const history = this.getHistory();
                
                // 确保所有必要的数据结构都存在
                const historyItem = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    originalText: analysisData.originalText || '',
                    fullTranslation: analysisData.fullTranslation || '',
                    sentences: analysisData.sentences || [],
                    sentenceData: analysisData.sentenceData || {}
                };

                // 确保 sentenceData 中每个句子都有完整的结构
                if (historyItem.sentences.length > 0) {
                    historyItem.sentences.forEach((_, index) => {
                        if (!historyItem.sentenceData[index]) {
                            historyItem.sentenceData[index] = {
                                pos: null,
                                syntax: null,
                                knowledge: null,
                                translation: null
                            };
                        } else {
                            // 确保每个句子的分析数据结构完整
                            const sentenceData = historyItem.sentenceData[index];
                            if (sentenceData.pos === undefined) sentenceData.pos = null;
                            if (sentenceData.syntax === undefined) sentenceData.syntax = null;
                            if (sentenceData.knowledge === undefined) sentenceData.knowledge = null;
                            if (sentenceData.translation === undefined) sentenceData.translation = null;
                        }
                    });
                }

                history.unshift(historyItem);

                if (history.length > MAX_HISTORY_ITEMS) {
                    history.pop();
                }

                localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                console.log('历史记录保存成功:', historyItem);
                return true;
            } catch (error) {
                console.error('保存历史记录失败:', error);
                return false;
            }
        },

        getHistory: function() {
            try {
                const history = localStorage.getItem(HISTORY_KEY);
                return history ? JSON.parse(history) : [];
            } catch (error) {
                console.error('读取历史记录失败:', error);
                return [];
            }
        },

        clearHistory: function() {
            try {
                localStorage.removeItem(HISTORY_KEY);
                return true;
            } catch (error) {
                console.error('清空历史记录失败:', error);
                return false;
            }
        },

        getHistoryItem: function(id) {
            try {
                const history = this.getHistory();
                return history.find(item => item.id === id);
            } catch (error) {
                console.error('获取历史记录项失败:', error);
                return null;
            }
        },

        deleteHistoryItem: function(id) {
            try {
                let history = this.getHistory();
                const initialLength = history.length;
                history = history.filter(item => item.id !== id);
                
                if (history.length !== initialLength) {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                    console.log('历史记录删除成功:', id);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('删除历史记录失败:', error);
                return false;
            }
        }
    };

    if (typeof window !== 'undefined') {
        window.HistoryManager = HistoryManager;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HistoryManager;
    }
})();