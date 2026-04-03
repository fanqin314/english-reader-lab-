// API请求封装.js - 封装所有 LLM API 调用
(function() {
    // 获取 API 配置
    function getApiConfig() {
        if (window.getApiConfig) {
            return window.getApiConfig();
        }
        return {
            baseUrl: localStorage.getItem('apiBase') || 'https://api.deepseek.com',
            apiKey: localStorage.getItem('apiKey') || '',
            model: localStorage.getItem('modelName') || 'deepseek-chat'
        };
    }

    // 显示提示
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = msg;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    }

    // 通用 API 请求函数
    async function callAPI(messages, maxTokens = 1000) {
        const config = getApiConfig();
        
        if (!config.apiKey) {
            throw new Error('请先在设置中配置 API Key');
        }

        try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: messages,
                    max_tokens: maxTokens,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API 请求失败: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API 请求失败:', error);
            throw error;
        }
    }

    // 请求词性标注
    async function requestPos(sentence) {
        const messages = [
            {
                role: 'system',
                content: '你是一个英语语法分析助手。请分析句子中每个单词的词性。'
            },
            {
                role: 'user',
                content: `请分析以下句子的词性，以 JSON 格式返回，格式如下：
[
  {"word": "单词", "pos": "词性缩写", "meaning": "中文释义"}
]

词性缩写包括：n(名词), v(动词), adj(形容词), adv(副词), pron(代词), prep(介词), conj(连词), art(冠词), num(数词), interj(感叹词)

句子：${sentence}

只返回 JSON，不要其他说明。`
            }
        ];

        try {
            const result = await callAPI(messages, 1000);
            
            // 尝试解析 JSON
            let posData;
            try {
                // 尝试从结果中提取 JSON
                const jsonMatch = result.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    posData = JSON.parse(jsonMatch[0]);
                } else {
                    posData = JSON.parse(result);
                }
            } catch (e) {
                // 如果解析失败，返回一个默认结构
                console.warn('词性 JSON 解析失败:', result);
                posData = { pos: [], raw: result };
            }

            return posData;
        } catch (error) {
            console.error('词性请求失败:', error);
            throw error;
        }
    }

    // 请求语法分析
    async function requestSyntax(sentence) {
        const messages = [
            {
                role: 'system',
                content: '你是一个英语语法分析助手。请分析句子的语法结构。'
            },
            {
                role: 'user',
                content: `请分析以下句子的语法结构，包括：
1. 主语
2. 谓语
3. 宾语
4. 其他成分（定语、状语、补语等）
5. 句型类型
6. 时态

句子：${sentence}

请用中文回答，条理清晰。`
            }
        ];

        try {
            const result = await callAPI(messages, 1500);
            return result;
        } catch (error) {
            console.error('语法分析请求失败:', error);
            throw error;
        }
    }

    // 请求知识拓展
    async function requestKnowledge(sentence) {
        const messages = [
            {
                role: 'system',
                content: '你是一个英语知识拓展助手。请为句子提供相关的知识点和背景信息。'
            },
            {
                role: 'user',
                content: `请为以下句子提供知识拓展，包括：
1. 句子中的重点词汇和短语
2. 相关的语法点
3. 文化背景或实用表达
4. 类似的句型表达

句子：${sentence}

请用中文回答，简洁实用。`
            }
        ];

        try {
            const result = await callAPI(messages, 1500);
            return result;
        } catch (error) {
            console.error('知识拓展请求失败:', error);
            throw error;
        }
    }

    // 请求句子翻译
    async function requestTranslation(sentence) {
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的英汉翻译助手。'
            },
            {
                role: 'user',
                content: `请将以下句子翻译成中文，准确流畅。

句子：${sentence}

只返回翻译结果，不要其他说明。`
            }
        ];

        try {
            const result = await callAPI(messages, 800);
            return result;
        } catch (error) {
            console.error('句子翻译请求失败:', error);
            throw error;
        }
    }

    // 请求全文翻译
    async function requestFullTranslation(text) {
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的英汉翻译助手。请将英文文本翻译成中文，保持原文的段落结构。'
            },
            {
                role: 'user',
                content: `请将以下英文文本翻译成中文：

${text}

只返回翻译结果，不要其他说明。`
            }
        ];

        try {
            const result = await callAPI(messages, 2000);
            return result;
        } catch (error) {
            console.error('全文翻译请求失败:', error);
            throw error;
        }
    }

    // 请求单词释义
    async function requestWordMeaning(word) {
        const messages = [
            {
                role: 'system',
                content: '你是一个英语词典助手。请提供单词的释义和词性。'
            },
            {
                role: 'user',
                content: `请提供单词 "${word}" 的信息：
1. 词性（缩写：n, v, adj, adv等）
2. 中文释义
3. 简单的英文例句（可选）

以 JSON 格式返回：
{
  "word": "单词",
  "pos": "词性",
  "meaning": "中文释义"
}

只返回 JSON，不要其他说明。`
            }
        ];

        try {
            const result = await callAPI(messages, 500);
            
            // 尝试解析 JSON
            let wordData;
            try {
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    wordData = JSON.parse(jsonMatch[0]);
                } else {
                    wordData = JSON.parse(result);
                }
            } catch (e) {
                // 如果解析失败，返回一个默认结构
                console.warn('单词释义 JSON 解析失败:', result);
                wordData = {
                    word: word,
                    pos: '',
                    meaning: result
                };
            }

            return wordData;
        } catch (error) {
            console.error('单词释义请求失败:', error);
            throw error;
        }
    }

    // 导出接口
    window.APIRequest = {
        requestPos,
        requestSyntax,
        requestKnowledge,
        requestTranslation,
        requestFullTranslation,
        requestWordMeaning
    };

    console.log('API 请求模块已加载');
})();
