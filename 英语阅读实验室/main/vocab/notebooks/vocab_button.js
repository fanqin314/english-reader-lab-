// 生词本按钮.js - 管理生词本按钮的显示和主按钮交互

(function() {
    // 主按钮交互模块引用
    let mainButtonManager = null;
    
    // 初始化：注册到主按钮管理器
    function init() {
        // 获取主按钮管理器
        if (window.MainButtonManager) {
            mainButtonManager = window.MainButtonManager;
            // 注册生词本模块
            mainButtonManager.setVocabModule({
                showVocabInterface: showVocabInterface
            });
        } else {
            console.warn('MainButtonManager 未加载，生词本按钮将无法正常工作');
        }
        
        // 监听模式切换事件（可选）
        if (window.MainButtonManager) {
            // 可以在这里添加额外的初始化逻辑
        }
    }
    
    // 显示生词本界面
    function showVocabInterface(contentArea, sentencesContainer) {
        if (window.VocabInterface && window.VocabInterface.show) {
            window.VocabInterface.show(contentArea, sentencesContainer);
        } else {
            console.warn('VocabInterface 模块未加载');
        }
    }
    
    // 隐藏生词本界面（如果当前显示）
    function hideVocabInterface() {
        if (window.VocabInterface && window.VocabInterface.hide) {
            window.VocabInterface.hide();
        }
    }
    
    // 刷新生词本界面
    function refreshVocabInterface() {
        if (window.VocabInterface && window.VocabInterface.refresh) {
            window.VocabInterface.refresh();
        }
    }
    
    // 获取当前是否在生词本模式
    function isVocabMode() {
        return window.MainButtonManager && window.MainButtonManager.getCurrentMode() === 'vocab';
    }
    
    // 切换到生词本模式
    function switchToVocabMode() {
        if (window.MainButtonManager && window.MainButtonManager.switchMode) {
            window.MainButtonManager.switchMode('vocab');
        }
    }
    
    // 切换到深度分析模式
    function switchToAnalysisMode() {
        if (window.MainButtonManager && window.MainButtonManager.switchMode) {
            window.MainButtonManager.switchMode('analysis');
        }
    }
    
    // 导出接口
    window.VocabButton = {
        init,
        showVocabInterface,
        hideVocabInterface,
        refreshVocabInterface,
        isVocabMode,
        switchToVocabMode,
        switchToAnalysisMode
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();