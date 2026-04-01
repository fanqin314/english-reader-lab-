// 生词本界面.js - 生词本界面的HTML渲染和交互

(function() {
    let currentContainer = null;
    let sentencesContainer = null;
    
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
        container.appendChild(header);
        
        // 生词本标签页区域
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'notebook-tabs';
        container.appendChild(tabsDiv);
        
        // 创建生词本区域
        const createDiv = document.createElement('div');
        createDiv.style.marginBottom = '20px';
        const newNameInput = document.createElement('input');
        newNameInput.type = 'text';
        newNameInput.placeholder = '新生词本名称';
        const createBtn = document.createElement('button');
        createBtn.innerText = '➕ 创建生词本';
        createBtn.classList.add('secondary');
        createDiv.appendChild(newNameInput);
        createDiv.appendChild(createBtn);
        container.appendChild(createDiv);
        
        // 手动添加单词区域
        const addWordDiv = document.createElement('div');
        addWordDiv.style.marginBottom = '20px';
        const wordInput = document.createElement('input');
        wordInput.type = 'text';
        wordInput.placeholder = '要添加的单词';
        const meaningInput = document.createElement('input');
        meaningInput.type = 'text';
        meaningInput.placeholder = '中文释义（可选）';
        const addWordBtn = document.createElement('button');
        addWordBtn.innerText = '➕ 手动添加单词';
        addWordBtn.classList.add('secondary');
        addWordDiv.appendChild(wordInput);
        addWordDiv.appendChild(meaningInput);
        addWordDiv.appendChild(addWordBtn);
        container.appendChild(addWordDiv);
        
        // 单词列表区域
        const wordsListDiv = document.createElement('div');
        wordsListDiv.id = 'vocabWordsList';
        container.appendChild(wordsListDiv);
        
        // 刷新界面的函数
        function refreshUI() {
            renderNotebookTabs(tabsDiv, refreshUI);
            renderWordsList(wordsListDiv);
        }
        
        // 创建生词本按钮事件
        createBtn.onclick = () => {
            const name = newNameInput.value.trim();
            if (!name) {
                showToast('请输入生词本名称');
                return;
            }
            const result = window.VocabData.createNotebook(name);
            if (result.success) {
                newNameInput.value = '';
                refreshUI();
                showToast(`生词本“${name}”已创建`);
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
            const currentNotebook = window.VocabData.getCurrentNotebook();
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
                const dictResult = await window.DictService.getWordMeaning(word, {
                    apiCall: async (w) => {
                        if (window.APIRequest && window.APIRequest.requestWordMeaning) {
                            return await window.APIRequest.requestWordMeaning(w);
                        }
                        return null;
                    }
                });
                if (dictResult) {
                    finalMeaning = dictResult.meaning;
                    finalPos = dictResult.pos;
                }
            }
            
            const result = window.VocabData.addWord(window.VocabData.getCurrentNotebookId(), {
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
                showToast(`✅ 已添加“${word}”`);
            } else {
                showToast(result.error);
            }
        };
        
        // 初始渲染
        refreshUI();
    }
    
    // 渲染生词本标签页
    function renderNotebookTabs(container, onRefresh) {
        container.innerHTML = '';
        const notebooks = window.VocabData.getAllNotebooks();
        const currentId = window.VocabData.getCurrentNotebookId();
        
        for (const [id, nb] of Object.entries(notebooks)) {
            const tabWrapper = document.createElement('div');
            tabWrapper.style.display = 'inline-flex';
            tabWrapper.style.alignItems = 'center';
            tabWrapper.style.margin = '0 4px';
            
            const tab = document.createElement('button');
            tab.innerText = nb.name;
            tab.className = 'notebook-tab';
            if (id === currentId) tab.classList.add('active');
            tab.onclick = () => {
                window.VocabData.setCurrentNotebookId(id);
                if (onRefresh) onRefresh();
            };
            tabWrapper.appendChild(tab);
            
            // 删除按钮（如果不是最后一个生词本）
            if (Object.keys(notebooks).length > 1) {
                const delBtn = document.createElement('button');
                delBtn.innerText = '❌';
                delBtn.style.background = 'transparent';
                delBtn.style.color = 'var(--danger)';
                delBtn.style.padding = '4px 8px';
                delBtn.style.marginLeft = '4px';
                delBtn.style.cursor = 'pointer';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`确定删除生词本“${nb.name}”吗？其中的单词将丢失。`)) {
                        const result = window.VocabData.deleteNotebook(id);
                        if (result.success) {
                            if (onRefresh) onRefresh();
                            showToast(`已删除生词本“${nb.name}”`);
                        } else {
                            showToast(result.error);
                        }
                    }
                };
                tabWrapper.appendChild(delBtn);
            }
            
            container.appendChild(tabWrapper);
        }
    }
    
    // 渲染单词列表
    function renderWordsList(container) {
        const currentNotebook = window.VocabData.getCurrentNotebook();
        
        if (!currentNotebook) {
            container.innerHTML = '<div>请选择一个生词本</div>';
            return;
        }
        
        const words = currentNotebook.words;
        
        if (words.length === 0) {
            container.innerHTML = '<div>暂无单词，右键/双击文章中的单词添加，或手动输入。</div>';
            return;
        }
        
        container.innerHTML = '';
        
        words.forEach((w, index) => {
            const div = document.createElement('div');
            div.className = 'word-item';
            
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
                contextSmall.style.color = 'var(--text-light)';
                contextSmall.innerText = ` 上下文: ${w.context}`;
                wordDetail.appendChild(document.createElement('br'));
                wordDetail.appendChild(contextSmall);
            }
            
            const buttonDiv = document.createElement('div');
            
            const editBtn = document.createElement('button');
            editBtn.innerText = '✏️';
            editBtn.className = 'edit-word-btn';
            editBtn.onclick = () => {
                if (window.openEditWordModal) {
                    window.openEditWordModal(w.word, w.pos || '', w.meaning || '');
                }
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = '删除';
            deleteBtn.className = 'delete-word-btn';
            deleteBtn.onclick = () => {
                const result = window.VocabData.deleteWord(window.VocabData.getCurrentNotebookId(), w.word);
                if (result.success) {
                    renderWordsList(container);
                    showToast(`已删除“${w.word}”`);
                } else {
                    showToast(result.error);
                }
            };
            
            buttonDiv.appendChild(editBtn);
            buttonDiv.appendChild(deleteBtn);
            
            div.appendChild(wordDetail);
            div.appendChild(buttonDiv);
            container.appendChild(div);
        });
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
})();