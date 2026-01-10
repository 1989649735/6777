// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各个模块
    const storageManager = new StorageManager();
    const achievementSystem = new AchievementSystem(storageManager);
    
    // 获取DOM元素
    const boardElement = document.getElementById('game-board');
    const mineCountElement = document.getElementById('mine-count');
    const timerElement = document.getElementById('timer');
    const difficultySelect = document.getElementById('difficulty');
    const newGameBtn = document.getElementById('new-game');
    const showAchievementsBtn = document.getElementById('show-achievements');
    const showSettingsBtn = document.getElementById('show-settings');
    const gamesPlayedElement = document.getElementById('games-played');
    const winRateElement = document.getElementById('win-rate');
    const bestTimeElement = document.getElementById('best-time');
    
    // 弹窗元素
    const achievementsModal = document.getElementById('achievements-modal');
    const closeAchievementsBtn = document.getElementById('close-achievements');
    const achievementsList = document.getElementById('achievements-list');
    
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const customWidthInput = document.getElementById('custom-width');
    const customHeightInput = document.getElementById('custom-height');
    const customMinesInput = document.getElementById('custom-mines');
    const enableSoundInput = document.getElementById('enable-sound');
    const enableAnimationsInput = document.getElementById('enable-animations');
    
    const gameOverModal = document.getElementById('game-over-modal');
    const closeGameOverBtn = document.getElementById('close-game-over');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverMessage = document.getElementById('game-over-message');
    const finalTimeElement = document.getElementById('final-time');
    const finalDifficultyElement = document.getElementById('final-difficulty');
    const playAgainBtn = document.getElementById('play-again');
    const backToMenuBtn = document.getElementById('back-to-menu');
    
    // 初始化游戏引擎
    const gameEngine = new GameEngine(boardElement, mineCountElement, timerElement);
    
    // 游戏配置
    let currentDifficulty = 'beginner';
    let customConfig = storageManager.getSettings().customDifficulty;
    
    // 更新游戏统计信息
    function updateGameStats() {
        const gameData = storageManager.getGameData();
        gamesPlayedElement.textContent = gameData.gamesPlayed;
        winRateElement.textContent = `${storageManager.getWinRate()}%`;
        
        const bestTime = gameData.bestTimes[currentDifficulty];
        bestTimeElement.textContent = bestTime ? `${bestTime}秒` : '--';
    }
    
    // 开始新游戏
    function startNewGame() {
        if (currentDifficulty === 'custom') {
            gameEngine.init(currentDifficulty, customConfig);
        } else {
            gameEngine.init(currentDifficulty);
        }
        updateGameStats();
    }
    
    // 显示游戏结束弹窗
    function showGameOverPopup() {
        const gameResult = gameEngine.getGameResult();
        const gameData = storageManager.getGameData();
        
        if (gameResult.isWin) {
            gameOverTitle.textContent = '恭喜胜利!';
            gameOverMessage.textContent = '你成功地找到了所有地雷!';
        } else {
            gameOverTitle.textContent = '游戏结束';
            gameOverMessage.textContent = '很遗憾，你踩到了地雷!';
        }
        
        finalTimeElement.textContent = gameResult.time;
        finalDifficultyElement.textContent = currentDifficulty === 'custom' ? '自定义' : currentDifficulty;
        
        gameOverModal.classList.add('show');
        
        // 更新游戏统计
        storageManager.updateGameStats(gameResult.isWin, gameResult.difficulty, gameResult.time);
        
        // 检查成就
        const gameResultWithStats = {
            ...gameResult,
            totalWins: gameData.gamesWon,
            totalGames: gameData.gamesPlayed,
            winsByDifficulty: {
                beginner: gameData.gamesWon - (gameData.bestTimes.intermediate ? 1 : 0) - (gameData.bestTimes.expert ? 1 : 0),
                intermediate: gameData.bestTimes.intermediate ? 1 : 0,
                expert: gameData.bestTimes.expert ? 1 : 0
            }
        };
        
        const unlockedAchievements = achievementSystem.checkAchievements(gameResultWithStats);
        if (unlockedAchievements.length > 0) {
            // 显示成就弹窗
            unlockedAchievements.forEach(achievement => {
                achievementSystem.showAchievementPopup(achievement);
            });
        }
        
        updateGameStats();
    }
    
    // 事件监听
    
    // 新游戏按钮
    newGameBtn.addEventListener('click', startNewGame);
    
    // 难度选择
    difficultySelect.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        startNewGame();
    });
    
    // 成就按钮
    showAchievementsBtn.addEventListener('click', () => {
        achievementSystem.renderAchievements(achievementsList);
        achievementsModal.classList.add('show');
    });
    
    // 设置按钮
    showSettingsBtn.addEventListener('click', () => {
        const settings = storageManager.getSettings();
        customWidthInput.value = settings.customDifficulty.width;
        customHeightInput.value = settings.customDifficulty.height;
        customMinesInput.value = settings.customDifficulty.mines;
        enableSoundInput.checked = settings.enableSound;
        enableAnimationsInput.checked = settings.enableAnimations;
        settingsModal.classList.add('show');
    });
    
    // 弹窗关闭事件
    closeAchievementsBtn.addEventListener('click', () => {
        achievementsModal.classList.remove('show');
    });
    
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });
    
    closeGameOverBtn.addEventListener('click', () => {
        gameOverModal.classList.remove('show');
    });
    
    // 点击弹窗外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === achievementsModal) {
            achievementsModal.classList.remove('show');
        }
        if (e.target === settingsModal) {
            settingsModal.classList.remove('show');
        }
        if (e.target === gameOverModal) {
            gameOverModal.classList.remove('show');
        }
    });
    
    // 保存设置
    saveSettingsBtn.addEventListener('click', () => {
        const settings = {
            enableSound: enableSoundInput.checked,
            enableAnimations: enableAnimationsInput.checked,
            customDifficulty: {
                width: parseInt(customWidthInput.value),
                height: parseInt(customHeightInput.value),
                mines: parseInt(customMinesInput.value)
            }
        };
        
        storageManager.saveSettings(settings);
        customConfig = settings.customDifficulty;
        settingsModal.classList.remove('show');
        
        if (currentDifficulty === 'custom') {
            startNewGame();
        }
    });
    
    // 游戏结束弹窗按钮
    playAgainBtn.addEventListener('click', () => {
        gameOverModal.classList.remove('show');
        startNewGame();
    });
    
    backToMenuBtn.addEventListener('click', () => {
        gameOverModal.classList.remove('show');
    });
    
    // 监听游戏状态变化
    function checkGameState() {
        const gameState = gameEngine.getGameState();
        if (gameState.isGameOver && !gameOverModal.classList.contains('show')) {
            showGameOverPopup();
        }
        requestAnimationFrame(checkGameState);
    }
    
    // 初始化
    function init() {
        // 加载设置
        const settings = storageManager.getSettings();
        customConfig = settings.customDifficulty;
        
        // 初始化游戏
        startNewGame();
        
        // 更新游戏统计
        updateGameStats();
        
        // 启动游戏状态检查
        requestAnimationFrame(checkGameState);
        
        // 渲染初始成就列表
        achievementSystem.renderAchievements(achievementsList);
    }
    
    // 启动游戏
    init();
});

// 添加成就弹窗样式
const style = document.createElement('style');
style.textContent = `
    .achievement-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        opacity: 0;
        transform: translateY(-50px);
        transition: all 0.3s ease;
        max-width: 300px;
    }
    
    .achievement-popup-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .achievement-popup-icon {
        font-size: 24px;
    }
    
    .achievement-popup-info {
        flex: 1;
    }
    
    .achievement-popup-title {
        font-weight: bold;
        font-size: 1.1em;
        margin-bottom: 4px;
    }
    
    .achievement-popup-desc {
        font-size: 0.9em;
        opacity: 0.9;
    }
    
    .achievement-date {
        font-size: 0.8em;
        color: #a0aec0;
        margin-top: 4px;
    }
`;
document.head.appendChild(style);