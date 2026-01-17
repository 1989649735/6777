// 俄罗斯方块存储管理器 - StorageManager.js
// 继承自公共 StorageManager 类
class TetrisStorageManager extends StorageManager {
    constructor() {
        super('tetris');
    }

    // 保存游戏状态
    saveGameState(gameState) {
        return this.save('game_state', gameState);
    }

    // 加载游戏状态
    loadGameState() {
        return this.load('game_state', null);
    }

    // 保存最高分
    saveHighScore(score) {
        const currentHighScore = this.getHighScore();
        if (score > currentHighScore) {
            this.save('high_score', score);
            return true;
        }
        return false;
    }

    // 获取最高分
    getHighScore() {
        return this.load('high_score', 0);
    }

    // 保存成就
    saveAchievements(achievements) {
        return this.save('achievements', achievements);
    }

    // 加载成就
    loadAchievements() {
        return this.load('achievements', {});
    }

    // 保存设置
    saveSettings(settings) {
        return this.save('settings', settings);
    }

    // 加载设置
    loadSettings() {
        return this.load('settings', {
            theme: 'classic',
            difficulty: 'normal',
            sound: true,
            music: true
        });
    }
}

// 全局实例
window.storageManager = new TetrisStorageManager();