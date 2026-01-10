class StorageManager {
    constructor() {
        this.prefix = 'tetris_';
    }

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

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }

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

    // 保存最高分
    saveHighScore(score) {
        const currentHighScore = this.getHighScore();
        if (score > currentHighScore) {
            this.save('high_score', score);
            return true;
        }
        return false;
    }

    // 获取最高分
    getHighScore() {
        return this.load('high_score', 0);
    }

    // 保存成就
    saveAchievements(achievements) {
        return this.save('achievements', achievements);
    }

    // 加载成就
    loadAchievements() {
        return this.load('achievements', {});
    }

    // 保存设置
    saveSettings(settings) {
        return this.save('settings', settings);
    }

    // 加载设置
    loadSettings() {
        return this.load('settings', {
            theme: 'classic',
            difficulty: 'normal',
            sound: true,
            music: true
        });
    }
}