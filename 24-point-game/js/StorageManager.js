// 存储管理器 - StorageManager.js
class StorageManager {
    constructor() {
        this.storageKeys = {
            playerData: "24point_playerData_v1",
            gameHistory: "24point_gameHistory",
            achievements: "24point_achievements",
            settings: "24point_settings",
            currentGame: "24point_currentGame",
            leaderboard: "24point_leaderboard"
        };
        
        this.initStorage();
    }
    
    // 初始化存储
    initStorage() {
        // 初始化玩家数据
        if (!localStorage.getItem(this.storageKeys.playerData)) {
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
        if (!localStorage.getItem(this.storageKeys.gameHistory)) {
            this.saveGameHistory([]);
        }
        
        // 初始化排行榜
        if (!localStorage.getItem(this.storageKeys.leaderboard)) {
            this.saveLeaderboard([]);
        }
    }
    
    // 保存玩家数据
    savePlayerData(playerData) {
        playerData.lastGameTime = Date.now();
        localStorage.setItem(this.storageKeys.playerData, JSON.stringify(playerData));
    }
    
    // 加载玩家数据
    loadPlayerData() {
        const playerData = localStorage.getItem(this.storageKeys.playerData);
        if (playerData) {
            return JSON.parse(playerData);
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
        localStorage.setItem(this.storageKeys.gameHistory, JSON.stringify(gameHistory));
    }
    
    // 加载游戏历史
    loadGameHistory() {
        const gameHistory = localStorage.getItem(this.storageKeys.gameHistory);
        if (gameHistory) {
            return JSON.parse(gameHistory);
        }
        return [];
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
        localStorage.setItem(this.storageKeys.currentGame, JSON.stringify(gameState));
    }
    
    // 加载当前游戏
    loadCurrentGame() {
        const currentGame = localStorage.getItem(this.storageKeys.currentGame);
        if (currentGame) {
            return JSON.parse(currentGame);
        }
        return null;
    }
    
    // 清除当前游戏
    clearCurrentGame() {
        localStorage.removeItem(this.storageKeys.currentGame);
    }
    
    // 保存成就状态
    saveAchievements(achievements) {
        localStorage.setItem(this.storageKeys.achievements, JSON.stringify(achievements));
    }
    
    // 加载成就状态
    loadAchievements() {
        const achievements = localStorage.getItem(this.storageKeys.achievements);
        if (achievements) {
            return JSON.parse(achievements);
        }
        return null;
    }
    
    // 保存排行榜
    saveLeaderboard(leaderboard) {
        // 按分数排序，保留前100名
        const sortedLeaderboard = leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
        localStorage.setItem(this.storageKeys.leaderboard, JSON.stringify(sortedLeaderboard));
    }
    
    // 加载排行榜
    loadLeaderboard() {
        const leaderboard = localStorage.getItem(this.storageKeys.leaderboard);
        if (leaderboard) {
            return JSON.parse(leaderboard);
        }
        return [];
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
        localStorage.removeItem(this.storageKeys.playerData);
        localStorage.removeItem(this.storageKeys.gameHistory);
        localStorage.removeItem(this.storageKeys.achievements);
        localStorage.removeItem(this.storageKeys.currentGame);
        localStorage.removeItem(this.storageKeys.leaderboard);
        this.initStorage();
    }
}

// 全局实例
window.storageManager = new StorageManager();