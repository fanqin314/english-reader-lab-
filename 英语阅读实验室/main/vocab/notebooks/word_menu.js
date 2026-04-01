// 单词菜单.js - 右键/双击单词添加生词本的菜单

(function() {
    let menu = null;
    
    // 初始化菜单
    function init() {
        menu = document.getElementById('customMenu');
        if (!menu) {
            console.warn('自定义菜单容器 #customMenu 未找到');
            return;
        }
        
        // 绑定右键事件
        document.body.addEventListener('contextmenu', handleContextMenu);
        
        // 绑定手机双击事件
        bindDoubleTap();
    }
    
    // 处理右键菜单
    function handleContextMenu(e) {
        // 查找被点击的单词 span
        let target = e.target;
        while (target && !target.classList?.contains('word-span')) {
            target = target.parentElement;
        }
        
        if (!target) return;
        
        e.preventDefault();
        
        const word = target.dataset.word;
        if (!word) return;
        
        const context = getContextWord(target);
        
        // 构建菜单
        buildMenu(word, context, e.pageX, e.pageY);
    }
    
    // 构建菜单
    function buildMenu(word, context, x, y) {
        if (!menu) return;
        
        menu.innerHTML = '';
        
        // 标题
        const header = document.createElement('div');
        header.className = 'custom-menu-item';
        header.innerText = `📖 收藏 "${word}" 到：`;
        header.style.fontWeight = 'bold';
        menu.appendChild(header);
        
        // 获取所有生词本
        const notebooks = window.VocabData ? window.VocabData.getAllNotebooks() : {};
        
        for (const [id, nb] of Object.entries(notebooks)) {
            const item = document.createElement('div');
            item.className = 'custom-menu-item';
            item.innerText = nb.name;
            item.addEventListener('click', async () => {
                await addWordToNotebook(id, word, context);
                menu.style.display = 'none';
            });
            menu.appendChild(item);
        }
        
        // 分隔线
        const divider = document.createElement('div');
        divider.className = 'menu-divider';
        menu.appendChild(divider);
        
        // 新建生词本选项
        const newItem = document.createElement('div');
        newItem.className = 'custom-menu-item';
        newItem.innerText = '➕ 新建生词本';
        newItem.addEventListener('click', () => {
            const name = prompt('新生词本名称');
            if (name && window.VocabData) {
                const result = window.VocabData.createNotebook(name);
                if (result.success) {
                    showToast(`已创建生词本“${name}”`);
                    // 重新打开菜单（可选，这里关闭菜单）
                    menu.style.display = 'none';
                } else {
                    showToast(result.error);
                }
            } else {
                menu.style.display = 'none';
            }
        });
        menu.appendChild(newItem);
        
        // 显示菜单
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.display = 'block';
        
        // 点击其他地方关闭菜单
        const closeMenu = () => {
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
    
    // 获取单词所在的句子上下文
    function getContextWord(spanElem) {
        const sentenceDiv = spanElem.closest('.sentence-text');
        return sentenceDiv ? sentenceDiv.innerText.trim() : '';
    }
    
    // 添加单词到生词本
    async function addWordToNotebook(notebookId, word, context) {
        if (!window.VocabData) {
            showToast('生词本模块未加载');
            return;
        }
        
        const notebook = window.VocabData.getNotebook(notebookId);
        if (!notebook) {
            showToast('生词本不存在');
            return;
        }
        
        // 检查是否已存在
        const exists = notebook.words.some(w => w.word === word);
        if (exists) {
            showToast(`“${word}”已存在生词本“${notebook.name}”中`);
            return;
        }
        
        // 尝试获取单词释义
        let meaning = '';
        let pos = '';
        
        if (window.DictService) {
            const dictResult = await window.DictService.getWordMeaning(word, {
                apiCall: async (w) => {
                    if (window.APIRequest && window.APIRequest.requestWordMeaning) {
                        return await window.APIRequest.requestWordMeaning(w);
                    }
                    return null;
                }
            });
            if (dictResult) {
                meaning = dictResult.meaning;
                pos = dictResult.pos;
            }
        }
        
        // 添加到生词本
        const result = window.VocabData.addWord(notebookId, {
            word: word,
            meaning: meaning,
            pos: pos,
            context: context,
            timestamp: Date.now()
        });
        
        if (result.success) {
            showToast(`✅ 已添加“${word}”到 ${notebook.name}`);
            // 如果生词本界面正在显示，刷新它
            if (window.VocabInterface && window.VocabInterface.refresh) {
                window.VocabInterface.refresh();
            }
        } else {
            showToast(result.error);
        }
    }
    
    // 绑定手机双击事件
    function bindDoubleTap() {
        let lastTap = 0;
        
        document.body.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                // 双击
                let target = e.target;
                while (target && !target.classList?.contains('word-span')) {
                    target = target.parentElement;
                }
                
                if (target) {
                    e.preventDefault();
                    const word = target.dataset.word;
                    if (word) {
                        // 手机端弹出生词本选择
                        handleMobileWordSelection(word, target);
                    }
                }
            }
            lastTap = now;
        });
    }
    
    // 手机端单词选择处理
    async function handleMobileWordSelection(word, target) {
        if (!window.VocabData) {
            showToast('生词本模块未加载');
            return;
        }
        
        const notebooks = window.VocabData.getAllNotebooks();
        const notebookNames = Object.entries(notebooks).map(([id, nb]) => ({ id, name: nb.name }));
        
        if (notebookNames.length === 0) {
            showToast('请先创建生词本');
            return;
        }
        
        // 简单的选择框（使用 prompt）
        const choices = notebookNames.map((n, i) => `${i + 1}. ${n.name}`).join('\n');
        const input = prompt(`收藏单词“${word}”到哪个生词本？\n${choices}\n\n请输入数字或名称：`, notebookNames[0]?.name);
        
        if (input) {
            let selected = null;
            // 尝试按数字匹配
            const numMatch = input.match(/^\d+$/);
            if (numMatch) {
                const idx = parseInt(numMatch[0]) - 1;
                if (idx >= 0 && idx < notebookNames.length) {
                    selected = notebookNames[idx];
                }
            }
            // 按名称匹配
            if (!selected) {
                selected = notebookNames.find(n => n.name === input);
            }
            
            if (selected) {
                const context = getContextWord(target);
                await addWordToNotebook(selected.id, word, context);
            } else {
                showToast('未找到生词本');
            }
        }
    }
    
    // 显示提示消息
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }
    
    // 导出接口
    window.WordMenu = {
        init
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();