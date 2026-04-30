// 生词本界面.js - 生词本界面的HTML渲染和交互

(function() {
    ModuleRegistry.register('VocabUI', ['GlobalManager'], function(GlobalManager) {
        // 当前界面容器
        let currentContainer = null;
        // 句子容器
        let sentencesContainer = null;
        // 当前搜索关键词
        let currentSearchKeyword = '';
        // 当前排序方式
        let currentSortBy = 'timestamp';
        // 当前排序顺序
        let currentSortOrder = 'desc';
        // 选中的单词集合
        let selectedWords = new Set();
        // 是否批量模式
        let isBatchMode = false;
        
        // 获取VocabData实例
        function getVocabData() {
            return GlobalManager.getGlobalObject('VocabData');
        }
    
    // 显示生词本界面
    function showVocabInterface(container, sentencesCont) {
        currentContainer = container;
        sentencesContainer = sentencesCont;
        
        if (!currentContainer) return;
        
        // 显示 card-header 和 card-body
        const cardHeader = document.querySelector('.card-header');
        const cardBody = document.querySelector('.card-body');
        
        if (cardHeader) {
            cardHeader.style.display = 'flex';
        }
        
        if (cardBody) {
            cardBody.style.display = 'block';
        }
        
        // 隐藏句子容器
        if (sentencesContainer) {
            sentencesContainer.style.display = 'none';
        }
        
        // 移除已存在的生词本界面
        const existing = document.getElementById('vocabInterface');
        if (existing) existing.remove();
        
        // 移除已存在的记忆模式界面
        const memoryModeDiv = document.getElementById('memoryModeInterface');
        if (memoryModeDiv) memoryModeDiv.style.display = 'none';
        
        // 创建生词本界面容器
        const vocabDiv = document.createElement('div');
        vocabDiv.id = 'vocabInterface';
        vocabDiv.className = 'vocab-card';
        
        currentContainer.insertBefore(vocabDiv, sentencesContainer);
        
        // 渲染界面
        renderVocabUI(vocabDiv);
    }
    
    // 渲染生词本界面
    function renderVocabUI(container) {
        container.innerHTML = '';
        
        // 头部
        const header = document.createElement('div');
        header.className = 'vocab-header';
        
        // 左侧区域：标题和记忆模式按钮
        const headerLeft = document.createElement('div');
        headerLeft.className = 'vocab-header-left';
        
        const title = document.createElement('h3');
        title.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: -5px; margin-bottom: -5px;">
   <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
   <polygon points="12 8 13.5 11.5 17 12 14.5 14 15 17.5 12 15.5 9 17.5 9.5 14 7 12 10.5 11.5 12 8" fill="currentColor" />
 </svg> 我的生词本`;
        headerLeft.appendChild(title);
        
        // 记忆模式按钮
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
        
        // 统计信息
        const statsDiv = document.createElement('div');
        statsDiv.className = 'vocab-stats';
        const vocabData = getVocabData();
        const totalCount = vocabData.getWordCount();
        const notebookCount = Object.keys(vocabData.getAllNotebooks()).length;
        statsDiv.innerHTML = `<span>${notebookCount} 个生词本</span> | <span>${totalCount} 个单词</span>`;
        header.appendChild(statsDiv);
        
        container.appendChild(header);
        
        // 显示记忆模式界面
        function showMemoryModeInterface(container) {
            // 隐藏生词本界面
            container.style.display = 'none';
            
            // 隐藏 card-header 和 card-body
            const cardHeader = document.querySelector('.card-header');
            const cardBody = document.querySelector('.card-body');
            
            if (cardHeader) {
                cardHeader.style.display = 'none';
            }
            
            if (cardBody) {
                cardBody.style.display = 'none';
            }
            
            // 检查是否已存在记忆模式界面
            let memoryModeDiv = document.getElementById('memoryModeInterface');
            if (!memoryModeDiv) {
                // 创建记忆模式界面容器
                memoryModeDiv = document.createElement('div');
                memoryModeDiv.id = 'memoryModeInterface';
                memoryModeDiv.className = 'vocab-card memory-mode-card';
            }
            
            // 清空容器，重新渲染内容
            memoryModeDiv.innerHTML = '';
            
            // 头部区域（包含返回按钮和功能按钮）
            const header = document.createElement('div');
            header.className = 'memory-mode-header';
            
            // 返回按钮
            const backBtn = document.createElement('button');
            backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
            backBtn.className = 'back-btn';
            backBtn.onclick = () => {
                // 显示生词本界面
                container.style.display = 'block';
                // 隐藏记忆模式界面
                memoryModeDiv.style.display = 'none';
                
                // 显示 card-header 和 card-body
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
            
            // 标题
            const title = document.createElement('h3');
            title.innerText = '🧠 记忆模式';
            header.appendChild(title);
            
            // 功能按钮容器
            const headerButtons = document.createElement('div');
            headerButtons.className = 'memory-mode-header-buttons';
            
            // 学习统计按钮
            const statsButton = document.createElement('button');
            statsButton.innerText = '学习统计';
            statsButton.className = 'section-btn header-section-btn';
            statsButton.onclick = () => {
                // 显示学习统计详细界面
                showStatsDetailInterface(memoryModeDiv);
            };
            headerButtons.appendChild(statsButton);
            
            // 学习计划按钮
                const planButton = document.createElement('button');
                planButton.innerText = '学习计划';
                planButton.className = 'section-btn header-section-btn';
                planButton.onclick = () => {
                    // 显示学习计划详细界面
                    showPlanDetailInterface(memoryModeDiv);
                };
            headerButtons.appendChild(planButton);
            
            header.appendChild(headerButtons);
            
            // 模式选择区域
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
            
            // 添加所有按钮
            modeButtons.forEach(mode => {
                const modeBtn = document.createElement('button');
                modeBtn.innerHTML = mode.icon + '<span>' + mode.text + '</span>';
                modeBtn.className = 'mode-btn';
                modeBtn.onclick = () => {
                    if (mode.id === 'flashcard') {
                        // 加载闪卡模式
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
            
            // 添加记忆模式内容
            memoryModeDiv.appendChild(header);
            
            // 添加标题作为memoryModeInterface的直接子元素
            const modeTitle = document.createElement('h4');
            modeTitle.innerText = '选择记忆模式';
            memoryModeDiv.appendChild(modeTitle);
            
            memoryModeDiv.appendChild(modeSelectDiv);
            
            // 确保记忆模式界面可见
            memoryModeDiv.style.display = 'block';
            
            // 如果是首次创建，将记忆模式界面添加到 contentArea
            if (!document.getElementById('memoryModeInterface')) {
                const contentArea = document.getElementById('contentArea');
                if (contentArea) {
                    contentArea.appendChild(memoryModeDiv);
                }
            }
        }
        
        // 显示学习统计详细界面
        function showStatsDetailInterface(container) {
            // 清空容器
            container.innerHTML = '';
            
            // 头部区域（包含返回按钮）
            const header = document.createElement('div');
            header.className = 'memory-mode-header';
            
            // 返回按钮
            const backBtn = document.createElement('button');
            backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
            backBtn.className = 'back-btn';
            backBtn.onclick = () => {
                // 返回到记忆模式主界面
                const vocabContainer = document.getElementById('vocabInterface');
                if (vocabContainer) {
                    showMemoryModeInterface(vocabContainer);
                }
            };
            header.appendChild(backBtn);
            
            // 标题
            const title = document.createElement('h3');
            title.innerText = '📊 学习统计';
            header.appendChild(title);
            
            container.appendChild(header);
            
            // 学习统计内容
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
        
        // 显示学习计划详细界面
        function showPlanDetailInterface(container) {
            // 清空容器
            container.innerHTML = '';
            
            // 头部区域（包含返回按钮）
            const header = document.createElement('div');
            header.className = 'memory-mode-header';
            
            // 返回按钮
            const backBtn = document.createElement('button');
            backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
            backBtn.className = 'back-btn';
            backBtn.onclick = () => {
                // 返回到记忆模式主界面
                const vocabContainer = document.getElementById('vocabInterface');
                if (vocabContainer) {
                    showMemoryModeInterface(vocabContainer);
                }
            };
            header.appendChild(backBtn);
            
            // 标题
            const title = document.createElement('h3');
            title.innerText = '📋 学习计划';
            header.appendChild(title);
            
            container.appendChild(header);
            
            // 学习计划内容
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
            
            // 添加保存计划按钮的点击事件
            const saveBtn = planContent.querySelector('.save-plan-btn');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const goalInput = planContent.querySelector('.goal-input');
                    if (goalInput) {
                        const goal = goalInput.value;
                        // 保存目标到本地存储
                        localStorage.setItem('dailyWordGoal', goal);
                        showToast('每日目标已保存');
                    }
                };
            }
        }
        
        // 创建生词本区域
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
        
        // 生词本标签页区域
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'notebook-tabs';
        container.appendChild(tabsDiv);
        
        // 搜索和排序工具栏
        const toolbarDiv = document.createElement('div');
        toolbarDiv.className = 'words-toolbar';
        
        // 搜索框
        const searchDiv = document.createElement('div');
        searchDiv.className = 'search-box';
        const formDiv = document.createElement('div');
        formDiv.className = 'form';
        
        // 搜索图标
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
        searchInput.value = currentSearchKeyword;
        
        // 清除按钮
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset';
        resetBtn.type = 'button';
        resetBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;
        resetBtn.onclick = () => {
            searchInput.value = '';
            searchInput.focus();
            currentSearchKeyword = '';
            renderWordsList(wordsListDiv);
        };
        
        formDiv.appendChild(searchIcon);
        formDiv.appendChild(searchInput);
        formDiv.appendChild(resetBtn);
        searchDiv.appendChild(formDiv);
        toolbarDiv.appendChild(searchDiv);
        
        // 排序控件
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
        const currentOption = sortOptions.find(opt => opt.value === `${currentSortBy}-${currentSortOrder}`) || sortOptions[0];
        sortSelectTrigger.innerHTML = `<span class="sort-select-text">${currentOption.text}</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        sortSelect.appendChild(sortSelectTrigger);
        
        const sortDropdown = document.createElement('div');
        sortDropdown.className = 'sort-dropdown';
        sortOptions.forEach(opt => {
            const optDiv = document.createElement('div');
            optDiv.className = 'sort-option';
            optDiv.dataset.value = opt.value;
            optDiv.textContent = opt.text;
            if (opt.value === `${currentSortBy}-${currentSortOrder}`) {
                optDiv.classList.add('selected');
            }
            sortDropdown.appendChild(optDiv);
        });
        sortSelect.appendChild(sortDropdown);
        sortDiv.appendChild(sortSelect);
        toolbarDiv.appendChild(sortDiv);
        
        let isSortDropdownOpen = false;
        sortSelectTrigger.onclick = (e) => {
            e.stopPropagation();
            isSortDropdownOpen = !isSortDropdownOpen;
            sortDropdown.classList.toggle('show', isSortDropdownOpen);
            sortSelectTrigger.classList.toggle('active', isSortDropdownOpen);
        };
        
        sortDropdown.querySelectorAll('.sort-option').forEach(optEl => {
            optEl.onclick = (e) => {
                e.stopPropagation();
                const value = optEl.dataset.value;
                sortDropdown.querySelectorAll('.sort-option').forEach(el => el.classList.remove('selected'));
                optEl.classList.add('selected');
                const [sortBy, order] = value.split('-');
                currentSortBy = sortBy;
                currentSortOrder = order;
                sortSelectTrigger.querySelector('.sort-select-text').textContent = optEl.textContent;
                isSortDropdownOpen = false;
                sortDropdown.classList.remove('show');
                sortSelectTrigger.classList.remove('active');
                renderWordsList(wordsListDiv);
            };
        });
        
        document.addEventListener('click', () => {
            if (isSortDropdownOpen) {
                isSortDropdownOpen = false;
                sortDropdown.classList.remove('show');
                sortSelectTrigger.classList.remove('active');
            }
        });
        
        // 批量操作按钮
        const batchBtn = document.createElement('button');
        batchBtn.innerText = '批量操作';
        batchBtn.className = 'batch-mode-btn secondary';

        if (isBatchMode) {
            batchBtn.classList.add('active');
            batchBtn.innerText = '退出批量';
        }
        toolbarDiv.appendChild(batchBtn);
        
        // 导入导出按钮
        const importExportDiv = document.createElement('div');
        importExportDiv.className = 'import-export-btns';
        const exportBtn = document.createElement('button');
        exportBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> 导出';
        exportBtn.className = 'secondary';
        const importBtn = document.createElement('button');
        importBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> 导入';
        importBtn.className = 'secondary';
        importExportDiv.appendChild(exportBtn);
        importExportDiv.appendChild(importBtn);
        toolbarDiv.appendChild(importExportDiv);
        
        container.appendChild(toolbarDiv);
        
        // 批量操作栏
        if (isBatchMode) {
            const batchBar = document.createElement('div');
            batchBar.className = 'batch-actions-bar';
            batchBar.innerHTML = `
                <label class="select-all-label">
                    <input type="checkbox" class="select-all-checkbox">
                </label>
                <span class="selected-count">已选择 0 个</span>
                <button class="batch-delete-btn" disabled>批量删除</button>
            `;
            container.appendChild(batchBar);
        }
        
        // 单词列表区域
        const wordsListDiv = document.createElement('div');
        wordsListDiv.id = 'vocabWordsList';
        wordsListDiv.className = 'words-list';
        container.appendChild(wordsListDiv);
        
        // 刷新界面的函数
        function refreshUI() {
            if (window.NotebookTabUI) {
                window.NotebookTabUI.renderNotebookTabs(tabsDiv, refreshUI);
            } else {
                console.error('NotebookTabUI 未加载');
            }
            renderWordsList(wordsListDiv);
            updateStats();
        }
        
        // 更新统计信息
        function updateStats() {
            const vocabData = getVocabData();
            const totalCount = vocabData.getWordCount();
            const notebookCount = Object.keys(vocabData.getAllNotebooks()).length;
            statsDiv.innerHTML = `<span>${notebookCount} 个生词本</span> | <span>${totalCount} 个单词</span>`;
        }
        
        // 创建生词本按钮事件
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
                refreshUI();
                showToast(`生词本"${name}"已创建`);
            } else {
                showToast(result.error);
            }
        };
        
        // 搜索功能
        searchInput.oninput = () => {
            currentSearchKeyword = searchInput.value;
            renderWordsList(wordsListDiv);
        };
        
        // 排序功能已移至自定义下拉菜单
        
        // 批量模式切换
        batchBtn.onclick = () => {
            isBatchMode = !isBatchMode;
            selectedWords.clear();
            renderVocabUI(container);
        };
        
        // 导出功能
        exportBtn.onclick = () => {
            const vocabData = getVocabData();
            const currentId = vocabData.getCurrentNotebookId();
            if (!currentId) {
                showToast('请先选择一个生词本');
                return;
            }
            
            const result = vocabData.exportNotebook(currentId);
            if (result.success) {
                // 创建下载链接
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('生词本已导出');
            } else {
                showToast(result.error);
            }
        };
        
        // 导入功能
        importBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const vocabData = getVocabData();
                    const result = vocabData.importData(text);
                    if (result.success) {
                        refreshUI();
                        showToast('生词本导入成功');
                    } else {
                        showToast('导入失败: ' + result.error);
                    }
                } catch (err) {
                    showToast('文件读取失败');
                }
            };
            input.click();
        };
        
        // 批量操作栏事件
        if (isBatchMode) {
            const selectAllCheckbox = container.querySelector('.select-all-checkbox');
            const batchDeleteBtn = container.querySelector('.batch-delete-btn');
            const selectedCountSpan = container.querySelector('.selected-count');
            
            selectAllCheckbox.onchange = () => {
                const vocabData = getVocabData();
                const currentNotebook = vocabData.getCurrentNotebook();
                if (selectAllCheckbox.checked) {
                    currentNotebook.words.forEach(w => selectedWords.add(w.word));
                } else {
                    selectedWords.clear();
                }
                updateBatchUI();
                renderWordsList(wordsListDiv);
            };
            
            batchDeleteBtn.onclick = () => {
                if (selectedWords.size === 0) return;
                
                if (confirm(`确定删除选中的 ${selectedWords.size} 个单词吗？`)) {
                    const vocabData = getVocabData();
                    const currentId = vocabData.getCurrentNotebookId();
                    let deletedCount = 0;
                    
                    selectedWords.forEach(word => {
                        const result = vocabData.deleteWord(currentId, word);
                        if (result.success) deletedCount++;
                    });
                    
                    selectedWords.clear();
                    refreshUI();
                    showToast(`已删除 ${deletedCount} 个单词`);
                }
            };
            
            function updateBatchUI() {
                selectedCountSpan.textContent = `已选择 ${selectedWords.size} 个`;
                batchDeleteBtn.disabled = selectedWords.size === 0;
            }
        }
        
        // 初始渲染
        refreshUI();
        
        // 添加全局点击事件，点击页面其他地方时关闭所有卡片的active状态
        document.addEventListener('click', (e) => {
            // 如果点击的不是单词卡片，也不是卡片内的元素，关闭所有active状态
            if (!e.target.closest('.word-item')) {
                document.querySelectorAll('.word-item').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }
    

    
    // 渲染单词列表
    function renderWordsList(container) {
        const vocabData = getVocabData();
        if (!vocabData) {
            container.innerHTML = renderEmptyState('生词本数据服务未初始化');
            return;
        }
        
        const currentNotebook = vocabData.getCurrentNotebook();
        
        if (!currentNotebook) {
            container.innerHTML = renderEmptyState('请选择一个生词本');
            return;
        }
        
        // 获取并排序单词
        let words = vocabData.getWords(
            vocabData.getCurrentNotebookId(),
            currentSortBy,
            currentSortOrder
        );
        
        // 搜索过滤
        if (currentSearchKeyword) {
            words = words.filter(w => {
                const keyword = currentSearchKeyword.toLowerCase();
                return (
                    w.word.toLowerCase().includes(keyword) ||
                    w.meaning.toLowerCase().includes(keyword) ||
                    w.context.toLowerCase().includes(keyword)
                );
            });
        }
        
        if (words.length === 0) {
            if (currentSearchKeyword) {
                container.innerHTML = renderEmptyState('没有找到匹配的单词');
            } else {
                container.innerHTML = renderEmptyState(
                    '暂无单词',
                    '右键或双击文章中的单词可快速添加，或使用上方输入框手动添加'
                );
            }
            return;
        }
        
        // 使用文档片段批量更新DOM，减少重排和重绘
        const fragment = document.createDocumentFragment();
        
        words.forEach((w, index) => {
            const div = document.createElement('div');
            div.className = 'word-item';
            if (isBatchMode && selectedWords.has(w.word)) {
                div.classList.add('selected');
            }
            
            // 添加点击事件，切换active类以显示/隐藏操作按钮
            div.onclick = (e) => {
                // 如果点击的是按钮，不触发卡片的点击事件
                if (e.target.closest('.edit-word-btn') || e.target.closest('.delete-word-btn')) {
                    return;
                }
                
                // 移除其他卡片的active类
                document.querySelectorAll('.word-item').forEach(item => {
                    if (item !== div) {
                        item.classList.remove('active');
                    }
                });
                
                // 切换当前卡片的active类
                div.classList.toggle('active');
            };
            
            // 单词基本信息区域
            const wordDetail = document.createElement('div');
            wordDetail.className = 'word-detail';
            
            // 包裹input和strong的div
            const inputStrongContainer = document.createElement('div');
            inputStrongContainer.style.display = 'flex';
            inputStrongContainer.style.alignItems = 'center';
            inputStrongContainer.style.gap = '8px';
            
            // 复选框（批量模式）
            if (isBatchMode) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'word-checkbox';
                checkbox.checked = selectedWords.has(w.word);
                checkbox.onchange = () => {
                    if (checkbox.checked) {
                        selectedWords.add(w.word);
                    } else {
                        selectedWords.delete(w.word);
                    }
                    renderWordsList(container);
                    // 更新批量操作栏
                    const selectedCountSpan = document.querySelector('.selected-count');
                    const batchDeleteBtn = document.querySelector('.batch-delete-btn');
                    if (selectedCountSpan) selectedCountSpan.textContent = `已选择 ${selectedWords.size} 个`;
                    if (batchDeleteBtn) batchDeleteBtn.disabled = selectedWords.size === 0;
                };
                inputStrongContainer.appendChild(checkbox);
            }
            
            const wordStrong = document.createElement('strong');
            wordStrong.innerText = w.word;
            if (w.pos) {
                wordStrong.innerText += ` [${w.pos}]`;
            }
            inputStrongContainer.appendChild(wordStrong);
            wordDetail.appendChild(inputStrongContainer);
            
            const meaningSmall = document.createElement('small');
            meaningSmall.innerText = w.meaning || '暂无释义';
            wordDetail.appendChild(document.createElement('br'));
            wordDetail.appendChild(meaningSmall);
            
            if (w.context) {
                const contextSmall = document.createElement('small');
                contextSmall.className = 'word-context';
                contextSmall.innerText = `上下文: ${w.context}`;
                wordDetail.appendChild(document.createElement('br'));
                wordDetail.appendChild(contextSmall);
            }
            
            if (w.example && (w.example.en || w.example.zh)) {
                const exampleSmall = document.createElement('small');
                exampleSmall.className = 'word-example';
                if (w.example.en) {
                    exampleSmall.innerText = `例句: ${w.example.en}`;
                    if (w.example.zh) {
                        exampleSmall.innerText += ` (${w.example.zh})`;
                    }
                } else if (w.example.zh) {
                    exampleSmall.innerText = `例句: ${w.example.zh}`;
                }
                wordDetail.appendChild(document.createElement('br'));
                wordDetail.appendChild(exampleSmall);
            }
            
            // 操作按钮区域
            const buttonDiv = document.createElement('div');
            buttonDiv.className = 'word-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerText = '✏️';
            editBtn.className = 'edit-word-btn';
            editBtn.title = '编辑';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                
                // 关闭当前可能存在的气泡
                closeCurrentBubble();
                
                // 创建编辑气泡
                createEditBubble(w, editBtn);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = '🗑️';
            deleteBtn.className = 'delete-word-btn';
            deleteBtn.title = '删除';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                
                // 关闭当前可能存在的气泡
                closeCurrentBubble();
                
                // 创建删除确认气泡
                createDeleteBubble(w, deleteBtn, container);
            };
            
            buttonDiv.appendChild(editBtn);
            buttonDiv.appendChild(deleteBtn);
            
            div.appendChild(wordDetail);
            div.appendChild(buttonDiv);
            fragment.appendChild(div);
        });
        
        // 一次性更新容器
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    // 渲染空状态
    function renderEmptyState(title, subtitle = '') {
        return `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <div class="empty-title">${title}</div>
                ${subtitle ? `<div class="empty-subtitle">${subtitle}</div>` : ''}
            </div>
        `;
    }
    
    // 刷新界面
    function refresh() {
        const vocabDiv = document.getElementById('vocabInterface');
        if (vocabDiv) {
            renderVocabUI(vocabDiv);
        }
    }
    
    // 显示提示消息
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }
    
    // 全局变量，用于跟踪当前气泡
    let currentBubble = null;
    
    // 创建编辑气泡
    function createEditBubble(wordData, targetElement) {
        // 创建气泡元素
        const bubble = document.createElement('div');
        bubble.className = 'word-bubble';
        bubble.id = 'editWordBubble';
        
        // 构建气泡内容
        bubble.innerHTML = `
            <div class="bubble-arrow"></div>
            <div class="bubble-inner">
                <div class="bubble-title">编辑单词</div>
                <div class="form-group">
                    <label>词性:</label>
                    <input type="text" class="pos-input" value="${wordData.pos || ''}" placeholder="如: n., v., adj.等">
                </div>
                <div class="form-group">
                    <label>释义:</label>
                    <textarea class="meaning-input" placeholder="请输入中文释义">${wordData.meaning || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>上下文/例句:</label>
                    <textarea class="context-input" placeholder="请输入单词的上下文或例句">${wordData.context || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button class="save-btn">保存</button>
                    <button class="cancel-btn">取消</button>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.appendChild(bubble);
        currentBubble = bubble;
        
        // 计算位置
        positionBubble(bubble, targetElement);
        
        // 绑定关闭事件
        bindCloseEvents(bubble);
        
        // 绑定保存按钮事件
        const saveBtn = bubble.querySelector('.save-btn');
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const pos = bubble.querySelector('.pos-input').value.trim();
            const meaning = bubble.querySelector('.meaning-input').value.trim();
            const context = bubble.querySelector('.context-input').value.trim();
            
            if (!meaning) {
                showToast('释义不能为空');
                return;
            }
            
            // 更新单词数据
            const vocabData = getVocabData();
            if (vocabData) {
                const result = vocabData.updateWord(vocabData.getCurrentNotebookId(), wordData.word, {
                    pos: pos,
                    meaning: meaning,
                    context: context
                });
                
                if (result.success) {
                    // 关闭气泡并刷新列表
                    closeCurrentBubble();
                    renderWordsList(document.getElementById('vocabWordsList'));
                    showToast('单词信息已更新');
                } else {
                    showToast(result.error);
                }
            } else {
                showToast('生词本数据服务未初始化');
            }
        });
        
        // 绑定取消按钮事件
        const cancelBtn = bubble.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCurrentBubble();
        });
    }
    
    // 定位气泡
    function positionBubble(bubble, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();
        
        // 默认显示在按钮右下方
        let left = rect.left;
        let top = rect.bottom + 8;
        
        // 检查是否超出视口右边界
        const viewportWidth = window.innerWidth;
        if (left + 260 > viewportWidth) {
            left = viewportWidth - 270;
        }
        
        // 检查是否超出视口底部
        const viewportHeight = window.innerHeight;
        const bubbleHeight = bubbleRect.height || 300;
        if (top + bubbleHeight > viewportHeight) {
            // 如果下方空间不足，显示在上方
            top = rect.top - bubbleHeight - 8;
            bubble.classList.add('bubble-top');
        }
        
        bubble.style.left = `${left + window.scrollX}px`;
        bubble.style.top = `${top + window.scrollY}px`;
    }
    
    // 绑定关闭事件
    function bindCloseEvents(bubble) {
        // 点击外部关闭
        const closeHandler = (e) => {
            if (!bubble.contains(e.target)) {
                closeCurrentBubble();
            }
        };
        
        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeCurrentBubble();
            }
        };
        
        // 延迟绑定，避免立即触发
        setTimeout(() => {
            document.addEventListener('click', closeHandler);
            document.addEventListener('keydown', escHandler);
        }, 10);
        
        // 保存处理器引用以便移除
        bubble._closeHandler = closeHandler;
        bubble._escHandler = escHandler;
    }
    
    // 关闭当前气泡
    function closeCurrentBubble() {
        if (currentBubble) {
            // 移除事件监听
            if (currentBubble._closeHandler) {
                document.removeEventListener('click', currentBubble._closeHandler);
            }
            if (currentBubble._escHandler) {
                document.removeEventListener('keydown', currentBubble._escHandler);
            }
            // 移除元素
            currentBubble.remove();
            currentBubble = null;
        }
    }
    
    // 创建删除确认气泡
    function createDeleteBubble(wordData, targetElement, container) {
        // 创建气泡元素
        const bubble = document.createElement('div');
        bubble.className = 'word-bubble';
        bubble.id = 'deleteWordBubble';
        
        // 构建气泡内容
        bubble.innerHTML = `
            <div class="bubble-arrow"></div>
            <div class="bubble-inner">
                <div class="bubble-title">删除单词</div>
                <div class="bubble-message">确定删除单词"${wordData.word}"吗？</div>
                <div class="form-actions">
                    <button class="delete-btn">删除</button>
                    <button class="cancel-btn">取消</button>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.appendChild(bubble);
        currentBubble = bubble;
        
        // 计算位置
        positionBubble(bubble, targetElement);
        
        // 绑定关闭事件
        bindCloseEvents(bubble);
        
        // 绑定删除按钮事件
        const deleteBtn = bubble.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 删除单词
            const vocabData = getVocabData();
            if (vocabData) {
                const result = vocabData.deleteWord(vocabData.getCurrentNotebookId(), wordData.word);
                if (result.success) {
                    // 关闭气泡并刷新列表
                    closeCurrentBubble();
                    renderWordsList(container);
                    showToast(`已删除"${wordData.word}"`);
                } else {
                    showToast(result.error);
                }
            } else {
                showToast('生词本数据服务未初始化');
            }
        });
        
        // 绑定取消按钮事件
        const cancelBtn = bubble.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCurrentBubble();
        });
    }
    
    // 导出接口
    window.VocabInterface = {
        show: showVocabInterface,
        refresh,
        hide: () => {
            const vocabDiv = document.getElementById('vocabInterface');
            if (vocabDiv) vocabDiv.remove();
            if (sentencesContainer) sentencesContainer.style.display = 'block';
        }
    };

    return {
        show: showVocabInterface,
        refresh
    };
    });
})();
