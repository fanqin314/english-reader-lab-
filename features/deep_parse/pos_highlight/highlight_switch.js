// 高亮开关.js - 词性高亮开关功能（单击开关，右键/长按弹出设置）

(function() {
    let highlightEnabled = false;
    let settingsModalLoaded = false;
    
    function getHighlightButton() {
        return document.getElementById('highlightToggleBtn');
    }
    
    function updateButtonStyle() {
        const btn = getHighlightButton();
        if (btn) {
            if (highlightEnabled) {
                btn.style.background = 'var(--accent)';
                btn.style.color = 'white';
            } else {
                // 检查是否为深色模式
                const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
                btn.style.background = isDarkMode ? '#334155' : '#e2e8f0';
                btn.style.color = 'var(--text)';
            }
        }
    }
    
    async function enableHighlight() {
        if (highlightEnabled) return;
        highlightEnabled = true;
        updateButtonStyle();
        
        await autoAnalyzeAllSentences();
        
        if (window.HighlightRenderer && window.HighlightRenderer.applyHighlightToAll) {
            window.HighlightRenderer.applyHighlightToAll();
        } else {
            console.warn('HighlightRenderer 未加载');
        }
    }
    
    async function autoAnalyzeAllSentences() {
        if (!window.CacheManager) {
            console.warn('CacheManager 未加载');
            return;
        }
        
        const sentences = window.CacheManager.getSentences();
        if (!sentences || sentences.length === 0) {
            console.warn('没有句子数据');
            return;
        }
        
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            if (!sentence) continue;
            
            const existingPosData = window.CacheManager.getSentenceCache(i, 'pos');
            if (existingPosData) continue;
            
            try {
                if (window.PosButton && window.PosButton.loadAndDisplay) {
                    const tempPanel = document.createElement('div');
                    tempPanel.id = `pos-panel-${i}`;
                    await window.PosButton.loadAndDisplay(i, tempPanel);
                }
            } catch (error) {
                console.error(`分析句子 ${i} 的词性失败:`, error);
            }
        }
    }
    
    function disableHighlight() {
        if (!highlightEnabled) return;
        highlightEnabled = false;
        updateButtonStyle();
        
        if (window.HighlightRenderer && window.HighlightRenderer.clearAllHighlight) {
            window.HighlightRenderer.clearAllHighlight();
        } else if (window.SentenceRenderer && window.SentenceRenderer.clearHighlight) {
            window.SentenceRenderer.clearHighlight();
        } else {
            document.querySelectorAll('.word-span').forEach(span => {
                span.className = 'word-span';
            });
        }
    }
    
    async function toggleHighlight() {
        if (highlightEnabled) {
            disableHighlight();
        } else {
            await enableHighlight();
        }
    }
    
    function isHighlightEnabled() {
        return highlightEnabled;
    }
    
    function openHighlightSettings(buttonRect) {
        if (!settingsModalLoaded && window.HighlightSettingsModal) {
            window.HighlightSettingsModal.init();
            settingsModalLoaded = true;
        }
        
        if (window.HighlightSettingsModal && window.HighlightSettingsModal.show) {
            window.HighlightSettingsModal.show(buttonRect);
        } else {
            console.warn('HighlightSettingsModal 未加载');
        }
    }
    
    let pressTimer = null;
    
    function bindEvents() {
        const btn = getHighlightButton();
        if (!btn) {
            return false;
        }
        
        // 移除已有的事件监听器，避免重复绑定
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async (e) => {
            await toggleHighlight();
        });
        
        newBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = newBtn.getBoundingClientRect();
            openHighlightSettings(rect);
        });
        
        let touchStartTime = 0;
        let longPressTriggered = false;
        
        newBtn.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            longPressTriggered = false;
            pressTimer = setTimeout(() => {
                longPressTriggered = true;
                e.preventDefault();
                const rect = newBtn.getBoundingClientRect();
                openHighlightSettings(rect);
                pressTimer = null;
            }, 500);
        });
        
        newBtn.addEventListener('touchend', (e) => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (longPressTriggered) {
                e.preventDefault();
            }
        });
        
        newBtn.addEventListener('touchcancel', () => {
            if (pressTimer) clearTimeout(pressTimer);
        });
        
        return true;
    }
    
    function waitForButtonAndBind() {
        if (bindEvents()) {
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            if (bindEvents()) {
                obs.disconnect();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            bindEvents();
        }, 5000);
    }
    
    function init() {
        waitForButtonAndBind();
        
        if (window.CacheManager) {
            const savedState = localStorage.getItem('highlightEnabled');
            if (savedState === 'true') {
                highlightEnabled = true;
                updateButtonStyle();
                setTimeout(() => {
                    if (window.HighlightRenderer && window.HighlightRenderer.applyHighlightToAll) {
                        window.HighlightRenderer.applyHighlightToAll();
                    }
                }, 100);
            }
        }
    }
    
    function saveState() {
        localStorage.setItem('highlightEnabled', highlightEnabled);
    }
    
    function watchState() {
        const originalEnable = enableHighlight;
        const originalDisable = disableHighlight;
        
        window.enableHighlight = async function() {
            await originalEnable();
            saveState();
        };
        
        window.disableHighlight = function() {
            originalDisable();
            saveState();
        };
    }
    
    window.HighlightSwitch = {
        init,
        toggle: toggleHighlight,
        enable: enableHighlight,
        disable: disableHighlight,
        isEnabled: isHighlightEnabled,
        openSettings: openHighlightSettings
    };
    
    window.onHighlightToggle = toggleHighlight;
    
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
