// 解析请求.js - 调用 API 获取词性、语法结构、知识点、翻译

(function() {
    // 获取 API 配置（从全局或 localStorage）
    function getApiConfig() {
        return {
            baseUrl: localStorage.getItem('apiBase') || 'https://api.deepseek.com',
            apiKey: localStorage.getItem('apiKey') || '',
            model: localStorage.getItem('modelName') || 'deepseek-chat'
        };
    }

    // 通用 API 请求函数
    async function callAPI(messages, options = {}) {
        const config = getApiConfig();
        
        if (!config.apiKey) {
            throw new Error('请先配置 API Key');
        }

        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                temperature: options.temperature || 0.3,
                ...(options.responseFormat ? { response_format: { type: options.responseFormat } } : {})
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 请求失败: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // 请求词性分析
    async function requestPos(sentence) {
        const systemPrompt = `你是英语语言学专家。返回JSON格式：
{
  "pos": [
    {"word": "单词", "pos": "n/v/adj/adv/pron/prep/conj/interj/art/num", "meaning": "中文释义"}
  ]
}
只返回JSON，不要其他文字。`;

        const userContent = `分析句子: "${sentence}"`;
        
        const content = await callAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ]);

        // 提取 JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('返回格式错误');
        return JSON.parse(jsonMatch[0]);
    }

    // 请求语法结构
    async function requestSyntax(sentence) {
        const systemPrompt = `你是英语语言学专家。返回JSON格式：
{
  "syntax": "该句的语法结构描述（主语、谓语、宾语、定语、状语等）"
}
只返回JSON，不要其他文字。`;

        const userContent = `分析句子: "${sentence}"`;
        
        const content = await callAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ]);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('返回格式错误');
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.syntax || '暂无语法结构';
    }

    // 请求知识点（重点搭配、金句）
    async function requestKnowledge(sentence) {
        const systemPrompt = `你是英语语言学专家。返回JSON格式：
{
  "knowledge": "重点搭配、金句，使用换行符分隔不同要点"
}
只返回JSON，不要其他文字。`;

        const userContent = `分析句子: "${sentence}"`;
        
        const content = await callAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ]);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('返回格式错误');
        const parsed = JSON.parse(jsonMatch[0]);
        // 格式化换行
        let knowledge = parsed.knowledge || '暂无知识点';
        knowledge = knowledge.replace(/[；;]\s*/g, '<br>');
        knowledge = knowledge.replace(/(重点搭配|金句|写作建议)/g, '<strong>$1</strong>');
        return knowledge;
    }

    // 请求翻译
    async function requestTranslation(sentence) {
        const systemPrompt = `将以下英文句子翻译成中文，只返回翻译结果文本，不要其他内容。`;
        
        const content = await callAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: sentence }
        ]);

        return content;
    }

    // 请求单词释义（用于生词本）
    async function requestWordMeaning(word) {
        const systemPrompt = `你是英语词典助手。返回JSON格式：
{
  "meaning": "中文释义",
  "pos": "词性缩写(n/v/adj/adv等)"
}
只返回JSON，不要其他文字。`;

        const userContent = `提供单词"${word}"的中文释义和词性。`;
        
        const content = await callAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ]);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('返回格式错误');
        return JSON.parse(jsonMatch[0]);
    }

    // 请求全文翻译
    async function requestFullTranslation(text) {
        const systemPrompt = `将以下英文文章翻译成中文，只返回翻译结果文本，不要其他内容。`;
        
        const content = await callAPI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
        ]);

        return content;
    }

    // 导出接口
    window.APIRequest = {
        requestPos,
        requestSyntax,
        requestKnowledge,
        requestTranslation,
        requestWordMeaning,
        requestFullTranslation
    };
})();