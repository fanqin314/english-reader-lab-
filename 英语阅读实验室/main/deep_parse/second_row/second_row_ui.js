// 第二行按钮UI.js - 生成第二行按钮（加载示例、保存当前分析、词性高亮）

(function() {
    // 容器
    let container = null;
    
    // 按钮配置
const buttons = [
    { id: 'parseBtn', text: '🔍 解析', onClick: 'onParse' },
    { id: 'loadExampleBtn', text: '📄 加载示例', onClick: 'onLoadExample' },
    { id: 'saveAnalysisBtn', text: '💾 保存当前分析', onClick: 'onSaveAnalysis' },
    { id: 'highlightToggleBtn', text: '🎨 词性高亮', onClick: 'onHighlightToggle' }
];
    // 初始化：获取容器
    function init(containerId = 'secondRowContainer') {
        container = document.getElementById(containerId);
        if (!container) {
            console.warn(`第二行按钮容器 #${containerId} 未找到`);
            return;
        }
        
        generateButtons();
    }
    
    // 生成按钮
    function generateButtons() {
        if (!container) return;
        
        container.innerHTML = '';
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.text;
            button.classList.add('secondary');
            
            // 绑定点击事件（通过全局回调）
            if (window[btn.onClick]) {
                button.addEventListener('click', window[btn.onClick]);
            } else {
                console.warn(`回调函数 ${btn.onClick} 未找到`);
            }
            
            container.appendChild(button);
        });
    }
    
    // 获取高亮按钮元素
    function getHighlightButton() {
        return document.getElementById('highlightToggleBtn');
    }
    
    // 设置高亮按钮样式（激活/未激活）
    function setHighlightButtonStyle(active) {
        const btn = getHighlightButton();
        if (btn) {
            if (active) {
                btn.style.background = 'var(--accent)';
                btn.style.color = 'white';
            } else {
                btn.style.background = '#e2e8f0';
                btn.style.color = 'var(--text)';
            }
        }
    }
    
    // 导出接口
    window.SecondRowButtons = {
        init,
        getHighlightButton,
        setHighlightButtonStyle
    };
    
window.onParse = async function() {
    if (window.deepParse) {
        await window.deepParse();
    } else {
        console.error('深度解析函数未定义');
        alert('深度解析功能未准备好，请先配置 API Key 并刷新页面。');
    }
};

    // 自动初始化（等待 DOM 加载）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }
})();