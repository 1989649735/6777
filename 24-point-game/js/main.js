// 主入口文件 - main.js

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 初始化配置管理器
    configManager = new ConfigManager();
    
    // 初始化存储管理器
    storageManager = new StorageManager();
    
    // 初始化成就系统
    achievementSystem = new AchievementSystem();
    
    // 初始化游戏引擎
    gameEngine = new GameEngine();
    
    // 初始化UI管理器
    uiManager = new UIManager();
    
    // 应用初始设置
    configManager.applySettings();
    
    // 显示主菜单
    uiManager.showScreen('main-menu');
    
    console.log('24点游戏已初始化完成！');
});

// 全局变量声明
let configManager;
let storageManager;
let achievementSystem;
let gameEngine;
let uiManager;

// 工具函数
function formatTime(milliseconds) {
    if (milliseconds === Infinity || milliseconds === 0) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// 处理窗口关闭事件，保存游戏状态
window.addEventListener('beforeunload', function() {
    if (gameEngine && !gameEngine.gameState.gameOver) {
        // 保存当前游戏状态
        storageManager.saveCurrentGame(gameEngine.getGameState());
    }
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // ESC键返回主菜单
    if (e.key === 'Escape') {
        if (uiManager.currentScreen === 'game-screen') {
            if (confirm('确定要退出游戏吗？')) {
                uiManager.quitGame();
            }
        } else if (uiManager.currentScreen !== 'main-menu') {
            uiManager.showScreen('main-menu');
        }
    }
});

// 页面可见性变化事件，用于暂停/恢复游戏
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏，暂停游戏
        if (gameEngine && !gameEngine.gameState.gameOver) {
            gameEngine.pauseGame();
        }
    } else {
        // 页面可见，恢复游戏
        if (gameEngine && !gameEngine.gameState.gameOver) {
            gameEngine.resumeGame();
        }
    }
});