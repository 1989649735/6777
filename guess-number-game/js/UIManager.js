// 界面管理器 - UIManager.js
class UIManager {
    constructor() {
        this.currentScreen = "main-menu";
        this.currentGameMode = null;
        this.currentDifficulty = null;
        
        this.init();
    }
    
    // 初始化界面
    init() {
        this.bindEvents();
        this.showScreen("main-menu");
        this.updateStats();
        this.updateAchievements();
    }
    
    // 绑定事件
    bindEvents() {
        // 主菜单事件
        document.querySelectorAll(".mode-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.currentGameMode = e.target.closest(".mode-btn").dataset.mode;
                this.showDifficultySelection();
            });
        });
        
        document.getElementById("stats-btn").addEventListener("click", () => {
            this.showScreen("stats-screen");
            this.updateStats();
        });
        
        document.getElementById("achievements-btn").addEventListener("click", () => {
            this.showScreen("achievements-screen");
            this.updateAchievements();
        });
        
        document.getElementById("settings-btn").addEventListener("click", () => {
            this.showScreen("settings-screen");
            this.loadSettings();
        });
        
        // 难度选择事件
        document.querySelectorAll(".difficulty-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.currentDifficulty = e.target.dataset.difficulty;
                this.startNewGame();
            });
        });
        
        document.getElementById("back-to-menu").addEventListener("click", () => {
            this.showScreen("main-menu");
        });
        
        // 游戏界面事件
        document.getElementById("submit-guess").addEventListener("click", () => {
            this.handleGuessSubmit();
        });
        
        document.getElementById("get-hint").addEventListener("click", () => {
            this.handleHintRequest();
        });
        
        document.getElementById("save-game").addEventListener("click", () => {
            this.handleSaveGame();
        });
        
        document.getElementById("quit-game").addEventListener("click", () => {
            this.handleQuitGame();
        });
        
        // 游戏结束界面事件
        document.getElementById("play-again").addEventListener("click", () => {
            this.startNewGame();
        });
        
        document.getElementById("back-to-main").addEventListener("click", () => {
            this.showScreen("main-menu");
        });
        
        // 返回按钮事件
        document.getElementById("back-from-stats").addEventListener("click", () => {
            this.showScreen("main-menu");
        });
        
        document.getElementById("back-from-achievements").addEventListener("click", () => {
            this.showScreen("main-menu");
        });
        
        document.getElementById("back-from-settings").addEventListener("click", () => {
            this.showScreen("main-menu");
        });
        
        // 设置界面事件
        document.getElementById("save-settings").addEventListener("click", () => {
            this.saveSettings();
        });
        
        document.getElementById("export-data").addEventListener("click", () => {
            this.exportData();
        });
        
        document.getElementById("import-data").addEventListener("click", () => {
            document.getElementById("import-file").click();
        });
        
        document.getElementById("import-file").addEventListener("change", (e) => {
            this.importData(e.target.files[0]);
        });
        
        document.getElementById("reset-data").addEventListener("click", () => {
            this.resetData();
        });
        
        // 回车键提交猜测
        document.addEventListener("keypress", (e) => {
            if (this.currentScreen === "game-screen" && e.key === "Enter") {
                this.handleGuessSubmit();
            }
        });
    }
    
    // 显示屏幕
    showScreen(screenId) {
        // 隐藏所有屏幕
        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.remove("active");
        });
        
        // 显示目标屏幕
        document.getElementById(screenId).classList.add("active");
        this.currentScreen = screenId;
    }
    
    // 显示难度选择
    showDifficultySelection() {
        const modeInfo = configManager.getModeInfo(this.currentGameMode);
        document.getElementById("difficulty-selection").querySelector("h2").textContent = 
            `${modeInfo.name} - 选择难度`;
        this.showScreen("difficulty-selection");
    }
    
    // 开始新游戏
    startNewGame() {
        try {
            // 初始化游戏
            gameEngine.initGame(this.currentGameMode, this.currentDifficulty);
            
            // 渲染游戏界面
            this.renderGameScreen();
            this.showScreen("game-screen");
        } catch (error) {
            this.showFeedback("开始游戏失败: " + error.message, "error");
        }
    }
    
    // 渲染游戏界面
    renderGameScreen() {
        const gameState = gameEngine.getGameState();
        const modeInfo = configManager.getModeInfo(gameState.mode);
        
        // 更新游戏模式名称
        document.getElementById("game-mode-name").textContent = modeInfo.name;
        
        // 更新尝试次数
        document.getElementById("attempts").textContent = 
            `尝试次数: ${gameState.currentAttempts}/${gameState.maxAttempts}`;
        
        // 清空反馈
        this.showFeedback("", "info");
        
        // 生成输入控件
        this.generateInputControls(gameState.mode);
        
        // 清空历史记录
        this.clearHistory();
    }
    
    // 生成输入控件
    generateInputControls(mode) {
        const inputContainer = document.getElementById("input-container");
        inputContainer.innerHTML = "";
        
        const gameState = gameEngine.getGameState();
        const config = configManager.getModeConfig(gameState.mode, gameState.difficulty);
        
        if (mode === "classic" || mode === "reverse" || mode === "dynamic" || mode === "math") {
            // 单个数字输入
            const input = document.createElement("input");
            input.type = "number";
            input.className = "number-input";
            input.placeholder = "输入数字";
            input.step = config.useDecimals ? "0.1" : "1";
            input.min = config.range ? config.range[0] : 0;
            input.max = config.range ? config.range[1] : 1000;
            input.id = "guess-input";
            input.focus();
            inputContainer.appendChild(input);
        } else if (mode === "multi") {
            // 多个数字输入
            for (let i = 0; i < config.numberCount; i++) {
                const inputGroup = document.createElement("div");
                inputGroup.className = "input-group";
                
                const label = document.createElement("label");
                label.textContent = `数字${i + 1}`;
                
                const input = document.createElement("input");
                input.type = "number";
                input.className = "number-input";
                input.step = "1";
                input.min = config.range[0];
                input.max = config.range[1];
                input.dataset.index = i;
                input.id = `guess-input-${i}`;
                
                inputGroup.appendChild(label);
                inputGroup.appendChild(input);
                inputContainer.appendChild(inputGroup);
            }
            document.getElementById("guess-input-0").focus();
        } else if (mode === "code") {
            // 密码输入
            const input = document.createElement("input");
            input.type = "text";
            input.className = "code-input";
            input.placeholder = "输入密码";
            input.maxLength = config.codeLength;
            input.id = "guess-input";
            input.focus();
            inputContainer.appendChild(input);
        }
    }
    
    // 处理猜测提交
    handleGuessSubmit() {
        const gameState = gameEngine.getGameState();
        let guess;
        
        // 获取输入值
        if (gameState.mode === "multi") {
            guess = [];
            document.querySelectorAll(".number-input").forEach(input => {
                guess.push(parseFloat(input.value));
            });
        } else {
            guess = document.getElementById("guess-input").value;
            
            // 对于密码模式，添加额外的验证
            if (gameState.mode === "code") {
                const expectedLength = gameState.targetValue.length;
                if (guess.length !== expectedLength) {
                    this.showFeedback(`请输入${expectedLength}位数字密码`, "error");
                    return;
                }
            }
        }
        
        // 处理猜测
        const result = gameEngine.processGuess(guess);
        
        if (result.error) {
            this.showFeedback(result.error, "error");
        } else {
            this.showFeedback(result.feedback, result.gameState.win ? "success" : "info");
            this.updateGameInfo();
            this.addToHistory(result.gameState.guessHistory[result.gameState.guessHistory.length - 1]);
            
            // 清空输入
            this.clearInput();
            
            // 检查游戏是否结束
            if (result.gameState.gameOver) {
                this.handleGameOver(result.gameState);
            }
        }
    }
    
    // 处理提示请求
    handleHintRequest() {
        const result = gameEngine.getHint();
        if (result.error) {
            this.showFeedback(result.error, "error");
        } else {
            this.showFeedback(`提示: ${result.hint}`, "info");
        }
    }
    
    // 处理保存游戏
    handleSaveGame() {
        if (gameEngine.saveGame()) {
            this.showFeedback("游戏已保存", "success");
        } else {
            this.showFeedback("保存失败", "error");
        }
    }
    
    // 处理退出游戏
    handleQuitGame() {
        if (confirm("确定要退出游戏吗？当前进度将丢失。")) {
            gameEngine.reset();
            this.showScreen("main-menu");
        }
    }
    
    // 处理游戏结束
    handleGameOver(gameState) {
        // 保存游戏记录
        storageManager.saveGameRecord(gameState);
        
        // 检查成就
        const newlyUnlocked = achievementSystem.checkAchievements({
            gameId: gameState.gameId,
            mode: gameState.mode,
            difficulty: gameState.difficulty,
            result: gameState.win ? "胜利" : "失败",
            attempts: gameState.currentAttempts,
            time: gameState.elapsedTime,
            targetValue: gameState.targetValue
        });
        
        // 显示游戏结束界面
        this.showGameOverScreen(gameState, newlyUnlocked);
    }
    
    // 显示游戏结束界面
    showGameOverScreen(gameState, newlyUnlocked) {
        const resultElement = document.getElementById("game-result");
        const statsElement = document.getElementById("result-stats");
        const achievementsElement = document.getElementById("result-achievements");
        
        // 显示结果
        if (gameState.win) {
            resultElement.textContent = "恭喜你赢了！";
            resultElement.className = "success";
        } else {
            resultElement.textContent = "很遗憾，你输了！";
            resultElement.className = "error";
        }
        
        // 显示统计信息
        statsElement.innerHTML = `
            <p>尝试次数: ${gameState.currentAttempts}/${gameState.maxAttempts}</p>
            <p>用时: ${this.formatTime(gameState.elapsedTime)}</p>
            <p>正确答案: ${gameState.targetValue}</p>
        `;
        
        // 显示解锁的成就
        if (newlyUnlocked.length > 0) {
            achievementsElement.innerHTML = `
                <h3>🎉 解锁新成就！</h3>
                <ul>
                    ${newlyUnlocked.map(ach => `
                        <li>
                            <span>${ach.icon} ${ach.name}</span>
                            <p>${ach.description}</p>
                        </li>
                    `).join("")}
                </ul>
            `;
        } else {
            achievementsElement.innerHTML = "";
        }
        
        this.showScreen("game-over");
    }
    
    // 更新游戏信息
    updateGameInfo() {
        const gameState = gameEngine.getGameState();
        document.getElementById("attempts").textContent = 
            `尝试次数: ${gameState.currentAttempts}/${gameState.maxAttempts}`;
        document.getElementById("timer").textContent = 
            `时间: ${this.formatTime(gameState.elapsedTime)}`;
    }
    
    // 显示反馈
    showFeedback(message, type = "info") {
        const feedbackElement = document.getElementById("feedback");
        
        // 添加淡出效果
        feedbackElement.classList.add("fade-out");
        
        setTimeout(() => {
            // 更新内容和样式
            feedbackElement.textContent = message;
            feedbackElement.className = type;
            
            // 添加淡入效果
            feedbackElement.classList.remove("fade-out");
            feedbackElement.classList.add("fade-in");
            
            // 3秒后自动清除反馈
            setTimeout(() => {
                feedbackElement.classList.add("fade-out");
            }, 3000);
        }, 300);
    }
    
    // 添加到历史记录
    addToHistory(guessRecord) {
        const historyList = document.getElementById("history-list");
        const li = document.createElement("li");
        
        // 格式化猜测值，特别是对于密码模式
        let guessDisplay;
        if (Array.isArray(guessRecord.guess)) {
            // 对于数组类型的猜测（如密码模式和多数字模式），转换为字符串
            guessDisplay = guessRecord.guess.join('');
        } else {
            guessDisplay = guessRecord.guess;
        }
        
        li.innerHTML = `
            <div>
                <strong>猜测:</strong> ${guessDisplay} | <strong>反馈:</strong> ${guessRecord.feedback}
            </div>
            <span class="history-time">${this.formatTime(guessRecord.timestamp - gameEngine.startTime)}</span>
        `;
        
        // 添加到列表开头，让最新的猜测显示在最上面
        historyList.insertBefore(li, historyList.firstChild);
        
        // 添加动画效果
        li.classList.add("fade-in");
        
        // 滚动到顶部
        historyList.scrollTop = 0;
    }
    
    // 清空历史记录
    clearHistory() {
        document.getElementById("history-list").innerHTML = "";
    }
    
    // 清空输入
    clearInput() {
        document.querySelectorAll(".number-input, .code-input").forEach(input => {
            input.value = "";
        });
        
        // 重新聚焦第一个输入框
        const firstInput = document.querySelector(".number-input, .code-input");
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    // 更新统计信息
    updateStats() {
        const playerData = storageManager.loadPlayerData();
        const stats = playerData.stats;
        
        document.getElementById("total-games").textContent = stats.totalGames;
        document.getElementById("total-wins").textContent = stats.wins;
        document.getElementById("win-rate").textContent = stats.totalGames > 0 
            ? Math.round((stats.wins / stats.totalGames) * 100) + "%" 
            : "0%";
        document.getElementById("avg-attempts").textContent = stats.avgAttempts;
        document.getElementById("fastest-time").textContent = stats.fastestWinTime < Infinity 
            ? this.formatTime(stats.fastestWinTime) 
            : "--:--";
        document.getElementById("max-streak").textContent = stats.maxStreak;
    }
    
    // 更新成就显示
    updateAchievements() {
        const achievements = achievementSystem.getAllAchievements();
        const progress = achievementSystem.getAchievementProgress();
        
        // 更新成就计数
        document.getElementById("unlocked-count").textContent = progress.unlockedCount;
        document.getElementById("total-achievements").textContent = progress.totalAchievements;
        document.getElementById("total-points").textContent = progress.totalPoints;
        
        // 渲染成就列表
        const achievementsGrid = document.getElementById("achievements-grid");
        achievementsGrid.innerHTML = achievements.map(achievement => {
            let cardClass = "achievement-card";
            if (achievement.unlocked) {
                cardClass += " unlocked";
            } else if (achievement.hidden) {
                cardClass += " locked hidden";
            } else {
                cardClass += " locked";
            }
            
            return `
                <div class="${cardClass}">
                    <div class="achievement-name">${achievement.icon} ${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-meta">
                        <span>点数: ${achievement.points}</span>
                        ${achievement.unlocked ? 
                            `<span class="achievement-date">
                                解锁于: ${new Date(achievement.unlockDate).toLocaleString()}
                            </span>` : 
                            `<span>进度: ${achievement.progress.current}/${achievement.progress.target}</span>`
                        }
                    </div>
                </div>
            `;
        }).join("");
    }
    
    // 加载设置
    loadSettings() {
        const settings = configManager.getUserSettings();
        
        document.getElementById("default-difficulty").value = settings.difficulty;
        document.getElementById("hints-enabled").checked = settings.hintSettings.enabled;
        document.getElementById("max-hints").value = settings.hintSettings.maxHintsPerGame;
        document.getElementById("theme").value = settings.theme;
        document.getElementById("sound-enabled").checked = settings.soundEnabled;
        document.getElementById("animations-enabled").checked = settings.animationsEnabled;
    }
    
    // 保存设置
    saveSettings() {
        const settings = {
            difficulty: document.getElementById("default-difficulty").value,
            hintSettings: {
                enabled: document.getElementById("hints-enabled").checked,
                maxHintsPerGame: parseInt(document.getElementById("max-hints").value)
            },
            theme: document.getElementById("theme").value,
            soundEnabled: document.getElementById("sound-enabled").checked,
            animationsEnabled: document.getElementById("animations-enabled").checked
        };
        
        configManager.updateUserSettings(settings);
        this.showFeedback("设置已保存", "success");
    }
    
    // 导出数据
    exportData() {
        const data = storageManager.exportPlayerData();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `guess-number-game-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showFeedback("数据已导出", "success");
    }
    
    // 导入数据
    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = storageManager.importPlayerData(e.target.result);
            if (result) {
                this.showFeedback("数据已导入", "success");
                this.updateStats();
                this.updateAchievements();
            } else {
                this.showFeedback("数据导入失败", "error");
            }
        };
        reader.readAsText(file);
    }
    
    // 重置数据
    resetData() {
        if (confirm("确定要重置所有数据吗？此操作不可恢复。")) {
            storageManager.resetAllData();
            achievementSystem.resetAchievements();
            this.showFeedback("数据已重置", "success");
            this.updateStats();
            this.updateAchievements();
        }
    }
    
    // 格式化时间
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
}

// 全局实例
window.uiManager = new UIManager();