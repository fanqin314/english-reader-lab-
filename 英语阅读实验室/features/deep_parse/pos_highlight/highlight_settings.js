// 高亮设置弹窗.js - 词性选择弹窗（含一键添加所有该词性单词）

(function() {
    let modal = null;
    
    const posList = [
        { code: 'n', name: '名词', color: '#8B5A2B' },
        { code: 'v', name: '动词', color: '#EF4444' },
        { code: 'adj', name: '形容词', color: '#F97316' },
        { code: 'adv', name: '副词', color: '#EAB308' },
        { code: 'pron', name: '代词', color: '#22C55E' },
        { code: 'prep', name: '介词', color: '#3B82F6' },
        { code: 'conj', name: '连词', color: '#6366F1' },
        { code: 'interj', name: '感叹词', color: '#A855F7' },
        { code: 'art', name: '冠词', color: '#EC4899' },
        { code: 'num', name: '数词', color: '#6B7280' }
    ];
    
    let currentPosMap = {};
    
    function init() {
        modal = document.getElementById('posSettingsModal');
        if (!modal) {
            console.warn('高亮设置弹窗容器 #posSettingsModal 未找到');
            return;
        }
        
        loadCurrentConfig();
        renderContent();
        bindCloseEvents();
    }
    
    function loadCurrentConfig() {
        if (window.HighlightRenderer) {
            currentPosMap = window.HighlightRenderer.getHighlightPosMap();
        } else {
            posList.forEach(pos => {
                currentPosMap[pos.code] = true;
            });
        }
    }
    
    function renderContent() {
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="setting-row">
                    <span style="font-weight:600;">🎨 词性高亮设置</span>
                    <button id="closePosSettingsBtn" style="background:none; font-size:20px; cursor:pointer;">✕</button>
                </div>
                <div id="posCheckboxGroup" class="checkbox-group"></div>
                <div class="button-group">
                    <button id="applyHighlightSettings">应用高亮</button>
                    <button id="addAllPosToVocabBtn" class="secondary">一键添加所有该词性单词</button>
                </div>
                <div class="vocab-select-section">
                    <label for="vocabNotebookSelect" style="display: block; margin: 12px 0 6px 0; font-size: 14px;">添加到生词本：</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <select id="vocabNotebookSelect" style="flex: 1; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"></select>
                        <button id="createNotebookBtn" style="padding: 6px 12px; background-color: #888888; color: white; border: none; border-radius: 4px; font-size: 14px; cursor: pointer;">+ 新建生词本</button>
                    </div>
                    <div id="createNotebookForm" style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 8px; display: none;">
                        <input type="text" id="newNotebookName" placeholder="请输入生词本名称" style="width: 100%; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                        <div style="display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end;">
                            <button id="cancelCreateNotebook" style="padding: 4px 12px; background-color: #e0e0e0; color: #333; border: none; border-radius: 4px; font-size: 13px; cursor: pointer;">取消</button>
                            <button id="confirmCreateNotebook" style="padding: 4px 12px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 13px; cursor: pointer;">创建</button>
                        </div>
                        <div id="createNotebookError" style="margin-top: 6px; color: #ef4444; font-size: 12px; display: none;"></div>
                    </div>
                </div>
                <div style="font-size: 12px; color: var(--text-light); margin-top: 12px;">
                    💡 单击"词性高亮"按钮开关高亮显示，右键/长按此按钮打开设置。
                </div>
            </div>
        `;
        
        const checkboxGroup = document.getElementById('posCheckboxGroup');
        if (checkboxGroup) {
            posList.forEach(pos => {
                const label = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.value = pos.code;
                cb.checked = currentPosMap[pos.code] === true;
                cb.addEventListener('change', (e) => {
                    currentPosMap[pos.code] = e.target.checked;
                });
                
                label.appendChild(cb);
                label.appendChild(document.createTextNode(` ${pos.name} (${pos.code})`));
                
                const colorSpan = document.createElement('span');
                colorSpan.className = 'color-sample';
                colorSpan.style.backgroundColor = pos.color;
                colorSpan.title = pos.color;
                label.appendChild(colorSpan);
                
                checkboxGroup.appendChild(label);
            });
        }
        
        bindButtonEvents();
    }
    
    function loadNotebooks() {
        const select = document.getElementById('vocabNotebookSelect');
        if (!select) return;
        
        select.innerHTML = '';
        
        if (window.VocabData) {
            const notebooks = window.VocabData.getAllNotebooks();
            Object.entries(notebooks).forEach(([id, notebook]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = notebook.name;
                select.appendChild(option);
            });
        }
    }

    function bindButtonEvents() {
        const closeBtn = document.getElementById('closePosSettingsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }
        
        const applyBtn = document.getElementById('applyHighlightSettings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                if (window.HighlightRenderer) {
                    window.HighlightRenderer.updateHighlightPosMap(currentPosMap);
                }
                
                if (window.HighlightSwitch && window.HighlightSwitch.isEnabled()) {
                    if (window.HighlightRenderer) {
                        window.HighlightRenderer.applyHighlightToAll();
                    }
                }
                
                hide();
                showToast('高亮设置已应用');
            });
        }
        
        const addAllBtn = document.getElementById('addAllPosToVocabBtn');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', () => {
                const select = document.getElementById('vocabNotebookSelect');
                const selectedNotebookId = select.value;
                
                if (!selectedNotebookId) {
                    showToast('请选择目标生词本');
                    return;
                }
                
                if (window.AddAllPosToVocab && window.AddAllPosToVocab.execute) {
                    window.AddAllPosToVocab.execute(currentPosMap, selectedNotebookId);
                } else {
                    console.warn('AddAllPosToVocab 模块未加载');
                    showToast('一键添加功能暂不可用');
                }
                hide();
            });
        }
        
        const createNotebookBtn = document.getElementById('createNotebookBtn');
        const createNotebookForm = document.getElementById('createNotebookForm');
        const newNotebookName = document.getElementById('newNotebookName');
        const cancelCreateNotebook = document.getElementById('cancelCreateNotebook');
        const confirmCreateNotebook = document.getElementById('confirmCreateNotebook');
        const createNotebookError = document.getElementById('createNotebookError');
        
        if (createNotebookBtn) {
            createNotebookBtn.addEventListener('click', () => {
                if (createNotebookForm) {
                    createNotebookForm.style.display = 'block';
                    newNotebookName.focus();
                }
            });
        }
        
        if (cancelCreateNotebook) {
            cancelCreateNotebook.addEventListener('click', () => {
                if (createNotebookForm) {
                    createNotebookForm.style.display = 'none';
                    if (newNotebookName) {
                        newNotebookName.value = '';
                    }
                    if (createNotebookError) {
                        createNotebookError.style.display = 'none';
                    }
                }
            });
        }
        
        if (confirmCreateNotebook) {
            confirmCreateNotebook.addEventListener('click', () => {
                if (!newNotebookName) return;
                
                const name = newNotebookName.value;
                if (!name || name.trim() === '') {
                    if (createNotebookError) {
                        createNotebookError.textContent = '请输入生词本名称';
                        createNotebookError.style.display = 'block';
                    }
                    return;
                }
                
                if (window.VocabData) {
                    const result = window.VocabData.createNotebook(name.trim());
                    if (result && result.success) {
                        loadNotebooks();
                        const select = document.getElementById('vocabNotebookSelect');
                        select.value = result.id;
                        showToast('生词本创建成功');
                        if (createNotebookForm) {
                            createNotebookForm.style.display = 'none';
                            newNotebookName.value = '';
                            if (createNotebookError) {
                                createNotebookError.style.display = 'none';
                            }
                        }
                    } else {
                        if (createNotebookError) {
                            createNotebookError.textContent = '生词本创建失败：' + (result.error || '');
                            createNotebookError.style.display = 'block';
                        }
                    }
                }
            });
        }
    }
    
    function bindCloseEvents() {
        if (!modal) return;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hide();
            }
        });
    }
    
    function show() {
        if (!modal) {
            init();
        }
        if (!modal) {
            console.error('无法初始化词性高亮设置弹窗');
            return;
        }
        loadCurrentConfig();
        const checkboxes = modal.querySelectorAll('#posCheckboxGroup input[type="checkbox"]');
        if (checkboxes.length) {
            checkboxes.forEach(cb => {
                cb.checked = currentPosMap[cb.value] === true;
            });
        }
        loadNotebooks();
        modal.style.display = 'flex';
    }
    
    function hide() {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }
    
    function getPosList() {
        return [...posList];
    }
    
    window.HighlightSettingsModal = {
        init,
        show,
        hide,
        getPosList
    };
})();
