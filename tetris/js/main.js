// 游戏主入口文件
window.addEventListener('DOMContentLoaded', () => {
    // 初始化各个管理器
    const storageManager = new StorageManager();
    const configManager = new ConfigManager(storageManager);
    const achievementSystem = new AchievementSystem(storageManager, configManager);
    
    // 初始化游戏引擎
    const gameEngine = new GameEngine(configManager, achievementSystem);
    
    // 初始化UI管理器
    const uiManager = new UIManager(gameEngine, configManager, achievementSystem);
    
    // 将实例挂载到window对象，方便调试和访问
    window.gameEngine = gameEngine;
    window.uiManager = uiManager;
    window.configManager = configManager;
    window.achievementSystem = achievementSystem;
    window.storageManager = storageManager;
    
    console.log('俄罗斯方块游戏初始化完成！');
    console.log('控制说明：');
    console.log('← → 左右移动');
    console.log('↓ 加速下落');
    console.log('↑ 旋转');
    console.log('空格 直接掉落');
    console.log('C 保持方块');
    console.log('P 暂停/继续');
});