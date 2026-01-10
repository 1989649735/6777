class GameEngine {
    constructor(configManager, achievementSystem) {
        this.configManager = configManager;
        this.achievementSystem = achievementSystem;
        
        // 游戏设置
        this.rows = 20;
        this.cols = 10;
        this.cellSize = 30;
        
        // 游戏状态
        this.gameState = 'ready'; // ready, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;
        this.gameTime = 0;
        
        // 游戏板
        this.board = this.createBoard();
        
        // 方块定义
        this.tetrominos = {
            I: {
                shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                color: '#00f2fe'
            },
            O: {
                shape: [[1, 1], [1, 1]],
                color: '#ffd700'
            },
            T: {
                shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                color: '#9d4edd'
            },
            S: {
                shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
                color: '#4ade80'
            },
            Z: {
                shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
                color: '#f87171'
            },
            J: {
                shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
                color: '#3b82f6'
            },
            L: {
                shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
                color: '#f59e0b'
            }
        };
        
        // 当前方块
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.currentRotation = 0;
        
        // 保持功能
        this.holdPiece = null;
        this.canHold = true;
        
        // 下一个方块队列
        this.nextPieces = [];
        this.queueSize = 3;
        
        // 难度设置
        this.difficultySettings = {
            easy: { initialSpeed: 1000, speedIncrement: 50 },
            normal: { initialSpeed: 800, speedIncrement: 75 },
            hard: { initialSpeed: 600, speedIncrement: 100 }
        };
        this.dropSpeed = this.difficultySettings.normal.initialSpeed;
        this.difficulty = 'normal';
        
        // 游戏统计
        this.gameStats = {
            totalGames: 0,
            highScore: 0,
            totalLines: 0,
            totalTetris: 0,
            maxCombo: 0,
            totalTime: 0,
            noHoldGames: 0,
            quickScore: null,
            quickScoreTime: 0
        };
        
        // 计时器
        this.dropTimer = null;
        this.gameTimer = null;
        
        // 输入状态
        this.inputState = {};
        
        // 初始化
        this.initializeNextPieces();
        this.spawnPiece();
        
        // 绑定事件
        this.bindEvents();
    }
    
    createBoard() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    initializeNextPieces() {
        for (let i = 0; i < this.queueSize; i++) {
            this.nextPieces.push(this.getRandomPiece());
        }
    }
    
    getRandomPiece() {
        const pieces = Object.keys(this.tetrominos);
        return pieces[Math.floor(Math.random() * pieces.length)];
    }
    
    spawnPiece() {
        const pieceType = this.nextPieces.shift();
        this.nextPieces.push(this.getRandomPiece());
        
        this.currentPiece = pieceType;
        this.currentRotation = 0;
        this.currentX = Math.floor(this.cols / 2) - Math.floor(this.getPieceShape().length / 2);
        this.currentY = 0;
        this.canHold = true;
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentX, this.currentY, this.getPieceShape())) {
            this.gameOver();
        }
    }
    
    getPieceShape() {
        const shape = this.tetrominos[this.currentPiece].shape;
        return this.rotateShape(shape, this.currentRotation);
    }
    
    rotateShape(shape, rotation) {
        let rotated = shape;
        for (let i = 0; i < rotation; i++) {
            rotated = this.rotateOnce(rotated);
        }
        return rotated;
    }
    
    rotateOnce(shape) {
        const size = shape.length;
        const rotated = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                rotated[x][size - 1 - y] = shape[y][x];
            }
        }
        
        return rotated;
    }
    
    checkCollision(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // 检查边界
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    
                    // 检查是否与已有方块碰撞
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    moveLeft() {
        if (this.gameState !== 'playing') return;
        
        if (!this.checkCollision(this.currentX - 1, this.currentY, this.getPieceShape())) {
            this.currentX--;
            this.configManager.playSound('move');
        }
    }
    
    moveRight() {
        if (this.gameState !== 'playing') return;
        
        if (!this.checkCollision(this.currentX + 1, this.currentY, this.getPieceShape())) {
            this.currentX++;
            this.configManager.playSound('move');
        }
    }
    
    moveDown() {
        if (this.gameState !== 'playing') return;
        
        if (!this.checkCollision(this.currentX, this.currentY + 1, this.getPieceShape())) {
            this.currentY++;
            this.score += 1;
            this.updateScore();
            return true;
        } else {
            this.lockPiece();
            return false;
        }
    }
    
    hardDrop() {
        if (this.gameState !== 'playing') return;
        
        let dropDistance = 0;
        while (!this.checkCollision(this.currentX, this.currentY + 1, this.getPieceShape())) {
            this.currentY++;
            dropDistance++;
        }
        
        if (dropDistance > 0) {
            this.score += dropDistance * 2;
            this.updateScore();
            this.configManager.playSound('hardDrop');
        }
        
        this.lockPiece();
    }
    
    rotate() {
        if (this.gameState !== 'playing') return;
        
        const newRotation = (this.currentRotation + 1) % 4;
        const newShape = this.rotateShape(this.tetrominos[this.currentPiece].shape, newRotation);
        
        // 壁踢（Wall Kick）逻辑
        const wallKicks = [
            [0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0],
            [0, -1], [-1, -1], [1, -1], [-2, -1], [2, -1]
        ];
        
        for (const [dx, dy] of wallKicks) {
            if (!this.checkCollision(this.currentX + dx, this.currentY + dy, newShape)) {
                this.currentRotation = newRotation;
                this.currentX += dx;
                this.currentY += dy;
                this.configManager.playSound('rotate');
                return;
            }
        }
    }
    
    hold() {
        if (this.gameState !== 'playing' || !this.canHold) return;
        
        if (this.holdPiece) {
            const temp = this.holdPiece;
            this.holdPiece = this.currentPiece;
            this.currentPiece = temp;
            this.currentRotation = 0;
            this.currentX = Math.floor(this.cols / 2) - Math.floor(this.getPieceShape().length / 2);
            this.currentY = 0;
        } else {
            this.holdPiece = this.currentPiece;
            this.spawnPiece();
        }
        
        this.canHold = false;
        this.configManager.playSound('hold');
    }
    
    lockPiece() {
        const shape = this.getPieceShape();
        const color = this.tetrominos[this.currentPiece].color;
        
        // 将方块锁定到游戏板
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardY = this.currentY + row;
                    const boardX = this.currentX + col;
                    if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
                        this.board[boardY][boardX] = color;
                    }
                }
            }
        }
        
        // 检查并消除完整行
        const clearedLines = this.clearLines();
        if (clearedLines > 0) {
            this.handleLineClear(clearedLines);
        } else {
            this.combo = 0;
        }
        
        // 生成新方块
        this.spawnPiece();
        
        // 检查成就
        this.checkAchievements();
    }
    
    clearLines() {
        let clearedLines = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                // 移除完整行
                this.board.splice(row, 1);
                // 在顶部添加新行
                this.board.unshift(Array(this.cols).fill(0));
                // 因为移除了一行，需要重新检查当前行
                row++;
                clearedLines++;
            }
        }
        
        return clearedLines;
    }
    
    handleLineClear(clearedLines) {
        this.lines += clearedLines;
        this.combo++;
        
        // 计算分数
        const lineScores = [0, 100, 300, 500, 800];
        const score = lineScores[clearedLines] * this.level;
        const comboBonus = (this.combo - 1) * 50;
        this.score += score + comboBonus;
        
        // 检查Tetris（四行消除）
        if (clearedLines === 4) {
            this.gameStats.totalTetris++;
            this.configManager.playSound('tetris');
        } else {
            this.configManager.playSound('lineClear');
        }
        
        // 更新等级
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateDropSpeed();
            this.configManager.playSound('levelUp');
        }
        
        this.updateScore();
    }
    
    updateScore() {
        // 这里会在UIManager中实现更新UI的逻辑
        if (window.uiManager) {
            window.uiManager.updateScore(this.score, this.level, this.lines);
        }
    }
    
    updateDropSpeed() {
        const settings = this.difficultySettings[this.difficulty];
        this.dropSpeed = Math.max(50, settings.initialSpeed - (this.level - 1) * settings.speedIncrement);
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.updateDropSpeed();
    }
    
    start() {
        if (this.gameState === 'gameOver') {
            this.reset();
        }
        
        this.gameState = 'playing';
        this.startDropTimer();
        this.startGameTimer();
        this.configManager.playSound('gameStart');
        this.configManager.playMusic('gameMusic');
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopDropTimer();
            this.stopGameTimer();
            this.configManager.playSound('pause');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startDropTimer();
            this.startGameTimer();
            this.configManager.playSound('resume');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.stopDropTimer();
        this.stopGameTimer();
        
        // 更新游戏统计
        this.gameStats.totalGames++;
        this.gameStats.highScore = Math.max(this.gameStats.highScore, this.score);
        this.gameStats.totalLines += this.lines;
        this.gameStats.totalTime += this.gameTime;
        this.gameStats.maxCombo = Math.max(this.gameStats.maxCombo, this.combo);
        
        // 检查是否没有使用保持功能
        if (this.gameStats.noHoldGames === 0 && !this.holdPiece) {
            this.gameStats.noHoldGames = 1;
        }
        
        // 检查快速得分成就
        if (this.gameTime <= 30 && this.score >= 100) {
            this.gameStats.quickScore = this.score;
            this.gameStats.quickScoreTime = this.gameTime;
        }
        
        // 检查成就
        this.checkAchievements();
        
        this.configManager.playSound('gameOver');
        this.configManager.stopMusic();
        
        // 显示游戏结束界面
        if (window.uiManager) {
            window.uiManager.showGameOver(this.score, this.level, this.lines);
        }
    }
    
    reset() {
        // 重置游戏状态
        this.gameState = 'ready';
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;
        this.gameTime = 0;
        
        // 重置游戏板
        this.board = this.createBoard();
        
        // 重置方块
        this.currentPiece = null;
        this.holdPiece = null;
        this.nextPieces = [];
        this.initializeNextPieces();
        this.spawnPiece();
        
        // 重置统计
        this.gameStats.quickScore = null;
        this.gameStats.quickScoreTime = 0;
        
        // 更新UI
        this.updateScore();
    }
    
    startDropTimer() {
        this.stopDropTimer();
        this.dropTimer = setInterval(() => {
            this.moveDown();
        }, this.dropSpeed);
    }
    
    stopDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
            this.dropTimer = null;
        }
    }
    
    startGameTimer() {
        this.stopGameTimer();
        this.gameTimer = setInterval(() => {
            this.gameTime++;
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case ' ': // 空格键
                    e.preventDefault();
                    if (this.gameState === 'ready') {
                        this.start();
                    } else if (this.gameState === 'playing') {
                        this.hardDrop();
                    } else if (this.gameState === 'gameOver') {
                        this.start();
                    }
                    break;
                case 'c':
                case 'C':
                    this.hold();
                    break;
                case 'p':
                case 'P':
                    this.pause();
                    break;
            }
        });
    }
    
    checkAchievements() {
        this.achievementSystem.checkAchievements(this.gameStats);
    }
    
    // 获取当前游戏状态用于渲染
    getGameState() {
        return {
            board: this.board,
            currentPiece: this.currentPiece,
            currentX: this.currentX,
            currentY: this.currentY,
            currentRotation: this.currentRotation,
            holdPiece: this.holdPiece,
            nextPieces: this.nextPieces,
            gameState: this.gameState,
            score: this.score,
            level: this.level,
            lines: this.lines,
            combo: this.combo
        };
    }
}