/**
 * 烟花祝福语效果 - 满屏飘落
 */

class Fireworks {
    constructor() {
        this.blessings = [
            '新年快乐', '万事如意', '心想事成', '身体健康',
            '大吉大利', '财源广进', '幸福美满', '前程似锦',
            '步步高升', '吉祥如意', '福气满满', '好运连连',
            '恭喜发财', '年年有余', '团团圆圆', '平安喜乐',
            '2026', 'Happy New Year', 'Good Luck', 'Best Wishes'
        ];

        this.colors = [
            '#ff6b9d', '#ffd700', '#00ffff', '#a58cff',
            '#ff4757', '#2ed573', '#ffa502', '#ffffff'
        ];

        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);

        this.isActive = true;
        this.createInterval = null;
    }

    /**
     * 创建单个祝福语
     */
    createBlessing() {
        if (!this.isActive) return;

        const blessing = document.createElement('div');
        const text = this.blessings[Math.floor(Math.random() * this.blessings.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        // 随机起始位置和方向
        const side = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
        let startX, startY, moveX, moveY;

        switch(side) {
            case 0: // 从上往下
                startX = Math.random() * 100;
                startY = -5;
                moveX = (Math.random() - 0.5) * 20; // -10% to 10%
                moveY = 105; // 移动到屏幕下方
                break;
            case 1: // 从右往左
                startX = 105;
                startY = Math.random() * 100;
                moveX = -105;
                moveY = (Math.random() - 0.5) * 20;
                break;
            case 2: // 从下往上
                startX = Math.random() * 100;
                startY = 105;
                moveX = (Math.random() - 0.5) * 20;
                moveY = -105;
                break;
            case 3: // 从左往右
                startX = -5;
                startY = Math.random() * 100;
                moveX = 105;
                moveY = (Math.random() - 0.5) * 20;
                break;
        }

        const size = 1 + Math.random() * 1.5; // 1rem - 2.5rem
        const duration = 5 + Math.random() * 3; // 5-8秒

        blessing.textContent = text;
        blessing.style.cssText = `
            position: absolute;
            left: ${startX}%;
            top: ${startY}%;
            font-size: ${size}rem;
            color: ${color};
            font-weight: bold;
            white-space: nowrap;
            text-shadow: 0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color};
            transition: transform ${duration}s ease-out, opacity ${duration}s ease-in;
            opacity: 0;
            will-change: transform, opacity;
        `;

        this.container.appendChild(blessing);

        // 强制重绘
        blessing.offsetHeight;

        // 开始动画
        setTimeout(() => {
            blessing.style.opacity = '1';
            blessing.style.transform = `translate(${moveX * (window.innerWidth / 100)}px, ${moveY * (window.innerHeight / 100)}px) scale(1.5)`;
        }, 50);

        // 淡出并移除
        setTimeout(() => {
            blessing.style.opacity = '0';
        }, (duration - 1) * 1000);

        // 动画结束后移除
        setTimeout(() => {
            if (blessing.parentNode) {
                blessing.remove();
            }
        }, duration * 1000);
    }

    /**
     * 启动
     */
    start() {
        this.isActive = true;

        // 立即创建一些祝福语
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createBlessing(), i * 200);
        }

        // 持续创建祝福语（每400ms创建一个）
        this.createInterval = setInterval(() => {
            this.createBlessing();
        }, 400);

        console.log('🎊 祝福语效果已启动');
    }

    /**
     * 停止
     */
    stop() {
        this.isActive = false;
        if (this.createInterval) {
            clearInterval(this.createInterval);
            this.createInterval = null;
        }
        this.container.innerHTML = '';
    }

    /**
     * 销毁
     */
    destroy() {
        this.stop();
        this.container.remove();
    }
}

// 导出到全局
window.Fireworks = Fireworks;
