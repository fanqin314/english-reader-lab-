/**
 * 单词记忆卡 - 独立 JS 组件
 * 使用方法：在 HTML 中预留一个容器 <div id="word-card-app"></div>，然后引入本文件。
 * 所有样式与交互均已内嵌，支持深色模式、翻转卡片、例句生成、3D 倾斜等。
 */
(function() {
    "use strict";

    // ---------- 样式定义 (注入 <style>) ----------
    const styles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        :root {
            --bg-gradient-start: #e0eafc;
            --bg-gradient-end: #cfdef3;
            --card-bg: rgba(255, 255, 255, 0.65);
            --card-border-inset: rgba(255, 255, 255, 0.5);
            --text-primary: #1e2a3e;
            --text-secondary: #2c3e50;
            --pos-bg: #d9e2ec;
            --pos-color: #2c5a7a;
            --pos-shadow-inset: rgba(0, 0, 0, 0.15);
            --pos-shadow-outset: rgba(255, 255, 255, 0.6);
            --counter-bg: #d9e2ec;
            --counter-color: #2c5a7a;
            --example-bg: rgba(255, 255, 255, 0.5);
            --example-border: rgba(0, 0, 0, 0.05);
            --btn-bg: #eef3fc;
            --btn-color: #2c5a7a;
            --btn-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05);
            --btn-hover-bg: #4c9aff;
            --btn-hover-color: white;
            --btn-active-bg: #3a7ecf;
            --nav-btn-bg: rgba(255, 255, 255, 0.7);
            --nav-btn-color: #1e2a3e;
            --nav-btn-border: rgba(0, 0, 0, 0.05);
            --nav-btn-shadow: 0 8px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
            --nav-btn-hover-bg: white;
            --progress-bg: rgba(0, 0, 0, 0.08);
            --progress-bar: linear-gradient(90deg, #4c9aff, #7fc9ff);
            --word-gradient: linear-gradient(135deg, #1f3b4c, #2c5a7a);
            --word-shadow: 2px 2px 4px rgba(0,0,0,0.1), 4px 4px 8px rgba(0,0,0,0.05);
            --glare-color: rgba(255, 255, 255, 0.5);
            --flip-bg: linear-gradient(145deg, #ffffff, #f3f7fc);
            --flip-border: rgba(255,255,255,0.8);
        }
        body.dark {
            --bg-gradient-start: #0f141e;
            --bg-gradient-end: #1a1f2e;
            --card-bg: rgba(22, 28, 40, 0.8);
            --card-border-inset: rgba(255, 255, 255, 0.12);
            --text-primary: #f0f4fa;
            --text-secondary: #cbd5e6;
            --pos-bg: #2a3446;
            --pos-color: #b8d0ff;
            --pos-shadow-inset: rgba(0, 0, 0, 0.5);
            --pos-shadow-outset: rgba(255, 255, 255, 0.08);
            --counter-bg: #2a3446;
            --counter-color: #b8d0ff;
            --example-bg: rgba(10, 15, 24, 0.6);
            --example-border: rgba(255, 255, 255, 0.12);
            --btn-bg: #2d3a52;
            --btn-color: #c6ddff;
            --btn-shadow: 0 6px 10px rgba(0, 0, 0, 0.4);
            --btn-hover-bg: #4f7ec9;
            --btn-active-bg: #3a5f9e;
            --nav-btn-bg: rgba(20, 28, 40, 0.7);
            --nav-btn-color: #e2ecff;
            --nav-btn-border: rgba(255, 255, 255, 0.1);
            --nav-btn-shadow: 0 10px 20px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
            --nav-btn-hover-bg: rgba(60, 80, 120, 0.7);
            --progress-bg: rgba(255, 255, 255, 0.12);
            --progress-bar: linear-gradient(90deg, #6ea8fe, #a3c9ff);
            --word-gradient: linear-gradient(135deg, #d9ebff, #f5faff);
            --word-shadow: 0 0 16px rgba(110, 168, 254, 0.5), 2px 4px 10px rgba(0, 0, 0, 0.4);
            --glare-color: rgba(255, 255, 255, 0.2);
            --flip-bg: linear-gradient(145deg, #1e2638, #2a3448);
            --flip-border: rgba(255,255,255,0.15);
        }
        body {
            min-height: 100vh;
            background: linear-gradient(145deg, var(--bg-gradient-start), var(--bg-gradient-end));
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            padding: 20px;
            transition: background 0.3s;
            margin: 0;
        }
        .word-card-container {
            width: 100%;
            max-width: 580px;
        }
        .card-3d {
            width: 100%;
            background: var(--card-bg);
            backdrop-filter: blur(18px);
            border-radius: 48px;
            padding: 28px 24px 36px;
            box-shadow: 0 25px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px var(--card-border-inset) inset;
            transition: transform 0.1s linear, box-shadow 0.2s;
            transform-style: preserve-3d;
            position: relative;
            overflow: hidden;
        }
        .glare {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            border-radius: inherit;
            background: radial-gradient(circle at 0% 0%, var(--glare-color) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            z-index: 1;
        }
        .content {
            position: relative;
            z-index: 2;
            color: var(--text-primary);
        }
        .icon-only-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--btn-bg);
            border: none;
            color: var(--btn-color);
            width: 44px;
            height: 44px;
            border-radius: 40px;
            cursor: pointer;
            box-shadow: var(--btn-shadow);
            transition: all 0.2s;
            transform: translateY(-1px);
            backdrop-filter: blur(4px);
            border: 1px solid var(--example-border);
            padding: 0;
        }
        .icon-only-btn:hover {
            background: var(--btn-hover-bg);
            color: var(--btn-hover-color);
            box-shadow: 0 10px 16px rgba(0,0,0,0.3);
            transform: translateY(-3px);
        }
        .icon-only-btn:active {
            background: var(--btn-active-bg);
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transform: translateY(1px);
        }
        .icon-only-btn svg {
            width: 22px;
            height: 22px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .theme-toggle {
            position: absolute;
            top: 20px; right: 24px; z-index: 10;
            background: var(--nav-btn-bg);
            backdrop-filter: blur(8px);
            border: 1px solid var(--nav-btn-border);
            border-radius: 40px;
            padding: 8px 12px;
            color: var(--nav-btn-color);
            box-shadow: var(--nav-btn-shadow);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            width: 44px;
            height: 44px;
        }
        .theme-toggle:hover {
            background: var(--nav-btn-hover-bg);
            transform: scale(0.95);
        }
        .theme-toggle svg {
            width: 22px;
            height: 22px;
            stroke: currentColor;
            stroke-width: 2;
            fill: none;
        }
        .word-section {
            text-align: center;
            margin-bottom: 28px;
        }
        .word-section.animate .word {
            animation: fadeSlide 0.25s ease-out;
        }
        @keyframes fadeSlide {
            0% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .word {
            font-size: 3.2rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            background: var(--word-gradient);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 12px;
            text-shadow: var(--word-shadow);
        }
        .pos {
            font-size: 0.9rem;
            background: var(--pos-bg);
            display: inline-block;
            padding: 5px 14px;
            border-radius: 40px;
            margin-bottom: 12px;
            color: var(--pos-color);
            box-shadow: inset 0 2px 5px var(--pos-shadow-inset), 0 1px 0 var(--pos-shadow-outset);
            font-weight: 500;
            backdrop-filter: blur(4px);
        }
        .meaning {
            font-size: 1.25rem;
            color: var(--text-secondary);
            font-weight: 500;
        }
        .example-area {
            background: var(--example-bg);
            border-radius: 28px;
            padding: 20px 18px;
            margin: 20px 0 12px;
            border: 1px solid var(--example-border);
            backdrop-filter: blur(8px);
            transition: all 0.25s;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            gap: 15px;
        }
        .example-text {
            flex: 1;
        }
        .example-en {
            font-size: 1.05rem;
            line-height: 1.5;
            margin-bottom: 8px;
            font-style: italic;
            color: var(--text-primary);
        }
        .example-zh {
            font-size: 0.95rem;
            color: var(--text-secondary);
            transition: opacity 0.2s;
        }
        .hide-zh .example-zh {
            display: none;
        }
        .button-group-vertical {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-end;
        }
        .flip-mode .pos,
        .flip-mode .meaning {
            display: none !important;
        }
        .flip-container {
            perspective: 1200px;
            width: 100%;
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
        }
        .flipper {
            position: relative;
            width: 100%;
            max-width: 400px;
            height: 140px;
            transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1);
            transform-style: preserve-3d;
            cursor: pointer;
            margin: 0 auto;
        }
        .flip-mode .flipper:hover {
            transform: rotateY(180deg);
        }
        .flip-front, .flip-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 36px;
            background: var(--flip-bg);
            box-shadow: 0 15px 25px -8px rgba(0,0,0,0.2), inset 0 0 0 1px var(--flip-border);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            backdrop-filter: blur(12px);
        }
        .flip-front {
            transform: rotateY(0deg);
            font-size: 2.8rem;
            font-weight: 800;
            background: var(--word-gradient);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: var(--word-shadow);
        }
        .flip-back {
            transform: rotateY(180deg);
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            text-align: center;
            line-height: 1.4;
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border: 1px solid var(--example-border);
        }
        .nav-buttons {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            gap: 15px;
        }
        .nav-btn {
            --btn-rotate-x: 0deg;
            --btn-rotate-y: 0deg;
            background: var(--nav-btn-bg);
            border: 1px solid var(--nav-btn-border);
            color: var(--nav-btn-color);
            padding: 12px 26px;
            border-radius: 60px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            backdrop-filter: blur(8px);
            box-shadow: var(--nav-btn-shadow);
            transition: box-shadow 0.2s, background 0.2s, transform 0.1s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            transform: perspective(400px) rotateX(calc(var(--btn-rotate-x) * -1)) rotateY(calc(var(--btn-rotate-y) * -1));
            will-change: transform;
        }
        .nav-btn svg {
            width: 18px; height: 18px;
            stroke: currentColor;
            stroke-width: 2.2;
            fill: none;
        }
        .nav-btn:hover {
            background: var(--nav-btn-hover-bg);
            box-shadow: 0 18px 28px rgba(0, 0, 0, 0.25), 0 6px 12px rgba(0, 0, 0, 0.15);
            transform: perspective(400px) rotateX(calc(var(--btn-rotate-x) * -1 - 5deg)) rotateY(calc(var(--btn-rotate-y) * -1 - 5deg)) scale(1.03);
        }
        .nav-btn:active {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transform: perspective(400px) rotateX(calc(var(--btn-rotate-x) * -1 - 2deg)) rotateY(calc(var(--btn-rotate-y) * -1 - 2deg)) scale(0.97);
        }
        .counter {
            font-size: 0.95rem;
            background: var(--counter-bg);
            padding: 8px 18px;
            border-radius: 60px;
            color: var(--counter-color);
            box-shadow: inset 0 2px 6px var(--pos-shadow-inset), 0 1px 0 var(--pos-shadow-outset);
            font-weight: 500;
            backdrop-filter: blur(4px);
        }
        .progress {
            width: 100%; height: 5px; background: var(--progress-bg);
            border-radius: 6px; margin-top: 28px; overflow: hidden;
        }
        .progress-bar {
            height: 100%; background: var(--progress-bar);
            border-radius: 6px; transition: width 0.25s;
        }
        @media (max-width: 550px) {
            .card-3d { padding: 20px 16px; }
            .flip-front { font-size: 2rem; }
            .flip-back { font-size: 1.5rem; }
            .example-area { flex-direction: row; }
            .button-group-vertical { flex-direction: row; justify-content: flex-end; width: 100%; }
            .nav-btn { padding: 10px 20px; }
        }
    `;

    // 注入样式
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // ---------- 默认单词库 (可外部配置) ----------
    const DEFAULT_WORDS = [
        { word: "Antique", pos: "adj / n", meaning: "古老的，古董的", example: null },
        { word: "Exert", pos: "v", meaning: "施加（影响）；运用", example: null },
        { word: "Peculiar", pos: "adj", meaning: "奇怪的；特有的", example: null },
        { word: "Fascination", pos: "n", meaning: "魅力；着迷", example: null },
        { word: "Pretentious", pos: "adj", meaning: "自命不凡的，做作的", example: null },
        { word: "Ephemeral", pos: "adj", meaning: "短暂的，瞬息的", example: null },
        { word: "Serendipity", pos: "n", meaning: "意外发现珍宝的运气", example: null },
        { word: "Mellifluous", pos: "adj", meaning: "甜美流畅的（声音）", example: null }
    ];

    // 例句模拟库
    const FAKE_EXAMPLES = {
        "Antique": { en: "This antique vase is worth a fortune.", zh: "这个古董花瓶价值连城。" },
        "Exert": { en: "He had to exert all his strength.", zh: "他必须使出全力。" },
        "Peculiar": { en: "There's a peculiar smell.", zh: "有一股奇怪的气味。" },
        "Fascination": { en: "The castle held a strange fascination.", zh: "古堡有种奇怪的魅力。" },
        "Pretentious": { en: "His pretentious style annoys readers.", zh: "他做作的风格惹人反感。" },
        "Ephemeral": { en: "Fame can be ephemeral.", zh: "名声可能转瞬即逝。" },
        "Serendipity": { en: "Finding that book was serendipity.", zh: "找到那本书纯属机缘。" },
        "Mellifluous": { en: "Her mellifluous voice captivated all.", zh: "她甜美的嗓音迷住了所有人。" }
    };

    // ---------- 构建 DOM 结构 ----------
    function createCardHTML() {
        return `
            <div class="word-card-container">
                <div class="card-3d" id="magicCard">
                    <div class="glare" id="glareLayer"></div>
                    <button class="theme-toggle" id="themeToggle" aria-label="切换深色/浅色模式"></button>
                    <div class="content">
                        <div class="word-section" id="wordSection">
                            <div class="word" id="currentWord">Antique</div>
                            <div class="pos" id="currentPos">adj / n</div>
                            <div class="meaning" id="currentMeaning">古老的，古董的</div>
                            <div id="flipWrapper" style="display: none;"></div>
                        </div>
                        <div class="example-area" id="exampleArea">
                            <div class="example-text">
                                <div class="example-en" id="exampleEn">点击右侧星星生成例句</div>
                                <div class="example-zh" id="exampleZh"></div>
                            </div>
                            <div class="button-group-vertical">
                                <button class="icon-only-btn" id="generateExampleBtn" aria-label="生成例句">
                                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                </button>
                                <button class="icon-only-btn" id="toggleTranslationBtn" aria-label="隐藏/显示翻译">
                                    <svg viewBox="0 0 24 24" id="hideIcon"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2.5"/></svg>
                                </button>
                            </div>
                        </div>
                        <div class="nav-buttons">
                            <button class="nav-btn" id="prevBtn">
                                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                                上一个
                            </button>
                            <span class="counter" id="counter">1 / 8</span>
                            <button class="nav-btn" id="nextBtn">
                                下一个
                                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>
                        <div class="progress"><div class="progress-bar" id="progressBar"></div></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ---------- 初始化逻辑 ----------
    function initWordCard(container, customWords = null) {
        const wordsData = customWords || DEFAULT_WORDS;
        const totalWords = wordsData.length;
        let currentIndex = 0;
        let isFlipMode = false;

        // 挂载 HTML
        container.innerHTML = createCardHTML();

        // DOM 元素
        const card = document.getElementById('magicCard');
        const glare = document.getElementById('glareLayer');
        const wordSection = document.getElementById('wordSection');
        const wordEl = document.getElementById('currentWord');
        const posEl = document.getElementById('currentPos');
        const meaningEl = document.getElementById('currentMeaning');
        const exampleEnEl = document.getElementById('exampleEn');
        const exampleZhEl = document.getElementById('exampleZh');
        const generateBtn = document.getElementById('generateExampleBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const counterSpan = document.getElementById('counter');
        const progressBar = document.getElementById('progressBar');
        const themeToggle = document.getElementById('themeToggle');
        const toggleTransBtn = document.getElementById('toggleTranslationBtn');
        const hideIconSvg = document.getElementById('hideIcon');
        const flipWrapper = document.getElementById('flipWrapper');
        const exampleArea = document.getElementById('exampleArea');
        const navButtons = [prevBtn, nextBtn];

        // 主题图标更新
        function setThemeIcon() {
            const isDark = document.body.classList.contains('dark');
            themeToggle.innerHTML = isDark ? 
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>` :
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        }
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        setThemeIcon();
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
            setThemeIcon();
        });

        // 翻转卡片
        function buildFlipStructure(word, meaning) {
            flipWrapper.style.display = 'block';
            flipWrapper.innerHTML = `
                <div class="flip-container">
                    <div class="flipper">
                        <div class="flip-front">${word}</div>
                        <div class="flip-back">${meaning}</div>
                    </div>
                </div>
            `;
            wordEl.style.display = 'none';
            posEl.style.display = 'none';
            meaningEl.style.display = 'none';
            wordSection.classList.add('flip-mode');
        }
        function destroyFlipStructure() {
            flipWrapper.style.display = 'none';
            flipWrapper.innerHTML = '';
            wordEl.style.display = '';
            posEl.style.display = '';
            meaningEl.style.display = '';
            wordSection.classList.remove('flip-mode');
        }
        function updateFlipContent(word, meaning) {
            const front = document.querySelector('.flip-front');
            const back = document.querySelector('.flip-back');
            if (front) front.textContent = word;
            if (back) back.textContent = meaning;
        }

        function toggleTranslationMode() {
            isFlipMode = !isFlipMode;
            const item = wordsData[currentIndex];
            if (isFlipMode) {
                exampleArea.classList.add('hide-zh');
                buildFlipStructure(item.word, item.meaning);
                hideIconSvg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
                toggleTransBtn.setAttribute('aria-label', '显示翻译');
            } else {
                exampleArea.classList.remove('hide-zh');
                destroyFlipStructure();
                hideIconSvg.innerHTML = `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2.5"/>`;
                toggleTransBtn.setAttribute('aria-label', '隐藏翻译');
                updateCardContent();
            }
        }

        function updateCardContent() {
            const item = wordsData[currentIndex];
            wordEl.textContent = item.word;
            posEl.textContent = item.pos;
            meaningEl.textContent = item.meaning;
            counterSpan.textContent = `${currentIndex+1} / ${totalWords}`;
            progressBar.style.width = `${((currentIndex+1)/totalWords)*100}%`;
            if (item.example) {
                exampleEnEl.textContent = item.example.en;
                exampleZhEl.textContent = item.example.zh;
            } else {
                exampleEnEl.textContent = '点击右侧星星生成例句';
                exampleZhEl.textContent = '';
            }
        }

        function updateCard() {
            wordSection.classList.add('animate');
            setTimeout(() => wordSection.classList.remove('animate'), 250);
            const item = wordsData[currentIndex];
            if (isFlipMode) {
                updateFlipContent(item.word, item.meaning);
                exampleArea.classList.add('hide-zh');
            } else {
                wordEl.textContent = item.word;
                posEl.textContent = item.pos;
                meaningEl.textContent = item.meaning;
                exampleArea.classList.remove('hide-zh');
            }
            counterSpan.textContent = `${currentIndex+1} / ${totalWords}`;
            progressBar.style.width = `${((currentIndex+1)/totalWords)*100}%`;
            if (item.example) {
                exampleEnEl.textContent = item.example.en;
                exampleZhEl.textContent = item.example.zh;
            } else {
                exampleEnEl.textContent = '点击右侧星星生成例句';
                exampleZhEl.textContent = '';
            }
        }

        // 生成例句
        async function handleGenerateExample() {
            const item = wordsData[currentIndex];
            exampleEnEl.textContent = '✨ 生成中...';
            exampleZhEl.textContent = '';
            await new Promise(r => setTimeout(r, 450));
            const example = FAKE_EXAMPLES[item.word] || { en: `"${item.word}" is a great word.`, zh: `“${item.word}”是个好词。` };
            item.example = example;
            exampleEnEl.textContent = example.en;
            exampleZhEl.textContent = example.zh;
        }

        function prevWord() {
            currentIndex = (currentIndex - 1 + totalWords) % totalWords;
            updateCard();
        }
        function nextWord() {
            currentIndex = (currentIndex + 1) % totalWords;
            updateCard();
        }

        generateBtn.addEventListener('click', handleGenerateExample);
        prevBtn.addEventListener('click', prevWord);
        nextBtn.addEventListener('click', nextWord);
        toggleTransBtn.addEventListener('click', toggleTranslationMode);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevWord(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); nextWord(); }
        });

        // 3D 倾斜 (卡片正向，按钮反向)
        function applyReverseTilt(rotateX, rotateY) {
            const reverseX = -rotateX;
            const reverseY = -rotateY;
            navButtons.forEach(btn => {
                btn.style.setProperty('--btn-rotate-x', reverseX + 'deg');
                btn.style.setProperty('--btn-rotate-y', reverseY + 'deg');
            });
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateY = (x - 0.5) * 22;
            const rotateX = (y - 0.5) * -22;
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            const gX = x * 100, gY = y * 100;
            const isDark = document.body.classList.contains('dark');
            glare.style.background = `radial-gradient(circle at ${gX}% ${gY}%, rgba(255,255,255,${isDark?0.3:0.5}) 0%, transparent 70%)`;
            glare.style.opacity = isDark ? '0.7' : '0.9';

            applyReverseTilt(rotateX, rotateY);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
            glare.style.opacity = '0';
            applyReverseTilt(0, 0);
        });

        applyReverseTilt(0, 0);
        updateCard();

        // 返回 API 以便外部控制（可选）
        return {
            next: nextWord,
            prev: prevWord,
            setIndex: (idx) => { currentIndex = idx % totalWords; updateCard(); },
            getCurrentWord: () => wordsData[currentIndex]
        };
    }

    // 暴露全局初始化方法
    window.WordMemoryCard = {
        init: initWordCard
    };

})();