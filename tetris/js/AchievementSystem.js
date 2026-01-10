class AchievementSystem {
    constructor(storageManager, configManager) {
        this.storageManager = storageManager;
        this.configManager = configManager;
        this.achievements = this.storageManager.loadAchievements();
        
        // 定义所有成就
        this.achievementDefinitions = {
            first_game: {
                id: 'first_game',
                title: '初出茅庐',
                description: '完成你的第一场游戏',
                icon: '🎮',
                type: 'game',
                condition: { minGames: 1 }
            },
            score_1000: {
                id: 'score_1000',
                title: '千分达人',
                description: '获得1000分',
                icon: '🏆',
                type: 'score',
                condition: { minScore: 1000 }
            },
            score_5000: {
                id: 'score_5000',
                title: '高分能手',
                description: '获得5000分',
                icon: '🏅',
                type: 'score',
                condition: { minScore: 5000 }
            },
            score_10000: {
                id: 'score_10000',
                title: '得分大师',
                description: '获得10000分',
                icon: '🥇',
                type: 'score',
                condition: { minScore: 10000 }
            },
            lines_10: {
                id: 'lines_10',
                title: '初露锋芒',
                description: '消除10行',
                icon: '📈',
                type: 'lines',
                condition: { minLines: 10 }
            },
            lines_50: {
                id: 'lines_50',
                title: '行消除专家',
                description: '消除50行',
                icon: '🔝',
                type: 'lines',
                condition: { minLines: 50 }
            },
            lines_100: {
                id: 'lines_100',
                title: '行消除大师',
                description: '消除100行',
                icon: '👑',
                type: 'lines',
                condition: { minLines: 100 }
            },
            tetris_1: {
                id: 'tetris_1',
                title: '俄罗斯方块！',
                description: '完成一次四行消除（Tetris）',
                icon: '💎',
                type: 'tetris',
                condition: { minTetris: 1 }
            },
            tetris_5: {
                id: 'tetris_5',
                title: 'Tetris达人',
                description: '完成5次四行消除',
                icon: '💎💎',
                type: 'tetris',
                condition: { minTetris: 5 }
            },
            tetris_10: {
                id: 'tetris_10',
                title: 'Tetris大师',
                description: '完成10次四行消除',
                icon: '💎💎💎',
                type: 'tetris',
                condition: { minTetris: 10 }
            },
            combo_2: {
                id: 'combo_2',
                title: '连击新手',
                description: '完成2连击',
                icon: '⚡',
                type: 'combo',
                condition: { minCombo: 2 }
            },
            combo_5: {
                id: 'combo_5',
                title: '连击高手',
                description: '完成5连击',
                icon: '🔥',
                type: 'combo',
                condition: { minCombo: 5 }
            },
            marathon: {
                id: 'marathon',
                title: '马拉松选手',
                description: '游戏时间超过10分钟',
                icon: '🏃',
                type: 'time',
                condition: { minTime: 600 }
            },
            perfectionist: {
                id: 'perfectionist',
                title: '完美主义者',
                description: '在没有使用保持功能的情况下完成游戏',
                icon: '✨',
                type: 'no_hold',
                condition: { noHold: true }
            },
            quick_start: {
                id: 'quick_start',
                title: '快速上手',
                description: '在30秒内获得100分',
                icon: '🚀',
                type: 'quick_score',
                condition: { maxTime: 30, minScore: 100 }
            }
        };
        
        // 初始化成就数据
        this.initializeAchievements();
    }
    
    initializeAchievements() {
        for (const [id, definition] of Object.entries(this.achievementDefinitions)) {
            if (!this.achievements[id]) {
                this.achievements[id] = {
                    unlocked: false,
                    unlockedAt: null,
                    progress: 0
                };
            }
        }
        this.saveAchievements();
    }
    
    checkAchievements(gameStats) {
        const newlyUnlocked = [];
        
        for (const [id, definition] of Object.entries(this.achievementDefinitions)) {
            if (!this.achievements[id].unlocked) {
                if (this.checkAchievementCondition(definition, gameStats)) {
                    this.unlockAchievement(id, gameStats);
                    newlyUnlocked.push(definition);
                } else {
                    this.updateProgress(id, definition, gameStats);
                }
            }
        }
        
        return newlyUnlocked;
    }
    
    checkAchievementCondition(definition, gameStats) {
        const { condition } = definition;
        
        switch (definition.type) {
            case 'game':
                return gameStats.totalGames >= condition.minGames;
            
            case 'score':
                return gameStats.highScore >= condition.minScore;
            
            case 'lines':
                return gameStats.totalLines >= condition.minLines;
            
            case 'tetris':
                return gameStats.totalTetris >= condition.minTetris;
            
            case 'combo':
                return gameStats.maxCombo >= condition.minCombo;
            
            case 'time':
                return gameStats.totalTime >= condition.minTime;
            
            case 'no_hold':
                return gameStats.noHoldGames >= 1;
            
            case 'quick_score':
                return gameStats.quickScore && gameStats.quickScoreTime <= condition.maxTime && 
                       gameStats.quickScore >= condition.minScore;
            
            default:
                return false;
        }
    }
    
    updateProgress(id, definition, gameStats) {
        let progress = 0;
        const { condition } = definition;
        
        switch (definition.type) {
            case 'score':
                progress = Math.min(100, (gameStats.highScore / condition.minScore) * 100);
                break;
            
            case 'lines':
                progress = Math.min(100, (gameStats.totalLines / condition.minLines) * 100);
                break;
            
            case 'tetris':
                progress = Math.min(100, (gameStats.totalTetris / condition.minTetris) * 100);
                break;
            
            case 'combo':
                progress = Math.min(100, (gameStats.maxCombo / condition.minCombo) * 100);
                break;
            
            case 'time':
                progress = Math.min(100, (gameStats.totalTime / condition.minTime) * 100);
                break;
        }
        
        this.achievements[id].progress = Math.round(progress);
    }
    
    unlockAchievement(id, gameStats) {
        this.achievements[id] = {
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progress: 100
        };
        
        this.saveAchievements();
        this.showAchievementNotification(this.achievementDefinitions[id]);
        this.configManager.playSound('achievement');
    }
    
    showAchievementNotification(achievement) {
        // 创建成就通知
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">成就解锁：${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
            zIndex: '1000',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            minWidth: '300px'
        });
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    saveAchievements() {
        this.storageManager.saveAchievements(this.achievements);
    }
    
    getAchievements() {
        return this.achievements;
    }
    
    getAchievementDefinitions() {
        return this.achievementDefinitions;
    }
    
    getUnlockedCount() {
        return Object.values(this.achievements).filter(achievement => achievement.unlocked).length;
    }
    
    getTotalCount() {
        return Object.keys(this.achievementDefinitions).length;
    }
    
    resetAchievements() {
        this.achievements = {};
        this.initializeAchievements();
        this.saveAchievements();
    }
}