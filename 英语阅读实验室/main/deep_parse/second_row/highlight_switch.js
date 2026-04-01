// 高亮开关.js - 词性高亮开关功能（单击开关，右键/长按弹出设置）

(function() {
    // 高亮状态
    let highlightEnabled = false;
    
    // 高亮设置弹窗是否已加载
    let settingsModalLoaded = false;
    
    // 获取高亮按钮
    function getHighlightButton() {
        return document.getElementById('highlightToggleBtn');
    }
    
    // 更新按钮样式
    function updateButtonStyle() {
        const btn = getHighlightButton();
        if (btn) {
            if (highlightEnabled) {
                btn.style.background = 'var(--accent)';
                btn.style.color = 'white';
            } else {
                btn.style.background = '#e2e8f0';
                btn.style.color = 'var(--text)';
            }
        }
    }
    
    // 开启高亮
    function enableHighlight() {
        if (highlightEnabled) return;
        highlightEnabled = true;
        updateButtonStyle();
        
        // 调用高亮渲染模块
        if (window.HighlightRenderer && window.HighlightRenderer.applyHighlightToAll) {
            window.HighlightRenderer.applyHighlightToAll();
        } else {
            console.warn('HighlightRenderer 未加载');
        }
    }
    
    // 关闭高亮
    function disableHighlight() {
        if (!highlightEnabled) return;
        highlightEnabled = false;
        updateButtonStyle();
        
        // 清除所有高亮
        if (window.HighlightRenderer && window.HighlightRenderer.clearAllHighlight) {
            window.HighlightRenderer.clearAllHighlight();
        } else if (window.SentenceRenderer && window.SentenceRenderer.clearHighlight) {
            window.SentenceRenderer.clearHighlight();
        } else {
            // 直接清除
            document.querySelectorAll('.word-span').forEach(span => {
                span.className = 'word-span';
            });
        }
    }
    
    // 切换高亮
    function toggleHighlight() {
        if (highlightEnabled) {
            disableHighlight();
        } else {
            enableHighlight();
        }
    }
    
    // 获取当前高亮状态
    function isHighlightEnabled() {
        return highlightEnabled;
    }
    
    // 打开高亮设置弹窗
    function openHighlightSettings() {
        // 确保弹窗内容已加载
        if (!settingsModalLoaded && window.HighlightSettingsModal) {
            window.HighlightSettingsModal.init();
            settingsModalLoaded = true;
        }
        
        // 显示弹窗
        if (window.HighlightSettingsModal && window.HighlightSettingsModal.show) {
            window.HighlightSettingsModal.show();
        } else {
            console.warn('HighlightSettingsModal 未加载');
        }
    }
    
    // 绑定按钮事件（单击开关，右键/长按打开设置）
    function bindEvents() {
        const btn = getHighlightButton();
        if (!btn) return;
        
        let pressTimer = null;
        
        // 单击：切换高亮
        btn.addEventListener('click', () => {
            toggleHighlight();
        });
        
        // 右键：打开设置（电脑）
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openHighlightSettings();
            return false;
        });
        
        // 鼠标按下：检测右键（备选）
        btn.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                e.preventDefault();
                openHighlightSettings();
            }
        });
        
        // 手机长按：打开设置
        btn.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                openHighlightSettings();
                pressTimer = null;
            }, 500);
        });
        
        btn.addEventListener('touchend', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        });
        
        btn.addEventListener('touchcancel', () => {
            if (pressTimer) clearTimeout(pressTimer);
        });
    }
    
    // 初始化
    function init() {
        bindEvents();
        
        // 从缓存读取高亮状态
        if (window.CacheManager) {
            const savedState = localStorage.getItem('highlightEnabled');
            if (savedState === 'true') {
                highlightEnabled = true;
                updateButtonStyle();
                // 延迟执行高亮，等待渲染完成
                setTimeout(() => {
                    if (window.HighlightRenderer && window.HighlightRenderer.applyHighlightToAll) {
                        window.HighlightRenderer.applyHighlightToAll();
                    }
                }, 100);
            }
        }
    }
    
    // 保存高亮状态到缓存
    function saveState() {
        localStorage.setItem('highlightEnabled', highlightEnabled);
    }
    
    // 监听状态变化自动保存
    function watchState() {
        // 在 enable/disable 时调用 saveState
        const originalEnable = enableHighlight;
        const originalDisable = disableHighlight;
        
        window.enableHighlight = function() {
            originalEnable();
            saveState();
        };
        
        window.disableHighlight = function() {
            originalDisable();
            saveState();
        };
    }
    
    // 导出接口
    window.HighlightSwitch = {
        init,
        toggle: toggleHighlight,
        enable: enableHighlight,
        disable: disableHighlight,
        isEnabled: isHighlightEnabled,
        openSettings: openHighlightSettings
    };
    
    // 全局回调（供第二行按钮调用）
    window.onHighlightToggle = toggleHighlight;
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            watchState();
        });
    } else {
        init();
        watchState();
    }
})();