class AchievementSystem {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.achievements = this.storageManager.getAchievements();
        
        // 定义成就列表
        this.achievementDefinitions = {
            first_win: {
                title: '初露锋芒',
                description: '赢得你的第一场扫雷游戏',
                icon: '🏆',
                type: 'win',
                condition: { wins: 1 }
            },
            win_streak: {
                title: '连胜达人',
                description: '连续赢得3场游戏',
                icon: '🔥',
                type: 'win_streak',
                condition: { streak: 3 }
            },
            beginner_master: {
                title: '初级大师',
                description: '在初级难度下赢得10场游戏',
                icon: '🎯',
                type: 'win_by_difficulty',
                condition: { difficulty: 'beginner', wins: 10 }
            },
            intermediate_master: {
                title: '中级大师',
                description: '在中级难度下赢得5场游戏',
                icon: '⭐',
                type: 'win_by_difficulty',
                condition: { difficulty: 'intermediate', wins: 5 }
            },
            expert_master: {
                title: '高级大师',
                description: '在高级难度下赢得3场游戏',
                icon: '💎',
                type: 'win_by_difficulty',
                condition: { difficulty: 'expert', wins: 3 }
            },
            speed_demon: {
                title: '速度恶魔',
                description: '在初级难度下30秒内完成游戏',
                icon: '⚡',
                type: 'fast_win',
                condition: { difficulty: 'beginner', time: 30 }
            },
            perfectionist: {
                title: '完美主义者',
                description: '在不标记任何错误旗帜的情况下完成游戏',
                icon: '✨',
                type: 'perfect_win',
                condition: { perfect: true }
            },
            lucky_guess: {
                title: '幸运猜测',
                description: '第一次点击就找到唯一的安全格子',
                icon: '🍀',
                type: 'lucky_first_click',
                condition: { lucky: true }
            },
            marathon_player: {
                title: '马拉松玩家',
                description: '累计玩100场游戏',
                icon: '🏃',
                type: 'total_games',
                condition: { games: 100 }
            },
            mine_sweeper: {
                title: '扫雷专家',
                description: '累计找到1000个地雷',
                icon: '💣',
                type: 'total_mines',
                condition: { mines: 1000 }
            }
        };
        
        this.currentStreak = 0;
        this.totalMinesFound = 0;
    }

    // 检查并解锁成就
    checkAchievements(gameResult) {
        const unlockedAchievements = [];
        
        // 更新连胜
        if (gameResult.isWin) {
            this.currentStreak += 1;
        } else {
            this.currentStreak = 0;
        }
        
        // 更新总地雷数
        this.totalMinesFound += gameResult.minesFound || 0;
        
        // 遍历所有成就定义
        for (const [id, definition] of Object.entries(this.achievementDefinitions)) {
            if (!this.achievements[id]) {
                if (this.meetsCondition(definition, gameResult)) {
                    this.unlockAchievement(id);
                    unlockedAchievements.push({ id, ...definition });
                }
            }
        }
        
        return unlockedAchievements;
    }

    // 检查是否满足成就条件
    meetsCondition(definition, gameResult) {
        const { type, condition } = definition;
        
        switch (type) {
            case 'win':
                return gameResult.isWin && gameResult.totalWins >= condition.wins;
            
            case 'win_streak':
                return this.currentStreak >= condition.streak;
            
            case 'win_by_difficulty':
                return gameResult.isWin && 
                       gameResult.difficulty === condition.difficulty && 
                       gameResult.winsByDifficulty[condition.difficulty] >= condition.wins;
            
            case 'fast_win':
                return gameResult.isWin && 
                       gameResult.difficulty === condition.difficulty && 
                       gameResult.time < condition.time;
            
            case 'perfect_win':
                return gameResult.isWin && gameResult.perfect;
            
            case 'lucky_first_click':
                return gameResult.luckyFirstClick;
            
            case 'total_games':
                return gameResult.totalGames >= condition.games;
            
            case 'total_mines':
                return this.totalMinesFound >= condition.mines;
            
            default:
                return false;
        }
    }

    // 解锁成就
    unlockAchievement(id) {
        this.achievements[id] = {
            unlocked: true,
            unlockedAt: new Date().toISOString()
        };
        this.storageManager.saveAchievements(this.achievements);
    }

    // 获取所有成就状态
    getAllAchievements() {
        return Object.entries(this.achievementDefinitions).map(([id, definition]) => ({
            id,
            ...definition,
            unlocked: !!this.achievements[id],
            unlockedAt: this.achievements[id]?.unlockedAt
        }));
    }

    // 获取已解锁的成就数量
    getUnlockedCount() {
        return Object.values(this.achievements).filter(a => a.unlocked).length;
    }

    // 获取总成就数量
    getTotalCount() {
        return Object.keys(this.achievementDefinitions).length;
    }

    // 渲染成就列表
    renderAchievements(container) {
        const achievements = this.getAllAchievements();
        
        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${achievement.unlocked ? `<div class="achievement-date">解锁于: ${new Date(achievement.unlockedAt).toLocaleString()}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // 显示成就弹窗
    showAchievementPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content">
                <div class="achievement-popup-icon">${achievement.icon}</div>
                <div class="achievement-popup-info">
                    <div class="achievement-popup-title">成就解锁!</div>
                    <div class="achievement-popup-desc">${achievement.title}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // 添加动画
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
        }, 100);
        
        // 3秒后移除
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(-50px)';
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 3000);
    }
}