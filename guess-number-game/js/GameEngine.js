// 游戏引擎 - GameEngine.js
class GameEngine {
    constructor() {
        this.gameState = null;
        this.timer = null;
        this.startTime = null;
    }
    
    // 初始化游戏
    initGame(mode, difficulty, customConfig = {}) {
        const config = configManager.getModeConfig(mode, difficulty);
        if (!config) {
            throw new Error(`无效的游戏模式或难度: ${mode}, ${difficulty}`);
        }
        
        let targetValue;
        
        // 根据模式生成目标值
        if (mode === "classic" || mode === "reverse" || mode === "dynamic") {
            targetValue = this.generateRandomNumber(config.range[0], config.range[1], config.useDecimals);
        } else if (mode === "multi") {
            targetValue = [];
            for (let i = 0; i < config.numberCount; i++) {
                targetValue.push(this.generateRandomNumber(config.range[0], config.range[1]));
            }
        } else if (mode === "math") {
            const originalValue = this.generateRandomNumber(1, 50);
            targetValue = this.applyMathOperation(originalValue, config.operation);
            // 保存原始值和运算类型，用于后续验证
            this.originalValue = originalValue;
            this.operation = config.operation;
        } else if (mode === "code") {
            targetValue = [];
            for (let i = 0; i < config.codeLength; i++) {
                targetValue.push(this.generateRandomNumber(config.numberRange[0], config.numberRange[1]));
            }
        }
        
        // 创建游戏状态
        this.gameState = {
            gameId: Date.now().toString(),
            mode,
            difficulty,
            targetValue,
            currentAttempts: 0,
            maxAttempts: config.maxAttempts,
            elapsedTime: 0,
            gameOver: false,
            win: false,
            guessHistory: [],
            hintsUsed: 0,
            maxHints: configManager.getUserSettings().hintSettings.maxHintsPerGame,
            specialRules: {
                changeProbability: config.changeProbability || 0
            }
        };
        
        // 开始计时
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.gameState.elapsedTime = Date.now() - this.startTime;
        }, 1000);
        
        return this.gameState;
    }
    
    // 生成随机数
    generateRandomNumber(min, max, useDecimals = false) {
        if (useDecimals) {
            return Math.round((Math.random() * (max - min) + min) * 10) / 10;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 应用数学运算
    applyMathOperation(value, operation) {
        switch (operation) {
            case "×2":
                return value * 2;
            case "×3":
                return value * 3;
            case "平方":
                return value * value;
            case "+10":
                return value + 10;
            case "-5":
                return value - 5;
            default:
                return value * 2;
        }
    }
    
    // 处理玩家猜测
    processGuess(guess) {
        if (!this.gameState || this.gameState.gameOver) {
            return { error: "游戏未开始或已结束" };
        }
        
        // 验证输入
        const validation = this.validateInput(guess, this.gameState.mode);
        if (!validation.valid) {
            return { error: validation.error };
        }
        
        const formattedGuess = validation.formattedInput;
        this.gameState.currentAttempts++;
        
        let feedback;
        let gameOver = false;
        let win = false;
        
        // 根据模式计算反馈
        if (this.gameState.mode === "classic") {
            feedback = this.processClassicGuess(formattedGuess);
        } else if (this.gameState.mode === "multi") {
            feedback = this.processMultiGuess(formattedGuess);
        } else if (this.gameState.mode === "math") {
            feedback = this.processMathGuess(formattedGuess);
        } else if (this.gameState.mode === "reverse") {
            feedback = this.processReverseGuess(formattedGuess);
        } else if (this.gameState.mode === "dynamic") {
            feedback = this.processDynamicGuess(formattedGuess);
        } else if (this.gameState.mode === "code") {
            feedback = this.processCodeGuess(formattedGuess);
        }
        
        // 检查是否达到最大尝试次数
        if (this.gameState.currentAttempts >= this.gameState.maxAttempts && !this.gameState.win) {
            this.gameState.gameOver = true;
            this.gameState.win = false;
            feedback += ` 游戏结束！正确答案是：${this.gameState.targetValue}`;
        }
        
        // 保存猜测记录
        this.gameState.guessHistory.push({
            guess: formattedGuess,
            feedback,
            timestamp: Date.now()
        });
        
        // 如果游戏结束，停止计时
        if (this.gameState.gameOver) {
            this.stopTimer();
        }
        
        return {
            gameState: this.gameState,
            feedback
        };
    }
    
    // 验证输入
    validateInput(guess, mode) {
        if (mode === "classic" || mode === "reverse" || mode === "dynamic" || mode === "math") {
            const num = parseFloat(guess);
            if (isNaN(num)) {
                return { valid: false, error: "请输入有效的数字" };
            }
            return { valid: true, formattedInput: num };
        } else if (mode === "multi") {
            if (!Array.isArray(guess)) {
                return { valid: false, error: "请输入数字数组" };
            }
            for (let num of guess) {
                if (isNaN(parseFloat(num))) {
                    return { valid: false, error: "请输入有效的数字" };
                }
            }
            return { valid: true, formattedInput: guess.map(num => parseFloat(num)) };
        } else if (mode === "code") {
            if (typeof guess !== "string" || guess.length !== this.gameState.targetValue.length) {
                return { valid: false, error: `请输入${this.gameState.targetValue.length}位数字密码` };
            }
            if (!/^\d+$/.test(guess)) {
                return { valid: false, error: "密码只能包含数字" };
            }
            return { valid: true, formattedInput: guess.split('').map(num => parseInt(num)) };
        }
        return { valid: false, error: "无效的游戏模式" };
    }
    
    // 处理经典模式猜测
    processClassicGuess(guess) {
        if (guess === this.gameState.targetValue) {
            this.gameState.gameOver = true;
            this.gameState.win = true;
            return "正确！";
        } else if (guess < this.gameState.targetValue) {
            return "太小了";
        } else {
            return "太大了";
        }
    }
    
    // 处理多数字模式猜测
    processMultiGuess(guess) {
        let feedback = "";
        let allCorrect = true;
        
        for (let i = 0; i < this.gameState.targetValue.length; i++) {
            if (guess[i] === this.gameState.targetValue[i]) {
                feedback += `数字${i + 1}正确；`;
            } else if (guess[i] < this.gameState.targetValue[i]) {
                feedback += `数字${i + 1}太小；`;
                allCorrect = false;
            } else {
                feedback += `数字${i + 1}太大；`;
                allCorrect = false;
            }
        }
        
        if (allCorrect) {
            this.gameState.gameOver = true;
            this.gameState.win = true;
            feedback = "全部正确！";
        }
        
        return feedback;
    }
    
    // 处理数学运算模式猜测
    processMathGuess(guess) {
        const calculatedValue = this.applyMathOperation(guess, this.operation);
        
        if (calculatedValue === this.gameState.targetValue) {
            this.gameState.gameOver = true;
            this.gameState.win = true;
            return "正确！运算结果匹配";
        } else if (calculatedValue < this.gameState.targetValue) {
            return "运算结果太小";
        } else {
            return "运算结果太大";
        }
    }
    
    // 处理反向提示模式猜测
    processReverseGuess(guess) {
        const difference = Math.abs(guess - this.gameState.targetValue);
        
        if (difference === 0) {
            this.gameState.gameOver = true;
            this.gameState.win = true;
            return "正确！";
        } else if (difference <= 10) {
            return `与目标值的差在10以内（差：${difference}）`;
        } else if (this.gameState.targetValue % guess === 0 || guess % this.gameState.targetValue === 0) {
            return "是目标值的约数";
        } else if (this.isPrime(difference)) {
            return "与目标值的差是质数";
        } else {
            return "没有任何特殊关系";
        }
    }
    
    // 检查是否为质数
    isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        
        let i = 5;
        while (i * i <= num) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
            i += 6;
        }
        return true;
    }
    
    // 处理动态目标模式猜测
    processDynamicGuess(guess) {
        // 随机改变目标值
        if (Math.random() < this.gameState.specialRules.changeProbability) {
            const changeAmount = this.generateRandomNumber(-5, 5);
            const config = configManager.getModeConfig(this.gameState.mode, this.gameState.difficulty);
            this.gameState.targetValue += changeAmount;
            this.gameState.targetValue = Math.max(config.range[0], Math.min(config.range[1], this.gameState.targetValue));
        }
        
        return this.processClassicGuess(guess);
    }
    
    // 处理密码破译模式猜测
    processCodeGuess(guess) {
        let positionCorrect = 0;
        let numberCorrect = 0;
        const matchedTarget = [];
        const matchedGuess = [];
        
        // 首先检查位置正确的
        for (let i = 0; i < this.gameState.targetValue.length; i++) {
            if (guess[i] === this.gameState.targetValue[i]) {
                positionCorrect++;
                matchedTarget.push(i);
                matchedGuess.push(i);
            }
        }
        
        // 检查数字正确但位置错误的
        for (let i = 0; i < this.gameState.targetValue.length; i++) {
            if (!matchedTarget.includes(i)) {
                for (let j = 0; j < guess.length; j++) {
                    if (!matchedGuess.includes(j) && guess[j] === this.gameState.targetValue[i]) {
                        numberCorrect++;
                        matchedTarget.push(i);
                        matchedGuess.push(j);
                        break;
                    }
                }
            }
        }
        
        // 生成详细反馈
        let feedback = `${positionCorrect}A${numberCorrect}B`;
        
        // 添加更直观的描述
        if (positionCorrect > 0 && numberCorrect > 0) {
            feedback += ` (${positionCorrect}个数字位置正确，${numberCorrect}个数字正确但位置错误)`;
        } else if (positionCorrect > 0) {
            feedback += ` (${positionCorrect}个数字位置完全正确)`;
        } else if (numberCorrect > 0) {
            feedback += ` (${numberCorrect}个数字正确但位置错误)`;
        } else {
            feedback += " (没有数字匹配)";
        }
        
        // 添加鼓励性提示
        if (positionCorrect === this.gameState.targetValue.length) {
            this.gameState.gameOver = true;
            this.gameState.win = true;
            feedback = `🎉 正确！密码是 ${this.gameState.targetValue.join('')}！`;
        } else if (positionCorrect > this.gameState.targetValue.length / 2) {
            feedback += " 💪 你快接近答案了！";
        } else if (numberCorrect > 0) {
            feedback += " 🔍 继续尝试，你已经找对了一些数字！";
        } else {
            feedback += " 🤔 再试一次，相信你能找到规律！";
        }
        
        return feedback;
    }
    
    // 获取提示
    getHint() {
        if (!this.gameState || this.gameState.gameOver) {
            return { error: "游戏未开始或已结束" };
        }
        
        if (this.gameState.hintsUsed >= this.gameState.maxHints) {
            return { error: "已用完所有提示" };
        }
        
        this.gameState.hintsUsed++;
        let hint;
        
        if (this.gameState.mode === "classic") {
            if (this.gameState.guessHistory.length === 0) {
                const config = configManager.getModeConfig(this.gameState.mode, this.gameState.difficulty);
                hint = `目标在 ${config.range[0]} 和 ${config.range[1]} 之间`;
            } else {
                const lastGuess = this.gameState.guessHistory[this.gameState.guessHistory.length - 1];
                if (lastGuess.feedback === "太小了") {
                    hint = `目标大于 ${lastGuess.guess}`;
                } else if (lastGuess.feedback === "太大了") {
                    hint = `目标小于 ${lastGuess.guess}`;
                } else {
                    hint = "目标值就是你上次猜测的数字";
                }
            }
        } else if (this.gameState.mode === "math") {
            hint = `目标 = 你的猜测 ${this.operation}`;
        } else if (this.gameState.mode === "reverse") {
            hint = `目标是${this.gameState.targetValue % 2 === 0 ? "偶数" : "奇数"}`;
        } else if (this.gameState.mode === "code") {
            // 随机提示一位数字
            const randomIndex = Math.floor(Math.random() * this.gameState.targetValue.length);
            hint = `第${randomIndex + 1}位数字是 ${this.gameState.targetValue[randomIndex]}`;
        } else {
            hint = "此模式暂无提示";
        }
        
        return { hint };
    }
    
    // 保存游戏状态
    saveGame() {
        if (this.gameState) {
            storageManager.saveCurrentGame(this.gameState);
            return true;
        }
        return false;
    }
    
    // 加载游戏
    loadGame(savedGameState) {
        this.gameState = savedGameState;
        this.startTime = Date.now() - this.gameState.elapsedTime;
        
        // 重启计时器
        this.timer = setInterval(() => {
            this.gameState.elapsedTime = Date.now() - this.startTime;
        }, 1000);
        
        return this.gameState;
    }
    
    // 停止计时器
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    // 获取游戏状态
    getGameState() {
        return this.gameState;
    }
    
    // 结束游戏
    endGame() {
        this.stopTimer();
        if (this.gameState) {
            this.gameState.gameOver = true;
        }
    }
    
    // 重置游戏
    reset() {
        this.stopTimer();
        this.gameState = null;
        this.startTime = null;
        this.originalValue = null;
        this.operation = null;
    }
}

// 全局实例
window.gameEngine = new GameEngine();