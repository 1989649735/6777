class UIManager {
    constructor(gameEngine, configManager, achievementSystem) {
        this.gameEngine = gameEngine;
        this.configManager = configManager;
        this.achievementSystem = achievementSystem;
        
        // 获取画布元素
        this.gameCanvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.holdCanvas = document.getElementById('holdCanvas');
        
        // 获取上下文
        this.gameCtx = this.gameCanvas.getContext('2d');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        // 获取UI元素
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        
        // 按钮
        this.startBtn = document.getElementById('startBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.achievementsBtn = document.getElementById('achievementsBtn');
        
        // 模态框
        this.settingsModal = document.getElementById('settingsModal');
        this.achievementsModal = document.getElementById('achievementsModal');
        
        // 设置表单元素
        this.themeSelect = document.getElementById('theme');
        this.difficultySelect = document.getElementById('difficulty');
        this.soundCheckbox = document.getElementById('sound');
        this.musicCheckbox = document.getElementById('music');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        
        // 关闭按钮
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.closeAchievementsBtn = document.getElementById('closeAchievements');
        
        // 成就列表
        this.achievementsList = document.getElementById('achievementsList');
        
        // 渲染循环
        this.animationId = null;
        
        // 初始化
        this.initializeUI();
        this.bindEvents();
        this.startRenderLoop();
    }
    
    initializeUI() {
        // 设置初始值
        this.updateScore(0, 1, 0);
        
        // 加载设置到表单
        this.loadSettingsToForm();
        
        // 渲染初始状态
        this.render();
    }
    
    bindEvents() {
        // 按钮事件
        this.startBtn.addEventListener('click', () => {
            this.gameEngine.start();
            this.hideOverlay();
        });
        
        this.settingsBtn.addEventListener('click', () => {
            this.showSettings();
        });
        
        this.achievementsBtn.addEventListener('click', () => {
            this.showAchievements();
        });
        
        // 模态框关闭事件
        this.closeSettingsBtn.addEventListener('click', () => {
            this.hideSettings();
        });
        
        this.closeAchievementsBtn.addEventListener('click', () => {
            this.hideAchievements();
        });
        
        // 点击模态框外部关闭
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
        
        this.achievementsModal.addEventListener('click', (e) => {
            if (e.target === this.achievementsModal) {
                this.hideAchievements();
            }
        });
        
        // 保存设置
        this.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // 键盘事件（已在GameEngine中处理）
    }
    
    updateScore(score, level, lines) {
        this.scoreElement.textContent = score;
        this.levelElement.textContent = level;
        this.linesElement.textContent = lines;
    }
    
    showOverlay(title, message) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.gameOverlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        this.gameOverlay.classList.add('hidden');
    }
    
    showGameOver(score, level, lines) {
        this.showOverlay(
            '游戏结束',
            `得分: ${score}\n等级: ${level}\n消除行数: ${lines}\n按空格键重新开始`
        );
    }
    
    showSettings() {
        this.loadSettingsToForm();
        this.settingsModal.classList.add('active');
    }
    
    hideSettings() {
        this.settingsModal.classList.remove('active');
    }
    
    showAchievements() {
        this.renderAchievements();
        this.achievementsModal.classList.add('active');
    }
    
    hideAchievements() {
        this.achievementsModal.classList.remove('active');
    }
    
    loadSettingsToForm() {
        const settings = this.configManager.settings;
        this.themeSelect.value = settings.theme;
        this.difficultySelect.value = settings.difficulty;
        this.soundCheckbox.checked = settings.sound;
        this.musicCheckbox.checked = settings.music;
    }
    
    saveSettings() {
        const settings = {
            theme: this.themeSelect.value,
            difficulty: this.difficultySelect.value,
            sound: this.soundCheckbox.checked,
            music: this.musicCheckbox.checked
        };
        
        for (const [key, value] of Object.entries(settings)) {
            this.configManager.setSetting(key, value);
        }
        
        this.hideSettings();
    }
    
    renderAchievements() {
        const achievements = this.achievementSystem.achievements;
        const definitions = this.achievementSystem.achievementDefinitions;
        
        this.achievementsList.innerHTML = '';
        
        for (const [id, definition] of Object.entries(definitions)) {
            const achievement = achievements[id];
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            
            achievementItem.innerHTML = `
                <div class="achievement-icon">${definition.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${definition.title}</div>
                    <div class="achievement-desc">${definition.description}</div>
                    ${!achievement.unlocked ? `<div class="achievement-progress">进度: ${achievement.progress}%</div>` : ''}
                </div>
            `;
            
            this.achievementsList.appendChild(achievementItem);
        }
    }
    
    startRenderLoop() {
        const render = () => {
            this.render();
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }
    
    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    render() {
        // 获取游戏状态
        const gameState = this.gameEngine.getGameState();
        
        // 渲染游戏板
        this.renderGameBoard(gameState.board);
        
        // 渲染当前方块
        this.renderCurrentPiece(gameState);
        
        // 渲染下一个方块
        this.renderNextPieces(gameState.nextPieces);
        
        // 渲染保持方块
        this.renderHoldPiece(gameState.holdPiece);
    }
    
    renderGameBoard(board) {
        const { rows, cols } = this.gameEngine;
        const cellSize = this.gameEngine.cellSize;
        
        // 清空画布
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // 绘制网格
        this.gameCtx.strokeStyle = '#e0e0e0';
        this.gameCtx.lineWidth = 0.5;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.gameCtx.strokeRect(
                    col * cellSize,
                    row * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }
        
        // 绘制方块
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = board[row][col];
                if (cell) {
                    this.drawCell(this.gameCtx, col, row, cell, cellSize);
                }
            }
        }
    }
    
    renderCurrentPiece(gameState) {
        const { currentPiece, currentX, currentY, currentRotation } = gameState;
        const cellSize = this.gameEngine.cellSize;
        
        if (!currentPiece) return;
        
        const tetromino = this.gameEngine.tetrominos[currentPiece];
        const shape = this.gameEngine.rotateShape(tetromino.shape, currentRotation);
        
        // 绘制当前方块
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawCell(
                        this.gameCtx,
                        currentX + col,
                        currentY + row,
                        tetromino.color,
                        cellSize,
                        0.8
                    );
                }
            }
        }
    }
    
    renderNextPieces(nextPieces) {
        const cellSize = 24;
        const startX = 10;
        const startY = 10;
        const spacing = 10;
        
        // 清空画布
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // 绘制每个下一个方块
        nextPieces.forEach((pieceType, index) => {
            const tetromino = this.gameEngine.tetrominos[pieceType];
            const shape = tetromino.shape;
            const offsetY = index * (shape.length * cellSize + spacing) + startY;
            
            // 居中绘制
            const offsetX = (this.nextCanvas.width - shape[0].length * cellSize) / 2;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        this.drawCell(
                            this.nextCtx,
                            offsetX / cellSize + col,
                            offsetY / cellSize + row,
                            tetromino.color,
                            cellSize
                        );
                    }
                }
            }
        });
    }
    
    renderHoldPiece(holdPiece) {
        const cellSize = 24;
        
        // 清空画布
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        if (!holdPiece) return;
        
        const tetromino = this.gameEngine.tetrominos[holdPiece];
        const shape = tetromino.shape;
        
        // 居中绘制
        const offsetX = (this.holdCanvas.width - shape[0].length * cellSize) / 2;
        const offsetY = (this.holdCanvas.height - shape.length * cellSize) / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawCell(
                        this.holdCtx,
                        offsetX / cellSize + col,
                        offsetY / cellSize + row,
                        tetromino.color,
                        cellSize
                    );
                }
            }
        }
    }
    
    drawCell(ctx, col, row, color, cellSize, alpha = 1) {
        // 计算坐标
        const x = col * cellSize;
        const y = row * cellSize;
        
        // 保存状态
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = alpha;
        
        // 绘制方块
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);
        
        // 绘制高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, cellSize, cellSize / 3);
        ctx.fillRect(x, y, cellSize / 3, cellSize);
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + cellSize * 2 / 3, y, cellSize / 3, cellSize);
        ctx.fillRect(x, y + cellSize * 2 / 3, cellSize, cellSize / 3);
        
        // 恢复状态
        ctx.restore();
    }
    
    // 显示连击效果
    showCombo(combo) {
        if (combo <= 1) return;
        
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-display';
        comboElement.textContent = `${combo} COMBO!`;
        
        Object.assign(comboElement.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '2em',
            fontWeight: 'bold',
            color: '#ffd700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            zIndex: '10',
            opacity: '0',
            transition: 'all 0.5s ease',
            pointerEvents: 'none'
        });
        
        const gameArea = document.querySelector('.game-area');
        gameArea.appendChild(comboElement);
        
        // 显示动画
        setTimeout(() => {
            comboElement.style.opacity = '1';
            comboElement.style.transform = 'translate(-50%, -100%)';
        }, 100);
        
        // 隐藏动画
        setTimeout(() => {
            comboElement.style.opacity = '0';
            setTimeout(() => {
                comboElement.remove();
            }, 500);
        }, 1500);
    }
}