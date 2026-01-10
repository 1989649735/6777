// UI管理器 - UIManager.js
class UIManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.initEventListeners();
        this.updateAchievementsDisplay();
        this.updateStatsDisplay();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 主菜单事件
        this.bindMenuEvents();
        
        // 游戏界面事件
        this.bindGameEvents();
        
        // 统计信息事件
        this.bindStatsEvents();
        
        // 成就界面事件
        this.bindAchievementsEvents();
        
        // 排行榜事件
        this.bindLeaderboardEvents();
        
        // 设置界面事件
        this.bindSettingsEvents();
        
        // 游戏结束界面事件
        this.bindGameOverEvents();
    }
    
    // 绑定主菜单事件
    bindMenuEvents() {
        // 模式选择
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.startGame(mode);
            });
        });
        
        // 菜单选项
        document.getElementById('stats-btn')?.addEventListener('click', () => {
            this.showScreen('stats-screen');
        });
        
        document.getElementById('achievements-btn')?.addEventListener('click', () => {
            this.showScreen('achievements-screen');
            this.updateAchievementsDisplay();
        });
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.updateSettingsDisplay();
        });
        
        document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
            this.showScreen('leaderboard-screen');
            this.updateLeaderboardDisplay();
        });
    }
    
    // 绑定游戏事件
    bindGameEvents() {
        // 提交答案
        document.getElementById('submit-expression')?.addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // 回车键提交答案
        document.getElementById('expression-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // 获取提示
        document.getElementById('get-hint')?.addEventListener('click', () => {
            this.getHint();
        });
        
        // 新题目
        document.getElementById('new-puzzle')?.addEventListener('click', () => {
            this.generateNewPuzzle();
        });
        
        // 退出游戏
        document.getElementById('quit-game')?.addEventListener('click', () => {
            this.quitGame();
        });
    }
    
    // 绑定统计信息事件
    bindStatsEvents() {
        document.getElementById('back-from-stats')?.addEventListener('click', () => {
            this.showScreen('main-menu');
        });
    }
    
    // 绑定成就界面事件
    bindAchievementsEvents() {
        document.getElementById('back-from-achievements')?.addEventListener('click', () => {
            this.showScreen('main-menu');
        });
    }
    
    // 绑定排行榜事件
    bindLeaderboardEvents() {
        document.getElementById('back-from-leaderboard')?.addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        // 排行榜标签切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchLeaderboardTab(tab);
            });
        });
    }
    
    // 绑定设置界面事件
    bindSettingsEvents() {
        document.getElementById('back-from-settings')?.addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-data')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file')?.addEventListener('change', (e) => {
            this.importData(e);
        });
        
        document.getElementById('reset-data')?.addEventListener('click', () => {
            this.resetData();
        });
    }
    
    // 绑定游戏结束事件
    bindGameOverEvents() {
        document.getElementById('play-again')?.addEventListener('click', () => {
            // 再玩一次，使用相同的模式和难度
            this.startGame(gameEngine.gameState.mode, gameEngine.gameState.difficulty);
        });
        
        document.getElementById('back-to-main')?.addEventListener('click', () => {
            this.showScreen('main-menu');
        });
    }
    
    // 显示指定屏幕
    showScreen(screenId) {
        // 隐藏所有屏幕
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示指定屏幕
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }
    
    // 开始游戏
    startGame(mode) {
        const difficulty = configManager.getUserSettings().difficulty;
        const gameState = gameEngine.startNewGame(mode, difficulty);
        
        this.showScreen('game-screen');
        this.updateGameDisplay();
        this.startGameTimer();
    }
    
    // 更新游戏显示
    updateGameDisplay() {
        const gameState = gameEngine.getGameState();
        
        // 更新游戏模式名称
        document.getElementById('game-mode-name').textContent = this.getModeDisplayName(gameState.mode);
        
        // 更新关卡信息
        document.getElementById('level').textContent = `关卡: ${gameState.level}`;
        
        // 更新分数
        document.getElementById('score').textContent = `分数: ${gameState.score}`;
        
        // 更新计时器
        this.updateTimerDisplay(gameState.remainingTime);
        
        // 更新数字显示
        this.updateNumbersDisplay(gameState.currentNumbers);
        
        // 更新进度条
        this.updateProgressBar();
        
        // 清空反馈和输入
        this.clearFeedback();
        this.clearExpressionInput();
    }
    
    // 获取模式显示名称
    getModeDisplayName(mode) {
        const modeNames = {
            classic: '经典模式',
            timed: '计时模式',
            challenge: '挑战模式',
            speed: '速算模式',
            training: '训练模式',
            multiplayer: '多人模式'
        };
        return modeNames[mode] || mode;
    }
    
    // 更新数字显示
    updateNumbersDisplay(numbers) {
        for (let i = 0; i < numbers.length; i++) {
            const numElement = document.getElementById(`num${i + 1}`);
            if (numElement) {
                numElement.textContent = numbers[i];
            }
        }
    }
    
    // 更新计时器显示
    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timerDisplay = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = `时间: ${timerDisplay}`;
    }
    
    // 更新进度条
    updateProgressBar() {
        const gameState = gameEngine.getGameState();
        const progress = (gameState.currentRound / gameState.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${gameState.solvedCount}/${gameState.totalRounds}`;
    }
    
    // 开始游戏计时器
    startGameTimer() {
        // 清除可能存在的旧计时器
        if (this.timerUpdateInterval) {
            clearInterval(this.timerUpdateInterval);
        }
        
        // 创建新的计时器更新
        this.timerUpdateInterval = setInterval(() => {
            const gameState = gameEngine.getGameState();
            this.updateTimerDisplay(gameState.remainingTime);
            
            // 检查游戏是否结束
            if (gameState.gameOver) {
                this.endGame();
            }
        }, 1000);
    }
    
    // 提交答案
    submitAnswer() {
        const input = document.getElementById('expression-input');
        const expression = input.value.trim();
        
        if (!expression) {
            this.showFeedback('请输入表达式', 'error');
            return;
        }
        
        const result = gameEngine.validateAnswer(expression);
        
        if (result.correct) {
            this.showFeedback(result.message, 'success');
            this.addToExpressionHistory(expression, result.result);
            this.updateGameDisplay();
            
            // 检查游戏是否结束
            const gameState = gameEngine.getGameState();
            if (gameState.gameOver) {
                this.endGame();
            }
        } else {
            this.showFeedback(result.message, result.valid ? 'error' : 'info');
        }
    }
    
    // 显示反馈信息
    showFeedback(message, type = 'info') {
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = message;
        feedbackElement.className = type;
    }
    
    // 清除反馈信息
    clearFeedback() {
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = '';
        feedbackElement.className = 'info';
    }
    
    // 清空表达式输入
    clearExpressionInput() {
        const input = document.getElementById('expression-input');
        if (input) {
            input.value = '';
        }
        
        // 清空表达式历史
        this.clearExpressionHistory();
    }
    
    // 添加到表达式历史
    addToExpressionHistory(expression, result) {
        const historyElement = document.getElementById('expression-history');
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${expression} = ${result.toFixed(2)}`;
        historyElement.appendChild(historyItem);
        
        // 限制历史记录数量
        if (historyElement.children.length > 5) {
            historyElement.removeChild(historyElement.firstChild);
        }
        
        // 滚动到底部
        historyElement.scrollTop = historyElement.scrollHeight;
    }
    
    // 清空表达式历史
    clearExpressionHistory() {
        const historyElement = document.getElementById('expression-history');
        historyElement.innerHTML = '';
    }
    
    // 获取提示
    getHint() {
        const hint = gameEngine.getHint();
        this.showFeedback(hint.hint, 'info');
    }
    
    // 生成新题目
    generateNewPuzzle() {
        const numbers = gameEngine.generateNewPuzzle();
        this.updateNumbersDisplay(numbers);
        this.clearFeedback();
        this.clearExpressionInput();
    }
    
    // 退出游戏
    quitGame() {
        // 停止游戏计时器
        if (this.timerUpdateInterval) {
            clearInterval(this.timerUpdateInterval);
            this.timerUpdateInterval = null;
        }
        
        gameEngine.quitGame();
        this.showScreen('main-menu');
    }
    
    // 结束游戏
    endGame() {
        // 停止游戏计时器
        if (this.timerUpdateInterval) {
            clearInterval(this.timerUpdateInterval);
            this.timerUpdateInterval = null;
        }
        
        const gameState = gameEngine.getGameState();
        this.showGameOverScreen(gameState);
    }
    
    // 显示游戏结束界面
    showGameOverScreen(gameState) {
        // 更新游戏结果
        const resultElement = document.getElementById('game-result');
        resultElement.textContent = gameState.win ? '游戏胜利！' : '游戏结束';
        
        // 更新结果统计
        const statsElement = document.getElementById('result-stats');
        statsElement.innerHTML = `
            <div><strong>得分:</strong> ${gameState.score}</div>
            <div><strong>答对题数:</strong> ${gameState.solvedCount}/${gameState.totalRounds}</div>
            <div><strong>用时:</strong> ${this.formatTime(gameState.elapsedTime)}</div>
            <div><strong>提示使用:</strong> ${gameState.hintsUsed}</div>
        `;
        
        // 更新成就解锁
        const achievementsElement = document.getElementById('result-achievements');
        const newlyUnlocked = achievementSystem.getUnlockedAchievements().filter(a => {
            return a.unlockDate && (Date.now() - a.unlockDate) < 60000; // 最近1分钟解锁的
        });
        
        if (newlyUnlocked.length > 0) {
            achievementsElement.innerHTML = '<h3>解锁的成就:</h3>';
            newlyUnlocked.forEach(achievement => {
                const achievementItem = document.createElement('div');
                achievementItem.className = 'achievement-unlocked';
                achievementItem.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                `;
                achievementsElement.appendChild(achievementItem);
            });
        } else {
            achievementsElement.innerHTML = '';
        }
        
        // 更新统计信息和成就显示
        this.updateStatsDisplay();
        this.updateAchievementsDisplay();
        
        // 显示游戏结束界面
        this.showScreen('game-over');
    }
    
    // 更新成就显示
    updateAchievementsDisplay() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;
        
        const achievements = achievementSystem.getAllAchievements();
        const progress = achievementSystem.getAchievementProgress();
        
        // 更新成就头部信息
        document.getElementById('unlocked-count').textContent = progress.unlockedCount;
        document.getElementById('total-achievements').textContent = progress.totalAchievements;
        document.getElementById('total-points').textContent = progress.totalPoints;
        
        // 更新成就列表
        achievementsGrid.innerHTML = '';
        achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''} ${achievement.hidden ? 'hidden' : ''}`;
            
            const progressPercent = (achievement.progress.current / achievement.progress.target) * 100;
            
            achievementElement.innerHTML = `
                <div class="achievement-header">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-points">${achievement.points} 点</div>
                </div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-category">${achievement.category}</div>
                </div>
                <div class="achievement-progress">
                    <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-progress-text">
                    ${achievement.progress.current}/${achievement.progress.target}
                </div>
                ${achievement.unlocked ? `<div class="achievement-unlock-date">解锁于: ${this.formatDate(achievement.unlockDate)}</div>` : ''}
            `;
            
            achievementsGrid.appendChild(achievementElement);
        });
    }
    
    // 更新统计信息显示
    updateStatsDisplay() {
        const playerData = storageManager.loadPlayerData();
        const stats = playerData.stats;
        
        // 更新基本统计
        const totalGamesElement = document.getElementById('total-games');
        if (totalGamesElement) totalGamesElement.textContent = stats.totalGames;
        
        const totalWinsElement = document.getElementById('total-wins');
        if (totalWinsElement) totalWinsElement.textContent = stats.wins;
        
        const totalLossesElement = document.getElementById('total-losses');
        if (totalLossesElement) totalLossesElement.textContent = stats.losses;
        
        const winRateElement = document.getElementById('win-rate');
        if (winRateElement) winRateElement.textContent = `${stats.winRate}%`;
        
        const maxStreakElement = document.getElementById('max-streak');
        if (maxStreakElement) maxStreakElement.textContent = stats.maxStreak;
        
        const currentStreakElement = document.getElementById('current-streak');
        if (currentStreakElement) currentStreakElement.textContent = stats.currentStreak;
        
        // 更新难度统计
        const totalSolvedElement = document.getElementById('total-solved');
        if (totalSolvedElement) totalSolvedElement.textContent = stats.totalSolved;
        
        const avgSolveTimeElement = document.getElementById('avg-solve-time');
        if (avgSolveTimeElement) avgSolveTimeElement.textContent = this.formatTime(stats.avgSolveTime);
        
        const fastestSolveTimeElement = document.getElementById('fastest-solve-time');
        if (fastestSolveTimeElement) fastestSolveTimeElement.textContent = stats.fastestSolveTime === Infinity ? '00:00' : this.formatTime(stats.fastestSolveTime);
        
        const highestScoreElement = document.getElementById('highest-score');
        if (highestScoreElement) highestScoreElement.textContent = stats.highestScore;
        
        // 更新模式统计
        const modeStatsContainer = document.getElementById('mode-stats-container');
        if (modeStatsContainer) {
            modeStatsContainer.innerHTML = '';
            
            Object.entries(stats.modeStats).forEach(([mode, modeStats]) => {
                const modeStatElement = document.createElement('div');
                modeStatElement.className = 'mode-stat';
                modeStatElement.innerHTML = `
                    <h4>${this.getModeDisplayName(mode)}</h4>
                    <div class="mode-stat-grid">
                        <div><strong>游戏数:</strong> ${modeStats.games}</div>
                        <div><strong>胜利数:</strong> ${modeStats.wins}</div>
                        <div><strong>胜率:</strong> ${modeStats.winRate}%</div>
                        <div><strong>最高分数:</strong> ${modeStats.highestScore}</div>
                    </div>
                `;
                modeStatsContainer.appendChild(modeStatElement);
            });
        }
    }
    
    // 更新排行榜显示
    updateLeaderboardDisplay() {
        const localLeaderboardList = document.getElementById('local-leaderboard-list');
        if (!localLeaderboardList) return;
        
        const leaderboard = storageManager.loadLeaderboard();
        
        localLeaderboardList.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            leaderboardItem.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="score">${entry.score}</div>
                <div class="mode">${this.getModeDisplayName(entry.mode)}</div>
                <div class="date">${this.formatDate(entry.timestamp)}</div>
            `;
            localLeaderboardList.appendChild(leaderboardItem);
        });
    }
    
    // 切换排行榜标签
    switchLeaderboardTab(tabName) {
        // 切换标签按钮状态
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // 切换排行榜内容
        const leaderboards = document.querySelectorAll('.leaderboard');
        leaderboards.forEach(leaderboard => {
            leaderboard.classList.remove('active');
        });
        
        const activeLeaderboard = document.getElementById(`${tabName}-leaderboard`);
        if (activeLeaderboard) {
            activeLeaderboard.classList.add('active');
        }
    }
    
    // 更新设置显示
    updateSettingsDisplay() {
        const settings = configManager.getUserSettings();
        
        const themeElement = document.getElementById('theme');
        if (themeElement) themeElement.value = settings.theme;
        
        const difficultyElement = document.getElementById('default-difficulty');
        if (difficultyElement) difficultyElement.value = settings.difficulty;
        
        const soundElement = document.getElementById('sound-enabled');
        if (soundElement) soundElement.checked = settings.soundEnabled;
        
        const animationsElement = document.getElementById('animations-enabled');
        if (animationsElement) animationsElement.checked = settings.animationsEnabled;
        
        const hintsElement = document.getElementById('hints-enabled');
        if (hintsElement) hintsElement.checked = settings.hintsEnabled;
        
        const maxHintsElement = document.getElementById('max-hints');
        if (maxHintsElement) maxHintsElement.value = settings.maxHints;
        
        const autoCheckElement = document.getElementById('auto-check');
        if (autoCheckElement) autoCheckElement.checked = settings.autoCheck;
    }
    
    // 保存设置
    saveSettings() {
        const newSettings = {
            theme: document.getElementById('theme').value,
            difficulty: document.getElementById('default-difficulty').value,
            soundEnabled: document.getElementById('sound-enabled').checked,
            animationsEnabled: document.getElementById('animations-enabled').checked,
            hintsEnabled: document.getElementById('hints-enabled').checked,
            maxHints: parseInt(document.getElementById('max-hints').value),
            autoCheck: document.getElementById('auto-check').checked
        };
        
        configManager.updateUserSettings(newSettings);
        this.showFeedback('设置已保存', 'success');
    }
    
    // 导出数据
    exportData() {
        const exportData = storageManager.exportPlayerData();
        
        // 创建下载链接
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `24point_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showFeedback('数据已导出', 'success');
    }
    
    // 导入数据
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = storageManager.importPlayerData(e.target.result);
            if (success) {
                this.showFeedback('数据已导入', 'success');
                this.updateStatsDisplay();
                this.updateAchievementsDisplay();
            } else {
                this.showFeedback('导入失败，请检查文件格式', 'error');
            }
        };
        reader.readAsText(file);
        
        // 清空文件输入
        event.target.value = '';
    }
    
    // 重置数据
    resetData() {
        if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
            storageManager.resetAllData();
            achievementSystem.resetAchievements();
            this.updateStatsDisplay();
            this.updateAchievementsDisplay();
            this.showFeedback('数据已重置', 'success');
        }
    }
    
    // 更新进度条
    updateProgressBar() {
        const gameState = gameEngine.getGameState();
        const progressPercent = (gameState.solvedCount / gameState.totalRounds) * 100;
        
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
        document.getElementById('progress-text').textContent = `${gameState.solvedCount}/${gameState.totalRounds}`;
    }
    
    // 格式化时间
    formatTime(milliseconds) {
        if (milliseconds === Infinity || milliseconds === 0) return '00:00';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 格式化日期
    formatDate(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
    
    // 更新计时器显示
    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timerDisplay = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = `时间: ${timerDisplay}`;
    }
}

// 全局实例
window.uiManager = new UIManager();