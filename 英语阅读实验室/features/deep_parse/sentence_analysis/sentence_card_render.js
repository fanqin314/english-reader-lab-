// render.js - 句子卡片渲染
(function() {
    ModuleRegistry.register('SentenceRenderer', ['Security', 'Performance'], function(Security, Performance) {
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
            // 优先使用二级分析界面的容器
            const secondaryAnalysisContainer = document.getElementById('secondaryAnalysisContainer');
            const secondaryContainer = document.getElementById('secondarySentencesContainer');
            if (secondaryAnalysisContainer && secondaryAnalysisContainer.style.display !== 'none' && secondaryContainer) {
                sentencesContainer = secondaryContainer;
                console.log('[render] 容器已设置为二级分析界面容器', secondaryContainer);
            } else {
                sentencesContainer = container;
                console.log('[render] 容器已设置', container);
            }
        }

        function renderAll() {
            // 优先使用二级分析界面的容器
            const secondaryAnalysisContainer = document.getElementById('secondaryAnalysisContainer');
            const secondaryContainer = document.getElementById('secondarySentencesContainer');
            if (secondaryAnalysisContainer && secondaryAnalysisContainer.style.display !== 'none' && secondaryContainer) {
                sentencesContainer = secondaryContainer;
            }
            
            if (!sentencesContainer) {
                console.error('[render] 容器未设置，无法渲染');
                return;
            }
            if (!sentences.length) {
                sentencesContainer.innerHTML = '<div class="card"><div class="card-body">暂无句子，请粘贴文章并点击"解析"。</div></div>';
                return;
            }
            
            Performance.trackDOMUpdate();
            
            // 使用文档片段批量更新DOM
            const fragment = document.createDocumentFragment();
            sentences.forEach((sentence, idx) => {
                const card = createSentenceCard(sentence, idx);
                fragment.appendChild(card);
            });
            sentencesContainer.innerHTML = '';
            sentencesContainer.appendChild(fragment);
            
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
                return `<span class="word-span" data-word="${Security.escapeHtml(wordClean)}">${Security.escapeHtml(part)}</span>`;
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
            
            // 按钮点击处理函数
                function handleButtonClick(clickedButton) {
                    const type = clickedButton.dataset.type;
                    const sentenceIndex = idx;
                    
                    // 1. 重置所有按钮样式
                    const allButtons = btnGroup.querySelectorAll('button');
                    allButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.disabled = false;
                    });
                    
                    // 2. 设置当前按钮为激活状态
                    clickedButton.classList.add('active');
                    clickedButton.style.background = 'var(--accent)';
                    clickedButton.style.color = 'white';
                    clickedButton.disabled = true;
                    
                    // 3. 隐藏所有面板
                    const allPanels = card.querySelectorAll('.detail-panel');
                    allPanels.forEach(panel => {
                        panel.classList.remove('show');
                    });
                    
                    // 4. 显示加载状态
                    const panel = document.getElementById(`${type}-panel-${sentenceIndex}`);
                    if (panel) {
                        panel.innerHTML = '<div class="loading">加载中...</div>';
                        panel.classList.add('show');
                    }
                    
                    // 5. 调用对应功能并显示面板
                    // 同时触发 EventBus 和全局回调，确保两种调用方式都能工作
                    if (typeof EventBus !== 'undefined' && EventBus && EventBus.emit) {
                        EventBus.emit('loadSentenceDetail', { idx: sentenceIndex, type, panel });
                    }
                    
                    // 保留原有的全局回调，确保向后兼容
                    if (window.onLoadSentenceDetail) {
                        window.onLoadSentenceDetail(sentenceIndex, type);
                    } else {
                        console.error('onLoadSentenceDetail 未定义');
                        // 恢复按钮状态
                        clickedButton.disabled = false;
                    }
                }
            
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.textContent = btn.text;
                button.dataset.type = btn.type;
                button.dataset.index = idx;
                // 使用性能优化的事件监听器
                Performance.addEventListener(button, 'click', () => handleButtonClick(button));
                btnGroup.appendChild(button);
            });
            const refreshSpan = document.createElement('span');
            refreshSpan.className = 'refresh-icon';
            refreshSpan.innerHTML = '🔄';
            refreshSpan.title = '重新解析该句所有数据';
            Performance.addEventListener(refreshSpan, 'click', () => {
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

        // 导出全局接口（保持向后兼容）
        window.SentenceRenderer = {
            setContainer,
            setSentencesData,
            getSentencesData,
            renderAll
        };
        console.log('[render] 模块已加载，window.SentenceRenderer 已设置');

        return {
            setContainer,
            setSentencesData,
            getSentencesData,
            renderAll
        };
    });
})();