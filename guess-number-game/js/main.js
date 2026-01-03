// 主程序入口 - main.js

// 游戏主控制器
class GameController {
    constructor() {
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 等待页面加载完成
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                this.initializeGame();
            });
        } else {
            this.initializeGame();
        }
        
        // 窗口关闭时保存游戏进度
        window.addEventListener("beforeunload", () => {
            this.saveGameProgress();
        });
    }
    
    // 初始化所有模块
    initializeGame() {
        console.log("游戏初始化开始...");
        
        // 检查是否有保存的游戏
        const savedGame = storageManager.loadCurrentGame();
        if (savedGame) {
            this.askToContinueGame(savedGame);
        } else {
            // 显示主菜单
            uiManager.showScreen("main-menu");
        }
        
        console.log("游戏初始化完成！");
    }
    
    // 询问是否继续保存的游戏
    askToContinueGame(savedGame) {
        if (confirm("检测到未完成的游戏，是否继续？")) {
            // 加载保存的游戏
            gameEngine.loadGame(savedGame);
            uiManager.renderGameScreen();
            uiManager.showScreen("game-screen");
            
            // 恢复历史记录
            savedGame.guessHistory.forEach(guess => {
                uiManager.addToHistory(guess);
            });
            
            // 更新游戏信息
            uiManager.updateGameInfo();
        } else {
            // 清除保存的游戏
            storageManager.clearCurrentGame();
            uiManager.showScreen("main-menu");
        }
    }
    
    // 保存游戏进度
    saveGameProgress() {
        const gameState = gameEngine.getGameState();
        if (gameState && !gameState.gameOver && configManager.getUserSettings().autoSave) {
            gameEngine.saveGame();
        }
    }
}

// 启动游戏
window.gameController = new GameController();

// 全局错误处理
window.addEventListener("error", (e) => {
    console.error("全局错误:", e.error);
    if (uiManager) {
        uiManager.showFeedback("游戏发生错误，请刷新页面重试", "error");
    }
});

// 全局Promise拒绝处理
window.addEventListener("unhandledrejection", (e) => {
    console.error("未处理的Promise拒绝:", e.reason);
    if (uiManager) {
        uiManager.showFeedback("游戏发生错误，请刷新页面重试", "error");
    }
});