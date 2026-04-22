// highlight_controller.js - 词性高亮控制器
// 处理用户交互，协调视图和服务，替代全局变量模式

(function() {
    'use strict';
    
    /**
     * 词性高亮控制器
     * 负责事件绑定、状态管理和视图协调
     */
    class HighlightController {
        constructor(highlightService, eventBus) {
            this.highlightService = highlightService;
            this.eventBus = eventBus;
            
            this.highlightEnabled = false;
            this.eventsBound = false;
            this.pressTimer = null;
            this.longPressTriggered = false;
            
            // 绑定方法到实例
            this.handleClick = this.handleClick.bind(this);
            this.handleContextMenu = this.handleContextMenu.bind(this);
            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchEnd = this.handleTouchEnd.bind(this);
            this.handleTouchCancel = this.handleTouchCancel.bind(this);
            
            // 监听配置变更事件
            this.eventBus.on('highlightConfigChanged', () => {
                if (this.highlightEnabled) {
                    this.highlightService.applyHighlightToAll();
                }
            });
            
            console.log('[HighlightController] 控制器已初始化');
        }
        
        /**
         * 获取高亮按钮元素
         */
        getHighlightButton() {
            return document.getElementById('highlightToggleBtn');
        }
        
        /**
         * 更新按钮样式
         */
        updateButtonStyle() {
            const btn = this.getHighlightButton();
            if (btn) {
                if (this.highlightEnabled) {
                    btn.style.background = 'var(--accent)';
                    btn.style.color = 'white';
                } else {
                    btn.style.background = '#e2e8f0';
                    btn.style.color = 'var(--text)';
                }
            }
        }
        
        /**
         * 启用高亮
         */
        async enableHighlight() {
            if (this.highlightEnabled) return;
            
            this.highlightEnabled = true;
            this.updateButtonStyle();
            
            // 分析所有句子
            await this.highlightService.analyzeAllSentences();
            
            // 应用高亮
            this.highlightService.applyHighlightToAll();
            
            // 保存状态
            this.saveState();
            
            // 触发事件
            this.eventBus.emit('highlightEnabled');
        }
        
        /**
         * 禁用高亮
         */
        disableHighlight() {
            if (!this.highlightEnabled) return;
            
            this.highlightEnabled = false;
            this.updateButtonStyle();
            
            // 清除高亮
            this.highlightService.clearAllHighlight();
            
            // 保存状态
            this.saveState();
            
            // 触发事件
            this.eventBus.emit('highlightDisabled');
        }
        
        /**
         * 切换高亮状态
         */
        async toggleHighlight() {
            if (this.highlightEnabled) {
                this.disableHighlight();
            } else {
                await this.enableHighlight();
            }
        }
        
        /**
         * 处理点击事件
         */
        async handleClick(e) {
            e.preventDefault();
            await this.toggleHighlight();
        }
        
        /**
         * 处理右键菜单事件
         */
        handleContextMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            this.openSettings();
        }
        
        /**
         * 处理触摸开始事件（长按检测）
         */
        handleTouchStart(e) {
            this.longPressTriggered = false;
            this.pressTimer = setTimeout(() => {
                this.longPressTriggered = true;
                e.preventDefault();
                this.openSettings();
                this.pressTimer = null;
            }, 500);
        }
        
        /**
         * 处理触摸结束事件
         */
        handleTouchEnd(e) {
            if (this.pressTimer) {
                clearTimeout(this.pressTimer);
                this.pressTimer = null;
            }
            if (this.longPressTriggered) {
                e.preventDefault();
            }
        }
        
        /**
         * 处理触摸取消事件
         */
        handleTouchCancel() {
            if (this.pressTimer) {
                clearTimeout(this.pressTimer);
                this.pressTimer = null;
            }
        }
        
        /**
         * 打开设置弹窗
         */
        openSettings() {
            // 触发事件让设置组件处理
            this.eventBus.emit('openHighlightSettings');
        }
        
        /**
         * 绑定事件
         */
        bindEvents() {
            const btn = this.getHighlightButton();
            if (!btn || this.eventsBound) {
                return this.eventsBound;
            }
            
            btn.addEventListener('click', this.handleClick);
            btn.addEventListener('contextmenu', this.handleContextMenu);
            btn.addEventListener('touchstart', this.handleTouchStart);
            btn.addEventListener('touchend', this.handleTouchEnd);
            btn.addEventListener('touchcancel', this.handleTouchCancel);
            
            this.eventsBound = true;
            console.log('[HighlightController] 事件已绑定');
            return true;
        }
        
        /**
         * 等待按钮并绑定事件
         */
        waitForButtonAndBind() {
            if (this.bindEvents()) {
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                if (this.bindEvents()) {
                    obs.disconnect();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                if (!this.eventsBound) {
                    this.bindEvents();
                }
            }, 5000);
        }
        
        /**
         * 保存状态到 localStorage
         */
        saveState() {
            try {
                localStorage.setItem('highlightEnabled', this.highlightEnabled);
            } catch (e) {
                console.warn('[HighlightController] 保存状态失败:', e);
            }
        }
        
        /**
         * 从 localStorage 加载状态
         */
        loadState() {
            try {
                const saved = localStorage.getItem('highlightEnabled');
                if (saved === 'true') {
                    this.highlightEnabled = true;
                    this.updateButtonStyle();
                    // 延迟应用高亮，等待渲染完成
                    setTimeout(() => {
                        this.highlightService.applyHighlightToAll();
                    }, 100);
                }
            } catch (e) {
                console.warn('[HighlightController] 加载状态失败:', e);
            }
        }
        
        /**
         * 初始化控制器
         */
        init() {
            this.waitForButtonAndBind();
            this.loadState();
            console.log('[HighlightController] 初始化完成');
        }
        
        /**
         * 获取当前高亮状态
         */
        isEnabled() {
            return this.highlightEnabled;
        }
    }
    
    // 注册到 DI 容器
    if (window.DIContainer) {
        window.DIContainer.registerSingleton('HighlightController',
            (highlightService, eventBus) => {
                const controller = new HighlightController(highlightService, eventBus);
                // 自动初始化
                setTimeout(() => controller.init(), 0);
                return controller;
            },
            ['HighlightService', 'EventBus']
        );
        console.log('[HighlightController] 已注册到 DI 容器');
    }
    
    // 导出类供直接使用
    window.HighlightController = HighlightController;
})();
