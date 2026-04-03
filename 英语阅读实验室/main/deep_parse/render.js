// 渲染.js - 句子卡片和详情面板的渲染
(function() {
    let container = null;
    let sentences = [];
    let sentenceData = {};

    // 设置容器
    function setContainer(elem) {
        container = elem;
    }

    // 设置句子数据
    function setSentencesData(sentencesArr, dataObj) {
        sentences = sentencesArr || [];
        sentenceData = dataObj || {};
        
        // 同步到 CacheManager
        if (window.CacheManager) {
            window.CacheManager.setSentences(sentences);
        }
    }

    // 获取句子数据
    function getSentencesData() {
        return {
            sentences: sentences,
            sentenceData: sentenceData
        };
    }

    // 渲染所有句子
    function renderAll() {
        if (!container) {
            console.error('容器未设置');
            return;
        }

        container.innerHTML = '';

        sentences.forEach((sentence, idx) => {
            const card = createSentenceCard(sentence, idx);
            container.appendChild(card);
        });

        // 应用词性高亮（如果已开启）
        if (window.HighlightSwitch && window.HighlightSwitch.isEnabled()) {
            applyAllHighlights();
        }
    }

    // 创建句子卡片
    function createSentenceCard(sentence, idx) {
        const card = document.createElement('div');
        card.className = 'sentence-card';
        card.id = `sentence-${idx}`;

        // 句子文本
        const textDiv = document.createElement('div');
        textDiv.className = 'sentence-text';
        textDiv.id = `sentence-text-${idx}`;
        textDiv.innerText = sentence;
        card.appendChild(textDiv);

        // 句子按钮
        const btnDiv = document.createElement('div');
        btnDiv.className = 'sentence-buttons';

        // 词性按钮
        const posBtn = document.createElement('button');
        posBtn.innerText = '📝 词性';
        posBtn.onclick = () => togglePanel(idx, 'pos');
        btnDiv.appendChild(posBtn);

        // 语法按钮
        const syntaxBtn = document.createElement('button');
        syntaxBtn.innerText = '🔗 语法';
        syntaxBtn.onclick = () => togglePanel(idx, 'syntax');
        btnDiv.appendChild(syntaxBtn);

        // 知识按钮
        const knowledgeBtn = document.createElement('button');
        knowledgeBtn.innerText = '💡 知识';
        knowledgeBtn.onclick = () => togglePanel(idx, 'knowledge');
        btnDiv.appendChild(knowledgeBtn);

        // 翻译按钮
        const transBtn = document.createElement('button');
        transBtn.innerText = '🌐 翻译';
        transBtn.onclick = () => togglePanel(idx, 'translation');
        btnDiv.appendChild(transBtn);

        // 重新加载按钮
        const reloadBtn = document.createElement('button');
        reloadBtn.innerText = '🔄';
        reloadBtn.onclick = () => reloadSentence(idx);
        btnDiv.appendChild(reloadBtn);

        card.appendChild(btnDiv);

        // 创建各个详情面板
        const panels = ['pos', 'syntax', 'knowledge', 'translation'];
        panels.forEach(type => {
            const panel = document.createElement('div');
            panel.className = 'detail-panel';
            panel.id = `${type}-panel-${idx}`;
            panel.innerHTML = `<div style="padding:16px;color:#64748b;">点击上方按钮加载内容</div>`;
            card.appendChild(panel);
        });

        return card;
    }

    // 切换面板显示/隐藏
    function togglePanel(idx, type) {
        const panel = document.getElementById(`${type}-panel-${idx}`);
        if (!panel) return;

        // 调用全局回调函数
        if (window.onLoadSentenceDetail) {
            window.onLoadSentenceDetail(idx, type);
        }

        // 显示面板
        panel.classList.add('show');
    }

    // 重新加载句子
    function reloadSentence(idx) {
        // 清除该句的所有缓存
        if (window.CacheManager) {
            window.CacheManager.clearSentenceCache(idx);
        }

        // 重新显示面板
        const panels = ['pos', 'syntax', 'knowledge', 'translation'];
        panels.forEach(type => {
            const panel = document.getElementById(`${type}-panel-${idx}`);
            if (panel) {
                panel.classList.remove('show');
                panel.innerHTML = `<div style="padding:16px;color:#64748b;">点击上方按钮加载内容</div>`;
            }
        });

        showToast(`已清除第 ${idx + 1} 句的缓存`);
    }

    // 应用所有句子的词性高亮
    function applyAllHighlights() {
        sentences.forEach((sentence, idx) => {
            const cached = window.CacheManager ? window.CacheManager.getSentenceCache(idx, 'pos') : null;
            if (cached) {
                highlightSentenceWords(`sentence-${idx}`, cached);
            }
        });
    }

    // 高亮句子中的单词
    function highlightSentenceWords(sentenceId, posData) {
        const textDiv = document.getElementById(`${sentenceId}-text`);
        if (!textDiv) return;

        try {
            // 解析词性数据
            let posList = [];
            if (typeof posData === 'string') {
                const parsed = JSON.parse(posData);
                posList = parsed.pos || [];
            } else {
                posList = posData.pos || [];
            }

            if (posList.length === 0) return;

            // 获取原句文本
            const originalText = textDiv.innerText;
            
            // 构建高亮后的HTML
            let html = originalText;
            
            // 按单词位置排序（确保长单词先匹配）
            posList.sort((a, b) => b.word.length - a.word.length);

            // 为每个单词添加高亮
            posList.forEach(item => {
                const word = item.word;
                const pos = item.pos ? item.pos.toLowerCase() : '';
                
                // 创建高亮span
                const highlightSpan = `<span class="highlight-word pos-${pos}">${word}</span>`;
                
                // 替换单词（全局替换，但保留大小写）
                const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
                html = html.replace(regex, (match) => {
                    // 保持原单词的大小写
                    return `<span class="highlight-word pos-${pos}">${match}</span>`;
                });
            });

            textDiv.innerHTML = html;
        } catch (e) {
            console.error('高亮失败:', e);
        }
    }

    // 转义正则特殊字符
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 显示提示
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }

    // 导出接口
    window.SentenceRenderer = {
        setContainer,
        setSentencesData,
        getSentencesData,
        renderAll,
        highlightSentenceWords,
        createSentenceCard
    };

    console.log('渲染模块已加载');
})();
