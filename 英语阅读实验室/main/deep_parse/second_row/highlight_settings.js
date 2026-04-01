// 高亮设置弹窗.js - 词性选择弹窗（含一键添加所有该词性单词）

(function() {
    // 弹窗容器
    let modal = null;
    
    // 词性列表配置（带颜色）
    const posList = [
        { code: 'n', name: '名词 (n)', color: '#8B5A2B' },
        { code: 'v', name: '动词 (v)', color: '#EF4444' },
        { code: 'adj', name: '形容词 (adj)', color: '#F97316' },
        { code: 'adv', name: '副词 (adv)', color: '#EAB308' },
        { code: 'pron', name: '代词 (pron)', color: '#22C55E' },
        { code: 'prep', name: '介词 (prep)', color: '#3B82F6' },
        { code: 'conj', name: '连词 (conj)', color: '#6366F1' },
        { code: 'interj', name: '感叹词 (interj)', color: '#A855F7' },
        { code: 'art', name: '冠词 (art)', color: '#EC489A' },
        { code: 'num', name: '数词 (num)', color: '#6B7280' }
    ];
    
    // 当前勾选状态
    let currentPosMap = {};
    
    // 初始化弹窗
    function init() {
        modal = document.getElementById('posSettingsModal');
        if (!modal) {
            console.warn('高亮设置弹窗容器 #posSettingsModal 未找到');
            return;
        }
        
        // 加载当前配置
        loadCurrentConfig();
        
        // 渲染内容
        renderContent();
        
        // 绑定关闭事件
        bindCloseEvents();
    }
    
    // 加载当前高亮配置
    function loadCurrentConfig() {
        if (window.HighlightRenderer) {
            currentPosMap = window.HighlightRenderer.getHighlightPosMap();
        } else {
            // 默认全选
            posList.forEach(pos => {
                currentPosMap[pos.code] = true;
            });
        }
    }
    
    // 渲染弹窗内容
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
                <div style="font-size: 12px; color: var(--text-light); margin-top: 12px;">
                    💡 单击“词性高亮”按钮开关高亮显示，右键/长按此按钮打开设置。
                </div>
            </div>
        `;
        
        // 渲染复选框组
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
                label.appendChild(document.createTextNode(` ${pos.name}`));
                
                const colorSpan = document.createElement('span');
                colorSpan.className = 'color-sample';
                colorSpan.style.backgroundColor = pos.color;
                colorSpan.title = pos.color;
                label.appendChild(colorSpan);
                
                checkboxGroup.appendChild(label);
            });
        }
        
        // 绑定按钮事件
        bindButtonEvents();
    }
    
    // 绑定按钮事件
    function bindButtonEvents() {
        // 关闭按钮
        const closeBtn = document.getElementById('closePosSettingsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }
        
        // 应用高亮
        const applyBtn = document.getElementById('applyHighlightSettings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                // 更新高亮配置
                if (window.HighlightRenderer) {
                    window.HighlightRenderer.updateHighlightPosMap(currentPosMap);
                }
                
                // 如果高亮已开启，重新应用
                if (window.HighlightSwitch && window.HighlightSwitch.isEnabled()) {
                    if (window.HighlightRenderer) {
                        window.HighlightRenderer.applyHighlightToAll();
                    }
                }
                
                hide();
                showToast('高亮设置已应用');
            });
        }
        
        // 一键添加所有该词性单词
        const addAllBtn = document.getElementById('addAllPosToVocabBtn');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', () => {
                // 调用一键添加模块
                if (window.AddAllPosToVocab && window.AddAllPosToVocab.execute) {
                    window.AddAllPosToVocab.execute(currentPosMap);
                } else {
                    console.warn('AddAllPosToVocab 模块未加载');
                    showToast('一键添加功能暂不可用');
                }
                hide();
            });
        }
    }
    
    // 绑定弹窗关闭事件（点击背景关闭）
    function bindCloseEvents() {
        if (!modal) return;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hide();
            }
        });
    }
    
    // 显示弹窗
    function show() {
        if (!modal) return;
        // 重新加载当前配置（可能已被其他模块修改）
        loadCurrentConfig();
        // 重新渲染复选框状态
        const checkboxes = modal.querySelectorAll('#posCheckboxGroup input[type="checkbox"]');
        if (checkboxes.length) {
            checkboxes.forEach(cb => {
                cb.checked = currentPosMap[cb.value] === true;
            });
        }
        modal.style.display = 'flex';
    }
    
    // 隐藏弹窗
    function hide() {
        if (modal) {
            modal.style.display = 'none';
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
    window.HighlightSettingsModal = {
        init,
        show,
        hide
    };
})();