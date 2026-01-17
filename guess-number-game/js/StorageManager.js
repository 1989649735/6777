// 存储管理器 - StorageManager.js
// 继承自公共 StorageManager 类
class GuessNumberStorageManager extends StorageManager {
    constructor() {
        super('guessNumber');
        this.initStorage();
    }
    
    // 初始化存储
    initStorage() {
        // 初始化玩家数据
        if (!this.load('playerData')) {
            const defaultPlayerData = {
                playerId: Date.now().toString(),
                stats: {
                    totalGames: 0,
                    wins: 0,
                    avgAttempts: 0,
                    fastestWinTime: Infinity,
                    maxStreak: 0,
                    currentStreak: 0,
                    modeStats: {}
                },
                skillLevel: 1,
                unlockedModes: ["classic"],
                lastGameTime: null,
                gameHistory: []
            };
            this.savePlayerData(defaultPlayerData);
        }
        
        // 初始化游戏历史
        if (!this.load('gameHistory')) {
            this.saveGameHistory([]);
        }
    }
    
    // 保存玩家数据
    savePlayerData(playerData) {
        playerData.lastGameTime = Date.now();
        this.save('playerData', playerData);
    }
    
    // 加载玩家数据
    loadPlayerData() {
        const playerData = this.load('playerData');
        if (playerData) {
            return playerData;
        }
        return this.getDefaultsPlayerData();
    }
    
