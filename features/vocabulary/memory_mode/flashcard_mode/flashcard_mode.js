// 闪卡模式.js - 闪卡模式的核心模块

(function() {
    // 将模块挂载到 window 对象
    window.FlashcardMode = {
        showFlashcardModeInterface: function(container) {
            // 直接从 ModuleRegistry 获取 FlashcardUI 模块
            const flashcardUI = ModuleRegistry.get('FlashcardUI');
            if (flashcardUI && flashcardUI.showFlashcardModeInterface) {
                flashcardUI.showFlashcardModeInterface(container);
            } else {
                showToast('闪卡界面模块未加载');
            }
        }
    };

    ModuleRegistry.register('FlashcardMode', ['GlobalManager'], function(GlobalManager) {
        // 显示闪卡模式界面
        function showFlashcardModeInterface(container) {
            // 直接从 ModuleRegistry 获取 FlashcardUI 模块
            const flashcardUI = ModuleRegistry.get('FlashcardUI');
            if (flashcardUI && flashcardUI.showFlashcardModeInterface) {
                flashcardUI.showFlashcardModeInterface(container);
            } else {
                showToast('闪卡界面模块未加载');
            }
        }

        return {
            showFlashcardModeInterface
        };
    });
})();
