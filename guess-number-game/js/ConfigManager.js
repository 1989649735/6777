// 配置管理器 - ConfigManager.js
class ConfigManager {
    constructor() {
        this.gameConfig = {
            modeConfigs: {
                classic: {
                    name: "经典猜数字",
                    description: "传统的猜数字游戏",
                    difficultyLevels: {
                        "简单": { range: [1, 50], maxAttempts: 15 },
                        "中等": { range: [1, 100], maxAttempts: 10 },
                        "困难": { range: [1, 200], maxAttempts: 7 },
                        "专家": { range: [1, 1000], maxAttempts: 5, useDecimals: true }
                    }
                },
                multi: {
                    name: "多数字组合",
                    description: "同时猜测多个数字",
                    difficultyLevels: {
                        "简单": { numberCount: 2, range: [1, 20], maxAttempts: 15 },
                        "中等": { numberCount: 3, range: [1, 30], maxAttempts: 12 },
                        "困难": { numberCount: 4, range: [1, 40], maxAttempts: 10 }
                    }
                },
                math: {
                    name: "数学运算",
                    description: "通过运算接近目标",
                    difficultyLevels: {
                        "简单": { operation: "×2", range: [1, 50], maxAttempts: 12 },
                        "中等": { operation: "×3", range: [1, 100], maxAttempts: 10 },
                        "困难": { operation: "平方", range: [1, 20], maxAttempts: 8 }
                    }
                },
                reverse: {
                    name: "反向提示",
                    description: "通过特殊提示推理目标",
                    difficultyLevels: {
                        "简单": { range: [1, 50], maxAttempts: 12, hintTypes: ["大小10以内"] },
                        "中等": { range: [1, 100], maxAttempts: 10, hintTypes: ["大小10以内", "约数"] },
                        "困难": { range: [1, 200], maxAttempts: 8, hintTypes: ["大小10以内", "约数", "质数差"] }
                    }
                },
                dynamic: {
                    name: "动态目标",
                    description: "目标数字会随机变化",
                    difficultyLevels: {
                        "简单": { range: [1, 50], maxAttempts: 15, changeProbability: 0.1 },
                        "中等": { range: [1, 100], maxAttempts: 12, changeProbability: 0.2 },
                        "困难": { range: [1, 200], maxAttempts: 10, changeProbability: 0.3 }
                    }
                },
                code: {
                    name: "密码破译",
                    description: "猜数字和位置",
                    difficultyLevels: {
                        "简单": { codeLength: 3, numberRange: [0, 5], maxAttempts: 12 },
                        "中等": { codeLength: 4, numberRange: [0, 7], maxAttempts: 10 },
                        "困难": { codeLength: 5, numberRange: [0, 9], maxAttempts: 8 }
                    }
                }
            },
            userSettings: {
                difficulty: "中等",
                theme: "light",
                soundEnabled: true,
                animationsEnabled: true,
                autoSave: true,
                hintSettings: {
                    enabled: true,
                    maxHintsPerGame: 3
                }
            },
            unlockRequirements: {
                multi: { requirement: "经典模式胜利5次" },
                math: { requirement: "经典模式胜利10次" },
                reverse: { requirement: "多数字模式胜利3次" },
                dynamic: { requirement: "数学运算模式胜利3次" },
                code: { requirement: "所有其他模式各胜利1次" }
            }
        };
        
        this.loadUserSettings();
    }
    
    // 获取模式配置
    getModeConfig(modeName, difficultyLevel) {
        if (this.gameConfig.modeConfigs[modeName] && this.gameConfig.modeConfigs[modeName].difficultyLevels[difficultyLevel]) {
            return this.gameConfig.modeConfigs[modeName].difficultyLevels[difficultyLevel];
        }
        return null;
    }
    
    // 获取模式信息
    getModeInfo(modeName) {
        return this.gameConfig.modeConfigs[modeName] || null;
    }
    
