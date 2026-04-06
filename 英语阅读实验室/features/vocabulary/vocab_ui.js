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
        
        // 隐藏句子容器
        if (sentencesContainer) {
            sentencesContainer.style.display = 'none';
        }
        
        // 移除已存在的生词本界面
        const existing = document.getElementById('vocabInterface');
        if (existing) existing.remove();
        
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
        const title = document.createElement('h3');
        title.innerText = '📚 我的生词本';
        header.appendChild(title);
        
        // 统计信息
        const statsDiv = document.createElement('div');
        statsDiv.className = 'vocab-stats';
        const vocabData = getVocabData();
        const totalCount = vocabData.getWordCount();
        const notebookCount = Object.keys(vocabData.getAllNotebooks()).length;
        statsDiv.innerHTML = `<span>${notebookCount} 个生词本</span> | <span>${totalCount} 个单词</span>`;
        header.appendChild(statsDiv);
        container.appendChild(header);
        
        // 创建生词本区域
        const createDiv = document.createElement('div');
        createDiv.className = 'create-notebook-section';
        const newNameInput = document.createElement('input');
        newNameInput.type = 'text';
        newNameInput.placeholder = '新生词本名称';
        newNameInput.className = 'notebook-name-input';
        const createBtn = document.createElement('button');
        createBtn.innerText = '➕ 创建生词本';
        createBtn.className = 'secondary';
        createDiv.appendChild(newNameInput);
        createDiv.appendChild(createBtn);
        container.appendChild(createDiv);
        
        // 生词本标签页区域
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'notebook-tabs';
        container.appendChild(tabsDiv);
        
        // 手动添加单词区域
        const addWordDiv = document.createElement('div');
        addWordDiv.className = 'add-word-section';
        const wordInput = document.createElement('input');
        wordInput.type = 'text';
        wordInput.placeholder = '要添加的单词';
        wordInput.className = 'word-input';
        const meaningInput = document.createElement('input');
        meaningInput.type = 'text';
        meaningInput.placeholder = '中文释义（可选）';
        meaningInput.className = 'meaning-input';
        const addWordBtn = document.createElement('button');
        addWordBtn.innerText = '➕ 手动添加';
        addWordBtn.className = 'secondary';
        addWordDiv.appendChild(wordInput);
        addWordDiv.appendChild(meaningInput);
        addWordDiv.appendChild(addWordBtn);
        container.appendChild(addWordDiv);
        
        // 搜索和排序工具栏
        const toolbarDiv = document.createElement('div');
        toolbarDiv.className = 'words-toolbar';
        
        // 搜索框
        const searchDiv = document.createElement('div');
        searchDiv.className = 'search-box';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍 搜索单词、释义...';
        searchInput.className = 'search-input';
        searchInput.value = currentSearchKeyword;
        searchDiv.appendChild(searchInput);
        toolbarDiv.appendChild(searchDiv);
        
        // 排序控件
        const sortDiv = document.createElement('div');
        sortDiv.className = 'sort-controls';
        const sortSelect = document.createElement('select');
        sortSelect.className = 'sort-select';
        const sortOptions = [
            { value: 'timestamp-desc', text: '最新添加' },
            { value: 'timestamp-asc', text: '最早添加' },
            { value: 'word-asc', text: '单词 A-Z' },
            { value: 'word-desc', text: '单词 Z-A' }
        ];
        sortOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.text = opt.text;
            if (opt.value === `${currentSortBy}-${currentSortOrder}`) {
                option.selected = true;
            }
            sortSelect.appendChild(option);
        });
        sortDiv.appendChild(sortSelect);
        toolbarDiv.appendChild(sortDiv);
        
        // 批量操作按钮
        const batchBtn = document.createElement('button');
        batchBtn.innerText = '☐ 批量操作';
        batchBtn.className = 'batch-mode-btn secondary';
        if (isBatchMode) {
            batchBtn.classList.add('active');
            batchBtn.innerText = '☑ 退出批量';
        }
        toolbarDiv.appendChild(batchBtn);
        
        // 导入导出按钮
        const importExportDiv = document.createElement('div');
        importExportDiv.className = 'import-export-btns';
        const exportBtn = document.createElement('button');
        exportBtn.innerText = '📤 导出';
        exportBtn.className = 'secondary';
        const importBtn = document.createElement('button');
        importBtn.innerText = '📥 导入';
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
                    <input type="checkbox" class="select-all-checkbox"> 全选
                </label>
                <span class="selected-count">已选择 0 个</span>
                <button class="batch-delete-btn" disabled>🗑️ 批量删除</button>
            `;
            container.appendChild(batchBar);
        }
        
        // 单词列表区域
        const wordsListDiv = document.createElement('div');
        wordsListDiv.id = 'vocabWordsList';
        container.appendChild(wordsListDiv);
        
        // 刷新界面的函数
        function refreshUI() {
            renderNotebookTabs(tabsDiv, refreshUI);
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
        
        // 添加单词按钮事件
        addWordBtn.onclick = async () => {
            const word = wordInput.value.trim();
            if (!word) {
                showToast('请输入单词');
                return;
            }
            const meaning = meaningInput.value.trim();
            const vocabData = getVocabData();
            if (!vocabData) {
                showToast('生词本数据服务未初始化');
                return;
            }
            const currentNotebook = vocabData.getCurrentNotebook();
            if (!currentNotebook) {
                showToast('请先选择一个生词本');
                return;
            }
            
            // 检查是否已存在
            const exists = currentNotebook.words.some(w => w.word.toLowerCase() === word.toLowerCase());
            if (exists) {
                showToast('该单词已存在');
                return;
            }
            
            // 如果没有提供释义，尝试从词库获取
            let finalMeaning = meaning;
            let finalPos = '';
            if (!finalMeaning && window.DictService) {
                try {
                    const dictResult = await window.DictService.getWordMeaning(word, {
                        apiCall: async (w) => {
                            const APIRequest = GlobalManager.getGlobalObject('APIRequest');
                            if (APIRequest && APIRequest.requestWordMeaning) {
                                return await APIRequest.requestWordMeaning(w);
                            }
                            return null;
                        }
                    });
                    if (dictResult) {
                        finalMeaning = dictResult.meaning;
                        finalPos = dictResult.pos;
                    }
                } catch (error) {
                    console.error('获取单词释义失败:', error);
                    showToast('获取单词释义失败，将使用手动输入的释义');
                }
            }
            
            try {
                const result = vocabData.addWord(vocabData.getCurrentNotebookId(), {
                    word: word,
                    meaning: finalMeaning,
                    pos: finalPos,
                    context: '',
                    timestamp: Date.now()
                });
                
                if (result.success) {
                    wordInput.value = '';
                    meaningInput.value = '';
                    refreshUI();
                    showToast(`✅ 已添加"${word}"`);
                } else {
                    showToast(`添加失败: ${result.error}`);
                }
            } catch (error) {
                console.error('添加单词失败:', error);
                showToast('添加单词失败，请稍后重试');
            }
        };
        
        // 搜索功能
        searchInput.oninput = () => {
            currentSearchKeyword = searchInput.value;
            renderWordsList(wordsListDiv);
        };
        
        // 排序功能
        sortSelect.onchange = () => {
            const [sortBy, order] = sortSelect.value.split('-');
            currentSortBy = sortBy;
            currentSortOrder = order;
            renderWordsList(wordsListDiv);
        };
        
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
    }
    
    // 渲染生词本标签页
    function renderNotebookTabs(container, onRefresh) {
        container.innerHTML = '';
        const vocabData = getVocabData();
        const notebooks = vocabData.getAllNotebooks();
        const currentId = vocabData.getCurrentNotebookId();
        
        for (const [id, nb] of Object.entries(notebooks)) {
            const tabWrapper = document.createElement('div');
            tabWrapper.className = 'notebook-tab-wrapper';
            
            const tab = document.createElement('button');
            tab.innerText = nb.name;
            tab.className = 'notebook-tab';
            if (id === currentId) tab.classList.add('active');
            
            // 双击重命名
            tab.ondblclick = () => {
                const newName = prompt('请输入新的生词本名称:', nb.name);
                if (newName && newName.trim() !== '' && newName !== nb.name) {
                    const result = vocabData.renameNotebook(id, newName.trim());
                    if (result.success) {
                        if (onRefresh) onRefresh();
                        showToast('重命名成功');
                    } else {
                        showToast(result.error);
                    }
                }
            };
            
            tab.onclick = () => {
                vocabData.setCurrentNotebookId(id);
                // 清空搜索和选择状态
                currentSearchKeyword = '';
                selectedWords.clear();
                if (onRefresh) onRefresh();
            };
            tabWrapper.appendChild(tab);
            
            // 操作按钮组（放在标签下面）
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'notebook-actions';
            
            // 重命名按钮
            const renameBtn = document.createElement('button');
            renameBtn.innerText = '✏️';
            renameBtn.className = 'notebook-action-btn';
            renameBtn.title = '重命名';
            renameBtn.onclick = (e) => {
                e.stopPropagation();
                const newName = prompt('请输入新的生词本名称:', nb.name);
                if (newName && newName.trim() !== '' && newName !== nb.name) {
                    const result = vocabData.renameNotebook(id, newName.trim());
                    if (result.success) {
                        if (onRefresh) onRefresh();
                        showToast('重命名成功');
                    } else {
                        showToast(result.error);
                    }
                }
            };
            actionsDiv.appendChild(renameBtn);
            
            // 删除按钮（如果不是最后一个生词本）
            if (Object.keys(notebooks).length > 1) {
                const delBtn = document.createElement('button');
                delBtn.innerText = '🗑️';
                delBtn.className = 'notebook-action-btn delete';
                delBtn.title = '删除';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`确定删除生词本"${nb.name}"吗？其中的 ${nb.words.length} 个单词将丢失。`)) {
                        const result = vocabData.deleteNotebook(id);
                        if (result.success) {
                            if (onRefresh) onRefresh();
                            showToast(`已删除生词本"${nb.name}"`);
                        } else {
                            showToast(result.error);
                        }
                    }
                };
                actionsDiv.appendChild(delBtn);
            }
            
            tabWrapper.appendChild(actionsDiv);
            container.appendChild(tabWrapper);
        }
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
                div.appendChild(checkbox);
            }
            
            const wordDetail = document.createElement('div');
            wordDetail.className = 'word-detail';
            
            const wordStrong = document.createElement('strong');
            wordStrong.innerText = w.word;
            if (w.pos) {
                wordStrong.innerText += ` [${w.pos}]`;
            }
            wordDetail.appendChild(wordStrong);
            
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
            
            const buttonDiv = document.createElement('div');
            buttonDiv.className = 'word-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerText = '✏️';
            editBtn.className = 'edit-word-btn';
            editBtn.title = '编辑';
            editBtn.onclick = () => {
                if (window.openEditWordModal) {
                    window.openEditWordModal(w.word, w.pos || '', w.meaning || '');
                }
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = '🗑️';
            deleteBtn.className = 'delete-word-btn';
            deleteBtn.title = '删除';
            deleteBtn.onclick = () => {
                if (confirm(`确定删除单词"${w.word}"吗？`)) {
                    const vocabData = getVocabData();
                    if (vocabData) {
                        const result = vocabData.deleteWord(vocabData.getCurrentNotebookId(), w.word);
                        if (result.success) {
                            renderWordsList(container);
                            showToast(`已删除"${w.word}"`);
                        } else {
                            showToast(result.error);
                        }
                    } else {
                        showToast('生词本数据服务未初始化');
                    }
                }
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
