// history_ui.js - 历史记录界面的HTML渲染和交互

(function() {
    ModuleRegistry.register('HistoryUI', ['GlobalManager'], function(GlobalManager) {
        let currentContainer = null;
        let sentencesContainer = null;
        
        // 获取HistoryManager实例
        function getHistoryManager() {
            return GlobalManager.getGlobalObject('HistoryManager');
        }
        
        // 获取HistoryModule实例
        function getHistoryModule() {
            return ModuleRegistry.get('HistoryModule');
        }
    
    // 显示历史记录界面
    function showHistoryInterface(container, sentencesCont) {
        currentContainer = container;
        sentencesContainer = sentencesCont;
        
        if (!currentContainer) return;
        
        // 隐藏句子容器
        if (sentencesContainer) {
            sentencesContainer.style.display = 'none';
        }
        
        // 移除已存在的历史记录界面
        const existing = document.getElementById('historyInterface');
        if (existing) existing.remove();
        
        // 创建历史记录界面容器
        const historyDiv = document.createElement('div');
        historyDiv.id = 'historyInterface';
        historyDiv.className = 'history-card';
        
        currentContainer.insertBefore(historyDiv, sentencesContainer);
        
        // 渲染界面
        renderHistoryUI(historyDiv);
    }
    
    // 渲染历史记录界面
    function renderHistoryUI(container) {
        container.innerHTML = '';
        
        // 头部
        const header = document.createElement('div');
        header.className = 'history-header';
        const title = document.createElement('h3');
        title.innerText = '📋 历史记录';
        header.appendChild(title);
        
        // 统计信息
        const statsDiv = document.createElement('div');
        statsDiv.className = 'history-stats';
        const historyModule = ModuleRegistry.get('HistoryModule');
        const history = historyModule ? historyModule.getHistory() : [];
        statsDiv.innerHTML = `<span>${history.length} 条记录</span>`;
        header.appendChild(statsDiv);
        container.appendChild(header);
        
        // 清空历史记录按钮
        const clearBtn = document.createElement('button');
        clearBtn.innerText = '🗑️ 清空历史记录';
        clearBtn.className = 'secondary';
        clearBtn.onclick = () => {
            if (confirm('确定清空所有历史记录吗？')) {
                if (historyModule) {
                    historyModule.clearHistory();
                    renderHistoryUI(container);
                    showToast('历史记录已清空');
                }
            }
        };
        header.appendChild(clearBtn);
        
        // 历史记录列表区域
        const historyListDiv = document.createElement('div');
        historyListDiv.id = 'historyList';
        container.appendChild(historyListDiv);
        
        // 渲染历史记录列表
        renderHistoryList(historyListDiv);
    }
    
    // 渲染历史记录列表
    function renderHistoryList(container) {
        // 优先使用 HistoryManager 获取完整的历史记录数据
        let history = [];
        const historyManager = getHistoryManager();
        if (historyManager) {
            history = historyManager.getHistory();
        } else {
            const historyModule = getHistoryModule();
            history = historyModule ? historyModule.getHistory() : [];
        }
        
        if (history.length === 0) {
            container.innerHTML = renderEmptyState('暂无历史记录', '完成分析后，结果将自动保存到历史记录中');
            return;
        }
        
        container.innerHTML = '';
        
        history.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'history-content';
            
            // 英文原文
            const textP = document.createElement('p');
            textP.className = 'history-text';
            textP.innerText = item.originalText || item.text;
            contentDiv.appendChild(textP);
            
            // 时间戳
            const timestampP = document.createElement('p');
            timestampP.className = 'history-timestamp';
            timestampP.innerText = formatTimestamp(item.id || item.timestamp);
            contentDiv.appendChild(timestampP);
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-delete-btn';
            deleteBtn.innerText = '🗑️';
            deleteBtn.title = '删除记录';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('确定删除这条历史记录吗？')) {
                    const historyManager = getHistoryManager();
                    if (historyManager && historyManager.deleteHistoryItem) {
                        const success = historyManager.deleteHistoryItem(item.id);
                        if (success) {
                            renderHistoryList(container);
                            showToast('历史记录已删除');
                        } else {
                            showToast('删除失败，请重试');
                        }
                    }
                }
            };
            
            // 创建按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            buttonContainer.appendChild(deleteBtn);
            
            // 添加点击事件到整个历史记录项
            div.style.cursor = 'pointer';
            div.onclick = () => {
                // 导航到二级分析界面，传递完整的历史记录项
                if (typeof EventBus !== 'undefined' && EventBus) {
                    EventBus.emit('navigateToSecondaryAnalysis', { 
                        text: item.originalText || item.text,
                        historyItem: item
                    });
                }
            };
            
            div.appendChild(contentDiv);
            div.appendChild(buttonContainer);
            container.appendChild(div);
        });
    }
    
    // 格式化时间戳
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        const historyDiv = document.getElementById('historyInterface');
        if (historyDiv) {
            renderHistoryUI(historyDiv);
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
    window.HistoryInterface = {
        show: showHistoryInterface,
        refresh,
        hide: () => {
            const historyDiv = document.getElementById('historyInterface');
            if (historyDiv) historyDiv.remove();
            if (sentencesContainer) sentencesContainer.style.display = 'block';
        }
    };

    return {
        show: showHistoryInterface,
        refresh
    };
    });
})();
