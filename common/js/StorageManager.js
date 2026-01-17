// 通用存储管理器 - StorageManager.js
class StorageManager {
    constructor(gameName) {
        this.prefix = `${gameName.toLowerCase()}_`;
    }

    // 保存数据
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(this.prefix + key, serializedData);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 加载数据
    load(key, defaultValue = null) {
        try {
            const serializedData = localStorage.getItem(this.prefix + key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('加载数据失败:', error);
            return defaultValue;
        }
    }

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }

    // 清空所有数据
    clear() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    // 保存游戏状态
    saveGameState(gameState) {
        return this.save('game_state', gameState);
    }

    // 加载游戏状态
    loadGameState() {
        return this.load('game_state', null);
    }

    // 保存设置
    saveSettings(settings) {
        return this.save('settings', settings);
    }

    // 加载设置
    loadSettings(defaultSettings = {}) {
        return this.load('settings', defaultSettings);
    }

    // 保存成就
    saveAchievements(achievements) {
        return this.save('achievements', achievements);
    }

    // 加载成就
    loadAchievements() {
        return this.load('achievements', {});
    }

    // 保存排行榜
    saveLeaderboard(leaderboard, key = 'leaderboard') {
        return this.save(key, leaderboard);
    }

    // 加载排行榜
    loadLeaderboard(key = 'leaderboard') {
        return this.load(key, []);
    }

    // 更新排行榜
    updateLeaderboard(newRecord, key = 'leaderboard', limit = 10) {
        const leaderboard = this.loadLeaderboard(key);
        leaderboard.push(newRecord);
        
        // 按分数排序（降序）
        leaderboard.sort((a, b) => b.score - a.score);
        
        // 限制排行榜数量
        if (leaderboard.length > limit) {
            leaderboard.splice(limit);
        }
        
        return this.saveLeaderboard(leaderboard, key);
    }
}
