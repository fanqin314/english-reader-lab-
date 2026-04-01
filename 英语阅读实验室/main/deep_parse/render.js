// render.js - 句子卡片渲染
(function() {
    let sentences = [];
    let sentenceData = {};
    let sentencesContainer = null;

    function setSentencesData(sentencesArray, dataObject) {
        sentences = sentencesArray;
        sentenceData = dataObject;
        console.log('[render] 句子数据已设置', sentences.length);
    }

    function getSentencesData() {
        return { sentences, sentenceData };
    }

    function setContainer(container) {
        sentencesContainer = container;
        console.log('[render] 容器已设置', container);
    }

    function renderAll() {
        if (!sentencesContainer) {
            console.error('[render] 容器未设置，无法渲染');
            return;
        }
        if (!sentences.length) {
            sentencesContainer.innerHTML = '<div class="card"><div class="card-body">暂无句子，请粘贴文章并点击“解析”。</div></div>';
            return;
        }
        sentencesContainer.innerHTML = '';
        sentences.forEach((sentence, idx) => {
            const card = createSentenceCard(sentence, idx);
            sentencesContainer.appendChild(card);
        });
        console.log('[render] 渲染完成，共', sentences.length, '句');
    }

    function createSentenceCard(sentence, idx) {
        const card = document.createElement('div');
        card.className = 'sentence-card';
        card.dataset.index = idx;
        
        const originalDiv = document.createElement('div');
        originalDiv.className = 'sentence-text';
        originalDiv.id = `sentence-${idx}`;
        const words = sentence.split(/(\s+)/).map(part => part.trim() ? part : ' ');
        originalDiv.innerHTML = words.map(part => {
            if (part.trim() === '') return ' ';
            const wordClean = part.replace(/[^\w']/g, '');
            return `<span class="word-span" data-word="${escapeHtml(wordClean)}">${escapeHtml(part)}</span>`;
        }).join('');
        card.appendChild(originalDiv);
        
        const btnGroup = document.createElement('div');
        btnGroup.className = 'sentence-buttons';
        const buttons = [
            { type: 'pos', text: '🏷️ 词性' },
            { type: 'syntax', text: '📐 语法结构' },
            { type: 'knowledge', text: '💡 知识点' },
            { type: 'translation', text: '🌐 翻译' }
        ];
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.dataset.type = btn.type;
            button.dataset.index = idx;
            button.addEventListener('click', () => {
                if (window.onLoadSentenceDetail) window.onLoadSentenceDetail(idx, btn.type);
                else console.error('onLoadSentenceDetail 未定义');
            });
            btnGroup.appendChild(button);
        });
        const refreshSpan = document.createElement('span');
        refreshSpan.className = 'refresh-icon';
        refreshSpan.innerHTML = '🔄';
        refreshSpan.title = '重新解析该句所有数据';
        refreshSpan.addEventListener('click', () => {
            if (window.onRefreshSentence) window.onRefreshSentence(idx);
        });
        btnGroup.appendChild(refreshSpan);
        card.appendChild(btnGroup);
        
        const panels = ['pos', 'syntax', 'knowledge', 'translation'];
        panels.forEach(type => {
            const panel = document.createElement('div');
            panel.className = 'detail-panel';
            panel.id = `${type}-panel-${idx}`;
            card.appendChild(panel);
        });
        return card;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    window.SentenceRenderer = {
        setContainer,
        setSentencesData,
        getSentencesData,
        renderAll
    };
    console.log('[render] 模块已加载，window.SentenceRenderer 已设置');
})();