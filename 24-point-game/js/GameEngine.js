// 游戏引擎 - GameEngine.js
class GameEngine {
    constructor() {
        this.gameState = {
            gameId: null,
            mode: 'classic',
            difficulty: 'medium',
            level: 1,
            score: 0,
            currentNumbers: [],
            target: 24,
            elapsedTime: 0,
            remainingTime: 0,
            solvedCount: 0,
            totalRounds: 10,
            currentRound: 1,
            attempts: 0,
            hintsUsed: 0,
            win: false,
            gameOver: false,
            startTime: null,
            timerInterval: null,
            gameHistory: []
        };
        
        this.operations = ['+', '-', '*', '/'];
    }
    
    // 开始新游戏
    startNewGame(mode, difficulty) {
        this.resetGame();
        
        this.gameState.gameId = Date.now().toString();
        this.gameState.mode = mode;
        this.gameState.difficulty = difficulty;
        
        // 根据模式和难度设置游戏参数
        const modeConfig = configManager.getModeConfig(mode);
        const difficultyConfig = configManager.getDifficultyConfig(difficulty);
        
        this.gameState.totalRounds = modeConfig.rounds || 10;
        this.gameState.remainingTime = modeConfig.timePerRound || difficultyConfig.timeLimit;
        this.gameState.startTime = Date.now();
        
        // 生成第一个题目
        this.generateNewPuzzle();
        
        // 启动计时器
        this.startTimer();
        
        return this.gameState;
    }
    
    // 重置游戏
    resetGame() {
        this.stopTimer();
        this.gameState = {
            gameId: null,
            mode: 'classic',
            difficulty: 'medium',
            level: 1,
            score: 0,
            currentNumbers: [],
            target: 24,
            elapsedTime: 0,
            remainingTime: 0,
            solvedCount: 0,
            totalRounds: 10,
            currentRound: 1,
            attempts: 0,
            hintsUsed: 0,
            win: false,
            gameOver: false,
            startTime: null,
            timerInterval: null,
            gameHistory: []
        };
    }
    
    // 生成新的24点题目
    generateNewPuzzle() {
        const difficultyConfig = configManager.getDifficultyConfig(this.gameState.difficulty);
        const { numberRange } = difficultyConfig;
        
        let numbers = [];
        let hasSolution = false;
        let attempts = 0;
        const maxAttempts = 1000;
        
        while (!hasSolution && attempts < maxAttempts) {
            attempts++;
            
            // 生成4个随机数字
            numbers = [];
            for (let i = 0; i < 4; i++) {
                numbers.push(Math.floor(Math.random() * (numberRange[1] - numberRange[0] + 1)) + numberRange[0]);
            }
            
            // 检查是否有解
            if (this.hasSolution(numbers, 24)) {
                hasSolution = true;
            }
        }
        
        if (hasSolution) {
            this.gameState.currentNumbers = numbers;
            this.gameState.attempts = 0;
            this.gameState.gameHistory.push({
                round: this.gameState.currentRound,
                numbers: [...numbers],
                startTime: Date.now()
            });
        } else {
            // 如果多次尝试都没有解，使用固定的有解题
            this.gameState.currentNumbers = [3, 8, 3, 8]; // 经典的3,8,3,8
        }
        
        return this.gameState.currentNumbers;
    }
    
