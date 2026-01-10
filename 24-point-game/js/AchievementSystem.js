// 成就系统 - AchievementSystem.js
class AchievementSystem {
    constructor() {
        this.achievements = [
            {   // 里程碑类成就
                id: "first_win",
                name: "初战告捷",
                description: "赢得第一场游戏",
                icon: "🏆",
                points: 10,
                category: "里程碑",
                hidden: false,
                criteria: (gameState, playerData) => {
                    return playerData.stats.wins >= 1;
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {   // 里程碑类成就
                id: "perfect_game",
                name: "完美游戏",
                description: "在经典模式中全部答对",
                icon: "💯",
                points: 50,
                category: "里程碑",
                hidden: false,
                criteria: (gameState, playerData) => {
                    return gameState.mode === "classic" && gameState.solvedCount === gameState.totalRounds;
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {   // 技能类成就
                id: "speed_demon",
                name: "速算大师",
                description: "在15秒内解出一题",
                icon: "⚡",
                points: 25,
                category: "技能",
                hidden: false,
                criteria: (gameState, playerData) => {
                    // 检查是否有任何回合在15秒内完成
                    const playerDataFull = storageManager.loadPlayerData();
                    return playerDataFull.gameHistory.some(game => {
                        return game.rounds && game.rounds.some(round => {
                            return round.endTime && (round.endTime - round.startTime) <= 15000;
                        });
                    });
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {   // 技能类成就
                id: "no_mistakes",
                name: "百发百中",
                description: "连续10题一次答对",
                icon: "🎯",
                points: 30,
                category: "技能",
                hidden: false,
                criteria: (gameState, playerData) => {
                    // 检查连续答对记录
                    const playerDataFull = storageManager.loadPlayerData();
                    let consecutiveWins = 0;
                    for (let i = playerDataFull.gameHistory.length - 1; i >= 0; i--) {
                        const game = playerDataFull.gameHistory[i];
                        if (game.result === "胜利" && game.attempts === 1) {
                            consecutiveWins++;
                            if (consecutiveWins >= 10) {
                                return true;
                            }
                        } else {
                            break;
                        }
                    }
                    return false;
                },
                progress: { current: 0, target: 10 },
                unlocked: false,
                unlockDate: null
            },
            {   // 挑战类成就
                id: "expert_champion",
                name: "专家冠军",
                description: "在专家难度下获得胜利",
                icon: "👑",
                points: 40,
                category: "挑战",
                hidden: false,
                criteria: (gameState, playerData) => {
                    return gameState.difficulty === "expert" && gameState.win;
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {   // 收集类成就
                id: "mode_master",
                name: "模式大师",
                description: "在所有游戏模式中获胜",
                icon: "🌟",
                points: 60,
                category: "收集",
                hidden: false,
                criteria: (gameState, playerData) => {
                    const requiredModes = ["classic", "timed", "challenge", "speed", "training", "multiplayer"];
                    const gameHistory = playerData.gameHistory || [];
                    const wonModes = new Set();
                    
                    gameHistory.forEach(game => {
                        if (game.result === "胜利") {
                            wonModes.add(game.mode);
                        }
                    });
                    
                    return requiredModes.every(mode => wonModes.has(mode));
                },
                progress: { current: 0, target: 6 },
                unlocked: false,
                unlockDate: null
            },
            {   // 里程碑类成就
                id: "hundred_games",
                name: "百战百胜",
                description: "完成100场游戏",
                icon: "📊",
                points: 75,
                category: "里程碑",
                hidden: false,
                criteria: (gameState, playerData) => {
                    return playerData.stats.totalGames >= 100;
                },
                progress: { current: 0, target: 100 },
                unlocked: false,
                unlockDate: null
            },
            {   // 技能类成就
                id: "streak_king",
                name: "连胜王者",
                description: "获得20连胜",
                icon: "🔥",
                points: 50,
                category: "技能",
                hidden: false,
                criteria: (gameState, playerData) => {
                    return playerData.stats.maxStreak >= 20;
                },
                progress: { current: 0, target: 20 },
                unlocked: false,
                unlockDate: null
            },
            {   // 隐藏成就
                id: "24_master",
                name: "24点大师",
                description: "总分达到10000分",
                icon: "👨‍🎓",
                points: 100,
                category: "隐藏",
                hidden: true,
                criteria: (gameState, playerData) => {
                    return playerData.stats.highestScore >= 10000;
                },
                progress: { current: 0, target: 10000 },
                unlocked: false,
                unlockDate: null
            },
            {   // 挑战类成就
                id: "no_hints",
                name: "自力更生",
                description: "完成10场游戏不使用提示",
                icon: "💪",
                points: 35,
                category: "挑战",
                hidden: false,
                criteria: (gameState, playerData) => {
                    // 检查无提示游戏记录
                    const playerDataFull = storageManager.loadPlayerData();
                    let noHintGames = 0;
                    playerDataFull.gameHistory.forEach(game => {
                        if (game.hintsUsed === 0) {
                            noHintGames++;
                        }
                    });
                    return noHintGames >= 10;
                },
                progress: { current: 0, target: 10 },
                unlocked: false,
                unlockDate: null
            },
            {   // 技能类成就
                id: "math_genius",
                name: "数学天才",
                description: "在挑战模式中达到20关",
                icon: "🧠",
                points: 45,
                category: "技能",
                hidden: false,
                criteria: (gameState, playerData) => {
                    return gameState.mode === "challenge" && gameState.level >= 20;
                },
                progress: { current: 0, target: 20 },
                unlocked: false,
                unlockDate: null
            },
            {   // 隐藏成就
                id: "all_achievements",
                name: "成就收藏家",
                description: "解锁所有成就",
                icon: "🏆",
                points: 200,
                category: "隐藏",
                hidden: true,
                criteria: (gameState, playerData) => {
                    // 检查所有成就是否已解锁
                    const allAchievements = this.getAllAchievements();
                    return allAchievements.every(achievement => achievement.unlocked);
                },
                progress: { current: 0, target: 12 },
                unlocked: false,
                unlockDate: null
            }
        ];
        
        this.init();
    }
    
    // 初始化成就系统
    init() {
        const savedAchievements = storageManager.loadAchievements();
        if (savedAchievements) {
            // 更新成就状态
            this.achievements.forEach((achievement, index) => {
                const savedAchievement = savedAchievements.find(a => a.id === achievement.id);
                if (savedAchievement) {
                    this.achievements[index] = { ...achievement, ...savedAchievement };
                }
            });
        } else {
            this.saveAchievements();
        }
    }
    
    // 检查成就
    checkAchievements(gameState) {
        const playerData = storageManager.loadPlayerData();
        const newlyUnlocked = [];
        
        // 更新所有成就的进度
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked) {
                // 检查完成度
                this.updateAchievementProgress(achievement, gameState, playerData);
                
                // 检查是否解锁
                if (achievement.criteria(gameState, playerData)) {
                    this.unlockAchievement(achievement.id);
                    newlyUnlocked.push(achievement);
                }
            }
        });
        
        // 保存成就状态
        this.saveAchievements();
        
        return newlyUnlocked;
    }
    
    // 更新成就进度
    updateAchievementProgress(achievement, gameState, playerData) {
        const playerDataFull = storageManager.loadPlayerData();
        
        switch (achievement.id) {
            case "first_win":
                achievement.progress.current = playerData.stats.wins >= 1 ? 1 : 0;
                break;
            
            case "perfect_game":
                achievement.progress.current = gameState.mode === "classic" && 
                                              gameState.solvedCount === gameState.totalRounds ? 1 : 0;
                break;
            
            case "speed_demon":
                // 检查是否有任何回合在15秒内完成
                const hasFastRound = playerDataFull.gameHistory.some(game => {
                    return game.rounds && game.rounds.some(round => {
                        return round.endTime && (round.endTime - round.startTime) <= 15000;
                    });
                });
                achievement.progress.current = hasFastRound ? 1 : 0;
                break;
            
            case "no_mistakes":
                // 计算连续答对次数
                let consecutiveWins = 0;
                for (let i = playerDataFull.gameHistory.length - 1; i >= 0; i--) {
                    const game = playerDataFull.gameHistory[i];
                    if (game.result === "胜利" && game.attempts === 1) {
                        consecutiveWins++;
                    } else {
                        break;
                    }
                }
                achievement.progress.current = consecutiveWins;
                break;
            
            case "expert_champion":
                achievement.progress.current = gameState.mode === "expert" && gameState.win ? 1 : 0;
                break;
            
            case "mode_master":
                // 计算解锁的模式数量
                const requiredModes = ["classic", "timed", "challenge", "speed", "training", "multiplayer"];
                const wonModes = new Set();
                playerDataFull.gameHistory.forEach(game => {
                    if (game.result === "胜利") {
                        wonModes.add(game.mode);
                    }
                });
                achievement.progress.current = requiredModes.filter(mode => wonModes.has(mode)).length;
                break;
            
            case "hundred_games":
                achievement.progress.current = playerData.stats.totalGames;
                break;
            
            case "streak_king":
                achievement.progress.current = playerData.stats.maxStreak;
                break;
            
            case "24_master":
                achievement.progress.current = playerData.stats.highestScore;
                break;
            
            case "no_hints":
                // 计算无提示游戏数量
                const noHintGames = playerDataFull.gameHistory.filter(game => game.hintsUsed === 0).length;
                achievement.progress.current = noHintGames;
                break;
            
            case "math_genius":
                achievement.progress.current = Math.max(achievement.progress.current, gameState.level);
                break;
            
            case "all_achievements":
                // 计算已解锁成就数量
                const unlockedCount = this.getUnlockedAchievements().length;
                achievement.progress.current = unlockedCount;
                break;
        }
    }
    
    // 解锁成就
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockDate = Date.now();
            return achievement;
        }
        return null;
    }
    
    // 获取所有成就
    getAllAchievements() {
        return this.achievements;
    }
    
    // 获取已解锁的成就
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }
    
    // 获取成就进度
    getAchievementProgress() {
        const totalAchievements = this.achievements.length;
        const unlockedCount = this.achievements.filter(a => a.unlocked).length;
        const totalPoints = this.achievements
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.points, 0);
        
        // 按分类统计
        const categoryProgress = {};
        this.achievements.forEach(achievement => {
            if (!categoryProgress[achievement.category]) {
                categoryProgress[achievement.category] = {
                    total: 0,
                    unlocked: 0
                };
            }
            categoryProgress[achievement.category].total++;
            if (achievement.unlocked) {
                categoryProgress[achievement.category].unlocked++;
            }
        });
        
        return {
            totalAchievements,
            unlockedCount,
            totalPoints,
            categoryProgress
        };
    }
    
    // 保存成就状态
    saveAchievements() {
        storageManager.saveAchievements(this.achievements);
    }
    
    // 重置成就
    resetAchievements() {
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            achievement.unlockDate = null;
            achievement.progress.current = 0;
        });
        this.saveAchievements();
    }
}

// 全局实例
window.achievementSystem = new AchievementSystem();