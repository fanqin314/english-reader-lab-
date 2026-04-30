// highlight_service.js - 词性高亮服务
// 使用依赖注入替代全局变量，提供清晰的服务接口

(function() {
    'use strict';
    
    /**
     * 词性高亮服务类
     * 封装所有词性高亮相关的业务逻辑
     */
    class HighlightService {
        constructor(cacheService, apiService, eventBus) {
            this.cacheService = cacheService;
            this.apiService = apiService;
            this.eventBus = eventBus;
            
            // 词性到CSS类名的映射
            this.posClassMap = {
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
            
            // 默认高亮配置
            this.defaultHighlightMap = {
                n: true, v: true, adj: true, adv: true, pron: true, 
                prep: true, conj: true, interj: true, art: true, num: true
            };
            
            // 当前高亮配置
            this.highlightPosMap = this.loadHighlightConfig();
            
            console.log('[HighlightService] 服务已初始化');
        }
        
        /**
         * 从 localStorage 加载高亮配置
         */
        loadHighlightConfig() {
            try {
                const saved = localStorage.getItem('highlightPosMap');
                if (saved) {
                    return { ...this.defaultHighlightMap, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.warn('[HighlightService] 加载配置失败:', e);
            }
            return { ...this.defaultHighlightMap };
        }
        
        /**
         * 保存高亮配置到 localStorage
         */
        saveHighlightConfig() {
            try {
                localStorage.setItem('highlightPosMap', JSON.stringify(this.highlightPosMap));
            } catch (e) {
                console.warn('[HighlightService] 保存配置失败:', e);
            }
        }
        
        /**
         * 更新高亮配置
         * @param {Object} newMap - 新的高亮配置
         */
        updateHighlightConfig(newMap) {
            this.highlightPosMap = { ...newMap };
            this.saveHighlightConfig();
            this.eventBus.emit('highlightConfigChanged', this.highlightPosMap);
        }
        
        /**
         * 获取当前高亮配置
         */
        getHighlightConfig() {
            return { ...this.highlightPosMap };
        }
        
        /**
         * 清除所有单词的高亮样式
         */
        clearAllHighlight() {
            document.querySelectorAll('.word-span').forEach(span => {
                span.className = 'word-span';
            });
        }
        
        /**
         * 高亮单个句子中的单词
         * @param {string} sentenceElementId - 句子元素ID
         * @param {Object} sentenceData - 句子数据（包含词性信息）
         */
        highlightSentenceWords(sentenceElementId, sentenceData) {
            const sentenceDiv = document.getElementById(sentenceElementId);
            if (!sentenceDiv) return;
            
            let posList = [];
            if (sentenceData && sentenceData.pos) {
                if (Array.isArray(sentenceData.pos)) {
                    posList = sentenceData.pos;
                } else if (sentenceData.pos.pos) {
                    posList = sentenceData.pos.pos;
                }
            }
            
            if (posList.length === 0) return;
            
            const spans = sentenceDiv.querySelectorAll('.word-span');
            
            spans.forEach(span => {
                const word = span.dataset.word;
                if (!word) return;
                
                const posItem = posList.find(p => 
                    p.word && p.word.toLowerCase() === word.toLowerCase()
                );
                
                if (posItem && this.highlightPosMap[posItem.pos]) {
                    const className = this.posClassMap[posItem.pos];
                    if (className) {
                        span.classList.add(className);
                    }
                }
            });
        }
        
        /**
         * 应用高亮到所有句子
         */
        applyHighlightToAll() {
            this.clearAllHighlight();
            
            if (!this.cacheService) {
                console.warn('[HighlightService] CacheService 不可用');
                return;
            }
            
            const sentences = this.cacheService.getSentences();
            if (!sentences) return;
            
            for (let i = 0; i < sentences.length; i++) {
                const posCache = this.cacheService.getSentenceCache(i, 'pos');
                if (!posCache) continue;
                
                try {
                    const parsed = typeof posCache === 'string' ? JSON.parse(posCache) : posCache;
                    this.highlightSentenceWords(`sentence-${i}`, { pos: parsed });
                } catch (e) {
                    console.warn(`[HighlightService] 解析句子 ${i} 的词性数据失败:`, e);
                }
            }
            
            this.eventBus.emit('highlightApplied', { sentenceCount: sentences.length });
        }
        
        /**
         * 分析单个句子的词性
         * @param {number} idx - 句子索引
         * @param {string} sentence - 句子文本
         */
        async analyzeSentence(idx, sentence) {
            if (!this.apiService) {
                console.warn('[HighlightService] ApiService 不可用');
                return null;
            }
            
            try {
                const result = await this.apiService.requestPos(sentence);
                if (this.cacheService) {
                    this.cacheService.setSentenceCache(idx, 'pos', result);
                }
                return result;
            } catch (error) {
                console.error(`[HighlightService] 分析句子 ${idx} 失败:`, error);
                return null;
            }
        }
        
        /**
         * 分析所有句子的词性
         */
        async analyzeAllSentences() {
            if (!this.cacheService) {
                console.warn('[HighlightService] CacheService 不可用');
                return;
            }
            
            const sentences = this.cacheService.getSentences();
            if (!sentences || sentences.length === 0) {
                console.warn('[HighlightService] 没有句子数据');
                return;
            }
            
            for (let i = 0; i < sentences.length; i++) {
                const sentence = sentences[i];
                if (!sentence) continue;
                
                // 检查是否已有缓存
                const existingPosData = this.cacheService.getSentenceCache(i, 'pos');
                if (existingPosData) continue;
                
                await this.analyzeSentence(i, sentence);
            }
            
            this.eventBus.emit('allSentencesAnalyzed', { count: sentences.length });
        }
    }
    
    // 注册到 DI 容器
    if (window.DIContainer) {
        window.DIContainer.registerSingleton('HighlightService', 
            (cacheService, apiService, eventBus) => {
                return new HighlightService(cacheService, apiService, eventBus);
            }, 
            ['CacheService', 'ApiService', 'EventBus']
        );
        console.log('[HighlightService] 已注册到 DI 容器');
    }
    
    // 导出类供直接使用
    window.HighlightService = HighlightService;
})();
