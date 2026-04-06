# 核心模块 (Core)

核心模块提供项目的基础设施和通用功能，为其他模块提供底层支持。

## 模块列表

### module_registry.js
**模块注册系统**

管理模块的注册、依赖解析和初始化顺序，实现模块化架构的核心。

**主要功能：**
- 模块注册：`register(moduleName, dependencies, factory)`
- 模块获取：`get(moduleName)`
- 初始化所有模块：`initializeAll()`

**使用示例：**
```javascript
ModuleRegistry.register('MyModule', ['EventBus', 'ErrorHandler'], function(EventBus, ErrorHandler) {
    // 模块实现
    return {
        // 导出的接口
    };
});
```

### event_bus.js
**事件总线**

实现模块间的事件驱动通信，实现组件解耦。

**主要功能：**
- 注册事件监听：`on(eventName, callback)`
- 移除事件监听：`off(eventName, callback)`
- 触发事件：`emit(eventName, data)`

**使用示例：**
```javascript
// 发送事件
EventBus.emit('customEvent', { data: 'value' });

// 监听事件
EventBus.on('customEvent', function(data) {
    console.log(data);
});
```

### error_handler.js
**错误处理器**

统一错误处理，提供用户友好的错误提示和错误分类。

**主要功能：**
- 显示错误提示：`showError(message, type)`
- 处理API错误：`handleApiError(error)`
- 处理验证错误：`handleValidationError(error)`
- 处理网络错误：`handleNetworkError(error)`
- 包装异步函数：`wrapAsyncFunction(fn)`

**使用示例：**
```javascript
const asyncFunction = ErrorHandler.wrapAsyncFunction(async function() {
    // 异步操作
});
```

### security.js
**安全工具**

提供API Key加密存储、输入验证、XSS防护等安全功能。

**主要功能：**
- 加密/解密：`encrypt(text)`, `decrypt(text)`
- 输入验证：`validateText(text, maxLength)`
- HTML转义：`escapeHtml(text)`
- 安全设置HTML：`safeSetInnerHTML(element, html)`
- 敏感信息过滤：`filterSensitiveInfo(text)`

**使用示例：**
```javascript
const validation = Security.validateText(text, 1000);
if (!validation.valid) {
    ErrorHandler.handleValidationError(validation.error);
}
```

### performance.js
**性能优化工具**

提供缓存、防抖、节流等性能优化功能。

**主要功能：**
- 防抖：`debounce(func, wait)`
- 节流：`throttle(func, limit)`
- API请求缓存：`cacheAPIRequest(key, requestFn)`
- 跟踪API请求：`trackAPIRequest()`

**使用示例：**
```javascript
const debouncedFunction = Performance.debounce(function() {
    // 防抖操作
}, 300);
```

### cache.js
**缓存管理**

统一管理句子解析缓存、全文翻译、句子数组等数据。

**主要功能：**
- 设置句子数组：`setSentences(sentences)`
- 获取句子数组：`getSentences()`
- 设置句子缓存：`setSentenceCache(idx, type, data)`
- 获取句子缓存：`getSentenceCache(idx, type)`
- 清除句子缓存：`clearSentenceCache(idx)`
- 设置全文翻译：`setFullTranslation(translation)`
- 获取全文翻译：`getFullTranslation()`
- 重置所有缓存：`resetAllCache()`

**使用示例：**
```javascript
CacheManager.setSentenceCache(0, 'pos', { pos: [...] });
const posData = CacheManager.getSentenceCache(0, 'pos');
```

## 依赖关系

```
module_registry.js (无依赖)
    ↓
event_bus.js (无依赖)
    ↓
error_handler.js (无依赖)
    ↓
security.js (无依赖)
    ↓
performance.js (无依赖)
    ↓
cache.js (无依赖)
```

## 使用原则

1. **核心模块优先加载**：核心模块必须在其他业务模块之前加载
2. **最小化依赖**：核心模块之间尽量减少相互依赖
3. **稳定性优先**：核心模块应保持稳定，避免频繁修改
4. **通用性**：核心模块提供的功能应具有通用性，适用于多个业务场景

## 扩展指南

如需添加新的核心模块：

1. 在 `core/` 目录下创建新的JS文件
2. 遵循现有的代码风格和命名规范
3. 添加详细的JSDoc注释
4. 在 `index.html` 中添加script引用
5. 更新本README文档

## 注意事项

- 核心模块不应包含业务逻辑
- 避免在核心模块中直接操作DOM
- 保持核心模块的独立性和可测试性
- 所有核心模块都应导出全局对象供其他模块使用