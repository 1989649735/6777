// 扫雷游戏存储管理器 - StorageManager.js
// 继承自公共 StorageManager 类
class MinesweeperStorageManager extends StorageManager {
    constructor() {
        super('minesweeper');
    }

    // 保存游戏数据
    saveGameData(data) {
        try {
            const gameData = this.getGameData();
            const updatedData = { ...gameData, ...data };
            this.save('game_data', updatedData);
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    }

    // 获取游戏数据
    getGameData() {
        try {
            const data = this.load('game_data');
            return data ? data : {
                gamesPlayed: 0,
                gamesWon: 0,
                bestTimes: {
                    beginner: null,
                    intermediate: null,
                    expert: null
                },
                totalTimePlayed: 0
            };
        } catch (error) {
            console.error('获取游戏数据失败:', error);
            return {
                gamesPlayed: 0,
                gamesWon: 0,
                bestTimes: {
                    beginner: null,
                    intermediate: null,
                    expert: null
                },
                totalTimePlayed: 0
            };
        }
    }

    // 保存设置
    saveSettings(settings) {
        try {
            this.save('settings', settings);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    // 获取设置
    getSettings() {
        try {
            const settings = this.load('settings');
            return settings ? settings : {
                enableSound: true,
                enableAnimations: true,
                customDifficulty: {
                    width: 9,
                    height: 9,
                    mines: 10
                }
            };
        } catch (error) {
            console.error('获取设置失败:', error);
            return {
                enableSound: true,
                enableAnimations: true,
                customDifficulty: {
                    width: 9,
                    height: 9,
                    mines: 10
                }
            };
        }
    }

    // 保存成就
    saveAchievements(achievements) {
        try {
            this.save('achievements', achievements);
        } catch (error) {
            console.error('保存成就失败:', error);
        }
    }

    // 获取成就
    getAchievements() {
        try {
            const achievements = this.load('achievements');
            return achievements ? achievements : {};
        } catch (error) {
            console.error('获取成就失败:', error);
            return {};
        }
    }

    // 重置所有数据
    resetAllData() {
        try {
            this.remove('game_data');
            this.remove('settings');
            this.remove('achievements');
            return true;
        } catch (error) {
            console.error('重置数据失败:', error);
            return false;
        }
    }

    // 更新游戏统计
    updateGameStats(isWin, difficulty, time) {
        const gameData = this.getGameData();
        
        gameData.gamesPlayed += 1;
        if (isWin) {
            gameData.gamesWon += 1;
            
            // 更新最佳时间
            if (difficulty in gameData.bestTimes) {
                if (!gameData.bestTimes[difficulty] || time < gameData.bestTimes[difficulty]) {
                    gameData.bestTimes[difficulty] = time;
                }
            }
        }
        
        this.saveGameData(gameData);
    }

    // 获取胜率
    getWinRate() {
        const gameData = this.getGameData();
        if (gameData.gamesPlayed === 0) return 0;
        return Math.round((gameData.gamesWon / gameData.gamesPlayed) * 100);
    }
}

// 全局实例
window.storageManager = new MinesweeperStorageManager();