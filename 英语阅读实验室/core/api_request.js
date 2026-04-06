/**
 * @module APIRequest
 * @description 处理所有API请求，包括词性分析、语法结构、知识点、翻译等
 * @requires Security, ErrorHandler, Performance
 * @exports {Object} APIRequest对象
 */
// 解析请求.js - 调用 API 获取词性、语法结构、知识点、翻译
(function() {
    ModuleRegistry.register('APIRequest', ['Security', 'ErrorHandler', 'Performance'], function(Security, ErrorHandler, Performance) {
        /**
         * 获取 API 配置
         * @returns {Object} API配置对象
         */
        function getApiConfig() {
            return Security.getApiConfig();
        }

        /**
         * 通用 API 请求函数
         * @param {Array} messages - API请求消息数组
         * @param {Object} options - 请求选项
         * @returns {Promise<string>} API响应内容
         * @throws {Error} API请求失败时抛出错误
         */
        async function callAPI(messages, options = {}) {
            const config = getApiConfig();
            
            if (!config || !config.apiKey) {
                throw new Error('请先配置 API Key');
            }

            // 打印配置信息（隐藏部分API Key）
            const maskedApiKey = config.apiKey.substring(0, 4) + '***' + config.apiKey.substring(config.apiKey.length - 4);
            console.log('API配置信息:', {
                baseUrl: config.baseUrl,
                apiKey: maskedApiKey,
                model: config.model
            });

            // 打印请求参数
            console.log('API请求参数:', {
                messages: messages,
                options: options
            });

            Performance.trackAPIRequest();

            try {
                const url = `${config.baseUrl}/chat/completions`;
                console.log('API请求URL:', url);
                
                const response = await fetch(url, {
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
                
                console.log('API响应状态:', response.status);
                console.log('API响应状态文本:', response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('API错误响应:', errorText);
                    
                    let errorMessage = `API 请求失败: ${response.status}`;
                    try {
                        const errorObj = JSON.parse(errorText);
                        if (errorObj.error && errorObj.error.message) {
                            errorMessage += ` - ${Security.filterSensitiveInfo(errorObj.error.message)}`;
                        }
                    } catch (e) {
                        errorMessage += ` - ${Security.filterSensitiveInfo(errorText)}`;
                    }
                    
                    // 根据状态码提供更具体的错误信息
                    if (response.status === 401) {
                        throw new Error('API Key 无效');
                    } else if (response.status === 403) {
                        throw new Error('API 权限不足');
                    } else if (response.status === 429) {
                        throw new Error('API 请求过于频繁，请稍后再试');
                    } else if (response.status === 500) {
                        throw new Error('服务器内部错误，请稍后再试');
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                console.log('API成功响应:', data);
                
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error('API 返回格式错误');
                }
                return data.choices[0].message.content;
            } catch (error) {
                console.error('API请求错误:', error);
                if (error.message && error.message.includes('fetch') || error.name === 'TypeError') {
                    throw new Error('网络连接失败，请检查网络设置');
                } else if (error.name === 'AbortError') {
                    throw new Error('API 请求超时');
                }
                throw error;
            }
        }

        /**
         * 生成缓存键的哈希函数
         * @param {string} prefix - 缓存键前缀
         * @param {string} content - 缓存内容
         * @returns {string} 生成的缓存键
         */
        function generateCacheKey(prefix, content) {
            let hash = 0;
            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 转换为32位整数
            }
            return `${prefix}_${Math.abs(hash)}`;
        }

        /**
         * 请求词性分析
         * @param {string} sentence - 待分析的句子
         * @returns {Promise<Object>} 词性分析结果
         */
        const requestPos = ErrorHandler.wrapAsyncFunction(async function(sentence) {
            const validation = Security.validateText(sentence, 1000);
            if (!validation.valid) {
                ErrorHandler.handleValidationError(validation.error);
                return { pos: [] }; // 返回空对象而不是null
            }

            // 使用缓存
            const cacheKey = generateCacheKey('pos', sentence);
            return Performance.cacheAPIRequest(cacheKey, async () => {
                const systemPrompt = `你是英语语言学专家。返回JSON格式：
{
  "pos": [
    {"word": "单词", "pos": "n/v/adj/adv/pron/prep/conj/interj/art/num", "meaning": "中文释义"}
  ]
}
只返回JSON，不要其他文字。`;

                const userContent = `分析句子: "${Security.escapeHtml(sentence)}"`;
                
                const content = await callAPI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ]);

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('返回格式错误');
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    throw new Error('JSON解析失败: ' + parseError.message);
                }
            });
        });

        /**
         * 请求语法结构分析
         * @param {string} sentence - 待分析的句子
         * @returns {Promise<string>} 语法结构分析结果
         */
        const requestSyntax = ErrorHandler.wrapAsyncFunction(async function(sentence) {
            const validation = Security.validateText(sentence, 1000);
            if (!validation.valid) {
                ErrorHandler.handleValidationError(validation.error);
                return '暂无语法结构'; // 返回默认值而不是null
            }

            // 使用缓存
            const cacheKey = generateCacheKey('syntax', sentence);
            return Performance.cacheAPIRequest(cacheKey, async () => {
                const systemPrompt = `你是英语语言学专家。返回JSON格式：
{
  "syntax": "该句的语法结构描述（主语、谓语、宾语、定语、状语等）"
}
只返回JSON，不要其他文字。`;

                const userContent = `分析句子: "${Security.escapeHtml(sentence)}"`;
                
                const content = await callAPI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ]);

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('返回格式错误');
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return parsed.syntax || '暂无语法结构';
                } catch (parseError) {
                    throw new Error('JSON解析失败: ' + parseError.message);
                }
            });
        });

        /**
         * 请求知识点分析
         * @param {string} sentence - 待分析的句子
         * @returns {Promise<string>} 知识点分析结果
         */
        const requestKnowledge = ErrorHandler.wrapAsyncFunction(async function(sentence) {
            const validation = Security.validateText(sentence, 1000);
            if (!validation.valid) {
                ErrorHandler.handleValidationError(validation.error);
                return '暂无知识点'; // 返回默认值而不是null
            }

            // 使用缓存
            const cacheKey = generateCacheKey('knowledge', sentence);
            return Performance.cacheAPIRequest(cacheKey, async () => {
                const systemPrompt = `你是英语语言学专家。返回JSON格式：
{
  "knowledge": "重点搭配、金句，使用换行符分隔不同要点"
}
只返回JSON，不要其他文字。`;

                const userContent = `分析句子: "${Security.escapeHtml(sentence)}"`;
                
                const content = await callAPI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ]);

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('返回格式错误');
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    let knowledge = parsed.knowledge || '暂无知识点';
                    knowledge = knowledge.replace(/[；;]\s*/g, '<br>');
                    knowledge = knowledge.replace(/(重点搭配|金句|写作建议)/g, '<strong>$1</strong>');
                    return knowledge;
                } catch (parseError) {
                    throw new Error('JSON解析失败: ' + parseError.message);
                }
            });
        });

        /**
         * 请求句子翻译
         * @param {string} sentence - 待翻译的句子
         * @returns {Promise<string>} 翻译结果
         */
        const requestTranslation = ErrorHandler.wrapAsyncFunction(async function(sentence) {
            const validation = Security.validateText(sentence, 1000);
            if (!validation.valid) {
                ErrorHandler.handleValidationError(validation.error);
                return ''; // 返回空字符串而不是null
            }

            // 使用缓存
            const cacheKey = generateCacheKey('translation', sentence);
            return Performance.cacheAPIRequest(cacheKey, async () => {
                const systemPrompt = `将以下英文句子翻译成中文，只返回翻译结果文本，不要其他内容。`;
                
                const content = await callAPI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: Security.escapeHtml(sentence) }
                ]);

                return content;
            });
        });

        /**
         * 请求单词释义
         * @param {string} word - 待查询的单词
         * @returns {Promise<Object>} 单词释义结果
         */
        const requestWordMeaning = ErrorHandler.wrapAsyncFunction(async function(word) {
            const validation = Security.validateText(word, 100);
            if (!validation.valid) {
                ErrorHandler.handleValidationError(validation.error);
                return { meaning: '', pos: '' }; // 返回空对象而不是null
            }

            // 使用缓存
            const cacheKey = generateCacheKey('meaning', word);
            return Performance.cacheAPIRequest(cacheKey, async () => {
                const systemPrompt = `你是英语词典助手。返回JSON格式：
{
  "meaning": "中文释义",
  "pos": "词性缩写(n/v/adj/adv等)"
}
只返回JSON，不要其他文字。`;

                const userContent = `提供单词"${Security.escapeHtml(word)}"的中文释义和词性。`;
                
                const content = await callAPI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ]);

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('返回格式错误');
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    throw new Error('JSON解析失败: ' + parseError.message);
                }
            });
        });

        /**
         * 请求全文翻译
         * @param {string} text - 待翻译的文本
         * @returns {Promise<string>} 翻译结果
         */
        const requestFullTranslation = ErrorHandler.wrapAsyncFunction(async function(text) {
            const validation = Security.validateText(text, 10000);
            if (!validation.valid) {
                ErrorHandler.handleValidationError(validation.error);
                return ''; // 返回空字符串而不是null
            }

            // 使用缓存
            const cacheKey = generateCacheKey('full_translation', text);
            return Performance.cacheAPIRequest(cacheKey, async () => {
                const systemPrompt = `将以下英文文章翻译成中文，只返回翻译结果文本，不要其他内容。`;
                
                const content = await callAPI([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: Security.escapeHtml(text) }
                ]);

                return content;
            });
        });

        // 导出全局接口（保持向后兼容）
        window.APIRequest = {
            requestPos,
            requestSyntax,
            requestKnowledge,
            requestTranslation,
            requestWordMeaning,
            requestFullTranslation,
            // 兼容别名
            requestPosAnalysis: requestPos,
            requestSyntaxAnalysis: requestSyntax,
            requestKnowledgePoints: requestKnowledge
        };

        return {
            requestPos,
            requestSyntax,
            requestKnowledge,
            requestTranslation,
            requestWordMeaning,
            requestFullTranslation
        };
    });
})();