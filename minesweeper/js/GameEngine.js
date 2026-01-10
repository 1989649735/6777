class GameEngine {
    constructor(boardElement, mineCountElement, timerElement) {
        this.boardElement = boardElement;
        this.mineCountElement = mineCountElement;
        this.timerElement = timerElement;
        
        // 游戏配置
        this.config = {
            beginner: { width: 9, height: 9, mines: 10 },
            intermediate: { width: 16, height: 16, mines: 40 },
            expert: { width: 30, height: 16, mines: 99 },
            custom: { width: 9, height: 9, mines: 10 }
        };
        
        // 游戏状态
        this.gameState = {
            isPlaying: false,
            isGameOver: false,
            isWin: false,
            width: 9,
            height: 9,
            mines: 10,
            flagsPlaced: 0,
            cellsRevealed: 0,
            startTime: null,
            currentTime: 0,
            timerInterval: null,
            board: [],
            difficulty: 'beginner',
            firstClick: true,
            wrongFlags: 0
        };
    }

    // 初始化游戏
    init(difficulty = 'beginner', customConfig = null) {
        this.gameState.difficulty = difficulty;
        
        if (difficulty === 'custom' && customConfig) {
            this.gameState.width = customConfig.width;
            this.gameState.height = customConfig.height;
            this.gameState.mines = customConfig.mines;
        } else {
            const config = this.config[difficulty];
            this.gameState.width = config.width;
            this.gameState.height = config.height;
            this.gameState.mines = config.mines;
        }
        
        this.resetGame();
        this.generateBoard();
        this.renderBoard();
        this.updateUI();
    }

    // 重置游戏
    resetGame() {
        this.gameState.isPlaying = false;
        this.gameState.isGameOver = false;
        this.gameState.isWin = false;
        this.gameState.flagsPlaced = 0;
        this.gameState.cellsRevealed = 0;
        this.gameState.startTime = null;
        this.gameState.currentTime = 0;
        this.gameState.firstClick = true;
        this.gameState.wrongFlags = 0;
        
        if (this.gameState.timerInterval) {
            clearInterval(this.gameState.timerInterval);
        }
        
        this.gameState.board = [];
    }

    // 生成游戏板
    generateBoard() {
        const { width, height } = this.gameState;
        
        // 创建空棋盘
        for (let y = 0; y < height; y++) {
            this.gameState.board[y] = [];
            for (let x = 0; x < width; x++) {
                this.gameState.board[y][x] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    x,
                    y
                };
            }
        }
    }

    // 放置地雷
    placeMines(firstClickX, firstClickY) {
        const { width, height, mines } = this.gameState;
        let minesPlaced = 0;
        
        while (minesPlaced < mines) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            
            // 确保不在第一次点击的位置及其周围放置地雷
            if (!this.gameState.board[y][x].isMine && 
                Math.abs(x - firstClickX) > 1 || 
                Math.abs(y - firstClickY) > 1) {
                
                this.gameState.board[y][x].isMine = true;
                minesPlaced++;
            }
        }
        
        this.calculateAdjacentMines();
    }

    // 计算相邻地雷数
    calculateAdjacentMines() {
        const { width, height } = this.gameState;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!this.gameState.board[y][x].isMine) {
                    let count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            
                            const newX = x + dx;
                            const newY = y + dy;
                            
                            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                                if (this.gameState.board[newY][newX].isMine) {
                                    count++;
                                }
                            }
                        }
                    }
                    this.gameState.board[y][x].adjacentMines = count;
                }
            }
        }
    }

    // 渲染游戏板
    renderBoard() {
        const { width, height } = this.gameState;
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${height}, 1fr)`;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = this.gameState.board[y][x];
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.dataset.x = x;
                cellElement.dataset.y = y;
                
                // 左键点击
                cellElement.addEventListener('click', () => {
                    this.handleCellClick(x, y);
                });
                
                // 右键点击（标记旗帜）
                cellElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(x, y);
                });
                
                this.boardElement.appendChild(cellElement);
            }
        }
    }

    // 更新单元格显示
    updateCell(x, y) {
        const cell = this.gameState.board[y][x];
        const cellElement = this.boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        
        if (!cellElement) return;
        
        cellElement.className = 'cell';
        
        if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            
            if (cell.isMine) {
                cellElement.classList.add('mine');
            } else if (cell.adjacentMines > 0) {
                cellElement.classList.add(`number-${cell.adjacentMines}`);
                cellElement.textContent = cell.adjacentMines;
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flagged');
        }
    }

    // 处理左键点击
    handleCellClick(x, y) {
        if (this.gameState.isGameOver) return;
        
        const cell = this.gameState.board[y][x];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        // 第一次点击，开始游戏并放置地雷
        if (this.gameState.firstClick) {
            this.startGame();
            this.placeMines(x, y);
            this.gameState.firstClick = false;
        }
        
        this.revealCell(x, y);
        this.checkWinCondition();
    }

    // 处理右键点击
    handleCellRightClick(x, y) {
        if (this.gameState.isGameOver || !this.gameState.isPlaying) return;
        
        const cell = this.gameState.board[y][x];
        
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        
        if (cell.isFlagged) {
            this.gameState.flagsPlaced++;
            if (!cell.isMine) {
                this.gameState.wrongFlags++;
            }
        } else {
            this.gameState.flagsPlaced--;
            if (!cell.isMine) {
                this.gameState.wrongFlags--;
            }
        }
        
        this.updateCell(x, y);
        this.updateUI();
    }

    // 揭示单元格
    revealCell(x, y) {
        const { width, height } = this.gameState;
        const cell = this.gameState.board[y][x];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.gameState.cellsRevealed++;
        
        this.updateCell(x, y);
        
        // 如果是地雷，游戏结束
        if (cell.isMine) {
            this.endGame(false);
            return;
        }
        
        // 如果没有相邻地雷，递归揭示周围单元格
        if (cell.adjacentMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    const newX = x + dx;
                    const newY = y + dy;
                    
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        this.revealCell(newX, newY);
                    }
                }
            }
        }
    }

    // 开始游戏
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.startTime = Date.now();
        
        this.gameState.timerInterval = setInterval(() => {
            this.gameState.currentTime = Math.floor((Date.now() - this.gameState.startTime) / 1000);
            this.updateUI();
        }, 1000);
    }

    // 结束游戏
    endGame(isWin) {
        this.gameState.isGameOver = true;
        this.gameState.isWin = isWin;
        
        if (this.gameState.timerInterval) {
            clearInterval(this.gameState.timerInterval);
        }
        
        // 揭示所有地雷
        if (!isWin) {
            for (let y = 0; y < this.gameState.height; y++) {
                for (let x = 0; x < this.gameState.width; x++) {
                    const cell = this.gameState.board[y][x];
                    if (cell.isMine) {
                        cell.isRevealed = true;
                        this.updateCell(x, y);
                    }
                }
            }
        }
        
        this.updateUI();
    }

    // 检查胜利条件
    checkWinCondition() {
        const totalCells = this.gameState.width * this.gameState.height;
        const safeCells = totalCells - this.gameState.mines;
        
        if (this.gameState.cellsRevealed === safeCells) {
            this.endGame(true);
        }
    }

    // 更新UI
    updateUI() {
        const remainingMines = Math.max(0, this.gameState.mines - this.gameState.flagsPlaced);
        this.mineCountElement.textContent = remainingMines;
        this.timerElement.textContent = this.gameState.currentTime;
    }

    // 获取游戏结果
    getGameResult() {
        return {
            isWin: this.gameState.isWin,
            time: this.gameState.currentTime,
            difficulty: this.gameState.difficulty,
            perfect: this.gameState.wrongFlags === 0,
            luckyFirstClick: this.gameState.firstClick === false && this.gameState.cellsRevealed === 1,
            minesFound: this.gameState.flagsPlaced - this.gameState.wrongFlags
        };
    }

    // 获取游戏状态
    getGameState() {
        return { ...this.gameState };
    }

    // 显示所有单元格（用于调试）
    revealAllCells() {
        for (let y = 0; y < this.gameState.height; y++) {
            for (let x = 0; x < this.gameState.width; x++) {
                this.gameState.board[y][x].isRevealed = true;
                this.updateCell(x, y);
            }
        }
    }
}