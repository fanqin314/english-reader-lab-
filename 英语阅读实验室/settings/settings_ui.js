// 设置按钮交互.js - 控制设置按钮的点击和弹窗显示

(function() {
    // 获取设置按钮和弹窗容器
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');

    // 等待 DOM 加载完成
    function init() {
        if (!settingsBtn || !settingsModal) {
            console.warn('设置按钮或弹窗容器未找到');
            return;
        }

        // 点击设置按钮：显示弹窗
        settingsBtn.addEventListener('click', () => {
            // 如果弹窗内容尚未加载，先加载
            if (settingsModal.innerHTML === '') {
                loadSettingsContent();
            }
            settingsModal.style.display = 'flex';
        });

        // 点击弹窗外部关闭（点击背景关闭）
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }

// 在 loadSettingsContent 中
function loadSettingsContent() {
    // 清空弹窗并创建 .modal-content 容器
    settingsModal.innerHTML = '';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    settingsModal.appendChild(modalContent);

    if (typeof window.fillAPISettings === 'function') {
        window.fillAPISettings(modalContent);
    }
    if (typeof window.fillDarkModeSettings === 'function') {
        window.fillDarkModeSettings(modalContent);
    }
}

    // 暴露给其他模块，用于关闭弹窗
    window.closeSettingsModal = function() {
        if (settingsModal) {
            settingsModal.style.display = 'none';
        }
    };

    // 暴露填充内容的钩子，供其他模块调用
    window.settingsModalContainer = settingsModal;

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();