// main/main_buttons.js - 主按钮生成与模式切换
(function() {
    ModuleRegistry.register('MainButtonManager', ['EventBus'], function(EventBus) {
        // 使用全局 EventBus 作为 fallback
        const eventBus = EventBus || window.EventBus;
        console.log('MainButtonManager 使用的 EventBus:', eventBus);
        
        let currentMode = 'analysis';
        let deepParseModule = null;
        let vocabModule = null;

        const mainButtonContainer = document.getElementById('mainButtonContainer');
        const contentArea = document.getElementById('contentArea');
        const sentencesContainer = document.getElementById('sentencesContainer');
        const textareaContainer = document.getElementById('textareaContainer');
        const secondRowContainer = document.getElementById('secondRowContainer');
        const fullTranslationArea = document.getElementById('fullTranslationArea');

        const mainButtons = [
            { id: 'deepParseMainBtn', text: '深度解析', mode: 'analysis', icon: 'search' },
            { id: 'vocabMainBtn', text: '生词本', mode: 'vocab', icon: 'book' },
            { id: 'historyMainBtn', text: '历史记录', mode: 'history', icon: 'history' }
        ];

        function getIconSVG(iconType) {
            const icons = {
                search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>`,
                book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>`,
                history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8v4l3 3"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>`
            };
            return icons[iconType] || icons.search;
        }

        function generateMainButtons() {
            if (!mainButtonContainer) return;
            mainButtonContainer.innerHTML = '';
            
            const menuDiv = document.createElement('div');
            menuDiv.className = 'menu';
            
            mainButtons.forEach(btn => {
                const linkDiv = document.createElement('div');
                linkDiv.className = 'link';
                linkDiv.id = btn.id;
                
                const iconSpan = document.createElement('span');
                iconSpan.className = 'link-icon';
                iconSpan.innerHTML = getIconSVG(btn.icon);
                
                const titleSpan = document.createElement('span');
                titleSpan.className = 'link-title';
                titleSpan.textContent = btn.text;
                
                linkDiv.appendChild(iconSpan);
                linkDiv.appendChild(titleSpan);
                
                if (currentMode === btn.mode) {
                    linkDiv.classList.add('active');
                }
                
                linkDiv.addEventListener('click', () => {
                    if (btn.mode !== currentMode) switchMode(btn.mode);
                });
                
                menuDiv.appendChild(linkDiv);
            });
            
            mainButtonContainer.appendChild(menuDiv);
        }

        function switchMode(mode) {
            currentMode = mode;
            updateButtonHighlight();
            if (mode === 'analysis') showAnalysisMode();
            else if (mode === 'vocab') showVocabMode();
            else showHistoryMode();
        }

        function updateButtonHighlight() {
            mainButtons.forEach(btn => {
                const link = document.getElementById(btn.id);
                if (link) {
                    if (currentMode === btn.mode) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        }

        function showAnalysisMode() {
            // 显示 card-header 和 card-body
            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');
            
            if (cardHeader) {
                cardHeader.style.display = 'flex';
            }
            
            if (cardBody) {
                cardBody.style.display = 'block';
            }
            
            // 确保文本框存在
            if (textareaContainer) {
                // 检查是否已存在textarea元素
                let textarea = document.getElementById('articleInput');
                if (!textarea) {
                    textarea = document.createElement('textarea');
                    textarea.id = 'articleInput';
                    textarea.rows = 5;
                    textarea.placeholder = '粘贴英文文章...';
                    textarea.style.width = '100%';
                    textarea.style.padding = '14px';
                    textarea.style.borderRadius = '20px';
                    textarea.style.border = '1px solid var(--border)';
                    textarea.style.fontSize = '16px';
                    textarea.style.background = 'var(--bg-page)';
                    textarea.style.color = 'var(--text)';
                    textareaContainer.appendChild(textarea);
                }
            }
            if (textareaContainer) textareaContainer.style.display = 'block';
            if (secondRowContainer) secondRowContainer.style.display = 'flex';
            if (fullTranslationArea) fullTranslationArea.style.display = 'block';
            if (sentencesContainer) sentencesContainer.style.display = 'block';
            if (contentArea) contentArea.style.display = 'block';

            // 隐藏二级分析界面
            const secondaryAnalysisContainer = document.getElementById('secondaryAnalysisContainer');
            if (secondaryAnalysisContainer) {
                secondaryAnalysisContainer.style.display = 'none';
            }

            const vocabDiv = document.getElementById('vocabInterface');
            if (vocabDiv) vocabDiv.remove();
            const historyDiv = document.getElementById('historyInterface');
            if (historyDiv) historyDiv.remove();
            
            // 隐藏记忆模式界面
            const memoryModeDiv = document.getElementById('memoryModeInterface');
            if (memoryModeDiv) memoryModeDiv.style.display = 'none';
        }

        function showVocabMode() {
            // 显示 card-header 和 card-body
            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');
            
            if (cardHeader) {
                cardHeader.style.display = 'flex';
            }
            
            if (cardBody) {
                cardBody.style.display = 'block';
            }
            
            if (textareaContainer) textareaContainer.style.display = 'none';
            if (secondRowContainer) secondRowContainer.style.display = 'none';
            if (fullTranslationArea) fullTranslationArea.style.display = 'none';
            if (sentencesContainer) sentencesContainer.style.display = 'none';
            if (contentArea) contentArea.style.display = 'block';
            
            // 隐藏二级分析界面
            const secondaryAnalysisContainer = document.getElementById('secondaryAnalysisContainer');
            if (secondaryAnalysisContainer) {
                secondaryAnalysisContainer.style.display = 'none';
            }
            
            // 移除可能存在的历史记录界面
            const historyDiv = document.getElementById('historyInterface');
            if (historyDiv) historyDiv.remove();
            
            // 隐藏记忆模式界面
            const memoryModeDiv = document.getElementById('memoryModeInterface');
            if (memoryModeDiv) memoryModeDiv.style.display = 'none';
            
            if (vocabModule && vocabModule.showVocabInterface) {
                vocabModule.showVocabInterface(contentArea, sentencesContainer);
            } else if (window.VocabInterface && window.VocabInterface.show) {
                window.VocabInterface.show(contentArea, sentencesContainer);
            } else {
                // 显示错误提示
                if (contentArea) {
                    const errorDiv = document.createElement('div');
                    errorDiv.id = 'vocabInterface';
                    errorDiv.className = 'vocab-card';
                    errorDiv.innerHTML = `
                        <div style="padding: 40px; text-align: center; color: var(--text-light);">
                            <p>⚠️ 生词本界面加载失败</p>
                            <p style="font-size: 0.9rem; margin-top: 10px;">请刷新页面重试</p>
                        </div>
                    `;
                    contentArea.insertBefore(errorDiv, sentencesContainer);
                }
            }
        }

        function showHistoryMode() {
            // 显示 card-header 和 card-body
            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');
            
            if (cardHeader) {
                cardHeader.style.display = 'flex';
            }
            
            if (cardBody) {
                cardBody.style.display = 'block';
            }
            
            if (textareaContainer) textareaContainer.style.display = 'none';
            if (secondRowContainer) secondRowContainer.style.display = 'none';
            if (fullTranslationArea) fullTranslationArea.style.display = 'none';
            if (sentencesContainer) sentencesContainer.style.display = 'none';
            if (contentArea) contentArea.style.display = 'block';
            
            // 隐藏二级分析界面
            const secondaryAnalysisContainer = document.getElementById('secondaryAnalysisContainer');
            if (secondaryAnalysisContainer) {
                secondaryAnalysisContainer.style.display = 'none';
            }
            
            // 移除可能存在的生词本界面
            const vocabDiv = document.getElementById('vocabInterface');
            if (vocabDiv) vocabDiv.remove();
            
            // 隐藏记忆模式界面
            const memoryModeDiv = document.getElementById('memoryModeInterface');
            if (memoryModeDiv) memoryModeDiv.style.display = 'none';
            
            // 显示历史记录界面
            if (window.HistoryInterface && window.HistoryInterface.show) {
                window.HistoryInterface.show(contentArea, sentencesContainer);
            } else {
                // 显示错误提示
                if (contentArea) {
                    const historyDiv = document.createElement('div');
                    historyDiv.id = 'historyInterface';
                    historyDiv.className = 'history-card';
                    historyDiv.innerHTML = `
                        <div style="padding: 40px; text-align: center; color: var(--text-light);">
                            <p>⚠️ 历史记录界面加载失败</p>
                            <p style="font-size: 0.9rem; margin-top: 10px;">请刷新页面重试</p>
                        </div>
                    `;
                    contentArea.insertBefore(historyDiv, sentencesContainer);
                }
            }
            
            // 触发showHistoryMode事件
            if (eventBus && eventBus.emit) {
                eventBus.emit('showHistoryMode');
            }
        }

        function setDeepParseModule(module) { deepParseModule = module; }
        function setVocabModule(module) { vocabModule = module; }
        function getCurrentMode() { return currentMode; }

        function init() {
            generateMainButtons();
            showAnalysisMode();
        }

        // 监听添加新按钮的事件
        if (eventBus && eventBus.on) {
            eventBus.on('addMainButton', function(button) {
                mainButtons.push(button);
                generateMainButtons();
            });

            // 监听导航到二级分析界面的事件
            eventBus.on('navigateToSecondaryAnalysis', function(data) {
                showSecondaryAnalysisMode(data.text, data.historyItem);
            });
        } else {
            console.warn('EventBus 不可用，无法监听 addMainButton 事件');
        }

        function showSecondaryAnalysisMode(text, historyItem) {
            // 隐藏所有界面
            if (textareaContainer) textareaContainer.style.display = 'none';
            if (secondRowContainer) secondRowContainer.style.display = 'none';
            if (fullTranslationArea) fullTranslationArea.style.display = 'none';
            if (sentencesContainer) sentencesContainer.style.display = 'none';
            if (contentArea) contentArea.style.display = 'none';

            // 隐藏 card-header 和 card-body
            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');
            
            if (cardHeader) {
                cardHeader.style.display = 'none';
            }
            
            if (cardBody) {
                cardBody.style.display = 'none';
            }

            // 显示二级分析界面
            const secondaryAnalysisContainer = document.getElementById('secondaryAnalysisContainer');
            if (secondaryAnalysisContainer) {
                secondaryAnalysisContainer.style.display = 'block';
            }

            // 触发分析事件，使用历史记录中的文本和数据
            if (eventBus && eventBus.emit) {
                eventBus.emit('analyzeText', { text: text, historyItem: historyItem });
            }
        }

        // 导出全局接口（保持向后兼容）
        window.MainButtonManager = {
            init, switchMode, getCurrentMode,
            setDeepParseModule, setVocabModule,
            showAnalysisMode, showVocabMode
        };

        return {
            init, switchMode, getCurrentMode,
            setDeepParseModule, setVocabModule,
            showAnalysisMode, showVocabMode
        };
    });
})();