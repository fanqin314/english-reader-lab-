(function() {
    ModuleRegistry.register('VocabMain', ['GlobalManager'], function(GlobalManager) {
        let currentContainer = null;
        let sentencesContainer = null;

        function getVocabData() {
            return GlobalManager.getGlobalObject('VocabData');
        }

        function showVocabInterface(container, sentencesCont) {
            currentContainer = container;
            sentencesContainer = sentencesCont;

            if (!currentContainer) return;

            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');

            if (cardHeader) {
                cardHeader.style.display = 'flex';
            }

            if (cardBody) {
                cardBody.style.display = 'block';
            }

            if (sentencesContainer) {
                sentencesContainer.style.display = 'none';
            }

            const existing = document.getElementById('vocabInterface');
            if (existing) existing.remove();

            const memoryModeDiv = document.getElementById('memoryModeInterface');
            if (memoryModeDiv) memoryModeDiv.style.display = 'none';

            const vocabDiv = document.createElement('div');
            vocabDiv.id = 'vocabInterface';
            vocabDiv.className = 'vocab-card';

            currentContainer.insertBefore(vocabDiv, sentencesContainer);

            renderVocabUI(vocabDiv);
        }

        function renderVocabUI(container) {
            container.innerHTML = '';

            const header = document.createElement('div');
            header.className = 'vocab-header';

            const headerLeft = document.createElement('div');
            headerLeft.className = 'vocab-header-left';

            const title = document.createElement('h3');
            title.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: -5px; margin-bottom: -5px;">
   <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
   <polygon points="12 8 13.5 11.5 17 12 14.5 14 15 17.5 12 15.5 9 17.5 9.5 14 7 12 10.5 11.5 12 8" fill="currentColor" />
 </svg> 我的生词本`;
            headerLeft.appendChild(title);

            const memoryModeWrapper = document.createElement('div');
            memoryModeWrapper.className = 'memory-mode-button-wrapper';

            const outerGlow = document.createElement('div');
            outerGlow.className = 'memory-mode-outer-glow';

            const memoryModeBtn = document.createElement('button');
            memoryModeBtn.className = 'memory-mode-button';
            memoryModeBtn.innerHTML = `
                <span class="memory-mode-button-content">
                    记忆模式
                    <span class="memory-mode-arrow">
                        <svg aria-hidden="true" viewBox="0 0 10 10" height="12" width="12" fill="none" stroke-width="2">
                            <path d="M0 5h7" class="opacity-0 group-hover:opacity-100 transition"></path>
                            <path d="M1 1l4 4-4 4" class="transition"></path>
                        </svg>
                    </span>
                </span>
                <div class="memory-mode-hover-effect">
                    <div></div>
                </div>
            `;
            memoryModeBtn.onclick = () => {
                showMemoryModeInterface(container);
            };

            memoryModeWrapper.appendChild(outerGlow);
            memoryModeWrapper.appendChild(memoryModeBtn);
            headerLeft.appendChild(memoryModeWrapper);

            header.appendChild(headerLeft);

            const statsDiv = document.createElement('div');
            statsDiv.className = 'vocab-stats';
            const vocabData = getVocabData();
            const totalCount = vocabData.getWordCount();
            const notebookCount = Object.keys(vocabData.getAllNotebooks()).length;
            statsDiv.innerHTML = `<span>${notebookCount} 个生词本</span> | <span>${totalCount} 个单词</span>`;
            header.appendChild(statsDiv);

            container.appendChild(header);

            function showMemoryModeInterface(container) {
                container.style.display = 'none';

                const cardHeader = document.querySelector('.card-header');
                const cardBody = document.querySelector('.card-body');

                if (cardHeader) {
                    cardHeader.style.display = 'none';
                }

                if (cardBody) {
                    cardBody.style.display = 'none';
                }

                let memoryModeDiv = document.getElementById('memoryModeInterface');
                if (!memoryModeDiv) {
                    memoryModeDiv = document.createElement('div');
                    memoryModeDiv.id = 'memoryModeInterface';
                    memoryModeDiv.className = 'vocab-card memory-mode-card';
                }

                memoryModeDiv.innerHTML = '';

                const header = document.createElement('div');
                header.className = 'memory-mode-header';

                const backBtn = document.createElement('button');
                backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
                backBtn.className = 'back-btn';
                backBtn.onclick = () => {
                    container.style.display = 'block';
                    memoryModeDiv.style.display = 'none';

                    const cardHeader = document.querySelector('.card-header');
                    const cardBody = document.querySelector('.card-body');

                    if (cardHeader) {
                        cardHeader.style.display = 'flex';
                    }

                    if (cardBody) {
                        cardBody.style.display = 'block';
                    }
                };
                header.appendChild(backBtn);

                const title = document.createElement('h3');
                title.innerText = '🧠 记忆模式';
                header.appendChild(title);

                const headerButtons = document.createElement('div');
                headerButtons.className = 'memory-mode-header-buttons';

                const statsButton = document.createElement('button');
                statsButton.innerText = '学习统计';
                statsButton.className = 'section-btn header-section-btn';
                statsButton.onclick = () => {
                    showStatsDetailInterface(memoryModeDiv);
                };
                headerButtons.appendChild(statsButton);

                const planButton = document.createElement('button');
                planButton.innerText = '学习计划';
                planButton.className = 'section-btn header-section-btn';
                planButton.onclick = () => {
                    showPlanDetailInterface(memoryModeDiv);
                };
                headerButtons.appendChild(planButton);

                header.appendChild(headerButtons);

                const modeSelectDiv = document.createElement('div');
                modeSelectDiv.className = 'mode-select-section';

                const modeButtons = [
                    {
                        id: 'flashcard',
                        text: '闪卡模式',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 50px; height: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: 0;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><path d="M6 8h.01"></path><path d="M10 8h.01"></path><path d="M14 8h.01"></path><path d="M18 8h.01"></path></svg>`
                    },
                    {
                        id: 'fill',
                        text: '填空练习',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 50px; height: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: 0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><rect x="7" y="14" width="4" height="4" rx="1"></rect></svg>`
                    },
                    {
                        id: 'spelling',
                        text: '拼写练习',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 50px; height: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: 0;"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path><path d="M8 12h8"></path></svg>`
                    },
                    {
                        id: 'listening',
                        text: '听力练习',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 50px; height: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: 0;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
                    }
                ];

                modeButtons.forEach(mode => {
                    const modeBtn = document.createElement('button');
                    modeBtn.innerHTML = mode.icon + '<span>' + mode.text + '</span>';
                    modeBtn.className = 'mode-btn';
                    modeBtn.onclick = () => {
                        if (mode.id === 'flashcard') {
                            const flashcardMode = GlobalManager.getGlobalObject('FlashcardMode');
                            if (flashcardMode && flashcardMode.showFlashcardModeInterface) {
                                flashcardMode.showFlashcardModeInterface(memoryModeDiv);
                            } else {
                                showToast('闪卡模式模块未加载');
                            }
                        } else {
                            showToast(`${mode.text}功能即将上线`);
                        }
                    };
                    modeSelectDiv.appendChild(modeBtn);
                });

                memoryModeDiv.appendChild(header);

                const modeTitle = document.createElement('h4');
                modeTitle.innerText = '选择记忆模式';
                memoryModeDiv.appendChild(modeTitle);

                memoryModeDiv.appendChild(modeSelectDiv);

                memoryModeDiv.style.display = 'block';

                if (!document.getElementById('memoryModeInterface')) {
                    const contentArea = document.getElementById('contentArea');
                    if (contentArea) {
                        contentArea.appendChild(memoryModeDiv);
                    }
                }
            }

            function showStatsDetailInterface(container) {
                container.innerHTML = '';

                const header = document.createElement('div');
                header.className = 'memory-mode-header';

                const backBtn = document.createElement('button');
                backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
                backBtn.className = 'back-btn';
                backBtn.onclick = () => {
                    const vocabContainer = document.getElementById('vocabInterface');
                    if (vocabContainer) {
                        showMemoryModeInterface(vocabContainer);
                    }
                };
                header.appendChild(backBtn);

                const title = document.createElement('h3');
                title.innerText = '📊 学习统计';
                header.appendChild(title);

                container.appendChild(header);

                const statsContent = document.createElement('div');
                statsContent.className = 'stats-content';
                statsContent.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">今日学习</span>
                        <span class="stat-value">0 个单词</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总学习</span>
                        <span class="stat-value">0 个单词</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">掌握率</span>
                        <span class="stat-value">0%</span>
                    </div>
                `;
                container.appendChild(statsContent);
            }

            function showPlanDetailInterface(container) {
                container.innerHTML = '';

                const header = document.createElement('div');
                header.className = 'memory-mode-header';

                const backBtn = document.createElement('button');
                backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
                backBtn.className = 'back-btn';
                backBtn.onclick = () => {
                    const vocabContainer = document.getElementById('vocabInterface');
                    if (vocabContainer) {
                        showMemoryModeInterface(vocabContainer);
                    }
                };
                header.appendChild(backBtn);

                const title = document.createElement('h3');
                title.innerText = '📋 学习计划';
                header.appendChild(title);

                container.appendChild(header);

                const planContent = document.createElement('div');
                planContent.className = 'plan-content';
                planContent.innerHTML = `
                    <div class="plan-item">
                        <span>每日目标: </span>
                        <input type="number" value="10" min="1" max="100" class="goal-input">
                        <span>个单词</span>
                    </div>
                    <button class="save-plan-btn">保存计划</button>
                `;
                container.appendChild(planContent);

                const saveBtn = planContent.querySelector('.save-plan-btn');
                if (saveBtn) {
                    saveBtn.onclick = () => {
                        const goalInput = planContent.querySelector('.goal-input');
                        if (goalInput) {
                            const goal = goalInput.value;
                            localStorage.setItem('dailyWordGoal', goal);
                            showToast('每日目标已保存');
                        }
                    };
                }
            }

            const createDiv = document.createElement('div');
            createDiv.className = 'create-notebook-section';
            const newNameInput = document.createElement('input');
            newNameInput.type = 'text';
            newNameInput.placeholder = '新生词本名称';
            newNameInput.className = 'notebook-name-input';
            const createBtn = document.createElement('button');
            createBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> 创建生词本';
            createBtn.className = 'secondary';
            createDiv.appendChild(newNameInput);
            createDiv.appendChild(createBtn);
            container.appendChild(createDiv);

            const tabsDiv = document.createElement('div');
            tabsDiv.className = 'notebook-tabs';
            container.appendChild(tabsDiv);

            const toolbarDiv = document.createElement('div');
            toolbarDiv.className = 'words-toolbar';

            const searchDiv = document.createElement('div');
            searchDiv.className = 'search-box';
            const formDiv = document.createElement('div');
            formDiv.className = 'form';

            const searchIcon = document.createElement('span');
            searchIcon.className = 'search-icon';
            searchIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>`;

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = '搜索单词、释义...';
            searchInput.className = 'input';

            const resetBtn = document.createElement('button');
            resetBtn.className = 'reset';
            resetBtn.type = 'button';
            resetBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>`;

            formDiv.appendChild(searchIcon);
            formDiv.appendChild(searchInput);
            formDiv.appendChild(resetBtn);
            searchDiv.appendChild(formDiv);
            toolbarDiv.appendChild(searchDiv);

            const sortDiv = document.createElement('div');
            sortDiv.className = 'sort-controls';

            const sortOptions = [
                { value: 'timestamp-desc', text: '最新添加' },
                { value: 'timestamp-asc', text: '最早添加' },
                { value: 'word-asc', text: '单词 A-Z' },
                { value: 'word-desc', text: '单词 Z-A' }
            ];

            const sortSelect = document.createElement('div');
            sortSelect.className = 'custom-sort-select';
            const sortSelectTrigger = document.createElement('button');
            sortSelectTrigger.className = 'sort-select-trigger';
            sortSelectTrigger.innerHTML = `<span class="sort-select-text">${sortOptions[0].text}</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            sortSelect.appendChild(sortSelectTrigger);

            const sortDropdown = document.createElement('div');
            sortDropdown.className = 'sort-dropdown';
            sortOptions.forEach(opt => {
                const optDiv = document.createElement('div');
                optDiv.className = 'sort-option';
                optDiv.dataset.value = opt.value;
                optDiv.textContent = opt.text;
                sortDropdown.appendChild(optDiv);
            });
            sortSelect.appendChild(sortDropdown);
            sortDiv.appendChild(sortSelect);
            toolbarDiv.appendChild(sortDiv);

            container.appendChild(toolbarDiv);

            const wordsListDiv = document.createElement('div');
            wordsListDiv.id = 'vocabWordsList';
            wordsListDiv.className = 'words-list';
            container.appendChild(wordsListDiv);

            createBtn.onclick = () => {
                const name = newNameInput.value.trim();
                if (!name) {
                    showToast('请输入生词本名称');
                    return;
                }
                const vocabData = getVocabData();
                const result = vocabData.createNotebook(name);
                if (result.success) {
                    newNameInput.value = '';
                    if (window.VocabList) {
                        window.VocabList.refreshUI();
                    }
                    showToast(`生词本"${name}"已创建`);
                } else {
                    showToast(result.error);
                }
            };

            if (window.VocabList) {
                window.VocabList.init(searchInput, resetBtn, sortSelectTrigger, sortDropdown, toolbarDiv, container);
            }

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.word-item')) {
                    document.querySelectorAll('.word-item').forEach(item => {
                        item.classList.remove('active');
                    });
                }
            });
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.innerText = msg;
                toast.style.opacity = '1';
                setTimeout(() => toast.style.opacity = '0', 2000);
            }
        }

        return {
            showVocabInterface
        };
    });
})();