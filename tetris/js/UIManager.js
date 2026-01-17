class UIManager {
    constructor(gameEngine, configManager, achievementSystem) {
        this.gameEngine = gameEngine;
        this.configManager = configManager;
        this.achievementSystem = achievementSystem;
        
        // 获取画布元素
        this.gameCanvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.holdCanvas = document.getElementById('holdCanvas');
        
        // 获取上下文
        this.gameCtx