// 成就系统 - AchievementSystem.js
class AchievementSystem {
    constructor() {
        this.achievements = [
            {
                id: "first_win",
                name: "初战告捷",
                description: "赢得第一场游戏",
                icon: "🏆",
                points: 10,
                category: "里程碑",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    return playerData.stats.wins >= 1;
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {
                id: "perfect_guess",
                name: "一次命中",
                description: "第一次尝试就猜中数字",
                icon: "🎯",
                points: 20,
                category: "技能",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    return gameRecord.attempts === 1 && gameRecord.result === "胜利";
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {
                id: "speed_demon",
                name: "速度之星",
                description: "在30秒内完成游戏",
                icon: "⚡",
                points: 15,
                category: "技能",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    return gameRecord.time <= 30000 && gameRecord.result === "胜利";
                },
                progress: { current: 0, target: 1 },
                unlocked: false,
                unlockDate: null
            },
            {
                id: "master_of_all",
                name: "全能大师",
                description: "在所有游戏模式中都获得胜利",
                icon: "🌟",
                points: 50,
                category: "收集",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    const requiredModes = ["classic", "multi", "math", "reverse", "dynamic", "code"];
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
            {
                id: "code_breaker",
                name: "密码破译专家",
                description: "在密码破译模式中连续胜利3次",
                icon: "🔓",
                points: 30,
                category: "挑战",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    const gameHistory = playerData.gameHistory || [];
                    let consecutiveWins = 0;
                    
                    // 从最新的游戏开始检查
                    for (let i = gameHistory.length - 1; i >= 0; i--) {
                        const game = gameHistory[i];
                        if (game.mode === "code" && game.result === "胜利") {
                            consecutiveWins++;
                            if (consecutiveWins >= 3) {
                                return true;
                            }
                        } else {
                            break;
                        }
                    }
                    return false;
                },
                progress: { current: 0, target: 3 },
                unlocked: false,
                unlockDate: null
            },
            {
                id: "hundred_games",
                name: "百场战役",
                description: "完成100场游戏",
                icon: "📊",
                points: 40,
                category: "里程碑",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    return playerData.stats.totalGames >= 100;
                },
                progress: { current: 0, target: 100 },
                unlocked: false,
                unlockDate: null
            },
            {
                id: "streak_master",
                name: "连胜大师",
                description: "获得10连胜",
                icon: "🔥",
                points: 25,
                category: "挑战",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    return playerData.stats.maxStreak >= 10;
                },
                progress: { current: 0, target: 10 },
                unlocked: false,
                unlockDate: null
            },
            {
                id: "expert_champion",
                name: "专家冠军",
                description: "在专家难度下获得胜利",
                icon: "👑",
                points: 35,
                category: "挑战",
                hidden: false,
                criteria: (gameRecord, playerData) => {
                    return gameRecord.difficulty === "专家" && gameRecord.result === "胜利";
                },
                progress: { current: 0, target: 1 },
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
    checkAchievements(gameRecord) {
        const playerData = storageManager.loadPlayerData();
        const newlyUnlocked = [];
        
        // 更新所有成就的进度
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked) {
                // 检查完成度
                this.updateAchievementProgress(achievement, gameRecord, playerData);
                
                // 检查是否解锁
                if (achievement.criteria(gameRecord, playerData)) {
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
    updateAchievementProgress(achievement, gameRecord, playerData) {
        const gameHistory = playerData.gameHistory || [];
        
        switch (achievement.id) {
            case "first_win":
            case "perfect_guess":
            case "speed_demon":
            case "expert_champion":
                achievement.progress.current = 0;
                gameHistory.forEach(game => {
                    if (achievement.criteria(game, playerData)) {
                        achievement.progress.current = 1;
                    }
                });
                break;
                
            case "master_of_all":
                const requiredModes = ["classic", "multi", "math", "reverse", "dynamic", "code"];
                const wonModes = new Set();
                gameHistory.forEach(game => {
                    if (game.result === "胜利") {
                        wonModes.add(game.mode);
                    }
                });
                achievement.progress.current = wonModes.size;
                break;
                
            case "code_breaker":
                let consecutiveWins = 0;
                for (let i = gameHistory.length - 1; i >= 0; i--) {
                    const game = gameHistory[i];
                    if (game.mode === "code" && game.result === "胜利") {
                        consecutiveWins++;
                    } else {
                        break;
                    }
                }
                achievement.progress.current = consecutiveWins;
                break;
                
            case "hundred_games":
                achievement.progress.current = playerData.stats.totalGames;
                break;
                
            case "streak_master":
                achievement.progress.current = playerData.stats.maxStreak;
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