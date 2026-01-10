class StorageManager {
    constructor() {
        this.storageKey = 'minesweeper_game_data';
        this.settingsKey = 'minesweeper_settings';
        this.achievementsKey = 'minesweeper_achievements';
    }

    // 保存游戏数据
    saveGameData(data) {
        try {
            const gameData = this.getGameData();
            const updatedData = { ...gameData, ...data };
            localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    }

    // 获取游戏数据
    getGameData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {
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
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    // 获取设置
    getSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? JSON.parse(settings) : {
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
            localStorage.setItem(this.achievementsKey, JSON.stringify(achievements));
        } catch (error) {
            console.error('保存成就失败:', error);
        }
    }

    // 获取成就
    getAchievements() {
        try {
            const achievements = localStorage.getItem(this.achievementsKey);
            return achievements ? JSON.parse(achievements) : {};
        } catch (error) {
            console.error('获取成就失败:', error);
            return {};
        }
    }

    // 重置所有数据
    resetAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.settingsKey);
            localStorage.removeItem(this.achievementsKey);
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