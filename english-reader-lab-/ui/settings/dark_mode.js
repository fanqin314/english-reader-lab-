// 深色模式调节按钮.js - 深色模式切换逻辑

(function() {
    // 深色模式状态（从 localStorage 读取）
    let isDarkMode = false;
    try {
        isDarkMode = localStorage.getItem('darkMode') === 'true';
    } catch (e) {
        console.warn('读取深色模式设置失败:', e);
        isDarkMode = false;
    }

    // 应用深色模式
    function applyDarkMode() {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark');
        }
        try {
            localStorage.setItem('darkMode', isDarkMode);
        } catch (e) {
            console.warn('保存深色模式设置失败:', e);
        }
    }

    // 切换深色模式
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        applyDarkMode();
        
        // 显示提示
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = isDarkMode ? '🌙 已切换到深色模式' : '☀️ 已切换到浅色模式';
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 1500);
        }
    }

    // 填充深色模式设置到弹窗
    function fillDarkModeSettings(modalContainer) {
        // 创建深色模式设置区域
        const darkModeSection = document.createElement('div');
        darkModeSection.innerHTML = `
            <div class="setting-header-row">
                <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> 外观</h3>
                <div class="glass-toggle" id="darkModeToggle">
                    <input type="checkbox" id="darkModeCheck" ${isDarkMode ? 'checked' : ''}>
                    <label for="darkModeCheck" class="toggle-label">
                        <span class="toggle-slider">
                            <svg class="toggle-icon light-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                            <svg class="toggle-icon dark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        </span>
                    </label>
                </div>
            </div>
        `;
        
        modalContainer.appendChild(darkModeSection);
        
        // 绑定切换事件
        const toggleCheck = document.getElementById('darkModeCheck');
        if (toggleCheck) {
            toggleCheck.addEventListener('change', () => {
                toggleDarkMode();
            });
        }
    }

    // 暴露接口
    window.fillDarkModeSettings = fillDarkModeSettings;
    window.isDarkModeEnabled = function() {
        return isDarkMode;
    };
    
    // 页面加载时应用深色模式
    document.addEventListener('DOMContentLoaded', applyDarkMode);
})();