    // 检查模式是否解锁
    checkModeUnlock(modeName, playerData) {
        // 经典模式默认解锁
        if (modeName === "classic") {
            return true;
        }
        
        // 检查是否已在解锁列表中
        if (playerData.unlockedModes && playerData.unlockedModes.includes(modeName)) {
            return true;
        }
        
        // 获取解锁要求
        const requirement = this.gameConfig.unlockRequirements[modeName];
        if (!requirement) {
            return true;
        }
        
        // 解析并检查要求
        const gameHistory = playerData.gameHistory || [];
        
        if (requirement.requirement === "经典模式胜利5次") {
            const classicWins = gameHistory.filter(game => game.mode === "classic" && game.result === "胜利").length;
            return classicWins >= 5;
        }
        
        if (requirement.requirement === "经典模式胜利10次") {
            const classicWins = gameHistory.filter(game => game.mode === "classic" && game.result === "胜利").length;
            return classicWins >= 10;
        }
        
        if (requirement.requirement === "多数字模式胜利3次") {
            const multiWins = gameHistory.filter(game => game.mode === "multi" && game.result === "胜利").length;
            return multiWins >= 3;
        }
        
        if (requirement.requirement === "数学运算模式胜利3次") {
            const mathWins = gameHistory.filter(game => game.mode === "math" && game.result === "胜利").length;
            return mathWins >= 3;
        }
        
        if (requirement.requirement === "所有其他模式各胜利1次") {
            const requiredModes = ["classic", "multi", "math", "reverse", "dynamic"];
            for (const mode of requiredModes) {
                if (mode !== modeName) {
                    const wins = gameHistory.filter(game => game.mode === mode && game.result === "胜利").length;
                    if (wins < 1) {
                        return false;
                    }
                }
            }
            return true;
        }
        
        return false;
    }
    
    // 获取推荐难度
    getRecommendedDifficulty(playerData, modeName) {
        const gameHistory = playerData.gameHistory || [];
        const modeGames = gameHistory.filter(game => game.mode === modeName);
        
        if (modeGames.length === 0) {
            return "中等";
        }
        
        const wins = modeGames.filter(game => game.result === "胜利").length;
        const winRate = wins / modeGames.length;
        
        if (winRate > 0.8) {
            return "困难";
        } else if (winRate > 0.6) {
            return "中等";
        } else {
            return "简单";
        }
    }
    
    // 获取用户设置
    getUserSettings() {
        return this.gameConfig.userSettings;
    }
    
    // 更新用户设置
    updateUserSettings(newSettings) {
        this.gameConfig.userSettings = {
            ...this.gameConfig.userSettings,
            ...newSettings
        };
        
        // 保存到本地存储
        localStorage.setItem("guessNumber_settings", JSON.stringify(this.gameConfig.userSettings));
        
        // 应用主题变化
        if (newSettings.theme) {
            document.getElementById("game-container").className = newSettings.theme + "-theme";
        }
    }
    
    // 加载用户设置
    loadUserSettings() {
        const savedSettings = localStorage.getItem("guessNumber_settings");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                this.gameConfig.userSettings = {
                    ...this.gameConfig.userSettings,
                    ...parsedSettings
                };
                
                // 应用主题
                document.getElementById("game-container").className = this.gameConfig.userSettings.theme + "-theme";
            } catch (error) {
                console.error("加载设置失败:", error);
            }
        }
    }
    
    // 重置为默认设置
    resetToDefaultSettings() {
        this.gameConfig.userSettings = {
            difficulty: "中等",
            theme: "light",
            soundEnabled: true,
            animationsEnabled: true,
            autoSave: true,
            hintSettings: {
                enabled: true,
                maxHintsPerGame: 3
            }
        };
        
        localStorage.setItem("guessNumber_settings", JSON.stringify(this.gameConfig.userSettings));
        document.getElementById("game-container").className = "light-theme";
        
        return this.gameConfig.userSettings;
    }
}

// 全局实例
window.configManager = new ConfigManager();