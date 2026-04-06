// API设置.js - API配置界面及逻辑
(function() {
    ModuleRegistry.register('APIConfig', ['Security', 'ErrorHandler', 'Performance'], function(Security, ErrorHandler, Performance) {
        // 获取存储的API配置
        let apiConfig = Security.getApiConfig();

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
            
            let baseUrl = baseUrlInput ? baseUrlInput.value.trim() : '';
            let apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
            let model = modelInput ? modelInput.value.trim() : '';
            
            // 验证输入
            if (baseUrl) {
                const urlValidation = Security.validateUrl(baseUrl);
                if (!urlValidation.valid) {
                    ErrorHandler.handleValidationError(urlValidation.error);
                    return;
                }
            }
            
            if (apiKey) {
                const keyValidation = Security.validateApiKey(apiKey);
                if (!keyValidation.valid) {
                    ErrorHandler.handleValidationError(keyValidation.error);
                    return;
                }
            }
            
            // 安全存储
            try {
                Security.setApiConfig(baseUrl, model);
                if (apiKey) {
                    Security.setApiKey(apiKey);
                }
                
                apiConfig = Security.getApiConfig();
                updateApiStatus();
                ErrorHandler.showSuccess('API配置已保存');
            } catch (error) {
                ErrorHandler.handleUnknownError('保存API配置失败');
            }
        }

        // 测试API连接
        async function testApiConnection() {
            if (!apiConfig.apiKey) {
                ErrorHandler.handleValidationError('请先填写API Key');
                return;
            }
            
            ErrorHandler.showError('测试中...', 'info');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
            
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
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (res.ok) {
                    ErrorHandler.showSuccess('✅ API连接成功');
                } else {
                    const err = await res.text();
                    ErrorHandler.handleApiError({ status: res.status, message: err });
                }
            } catch(e) {
                clearTimeout(timeoutId);
                if (e.name === 'AbortError') {
                    ErrorHandler.handleNetworkError(new Error('请求超时'));
                } else {
                    ErrorHandler.handleNetworkError(e);
                }
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
                <input type="text" id="apiBaseInput" placeholder="https://api.deepseek.com">
                <label>API Key</label>
                <input type="password" id="apiKeyInput" placeholder="sk-...">
                <label>模型名称</label>
                <input type="text" id="modelInput" placeholder="deepseek-chat">
                <div class="button-group">
                    <button id="saveApiBtn">💾 保存</button>
                    <button id="testApiBtn" class="secondary">🔌 测试连接</button>
                </div>
            `;
            
            Security.safeSetInnerHTML(modalContainer, apiSection.innerHTML);
            
            // 在JavaScript中设置值，避免在HTML中直接暴露API Key
            const apiBaseInput = document.getElementById('apiBaseInput');
            const apiKeyInput = document.getElementById('apiKeyInput');
            const modelInput = document.getElementById('modelInput');
            
            if (apiBaseInput && apiConfig.baseUrl) {
                apiBaseInput.value = apiConfig.baseUrl;
            }
            if (apiKeyInput && apiConfig.apiKey) {
                apiKeyInput.value = apiConfig.apiKey;
            }
            if (modelInput && apiConfig.model) {
                modelInput.value = apiConfig.model;
            }
            
            // 绑定事件
            const saveBtn = document.getElementById('saveApiBtn');
            const testBtn = document.getElementById('testApiBtn');
            
            if (saveBtn) saveBtn.addEventListener('click', saveApiConfig);
            if (testBtn) testBtn.addEventListener('click', testApiConnection);
        }

        // 暴露接口
        window.fillAPISettings = fillAPISettings;
        window.getApiConfig = function() {
            return Security.getApiConfig();
        };
        
        // 更新API状态（页面加载时调用）
        document.addEventListener('DOMContentLoaded', updateApiStatus);
    });
})();