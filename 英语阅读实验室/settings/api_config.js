// API设置.js - API配置界面及逻辑

(function() {
    // 获取存储的API配置
    let apiConfig = {
        baseUrl: localStorage.getItem('apiBase') || 'https://api.deepseek.com',
        apiKey: localStorage.getItem('apiKey') || '',
        model: localStorage.getItem('modelName') || 'deepseek-chat'
    };

    // 更新页面上的API状态显示
    function updateApiStatus() {
        const dot = document.getElementById('apiStatusDot');
        const text = document.getElementById('apiStatusText');
        if (apiConfig.apiKey && apiConfig.apiKey.trim() !== '') {
            dot.className = 'status-dot status-green';
            text.innerText = '已配置';
        } else {
            dot.className = 'status-dot status-red';
            text.innerText = '未配置';
        }
    }

    // 保存API配置
    function saveApiConfig() {
        const baseUrlInput = document.getElementById('apiBaseInput');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const modelInput = document.getElementById('modelInput');
        
        if (baseUrlInput) apiConfig.baseUrl = baseUrlInput.value.trim();
        if (apiKeyInput) apiConfig.apiKey = apiKeyInput.value.trim();
        if (modelInput) apiConfig.model = modelInput.value.trim();
        
        localStorage.setItem('apiBase', apiConfig.baseUrl);
        localStorage.setItem('apiKey', apiConfig.apiKey);
        localStorage.setItem('modelName', apiConfig.model);
        
        updateApiStatus();
        showToast('API配置已保存');
    }

    // 测试API连接
    async function testApiConnection() {
        if (!apiConfig.apiKey) {
            showToast('请先填写API Key');
            return;
        }
        
        showToast('测试中...');
        
        try {
            const res = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: apiConfig.model,
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 5
                })
            });
            
            if (res.ok) {
                showToast('✅ API连接成功');
            } else {
                const err = await res.text();
                showToast(`❌ 连接失败: ${res.status}`);
            }
        } catch(e) {
            showToast(`❌ 网络错误: ${e.message}`);
        }
    }

    // 显示提示消息
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        } else {
            alert(msg);
        }
    }

    // 填充API设置界面到弹窗
    function fillAPISettings(modalContainer) {
        // 创建API设置区域的HTML
        const apiSection = document.createElement('div');
        apiSection.innerHTML = `
            <hr>
            <h3>🔑 API 配置</h3>
            <label>Base URL</label>
            <input type="text" id="apiBaseInput" placeholder="https://api.deepseek.com" value="${escapeHtml(apiConfig.baseUrl)}">
            <label>API Key</label>
            <input type="password" id="apiKeyInput" placeholder="sk-..." value="${escapeHtml(apiConfig.apiKey)}">
            <label>模型名称</label>
            <input type="text" id="modelInput" placeholder="deepseek-chat" value="${escapeHtml(apiConfig.model)}">
            <div class="button-group">
                <button id="saveApiBtn">💾 保存</button>
                <button id="testApiBtn" class="secondary">🔌 测试连接</button>
            </div>
        `;
        
        modalContainer.appendChild(apiSection);
        
        // 绑定事件
        const saveBtn = document.getElementById('saveApiBtn');
        const testBtn = document.getElementById('testApiBtn');
        
        if (saveBtn) saveBtn.addEventListener('click', saveApiConfig);
        if (testBtn) testBtn.addEventListener('click', testApiConnection);
    }

    // 暴露接口
    window.fillAPISettings = fillAPISettings;
    window.getApiConfig = function() {
        return { ...apiConfig };
    };
    
    // 更新API状态（页面加载时调用）
    document.addEventListener('DOMContentLoaded', updateApiStatus);
})();

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}