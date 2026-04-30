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

        let virtualScrollInstance = null;

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
            
            // 对于大量句子，使用虚拟滚动
            if (sentences.length > 20) {
                renderWithVirtualScroll();
            } else {
                // 对于少量句子，使用常规渲染
                renderWithFragment();
            }
        }

        function renderWithFragment() {
            // 使用文档片段批量更新DOM
            const fragment = document.createDocumentFragment();
            sentences.forEach((sentence, idx) => {
                const card = createSentenceCard(sentence, idx);
                fragment.appendChild(card);
            });
            sentencesContainer.innerHTML = '';
            sentencesContainer.appendChild(fragment);
            
            console.log('[render] 常规渲染完成，共', sentences.length, '句');
        }

        function renderWithVirtualScroll() {
            // 清除之前的虚拟滚动实例
            if (virtualScrollInstance) {
                virtualScrollInstance.destroy();
            }
            
            // 设置容器样式
            sentencesContainer.style.height = '600px';
            sentencesContainer.style.overflow = 'auto';
            sentencesContainer.style.position = 'relative';
            
            // 卡片高度（估计值）
            const cardHeight = 180;
            
            // 创建虚拟滚动
            virtualScrollInstance = Performance.createVirtualScroll(
                sentencesContainer,
                cardHeight,
                (index) => {
                    return createSentenceCard(sentences[index], index);
                },
                sentences.length
            );
            
            console.log('[render] 虚拟滚动渲染完成，共', sentences.length, '句');
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
                { type: 'pos', text: '词性', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>' },
                { type: 'syntax', text: '语法结构', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' },
                { type: 'knowledge', text: '知识点', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4v3h-4z" /><path d="M12 3a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3 5.5v1h6v-1c1.5-1 3-3 3-5.5a6 6 0 0 0-6-6z" /></svg>' },
                { type: 'translation', text: '翻译', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }
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
                button.dataset.type = btn.type;
                button.dataset.index = idx;
                
                // 创建图标和文本容器
                const buttonContent = document.createElement('span');
                buttonContent.style.display = 'flex';
                buttonContent.style.alignItems = 'center';
                buttonContent.style.gap = '6px';
                
                // 添加图标
                if (btn.icon) {
                    const iconSpan = document.createElement('span');
                    iconSpan.innerHTML = btn.icon;
                    buttonContent.appendChild(iconSpan);
                }
                
                // 添加文本
                const textSpan = document.createElement('span');
                textSpan.textContent = btn.text;
                buttonContent.appendChild(textSpan);
                
                button.appendChild(buttonContent);
                
                // 使用性能优化的事件监听器
                Performance.addEventListener(button, 'click', () => handleButtonClick(button));
                btnGroup.appendChild(button);
            });
            const refreshButton = document.createElement('button');
            refreshButton.className = 'refresh-button';
            refreshButton.title = '重新解析该句所有数据';
            refreshButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>`;
            Performance.addEventListener(refreshButton, 'click', () => {
                // 添加旋转动画
                refreshButton.classList.add('spin');
                setTimeout(() => {
                    refreshButton.classList.remove('spin');
                }, 600);
                if (window.onRefreshSentence) window.onRefreshSentence(idx);
            });
            btnGroup.appendChild(refreshButton);
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