    // 检查给定数字是否可以通过四则运算得到24
    hasSolution(numbers, target) {
        // 递归检查所有可能的组合
        const permutations = this.getAllPermutations(numbers);
        
        for (let perm of permutations) {
            const results = this.calculateAllResults(perm);
            for (let result of results) {
                if (Math.abs(result - target) < 0.001) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 获取数组的所有排列
    getAllPermutations(arr) {
        if (arr.length === 1) return [arr];
        
        let permutations = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const remainingPermutations = this.getAllPermutations(remaining);
            
            for (let perm of remainingPermutations) {
                permutations.push([current, ...perm]);
            }
        }
        
        return permutations;
    }
    
    // 计算所有可能的结果
    calculateAllResults(numbers) {
        if (numbers.length === 1) return [numbers[0]];
        
        let results = [];
        
        // 分割数字数组
        for (let i = 1; i < numbers.length; i++) {
            const left = numbers.slice(0, i);
            const right = numbers.slice(i);
            
            // 递归计算左右两边的结果
            const leftResults = this.calculateAllResults(left);
            const rightResults = this.calculateAllResults(right);
            
            // 对左右结果应用所有运算
            for (let l of leftResults) {
                for (let r of rightResults) {
                    for (let op of this.operations) {
                        let result;
                        try {
                            result = this.calculate(l, r, op);
                            results.push(result);
                        } catch (e) {
                            // 忽略无效运算（如除零）
                            continue;
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    // 执行基本运算
    calculate(a, b, op) {
        switch (op) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '*':
                return a * b;
            case '/':
                if (b === 0) throw new Error('Division by zero');
                return a / b;
            default:
                throw new Error('Invalid operation');
        }
    }
    
    // 验证玩家的答案
    validateAnswer(expression) {
        this.gameState.attempts++;
        
        try {
            // 检查表达式是否使用了所有数字
            if (!this.checkExpressionUsesAllNumbers(expression, this.gameState.currentNumbers)) {
                return { valid: false, message: '请使用所有给出的数字', correct: false };
            }
            
            // 安全计算表达式结果
            const result = this.safeEval(expression);
            
            // 检查结果是否接近24（考虑浮点误差）
            if (Math.abs(result - this.gameState.target) < 0.001) {
                // 正确答案
                this.handleCorrectAnswer();
                return { valid: true, message: '正确！', correct: true, result: result };
            } else {
                // 错误答案
                return { valid: true, message: `错误，结果是 ${result.toFixed(2)}`, correct: false, result: result };
            }
        } catch (e) {
            // 表达式无效
            return { valid: false, message: '无效的表达式', correct: false };
        }
    }
    
    // 安全计算表达式
    safeEval(expression) {
        // 只允许数字、运算符和括号
        const validChars = /^[0-9+\-*/().\s]+$/;
        if (!validChars.test(expression)) {
            throw new Error('Invalid characters in expression');
        }
        
        // 替换除零的情况
        if (expression.includes('/0')) {
            throw new Error('Division by zero');
        }
        
        // 使用Function构造器进行安全计算
        return new Function('return ' + expression)();
    }
    
    // 检查表达式是否使用了所有数字
    checkExpressionUsesAllNumbers(expression, numbers) {
        // 提取表达式中的所有数字
        const exprNumbers = expression.match(/\d+/g).map(Number);
        
        // 检查数字数量是否匹配
        if (exprNumbers.length !== numbers.length) {
            return false;
        }
        
        // 检查每个数字是否都被使用（考虑重复数字）
        const sortedExpr = exprNumbers.sort((a, b) => a - b);
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        
        for (let i = 0; i < sortedExpr.length; i++) {
            if (sortedExpr[i] !== sortedNumbers[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    // 处理正确答案
    handleCorrectAnswer() {
        const modeConfig = configManager.getModeConfig(this.gameState.mode);
        const difficultyConfig = configManager.getDifficultyConfig(this.gameState.difficulty);
        
        // 计算得分
        let roundScore = modeConfig.pointsPerCorrect || difficultyConfig.pointsPerCorrect;
        
        // 时间奖励
        const timeBonus = Math.floor(this.gameState.remainingTime * 0.5);
        roundScore += timeBonus;
        
        // 尝试次数惩罚
        const attemptPenalty = Math.min(this.gameState.attempts * 2, 10);
        roundScore -= attemptPenalty;
        
        // 确保分数不为负
        roundScore = Math.max(roundScore, 0);
        
        this.gameState.score += roundScore;
        this.gameState.solvedCount++;
        
        // 检查是否完成所有回合
        if (this.gameState.currentRound >= this.gameState.totalRounds) {
            this.endGame(true);
        } else {
            // 进入下一回合
            this.gameState.currentRound++;
            this.gameState.level++;
            
            // 生成新题目
            this.generateNewPuzzle();
            
            // 重置回合相关参数
            this.gameState.attempts = 0;
            this.gameState.remainingTime = modeConfig.timePerRound || difficultyConfig.timeLimit;
        }
    }
    
    // 获取提示
    getHint() {
        this.gameState.hintsUsed++;
        
        // 简单提示：返回一种可能的运算组合
        const possibleSolutions = this.findPossibleSolutions(this.gameState.currentNumbers);
        if (possibleSolutions.length > 0) {
            const randomSolution = possibleSolutions[Math.floor(Math.random() * possibleSolutions.length)];
            return { hint: `尝试: ${randomSolution}`, type: 'operation' };
        }
        
        return { hint: '尝试不同的运算顺序', type: 'general' };
    }
    
    // 寻找可能的解决方案
    findPossibleSolutions(numbers) {
        const solutions = [];
        const permutations = this.getAllPermutations(numbers);
        
        for (let perm of permutations) {
            const results = this.calculateAllResultsWithExpressions(perm);
            for (let { result, expression } of results) {
                if (Math.abs(result - 24) < 0.001) {
                    solutions.push(expression);
                }
            }
        }
        
        // 去重
        return [...new Set(solutions)];
    }
    
    // 计算所有可能结果并返回表达式
    calculateAllResultsWithExpressions(numbers) {
        if (numbers.length === 1) {
            return [{ result: numbers[0], expression: numbers[0].toString() }];
        }
        
        let results = [];
        
        for (let i = 1; i < numbers.length; i++) {
            const left = numbers.slice(0, i);
            const right = numbers.slice(i);
            
            const leftResults = this.calculateAllResultsWithExpressions(left);
            const rightResults = this.calculateAllResultsWithExpressions(right);
            
            for (let l of leftResults) {
                for (let r of rightResults) {
                    for (let op of this.operations) {
                        try {
                            const result = this.calculate(l.result, r.result, op);
                            const expression = `(${l.expression})${op}(${r.expression})`;
                            results.push({ result, expression });
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    // 开始计时器
    startTimer() {
        this.gameState.timerInterval = setInterval(() => {
            this.gameState.elapsedTime = Date.now() - this.gameState.startTime;
            this.gameState.remainingTime--;
            
            // 检查时间是否用完
            if (this.gameState.remainingTime <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    // 停止计时器
    stopTimer() {
        if (this.gameState.timerInterval) {
            clearInterval(this.gameState.timerInterval);
            this.gameState.timerInterval = null;
        }
    }
    
    // 处理时间用完
    handleTimeUp() {
        // 检查是否完成所有回合
        if (this.gameState.currentRound >= this.gameState.totalRounds) {
            this.endGame(false);
        } else {
            // 进入下一回合
            this.gameState.currentRound++;
            this.gameState.level++;
            
            // 生成新题目
            this.generateNewPuzzle();
            
            // 重置回合相关参数
            this.gameState.attempts = 0;
            this.gameState.remainingTime = configManager.getModeConfig(this.gameState.mode).timePerRound || 
                                          configManager.getDifficultyConfig(this.gameState.difficulty).timeLimit;
        }
    }
    
    // 结束游戏
    endGame(win) {
        this.gameState.win = win;
        this.gameState.gameOver = true;
        this.stopTimer();
        
        // 保存游戏记录
        this.saveGameRecord();
        
        // 检查成就
        achievementSystem.checkAchievements(this.gameState);
        
        return this.gameState;
    }
    
    // 保存游戏记录
    saveGameRecord() {
        const gameRecord = {
            gameId: this.gameState.gameId,
            mode: this.gameState.mode,
            difficulty: this.gameState.difficulty,
            score: this.gameState.score,
            solvedCount: this.gameState.solvedCount,
            totalRounds: this.gameState.totalRounds,
            elapsedTime: this.gameState.elapsedTime,
            result: this.gameState.win ? "胜利" : "失败",
            timestamp: Date.now()
        };
        
        storageManager.saveGameRecord(gameRecord);
    }
    
    // 暂停游戏
    pauseGame() {
        this.stopTimer();
    }
    
    // 恢复游戏
    resumeGame() {
        if (!this.gameState.gameOver) {
            this.startTimer();
        }
    }
    
    // 获取当前游戏状态
    getGameState() {
        return { ...this.gameState };
    }
    
    // 退出游戏
    quitGame() {
        this.endGame(false);
    }
}

// 全局实例
window.gameEngine = new GameEngine();