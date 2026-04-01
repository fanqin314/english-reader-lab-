// main/main_buttons.js - 主按钮生成与模式切换
(function() {
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
        else showVocabMode();
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
        if (textareaContainer && textareaContainer.innerHTML === '') {
            const textarea = document.createElement('textarea');
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
        if (textareaContainer) textareaContainer.style.display = 'block';
        if (secondRowContainer) secondRowContainer.style.display = 'flex';
        if (fullTranslationArea) fullTranslationArea.style.display = 'block';
        if (sentencesContainer) sentencesContainer.style.display = 'block';

        const vocabDiv = document.getElementById('vocabInterface');
        if (vocabDiv) vocabDiv.remove();
    }

    function showVocabMode() {
        if (textareaContainer) textareaContainer.style.display = 'none';
        if (secondRowContainer) secondRowContainer.style.display = 'none';
        if (fullTranslationArea) fullTranslationArea.style.display = 'none';
        if (sentencesContainer) sentencesContainer.style.display = 'none';
        if (vocabModule && vocabModule.showVocabInterface) {
            vocabModule.showVocabInterface(contentArea, sentencesContainer);
        }
    }

    function setDeepParseModule(module) { deepParseModule = module; }
    function setVocabModule(module) { vocabModule = module; }
    function getCurrentMode() { return currentMode; }

    function init() {
        generateMainButtons();
        showAnalysisMode();
    }

    window.MainButtonManager = {
        init, switchMode, getCurrentMode,
        setDeepParseModule, setVocabModule,
        showAnalysisMode, showVocabMode
    };

    window.initApp = init;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();