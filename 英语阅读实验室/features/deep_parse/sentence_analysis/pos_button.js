// 词性按钮.js - 处理句子卡片上词性按钮的点击事件

(function() {
    ModuleRegistry.register('PosButton', ['Security', 'ErrorHandler', 'Performance', 'BaseAnalysisButton', 'GlobalManager'], function(Security, ErrorHandler, Performance, BaseAnalysisButton, GlobalManager) {
        
        // 当前打开的气泡引用
        let currentBubble = null;
        
        // 打开添加单词气泡
        function openAddWordBubble(word, pos, meaning, targetElement) {
            // 关闭已存在的气泡
            closeCurrentBubble();
            
            // 获取所有生词本
            const vocabData = GlobalManager.getGlobalObject('VocabData');
            const notebooks = vocabData ? vocabData.getAllNotebooks() : {};
            
            // 创建气泡元素
            const bubble = document.createElement('div');
            bubble.className = 'word-bubble';
            bubble.id = 'addWordBubble';
            
            // 构建气泡内容
            bubble.innerHTML = `
                <div class="bubble-arrow"></div>
                <div class="bubble-inner">
                    <div class="bubble-title">添加到生词本</div>
                    <input type="text" id="addWordName" class="bubble-word-input" value="${word}" readonly>
                    <div class="bubble-label">选择生词本：</div>
                    <div class="bubble-notebooks">
                        ${Object.entries(notebooks).map(([id, nb]) => `
                            <button class="bubble-nb-btn" data-id="${id}" data-name="${nb.name}">${nb.name}</button>
                        `).join('')}
                    </div>
                    <div class="bubble-new-link-container">
                        <div class="bubble-new-link" id="bubbleNewNotebookLink">+ 新建生词本</div>
                        <div class="bubble-new-form" id="bubbleNewNotebookForm" style="display: none;">
                            <input type="text" id="newNotebookName" class="bubble-new-input" placeholder="生词本名称">
                            <div class="bubble-new-actions">
                                <button class="bubble-new-create-btn">创建并添加</button>
                                <button class="bubble-new-cancel-btn">取消</button>
                            </div>
                            <div class="bubble-new-error" id="bubbleNewNotebookError" style="display: none;"></div>
                        </div>
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
            
            // 绑定生词本按钮事件
            const nbButtons = bubble.querySelectorAll('.bubble-nb-btn');
            nbButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const notebookId = btn.dataset.id;
                    const notebookName = btn.dataset.name;
                    handleAddToNotebook(notebookId, notebookName, word, pos, meaning, btn, bubble);
                });
            });
            
            // 绑定新建生词本链接事件
            const newLink = bubble.querySelector('#bubbleNewNotebookLink');
            const newForm = bubble.querySelector('#bubbleNewNotebookForm');
            const newInput = bubble.querySelector('#newNotebookName');
            const createBtn = bubble.querySelector('.bubble-new-create-btn');
            const cancelBtn = bubble.querySelector('.bubble-new-cancel-btn');
            const errorDiv = bubble.querySelector('#bubbleNewNotebookError');
            
            // 切换表单显示/隐藏
            newLink.addEventListener('click', (e) => {
                e.stopPropagation();
                if (newForm.style.display === 'none') {
                    newForm.style.display = 'block';
                    // 下次展开时清空输入框
                    if (!newInput.value) {
                        newInput.value = '';
                    }
                    errorDiv.style.display = 'none';
                } else {
                    newForm.style.display = 'none';
                }
            });
            
            // 取消按钮事件
            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                newForm.style.display = 'none';
            });
            
            // 创建并添加按钮事件
            createBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = newInput.value.trim();
                
                // 验证输入
                if (!name) {
                    errorDiv.textContent = '请输入生词本名称';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                // 检查是否重名
                const vocabData = GlobalManager.getGlobalObject('VocabData');
                const notebooks = vocabData.getAllNotebooks();
                const exists = Object.values(notebooks).some(nb => nb.name === name);
                if (exists) {
                    errorDiv.textContent = '生词本名称已存在';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                // 创建生词本
                const result = vocabData.createNotebook(name);
                if (result.success) {
                    // 获取新创建的生词本ID
                    const newNotebooks = vocabData.getAllNotebooks();
                    const newNotebookId = Object.keys(newNotebooks).find(id => newNotebooks[id].name === name);
                    
                    if (newNotebookId) {
                        // 自动添加单词
                        const addResult = vocabData.addWord(newNotebookId, {
                            word: word,
                            pos: pos,
                            meaning: meaning,
                            context: '',
                            timestamp: Date.now()
                        });
                        
                        if (addResult.success) {
                            showToast(`已创建生词本"${name}"并添加单词`);
                            setTimeout(() => {
                                closeCurrentBubble();
                            }, 600);
                        } else {
                            errorDiv.textContent = addResult.error;
                            errorDiv.style.display = 'block';
                        }
                    }
                } else {
                    errorDiv.textContent = result.error;
                    errorDiv.style.display = 'block';
                }
            });
        }
        
        // 定位气泡
        function positionBubble(bubble, targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const bubbleRect = bubble.getBoundingClientRect();
            
            // 默认显示在单词右下方
            let left = rect.left;
            let top = rect.bottom + 8;
            
            // 检查是否超出视口右边界
            const viewportWidth = window.innerWidth;
            if (left + 260 > viewportWidth) {
                left = viewportWidth - 270;
            }
            
            // 检查是否超出视口底部
            const viewportHeight = window.innerHeight;
            const bubbleHeight = bubbleRect.height || 200;
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
        
        // 处理添加到生词本
        async function handleAddToNotebook(notebookId, notebookName, word, pos, meaning, btn, bubble) {
            // 检查单词是否已存在
            const vocabData = GlobalManager.getGlobalObject('VocabData');
            const notebook = vocabData.getNotebook(notebookId);
            if (notebook) {
                const exists = notebook.words.some(w => w.word.toLowerCase() === word.toLowerCase());
                if (exists) {
                    showToast('单词已存在');
                    return;
                }
            }
            
            // 按钮变蓝
            btn.style.backgroundColor = '#3b82f6';
            btn.style.color = 'white';
            
            // 添加单词
            const result = vocabData.addWord(notebookId, {
                word: word,
                pos: pos,
                meaning: meaning,
                context: '',
                timestamp: Date.now()
            });
            
            if (result.success) {
                showToast(`已添加 ${word} 到 ${notebookName}`);
                // 延迟关闭气泡
                setTimeout(() => {
                    closeCurrentBubble();
                }, 600);
            } else {
                showToast(result.error);
                // 恢复按钮样式
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }
        }
        
        // 处理创建新生词本
        async function handleCreateNewNotebook(word, pos, meaning, bubble) {
            const name = prompt('请输入新生词本名称:');
            if (!name || !name.trim()) return;
            
            const trimmedName = name.trim();
            
            // 验证输入
            if (trimmedName.length > 50) {
                showToast('生词本名称过长，请使用50个字符以内');
                return;
            }
            
            // 创建生词本
            const vocabData = GlobalManager.getGlobalObject('VocabData');
            const result = vocabData.createNotebook(trimmedName);
            if (result.success) {
                showToast(`已创建生词本"${trimmedName}"`);
                
                // 获取新创建的生词本ID
                const notebooks = vocabData.getAllNotebooks();
                const newNotebookId = Object.keys(notebooks).find(id => notebooks[id].name === trimmedName);
                
                if (newNotebookId) {
                    // 直接添加到新生词本
                    const addResult = vocabData.addWord(newNotebookId, {
                        word: word,
                        pos: pos,
                        meaning: meaning,
                        context: '',
                        timestamp: Date.now()
                    });
                    
                    if (addResult.success) {
                        showToast(`已添加 ${word} 到 ${trimmedName}`);
                        setTimeout(() => {
                            closeCurrentBubble();
                        }, 600);
                    } else {
                        showToast(addResult.error);
                    }
                }
            } else {
                showToast(result.error);
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
        
        class PosButton extends BaseAnalysisButton.BaseAnalysisButton {
            constructor(security, errorHandler, performance, globalManager) {
                super({
                    security,
                    errorHandler,
                    performance,
                    cacheType: 'pos',
                    typeName: '词性'
                });
                this.globalManager = globalManager;
            }

            async callApi(sentence) {
                const apiRequest = this.globalManager.getGlobalObject('APIRequest');
                return await apiRequest.requestPos(sentence);
            }

            displayInPanel(panel, data) {
                if (!panel) return;
                
                try {
                    panel.innerHTML = '';
                    
                    let posData = data;
                    if (typeof data === 'string') {
                        posData = JSON.parse(data);
                    }
                    
                    const posList = posData.pos || [];
                    
                    const title = document.createElement('strong');
                    title.textContent = '词性列表';
                    panel.appendChild(title);
                    
                    const contentDiv = document.createElement('div');
                    
                    if (posList.length === 0) {
                        contentDiv.textContent = '暂无数据';
                        panel.appendChild(contentDiv);
                    } else {
                        contentDiv.className = 'pos-list';
                        
                        posList.forEach(p => {
                            const badge = this.createPosBadge(p);
                            contentDiv.appendChild(badge);
                        });
                        
                        panel.appendChild(contentDiv);
                    }
                    
                    panel.classList.add('show');
                } catch (e) {
                    console.error('显示词性数据失败:', e);
                    panel.innerHTML = '<strong>词性列表</strong><div>数据格式错误</div>';
                    panel.classList.add('show');
                }
            }

            createPosBadge(p) {
                const badge = document.createElement('span');
                badge.className = 'pos-badge';
                
                const wordSpan = document.createElement('span');
                wordSpan.textContent = this.security.escapeHtml(p.word) + ' ';
                badge.appendChild(wordSpan);
                
                const posSpan = document.createElement('span');
                posSpan.style.color = '#3b82f6';
                posSpan.textContent = `[${this.security.escapeHtml(p.pos)}]`;
                badge.appendChild(posSpan);
                
                if (p.meaning) {
                    const meaningSpan = document.createElement('span');
                    meaningSpan.textContent = '· ' + this.security.escapeHtml(p.meaning);
                    badge.appendChild(meaningSpan);
                }
                
                // 添加点击事件监听器
                badge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openAddWordBubble(p.word, p.pos, p.meaning || '', badge);
                });
                
                return badge;
            }
        }
        
        const posButton = new PosButton(Security, ErrorHandler, Performance, GlobalManager);
        
        window.PosButton = {
            loadAndDisplay: posButton.loadAndDisplay.bind(posButton)
        };
        
        window.onLoadPos = window.PosButton.loadAndDisplay;
    });
})();