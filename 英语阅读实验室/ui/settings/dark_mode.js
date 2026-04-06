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
        } else {
            document.documentElement.removeAttribute('data-theme');
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
            <hr>
            <h3>🌙 外观</h3>
            <div class="setting-row">
                <span>深色模式</span>
                <button id="darkModeToggleBtn" class="secondary">${isDarkMode ? '当前: 深色' : '当前: 浅色'}</button>
            </div>
        `;
        
        modalContainer.appendChild(darkModeSection);
        
        // 绑定切换按钮事件
        const toggleBtn = document.getElementById('darkModeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                toggleDarkMode();
                // 更新按钮文字
                toggleBtn.textContent = isDarkMode ? '当前: 深色' : '当前: 浅色';
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