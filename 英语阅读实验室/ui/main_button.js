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
            { id: 'deepParseMainBtn', text: '🔍 深度解析', mode: 'analysis' },
            { id: 'vocabMainBtn', text: '📚 生词本', mode: 'vocab' }
        ];

        function generateMainButtons() {
            if (!mainButtonContainer) return;
            mainButtonContainer.innerHTML = '';
            mainButtons.forEach(btn => {
                const button = document.createElement('button');
                button.id = btn.id;
                button.textContent = btn.text;
                button.classList.add('main-btn');
                if (currentMode === btn.mode) {
                    button.style.background = 'var(--accent)';
                    button.style.color = 'white';
                } else {
                    button.style.background = '#e2e8f0';
                    button.style.color = 'var(--text)';
                }
                button.addEventListener('click', () => {
                    if (btn.mode !== currentMode) switchMode(btn.mode);
                });
                mainButtonContainer.appendChild(button);
            });
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
                const button = document.getElementById(btn.id);
                if (button) {
                    if (currentMode === btn.mode) {
                        button.style.background = 'var(--accent)';
                        button.style.color = 'white';
                    } else {
                        button.style.background = '#e2e8f0';
                        button.style.color = 'var(--text)';
                    }
                }
            });
        }

        function showAnalysisMode() {
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
        }

        function showVocabMode() {
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