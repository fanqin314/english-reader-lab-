// 闪卡模式界面.js - 闪卡模式的界面和交互逻辑
// 基于完整版 flashcard_ui.js 改造，集成到模块化系统

(function() {
    // 将模块挂载到 window 对象（提前挂载，确保 GlobalManager 初始化时能获取到）
    window.FlashcardUI = {
        showFlashcardModeInterface: function(container) {
            console.log('FlashcardUI 模块正在初始化...');
        }
    };

    ModuleRegistry.register('FlashcardUI', ['GlobalManager'], function(GlobalManager) {
        // 获取VocabData实例
        function getVocabData() {
            return GlobalManager.getGlobalObject('VocabData');
        }

        // 当前单词索引
        let currentIndex = 0;
        // 单词数据列表
        let wordsData = [];
        // 是否为翻转模式
        let isFlipMode = false;

        // 默认单词库 (当生词本为空时使用)
        const DEFAULT_WORDS = [
            { word: "Antique", pos: "adj / n", meaning: "古老的，古董的", example: null },
            { word: "Exert", pos: "v", meaning: "施加（影响）；运用", example: null },
            { word: "Peculiar", pos: "adj", meaning: "奇怪的；特有的", example: null },
            { word: "Fascination", pos: "n", meaning: "魅力；着迷", example: null },
            { word: "Pretentious", pos: "adj", meaning: "自命不凡的，做作的", example: null },
            { word: "Ephemeral", pos: "adj", meaning: "短暂的，瞬息的", example: null },
            { word: "Serendipity", pos: "n", meaning: "意外发现珍宝的运气", example: null },
            { word: "Mellifluous", pos: "adj", meaning: "甜美流畅的（声音）", example: null }
        ];

        // 例句模拟库
        const FAKE_EXAMPLES = {
            "Antique": { en: "This antique vase is worth a fortune.", zh: "这个古董花瓶价值连城。" },
            "Exert": { en: "He had to exert all his strength.", zh: "他必须使出全力。" },
            "Peculiar": { en: "There's a peculiar smell.", zh: "有一股奇怪的气味。" },
            "Fascination": { en: "The castle held a strange fascination.", zh: "古堡有种奇怪的魅力。" },
            "Pretentious": { en: "His pretentious style annoys readers.", zh: "他做作的风格惹人反感。" },
            "Ephemeral": { en: "Fame can be ephemeral.", zh: "名声可能转瞬即逝。" },
            "Serendipity": { en: "Finding that book was serendipity.", zh: "找到那本书纯属机缘。" },
            "Mellifluous": { en: "Her mellifluous voice captivated all.", zh: "她甜美的嗓音迷住了所有人。" }
        };

        // 加载单词数据
        function loadWordsData() {
            const vocabData = getVocabData();
            if (!vocabData) {
                console.warn('生词本数据服务未初始化');
                wordsData = [];
                return;
            }

            const currentNotebook = vocabData.getCurrentNotebook();
            if (!currentNotebook || currentNotebook.words.length === 0) {
                console.warn('当前生词本为空');
                wordsData = [];
                return;
            }

            // 转换单词数据格式，包括例句
            wordsData = currentNotebook.words.map(word => ({
                word: word.word,
                pos: word.pos || 'n',
                meaning: word.meaning,
                example: word.example || null
            }));

            // 随机打乱单词顺序
            shuffleArray(wordsData);
            currentIndex = 0;
        }

        // 打乱数组
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // 显示闪卡模式界面
        function showFlashcardModeInterface(container) {
            // 隐藏其他界面元素
            hideOtherElements();

            // 隐藏记忆模式界面的原有内容
            const memoryModeHeader = container.querySelector('.memory-mode-header');
            const memoryModeTitle = container.querySelector('h4');
            const modeSelectSection = container.querySelector('.mode-select-section');
            
            if (memoryModeHeader) memoryModeHeader.style.display = 'none';
            if (memoryModeTitle) memoryModeTitle.style.display = 'none';
            if (modeSelectSection) modeSelectSection.style.display = 'none';

            // 加载单词数据
            loadWordsData();

            const totalWords = wordsData.length;

            // 创建闪卡容器
            let flashcardContainer = document.getElementById('flashcardModeContainer');
            if (!flashcardContainer) {
                flashcardContainer = document.createElement('div');
                flashcardContainer.id = 'flashcardModeContainer';
            }
            flashcardContainer.innerHTML = '';

            // 检查是否有单词
            if (totalWords === 0) {
                // 显示空状态
                const emptyHTML = `
                    <button class="icon-only-btn back-btn" id="backBtn" style="position: absolute; top: 0px; left: 0px; z-index: 0;">
                        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div class="empty-state">
                        <div class="empty-icon">📖</div>
                        <div class="empty-title">暂无单词</div>
                        <div class="empty-subtitle">请先在生词本中添加单词</div>
                    </div>
                `;
                flashcardContainer.innerHTML = emptyHTML;
                container.appendChild(flashcardContainer);
                
                // 添加返回按钮事件
                const backBtn = document.getElementById('backBtn');
                if (backBtn) {
                    backBtn.onclick = () => {
                        // 移除闪卡容器
                        if (flashcardContainer) {
                            flashcardContainer.remove();
                        }
                        
                        // 显示记忆模式界面的原有内容
                        if (container) {
                            const memoryModeHeader = container.querySelector('.memory-mode-header');
                            const memoryModeTitle = container.querySelector('h4');
                            const modeSelectSection = container.querySelector('.mode-select-section');
                            
                            if (memoryModeHeader) memoryModeHeader.style.display = 'flex';
                            if (memoryModeTitle) memoryModeTitle.style.display = 'block';
                            if (modeSelectSection) modeSelectSection.style.display = 'flex';
                        }
                    };
                }
                return;
            }

            // 创建闪卡界面
            const flashcardHTML = `
                <button class="icon-only-btn back-btn" id="backBtn" style="position: absolute; top: 0px; left: 0px; z-index: 0;">
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div class="word-card-container">
                    <div class="card-3d" id="magicCard">
                        <div class="glare" id="glareLayer"></div>
                        <div class="content">
                            <div class="word-section" id="wordSection">
                                <div class="word" id="currentWord">loading...</div>
                                <div class="pos" id="currentPos"></div>
                                <div class="meaning" id="currentMeaning"></div>
                                <div id="flipWrapper" style="display: none;"></div>
                            </div>
                            <div class="example-area" id="exampleArea">
                                <div class="example-text">
                                    <div class="example-en" id="exampleEn">点击右侧星星生成例句</div>
                                    <div class="example-zh" id="exampleZh"></div>
                                </div>
                                <div class="capsule-button">
                                    <button class="capsule-btn upper-btn" id="generateExampleBtn" aria-label="生成例句">
                                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    </button>
                                    <div class="capsule-divider"></div>
                                    <button class="capsule-btn lower-btn" id="toggleTranslationBtn" aria-label="隐藏/显示翻译">
                                        <svg viewBox="0 0 24 24" id="hideIcon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2.5"/></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="nav-buttons">
                                <button class="nav-btn" id="prevBtn">
                                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                                    上一个
                                </button>
                                <span class="counter" id="counter">1 / ${totalWords}</span>
                                <button class="nav-btn" id="nextBtn">
                                    下一个
                                    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                            <div class="progress"><div class="progress-bar" id="progressBar"></div></div>
                        </div>
                    </div>
                </div>
            `;

            flashcardContainer.innerHTML = flashcardHTML;
            container.appendChild(flashcardContainer);

            // 初始化界面
            initFlashcardUI(container, flashcardContainer);
        }

        // 隐藏其他界面元素
        function hideOtherElements() {
            // 隐藏 card-header 和 card-body
            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');
            
            if (cardHeader) {
                cardHeader.style.display = 'none';
            }
            
            if (cardBody) {
                cardBody.style.display = 'none';
            }
        }



        // 初始化闪卡界面
        function initFlashcardUI(memoryModeContainer, flashcardContainer) {
            // DOM 元素
            const card = document.getElementById('magicCard');
            const glare = document.getElementById('glareLayer');
            const wordSection = document.getElementById('wordSection');
            const wordEl = document.getElementById('currentWord');
            const posEl = document.getElementById('currentPos');
            const meaningEl = document.getElementById('currentMeaning');
            const exampleEnEl = document.getElementById('exampleEn');
            const exampleZhEl = document.getElementById('exampleZh');
            const generateBtn = document.getElementById('generateExampleBtn');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const counterSpan = document.getElementById('counter');
            const progressBar = document.getElementById('progressBar');
            const toggleTransBtn = document.getElementById('toggleTranslationBtn');
            const hideIconSvg = document.getElementById('hideIcon');
            const flipWrapper = document.getElementById('flipWrapper');
            const exampleArea = document.getElementById('exampleArea');
            const backBtn = document.getElementById('backBtn');
            const navButtons = [prevBtn, nextBtn];
            const totalWords = wordsData.length;

            // 初始化主题
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }

            // 翻转卡片功能
            function buildFlipStructure(word, meaning) {
                flipWrapper.style.display = 'block';
                flipWrapper.innerHTML = `
                    <div class="flip-container">
                        <div class="flipper">
                            <div class="flip-front">${word}</div>
                            <div class="flip-back">${meaning}</div>
                        </div>
                    </div>
                `;
                wordEl.style.display = 'none';
                posEl.style.display = 'none';
                meaningEl.style.display = 'none';
                wordSection.classList.add('flip-mode');
            }

            function destroyFlipStructure() {
                flipWrapper.style.display = 'none';
                flipWrapper.innerHTML = '';
                wordEl.style.display = '';
                posEl.style.display = '';
                meaningEl.style.display = '';
                wordSection.classList.remove('flip-mode');
            }

            function updateFlipContent(word, meaning) {
                const front = document.querySelector('.flip-front');
                const back = document.querySelector('.flip-back');
                if (front) front.textContent = word;
                if (back) back.textContent = meaning;
            }

            function toggleTranslationMode() {
                isFlipMode = !isFlipMode;
                const item = wordsData[currentIndex];

                if (isFlipMode) {
                    exampleArea.classList.add('hide-zh');
                    buildFlipStructure(item.word, item.meaning);
                    hideIconSvg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
                    toggleTransBtn.setAttribute('aria-label', '显示翻译');
                } else {
                    exampleArea.classList.remove('hide-zh');
                    destroyFlipStructure();
                    hideIconSvg.innerHTML = `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2.5"/>`;
                    toggleTransBtn.setAttribute('aria-label', '隐藏翻译');
                    updateCardContent();
                }
            }

            // 更新卡片内容
            function updateCardContent() {
                if (wordsData.length === 0) {
                    wordEl.textContent = '无单词';
                    posEl.textContent = '';
                    meaningEl.textContent = '请先在生词本中添加单词';
                    counterSpan.textContent = '0 / 0';
                    progressBar.style.width = '0%';
                    exampleEnEl.textContent = '暂无例句';
                    exampleZhEl.textContent = '';
                    return;
                }

                const item = wordsData[currentIndex];
                wordEl.textContent = item.word;
                posEl.textContent = item.pos;
                meaningEl.textContent = item.meaning;
                counterSpan.textContent = `${currentIndex+1} / ${totalWords}`;
                progressBar.style.width = `${((currentIndex+1)/totalWords)*100}%`;
                if (item.example) {
                    exampleEnEl.textContent = item.example.en;
                    exampleZhEl.textContent = item.example.zh;
                } else {
                    exampleEnEl.textContent = '点击右侧星星生成例句';
                    exampleZhEl.textContent = '';
                }
            }

            // 更新卡片
            function updateCard() {
                wordSection.classList.add('animate');
                setTimeout(() => wordSection.classList.remove('animate'), 250);

                if (wordsData.length === 0) {
                    updateCardContent();
                    return;
                }

                const item = wordsData[currentIndex];
                if (isFlipMode) {
                    updateFlipContent(item.word, item.meaning);
                    exampleArea.classList.add('hide-zh');
                } else {
                    wordEl.textContent = item.word;
                    posEl.textContent = item.pos;
                    meaningEl.textContent = item.meaning;
                    exampleArea.classList.remove('hide-zh');
                }
                counterSpan.textContent = `${currentIndex+1} / ${totalWords}`;
                progressBar.style.width = `${((currentIndex+1)/totalWords)*100}%`;
                if (item.example) {
                    exampleEnEl.textContent = item.example.en;
                    exampleZhEl.textContent = item.example.zh;
                } else {
                    exampleEnEl.textContent = '点击右侧星星生成例句';
                    exampleZhEl.textContent = '';
                }
            }

            // 生成例句
            async function handleGenerateExample() {
                if (wordsData.length === 0) return;

                const item = wordsData[currentIndex];
                
                // 检查是否已有例句
                if (item.example && item.example.en && item.example.zh) {
                    // 已有例句，直接显示
                    exampleEnEl.textContent = item.example.en;
                    exampleZhEl.textContent = item.example.zh;
                    return;
                }
                
                // 没有例句，生成新的
                exampleEnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle; animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> 生成中...';
                exampleZhEl.textContent = '';
                
                try {
                    // 调用API生成例句
                    const APIRequest = window.APIRequest || (window.GlobalManager && window.GlobalManager.getGlobalObject('APIRequest'));
                    if (APIRequest && APIRequest.requestExample) {
                        const example = await APIRequest.requestExample(item.word, item.meaning);
                        if (example && example.en && example.zh) {
                            // 保存到单词对象中
                            item.example = example;
                            exampleEnEl.textContent = example.en;
                            exampleZhEl.textContent = example.zh;
                            
                            // 保存到 VocabData 中
                            const vocabData = getVocabData();
                            if (vocabData) {
                                const currentNotebookId = vocabData.getCurrentNotebookId();
                                vocabData.updateWord(currentNotebookId, item.word, { example: example });
                            }
                        } else {
                            // 回退到默认例句
                            const defaultExample = FAKE_EXAMPLES[item.word] || { 
                                en: `"${item.word}" is a great word.`, 
                                zh: `「${item.word}」是个好词。` 
                            };
                            item.example = defaultExample;
                            exampleEnEl.textContent = defaultExample.en;
                            exampleZhEl.textContent = defaultExample.zh;
                            
                            // 保存默认例句到 VocabData 中
                            const vocabData = getVocabData();
                            if (vocabData) {
                                const currentNotebookId = vocabData.getCurrentNotebookId();
                                vocabData.updateWord(currentNotebookId, item.word, { example: defaultExample });
                            }
                        }
                    } else {
                        // API不可用时使用默认例句
                        const defaultExample = FAKE_EXAMPLES[item.word] || { 
                            en: `"${item.word}" is a great word.`, 
                            zh: `「${item.word}」是个好词。` 
                        };
                        item.example = defaultExample;
                        exampleEnEl.textContent = defaultExample.en;
                        exampleZhEl.textContent = defaultExample.zh;
                        
                        // 保存默认例句到 VocabData 中
                        const vocabData = getVocabData();
                        if (vocabData) {
                            const currentNotebookId = vocabData.getCurrentNotebookId();
                            vocabData.updateWord(currentNotebookId, item.word, { example: defaultExample });
                        }
                    }
                } catch (error) {
                    console.error('生成例句失败:', error);
                    // 错误时使用默认例句
                    const defaultExample = FAKE_EXAMPLES[item.word] || { 
                        en: `"${item.word}" is a great word.`, 
                        zh: `「${item.word}」是个好词。` 
                    };
                    item.example = defaultExample;
                    exampleEnEl.textContent = defaultExample.en;
                    exampleZhEl.textContent = defaultExample.zh;
                    
                    // 保存默认例句到 VocabData 中
                    const vocabData = getVocabData();
                    if (vocabData) {
                        const currentNotebookId = vocabData.getCurrentNotebookId();
                        vocabData.updateWord(currentNotebookId, item.word, { example: defaultExample });
                    }
                }
            }

            // 上一个单词
            function prevWord() {
                if (wordsData.length === 0) return;
                currentIndex = (currentIndex - 1 + totalWords) % totalWords;
                updateCard();
            }

            // 下一个单词
            function nextWord() {
                if (wordsData.length === 0) return;
                currentIndex = (currentIndex + 1) % totalWords;
                updateCard();
            }

            // 返回按钮事件
            backBtn.addEventListener('click', () => {
                // 移除闪卡容器
                if (flashcardContainer) {
                    flashcardContainer.remove();
                }
                
                // 显示记忆模式界面的原有内容
                if (memoryModeContainer) {
                    const memoryModeHeader = memoryModeContainer.querySelector('.memory-mode-header');
                    const memoryModeTitle = memoryModeContainer.querySelector('h4');
                    const modeSelectSection = memoryModeContainer.querySelector('.mode-select-section');
                    
                    if (memoryModeHeader) memoryModeHeader.style.display = 'flex';
                    if (memoryModeTitle) memoryModeTitle.style.display = 'block';
                    if (modeSelectSection) modeSelectSection.style.display = 'flex';
                }
            });

            // 事件监听
            generateBtn.addEventListener('click', handleGenerateExample);
            prevBtn.addEventListener('click', prevWord);
            nextBtn.addEventListener('click', nextWord);
            toggleTransBtn.addEventListener('click', toggleTranslationMode);

            // 键盘事件
            window.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') { e.preventDefault(); prevWord(); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); nextWord(); }
            });

            // 3D倾斜效果
            function applyReverseTilt(rotateX, rotateY) {
                const reverseX = -rotateX;
                const reverseY = -rotateY;
                navButtons.forEach(btn => {
                    btn.style.setProperty('--btn-rotate-x', reverseX + 'deg');
                    btn.style.setProperty('--btn-rotate-y', reverseY + 'deg');
                });
            }

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 22;
                const rotateX = (y - 0.5) * -22;
                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                // 光晕效果
                const gX = x * 100, gY = y * 100;
                const isDark = document.body.classList.contains('dark');
                glare.style.background = `radial-gradient(circle at ${gX}% ${gY}%, rgba(255,255,255,${isDark?0.3:0.5}) 0%, transparent 70%)`;
                glare.style.opacity = isDark ? '0.7' : '0.9';

                // 反向倾斜应用到按钮
                applyReverseTilt(rotateX, rotateY);
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
                glare.style.opacity = '0';
                // 重置按钮倾斜
                applyReverseTilt(0, 0);
            });

            // 初始化按钮倾斜为0
            applyReverseTilt(0, 0);
            updateCard();

            // 返回 API 以便外部控制
            return {
                next: nextWord,
                prev: prevWord,
                setIndex: (idx) => { currentIndex = idx % totalWords; updateCard(); },
                getCurrentWord: () => wordsData[currentIndex]
            };
        }

        // 更新 window.FlashcardUI 为实际的实现
        window.FlashcardUI = {
            showFlashcardModeInterface
        };

        return {
            showFlashcardModeInterface
        };
    });
})();