    // 获取默认玩家数据
    getDefaultsPlayerData() {
        return {
            playerId: Date.now().toString(),
            stats: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                avgAttempts: 0,
                avgWinAttempts: 0,
                avgLossAttempts: 0,
                fastestWinTime: Infinity,
                slowestWinTime: 0,
                avgWinTime: 0,
                totalGameTime: 0,
                maxStreak: 0,
                currentStreak: 0,
                totalHintsUsed: 0,
                avgHintsPerGame: 0,
                modeStats: {}
            },
            skillLevel: 1,
            unlockedModes: ["classic"],
            lastGameTime: null,
            gameHistory: []
        };
    }
    
    // 保存游戏记录
    saveGameRecord(gameState) {
        const gameHistory = this.loadGameHistory();
        
        const record = {
            gameId: gameState.gameId,
            mode: gameState.mode,
            difficulty: gameState.difficulty,
            result: gameState.win ? "胜利" : "失败",
            attempts: gameState.currentAttempts,
            time: gameState.elapsedTime,
            targetValue: gameState.targetValue,
            timestamp: Date.now()
        };
        
        gameHistory.push(record);
        
        // 限制历史记录数量
        if (gameHistory.length > 100) {
            gameHistory.shift();
        }
        
        this.saveGameHistory(gameHistory);
        
        // 更新玩家数据
        this.updatePlayerStats(record);
    }
    
    // 保存游戏历史
    saveGameHistory(gameHistory) {
        this.save('gameHistory', gameHistory);
    }
    
    // 加载游戏历史
    loadGameHistory() {
        return this.load('gameHistory', []);
    }
    
    // 更新玩家统计数据
    updatePlayerStats(gameRecord) {
        const playerData = this.loadPlayerData();
        
        // 更新总游戏数
        playerData.stats.totalGames++;
        
        // 更新总游戏时间
        playerData.stats.totalGameTime += gameRecord.time;
        
        // 更新胜利数和失败数
        if (gameRecord.result === "胜利") {
            playerData.stats.wins++;
            playerData.stats.currentStreak++;
            
            // 更新最快胜利时间
            if (gameRecord.time < playerData.stats.fastestWinTime) {
                playerData.stats.fastestWinTime = gameRecord.time;
            }
            
            // 更新最慢胜利时间
            if (gameRecord.time > playerData.stats.slowestWinTime) {
                playerData.stats.slowestWinTime = gameRecord.time;
            }
            
            // 更新最高连胜
            if (playerData.stats.currentStreak > playerData.stats.maxStreak) {
                playerData.stats.maxStreak = playerData.stats.currentStreak;
            }
        } else {
            playerData.stats.losses++;
            playerData.stats.currentStreak = 0;
        }
        
        // 更新胜率
        playerData.stats.winRate = Math.round((playerData.stats.wins / playerData.stats.totalGames) * 100);
        
        // 更新平均尝试次数
        playerData.stats.avgAttempts = Math.round(
            (playerData.stats.avgAttempts * (playerData.stats.totalGames - 1) + gameRecord.attempts) / 
            playerData.stats.totalGames
        );
        
        // 更新平均胜利尝试次数
        if (gameRecord.result === "胜利") {
            playerData.stats.avgWinAttempts = Math.round(
                (playerData.stats.avgWinAttempts * (playerData.stats.wins - 1) + gameRecord.attempts) / 
                playerData.stats.wins
            );
        }
        
        // 更新平均失败尝试次数
        if (gameRecord.result === "失败") {
            playerData.stats.avgLossAttempts = Math.round(
                (playerData.stats.avgLossAttempts * (playerData.stats.losses - 1) + gameRecord.attempts) / 
                playerData.stats.losses
            );
        }
        
        // 更新平均胜利时间
        if (gameRecord.result === "胜利") {
            playerData.stats.avgWinTime = Math.round(
                (playerData.stats.avgWinTime * (playerData.stats.wins - 1) + gameRecord.time) / 
                playerData.stats.wins
            );
        }
        
        // 更新模式统计
        if (!playerData.stats.modeStats[gameRecord.mode]) {
            playerData.stats.modeStats[gameRecord.mode] = {
                games: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                avgAttempts: 0,
                avgWinAttempts: 0,
                avgLossAttempts: 0,
                fastestTime: Infinity,
                slowestTime: 0,
                avgTime: 0
            };
        }
        
        const modeStats = playerData.stats.modeStats[gameRecord.mode];
        modeStats.games++;
        
        if (gameRecord.result === "胜利") {
            modeStats.wins++;
            
            // 更新模式最快时间
            if (gameRecord.time < modeStats.fastestTime) {
                modeStats.fastestTime = gameRecord.time;
            }
            
            // 更新模式最慢时间
            if (gameRecord.time > modeStats.slowestTime) {
                modeStats.slowestTime = gameRecord.time;
            }
        } else {
            modeStats.losses++;
        }
        
        // 更新模式胜率
        modeStats.winRate = Math.round((modeStats.wins / modeStats.games) * 100);
        
        // 更新模式平均尝试次数
        modeStats.avgAttempts = Math.round(
            (modeStats.avgAttempts * (modeStats.games - 1) + gameRecord.attempts) / 
            modeStats.games
        );
        
        // 更新模式平均胜利尝试次数
        if (gameRecord.result === "胜利") {
            modeStats.avgWinAttempts = Math.round(
                (modeStats.avgWinAttempts * (modeStats.wins - 1) + gameRecord.attempts) / 
                modeStats.wins
            );
        }
        
        // 更新模式平均失败尝试次数
        if (gameRecord.result === "失败") {
            modeStats.avgLossAttempts = Math.round(
                (modeStats.avgLossAttempts * (modeStats.losses - 1) + gameRecord.attempts) / 
                modeStats.losses
            );
        }
        
        // 更新模式平均时间
        modeStats.avgTime = Math.round(
            (modeStats.avgTime * (modeStats.games - 1) + gameRecord.time) / 
            modeStats.games
        );
        
        // 保存更新后的数据
        this.savePlayerData(playerData);
    }
    
    // 保存当前游戏
    saveCurrentGame(gameState) {
        this.save('currentGame', gameState);
    }
    
    // 加载当前游戏
    loadCurrentGame() {
        return this.load('currentGame', null);
    }
    
    // 清除当前游戏
    clearCurrentGame() {
        this.remove('currentGame');
    }
    
    // 导出玩家数据
    exportPlayerData() {
        const playerData = this.loadPlayerData();
        const gameHistory = this.loadGameHistory();
        const achievements = this.loadAchievements();
        const settings = configManager.getUserSettings();
        
        const exportData = {
            version: "1.0",
            exportTime: Date.now(),
            playerData,
            gameHistory,
            achievements,
            settings
        };
        
        return JSON.stringify(exportData);
    }
    
    // 导入玩家数据
    importPlayerData(jsonString) {
        try {
            const importData = JSON.parse(jsonString);
            
            // 验证数据结构
            if (!importData.playerData || !importData.gameHistory) {
                return false;
            }
            
            // 更新所有本地存储项
            this.savePlayerData(importData.playerData);
            this.saveGameHistory(importData.gameHistory);
            
            if (importData.achievements) {
                this.saveAchievements(importData.achievements);
            }
            
            if (importData.settings) {
                configManager.updateUserSettings(importData.settings);
            }
            
            return true;
        } catch (error) {
            console.error("导入数据失败:", error);
            return false;
        }
    }
    
    // 保存成就状态
    saveAchievements(achievements) {
        this.save('achievements', achievements);
    }
    
    // 加载成就状态
    loadAchievements() {
        return this.load('achievements', null);
    }
    
    // 重置所有数据
    resetAllData() {
        this.remove('playerData');
        this.remove('gameHistory');
        this.remove('achievements');
        this.remove('currentGame');
        this.initStorage();
    }
}

// 全局实例
window.storageManager = new GuessNumberStorageManager();