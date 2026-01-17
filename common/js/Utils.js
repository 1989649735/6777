// 通用工具函数 - Utils.js
class Utils {
    // 时间格式化：将毫秒转换为分:秒格式
    static formatTime(milliseconds) {
        if (milliseconds === Infinity) return '00:00';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 随机数生成：生成指定范围内的随机整数
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 随机数生成：生成指定范围内的随机浮点数
    static getRandomFloat(min, max, precision = 2) {
        const random = Math.random() * (max - min) + min;
        return parseFloat(random.toFixed(precision));
    }

    // 随机数组元素
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // 随机打乱数组
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 深度克隆对象
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // 防抖函数
    static debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 检查是否为数字
    static isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // 检查是否为空对象
    static isEmptyObject(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    // 生成唯一ID
    static generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    // 格式化数字（添加千分位分隔符）
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 计算两个点之间的距离
    static getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 检查设备类型
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 检查是否为平板
    static isTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    }

    // 检查是否为PC
    static isPC() {
        return !Utils.isMobile() && !Utils.isTablet();
    }

    // 获取设备类型
    static getDeviceType() {
        if (Utils.isMobile()) return 'mobile';
        if (Utils.isTablet()) return 'tablet';
        return 'pc';
    }

    // 播放音效
    static playSound(soundName, volume = 0.5) {
        // 这里可以扩展为实际的音效播放逻辑
        // 例如：使用AudioContext或HTML5 Audio元素
        console.log(`播放音效: ${soundName}, 音量: ${volume}`);
    }

    // 显示消息提示
    static showMessage(message, type = 'info', duration = 3000) {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        // 添加样式
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateX(100%);
        `;
        
        // 根据类型设置背景色
        switch (type) {
            case 'success':
                messageElement.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                messageElement.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                messageElement.style.backgroundColor = '#ff9800';
                break;
            default:
                messageElement.style.backgroundColor = '#2196F3';
        }
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 显示动画
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动移除
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, duration);
    }

    // 检查是否支持localStorage
    static isLocalStorageSupported() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 获取浏览器视口尺寸
    static getViewportSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }

    // 平滑滚动到顶部
    static scrollToTop(duration = 500) {
        const start = window.pageYOffset;
        const startTime = performance.now();
        
        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const scrollY = easeInOutQuad(elapsed, start, -start, duration);
            window.scrollTo(0, scrollY);
            
            if (elapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
}
