class ConfigManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.settings = this.storageManager.loadSettings();
        this.applySettings();
    }

    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySetting(key, value);
    }

    saveSettings() {
        this.storageManager.saveSettings(this.settings);
    }

    applySettings() {
        for (const [key, value] of Object.entries(this.settings)) {
            this.applySetting(key, value);
        }
    }

    applySetting(key, value) {
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'difficulty':
                this.applyDifficulty(value);
                break;
            case 'sound':
                this.applySound(value);
                break;
            case 'music':
                this.applyMusic(value);
                break;
        }
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    applyDifficulty(difficulty) {
        // 难度设置将在GameEngine中使用
        if (window.gameEngine) {
            window.gameEngine.setDifficulty(difficulty);
        }
    }

    applySound(enabled) {
        this.soundEnabled = enabled;
    }

    applyMusic(enabled) {
        this.musicEnabled = enabled;
        // 音乐控制将在游戏中实现
    }

    playSound(soundName) {
        if (this.soundEnabled) {
            // 这里可以添加音效播放逻辑
            console.log(`播放音效: ${soundName}`);
        }
    }

    playMusic(musicName) {
        if (this.musicEnabled) {
            // 这里可以添加音乐播放逻辑
            console.log(`播放音乐: ${musicName}`);
        }
    }

    stopMusic() {
        // 停止音乐逻辑
        console.log('停止音乐');
    }
}