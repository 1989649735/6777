// 24点游戏存储管理器 - StorageManager.js
// 继承自公共 StorageManager 类
class TwentyFourPointStorageManager extends StorageManager {
    constructor() {
        super('24point');
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
                    losses: 0,
                    winRate: 0,
                    totalSolved: 0,
                    avgSolveTime: 0,
                    fastestSolveTime: Infinity,
                    highestScore: 0,
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
            this.savePlayerData(defaultPlayerData);
        }
        
        // 初始化游戏历史
        if (!this.load('gameHistory')) {
            this.saveGameHistory([]);
        }
        
        // 初始化排行榜
        if (!this.load('leaderboard')) {
            this.saveLeaderboard([]);
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
                totalSolved: 0,
                avgSolveTime: 0,
                fastestSolveTime: Infinity,
                highestScore: 0,
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
            score: gameState.score,
            solvedCount: gameState.solvedCount,
            totalRounds: gameState.totalRounds,
            time: gameState.elapsedTime,
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
        
        // 更新排行榜
        if (gameState.win) {
            this.updateLeaderboard(gameState.score, gameState.mode);
        }
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
        
        if (gameRecord.result === "胜利") {
            playerData.stats.wins++;
            playerData.stats.currentStreak++;
            playerData.stats.totalSolved += gameRecord.solvedCount;
            
            // 更新最高分数
            if (gameRecord.score > playerData.stats.highestScore) {
                playerData.stats.highestScore = gameRecord.score;
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
        
        // 更新平均解题时间
        if (gameRecord.result === "胜利") {
            playerData.stats.avgSolveTime = Math.round(
                (playerData.stats.avgSolveTime * (playerData.stats.totalSolved - gameRecord.solvedCount) + gameRecord.time) / 
                playerData.stats.totalSolved
            );
        }
        
        // 更新最快解题时间
        if (gameRecord.time < playerData.stats.fastestSolveTime && gameRecord.result === "胜利") {
            playerData.stats.fastestSolveTime = gameRecord.time;
        }
        
        // 更新模式统计
        if (!playerData.stats.modeStats[gameRecord.mode]) {
            playerData.stats.modeStats[gameRecord.mode] = {
                games: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                solvedCount: 0,
                avgSolveTime: 0,
                fastestTime: Infinity,
                highestScore: 0,
                totalHintsUsed: 0
            };
        }
        
        const modeStats = playerData.stats.modeStats[gameRecord.mode];
        modeStats.games++;
        
        if (gameRecord.result === "胜利") {
            modeStats.wins++;
            modeStats.solvedCount += gameRecord.solvedCount;
            
            // 更新模式最高分数
            if (gameRecord.score > modeStats.highestScore) {
                modeStats.highestScore = gameRecord.score;
            }
            
            // 更新模式最快时间
            if (gameRecord.time < modeStats.fastestTime) {
                modeStats.fastestTime = gameRecord.time;
            }
            
            // 更新模式平均解题时间
            modeStats.avgSolveTime = Math.round(
                (modeStats.avgSolveTime * (modeStats.solvedCount - gameRecord.solvedCount) + gameRecord.time) / 
                modeStats.solvedCount
            );
        } else {
            modeStats.losses++;
        }
        
        // 更新模式胜率
        modeStats.winRate = Math.round((modeStats.wins / modeStats.games) * 100);
        
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
    
    // 保存成就状态
    saveAchievements(achievements) {
        this.save('achievements', achievements);
    }
    
    // 加载成就状态
    loadAchievements() {
        return this.load('achievements', null);
    }
    
    // 保存排行榜
    saveLeaderboard(leaderboard) {
        // 按分数排序，保留前100名
        const sortedLeaderboard = leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
        this.save('leaderboard', sortedLeaderboard);
    }
    
    // 加载排行榜
    loadLeaderboard() {
        return this.load('leaderboard', []);
    }
    
    // 更新排行榜
    updateLeaderboard(score, mode) {
        const leaderboard = this.loadLeaderboard();
        const playerData = this.loadPlayerData();
        
        const entry = {
            playerId: playerData.playerId,
            score: score,
            mode: mode,
            timestamp: Date.now()
        };
        
        leaderboard.push(entry);
        this.saveLeaderboard(leaderboard);
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
    
    // 重置所有数据
    resetAllData() {
        this.remove('playerData');
        this.remove('gameHistory');
        this.remove('achievements');
        this.remove('currentGame');
        this.remove('leaderboard');
        this.initStorage();
    }
}

// 全局实例
window.storageManager = new TwentyFourPointStorageManager();