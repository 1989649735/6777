// 配置管理器 - ConfigManager.js
class ConfigManager {
    constructor() {
        this.defaultSettings = {
            theme: 'light',
            difficulty: 'medium',
            soundEnabled: true,
            animationsEnabled: true,
            hintsEnabled: true,
            maxHints: 3,
            autoCheck: true,
            timerEnabled: true
        };
        
        this.loadSettings();
    }
    
    // 加载设置
    loadSettings() {
        const savedSettings = localStorage.getItem('24point_settings');
        if (savedSettings) {
            this.settings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
        } else {
            this.settings = { ...this.defaultSettings };
        }
    }
    
    // 保存设置
    saveSettings() {
        localStorage.setItem('24point_settings', JSON.stringify(this.settings));
    }
    
    // 获取用户设置
    getUserSettings() {
        return { ...this.settings };
    }
    
    // 更新用户设置
    updateUserSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.applySettings();
    }
    
    // 应用设置
    applySettings() {
        // 应用主题
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.className = `${this.settings.theme}-theme`;
        }
        
        // 应用声音设置
        // 这里可以添加声音设置的逻辑
        
        // 应用动画设置
        if (this.settings.animationsEnabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }
    
    // 获取默认设置
    getDefaultSettings() {
        return { ...this.defaultSettings };
    }
    
    // 重置设置
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettings();
    }
    
    // 获取难度配置
    getDifficultyConfig(difficulty = this.settings.difficulty) {
        const configs = {
            easy: {
                numberRange: [1, 10],
                timeLimit: 60,
                hintCost: 10,
                pointsPerCorrect: 10
            },
            medium: {
                numberRange: [1, 13],
                timeLimit: 45,
                hintCost: 15,
                pointsPerCorrect: 15
            },
            hard: {
                numberRange: [1, 13],
                timeLimit: 30,
                hintCost: 20,
                pointsPerCorrect: 20
            },
            expert: {
                numberRange: [1, 13],
                timeLimit: 20,
                hintCost: 25,
                pointsPerCorrect: 25
            }
        };
        
        return configs[difficulty] || configs.medium;
    }
    
    // 获取模式配置
    getModeConfig(mode) {
        const configs = {
            classic: {
                rounds: 10,
                pointsPerCorrect: 15,
                timePerRound: 45,
                hintEnabled: true
            },
            timed: {
                totalTime: 300, // 5分钟
                pointsPerCorrect: 10,
                penaltyPerWrong: 5,
                hintEnabled: false
            },
            challenge: {
                startingTime: 60,
                timeDecreasePerRound: 5,
                pointsPerCorrect: 20,
                hintEnabled: true,
                hintCost: 10
            },
            speed: {
                rounds: 20,
                timePerRound: 15,
                pointsPerCorrect: 5,
                penaltyPerWrong: 2,
                hintEnabled: false
            },
            training: {
                unlimitedTime: true,
                unlimitedHints: true,
                pointsPerCorrect: 0,
                penaltyPerWrong: 0
            },
            multiplayer: {
                rounds: 15,
                timePerRound: 30,
                pointsPerCorrect: 10,
                hintEnabled: false
            }
        };
        
        return configs[mode] || configs.classic;
    }
}

// 全局实例
window.configManager = new ConfigManager();