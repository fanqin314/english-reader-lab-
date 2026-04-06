// event_bus.js - 事件总线系统
console.log('EventBus 脚本开始执行...');
(function() {
    console.log('EventBus 立即执行函数开始...');
    if (typeof ModuleRegistry !== 'undefined') {
        console.log('ModuleRegistry 存在，开始注册 EventBus 模块...');
        try {
            ModuleRegistry.register('EventBus', [], function() {
                console.log('EventBus 模块工厂函数执行...');
                const events = {};
                
                function on(eventName, callback) {
                    if (!events[eventName]) {
                        events[eventName] = [];
                    }
                    events[eventName].push(callback);
                }
                
                function off(eventName, callback) {
                    if (events[eventName]) {
                        events[eventName] = events[eventName].filter(cb => cb !== callback);
                    }
                }
                
                function emit(eventName, data) {
                    if (events[eventName]) {
                        events[eventName].forEach(callback => callback(data));
                    }
                }
                
                // 导出全局接口（保持向后兼容）
                window.EventBus = {
                    on,
                    off,
                    emit
                };
                
                console.log('EventBus 模块初始化完成');
                return {
                    on,
                    off,
                    emit
                };
            });
            console.log('EventBus 模块注册完成');
        } catch (error) {
            console.error('EventBus 模块注册失败:', error);
        }
    } else {
        console.error('ModuleRegistry 未定义，EventBus 模块注册失败');
    }
    console.log('EventBus 立即执行函数结束...');
})();
console.log('EventBus 脚本执行完成...');