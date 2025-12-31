/**
 * 烟花 + 祝福语效果
 */

class Fireworks {
    constructor() {
        this.blessings = [
            '新年快乐', '万事如意', '心想事成', '身体健康',
            '大吉大利', '财源广进', '幸福美满', '前程似锦',
            '步步高升', '吉祥如意', '福气满满', '好运连连',
            '恭喜发财', '年年有余', '团团圆圆', '平安喜乐',
            '金玉满堂', '福星高照', '喜气洋洋', '鹏程万里',
            '大展宏图', '事业有成', '家庭和睦', '笑口常开',
            '身体健康', '工作顺利', '学业进步', '生意兴隆',
            '财源滚滚', '福如东海', '寿比南山', '吉星高照',
            '花开富贵', '竹报平安', '三阳开泰', '五福临门',
            '六六大顺', '七星高照', '八方来财', '九九同心',
            '十全十美', '百事可乐', '千事吉祥', '万事如意',
            '2026', 'Happy New Year', 'Good Luck', 'Best Wishes',
            '新年新气象', '好运连连', '福气东来', '鸿运当头',
            '一帆风顺', '双喜临门', '三羊开泰', '四季平安',
            '五福临门', '六六大顺', '七星伴月', '八方来财'
        ];

        this.colors = [
            '#ff6b9d', '#ffd700', '#00ffff', '#a58cff',
            '#ff4757', '#2ed573', '#ffa502', '#ffffff',
            '#ff6348', '#7b68ee', '#00ced1', '#ff69b4'
        ];

        // 创建烟花Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // 创建祝福语容器
        this.blessingContainer = document.createElement('div');
        this.blessingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            overflow: hidden;
        `;
        document.body.appendChild(this.blessingContainer);

        this.fireworks = [];
        this.particles = [];
        this.isActive = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * 创建烟花
     */
    createFirework(x, y) {
        const firework = {
            x: x,
            y: this.canvas.height,
            targetY: y,
            speed: 8 + Math.random() * 4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            trail: []
        };
        this.fireworks.push(firework);
    }

    /**
     * 创建爆炸粒子
     */
    createParticles(x, y, color) {
        const particleCount = 60 + Math.random() * 40;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.01,
                gravity: 0.08,
                size: 2 + Math.random() * 2
            });
        }

        // 爆炸时同时创建祝福语
        this.createBlessing(x, y);
    }

    /**
     * 创建祝福语
     */
    createBlessing(x, y) {
        if (!this.isActive) return;

        const blessing = document.createElement('div');
        const text = this.blessings[Math.floor(Math.random() * this.blessings.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        // 将像素坐标转换为百分比
        const percentX = (x / this.canvas.width) * 100;
        const percentY = (y / this.canvas.height) * 100;

        const size = 1 + Math.random() * 1.5;
        const duration = 3 + Math.random() * 2;

        // 随机飘落方向
        const moveX = (Math.random() - 0.5) * 40; // -20% to 20%
        const moveY = (Math.random() - 0.5) * 40;

        blessing.textContent = text;
        blessing.style.cssText = `
            position: absolute;
            left: ${percentX}%;
            top: ${percentY}%;
            font-size: ${size}rem;
            color: ${color};
            font-weight: bold;
            white-space: nowrap;
            text-shadow: 0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color};
            transition: all ${duration}s ease-out;
            opacity: 1;
            transform: scale(0.5) translate(0, 0);
            will-change: transform, opacity;
        `;

        this.blessingContainer.appendChild(blessing);

        // 强制重绘
        blessing.offsetHeight;

        // 开始飘落动画
        setTimeout(() => {
            blessing.style.transform = `scale(1.2) translate(${moveX * (window.innerWidth / 100)}px, ${moveY * (window.innerHeight / 100)}px)`;
            blessing.style.opacity = '0';
        }, 50);

        // 移除
        setTimeout(() => {
            if (blessing.parentNode) {
                blessing.remove();
            }
        }, duration * 1000);
    }

    /**
     * 更新烟花
     */
    update() {
        // 更新上升的烟花
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.y -= fw.speed;
            fw.trail.push({ x: fw.x, y: fw.y });

            if (fw.trail.length > 15) {
                fw.trail.shift();
            }

            if (fw.y <= fw.targetY) {
                this.createParticles(fw.x, fw.y, fw.color);
                this.fireworks.splice(i, 1);
            }
        }

        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 绘制
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制上升的烟花轨迹
        this.fireworks.forEach(fw => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = fw.color;
            this.ctx.lineWidth = 3;

            if (fw.trail.length > 0) {
                this.ctx.moveTo(fw.trail[0].x, fw.trail[0].y);
                fw.trail.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
            }
            this.ctx.lineTo(fw.x, fw.y);
            this.ctx.stroke();
        });

        // 绘制粒子
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    /**
     * 动画循环
     */
    animate() {
        if (!this.isActive) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    /**
     * 随机发射烟花
     */
    launchRandom() {
        if (!this.isActive) return;

        const x = Math.random() * this.canvas.width;
        const y = 100 + Math.random() * (this.canvas.height * 0.4);
        this.createFirework(x, y);

        // 随机间隔发射下一个
        setTimeout(() => this.launchRandom(), 800 + Math.random() * 1200);
    }

    /**
     * 启动
     */
    start() {
        this.isActive = true;

        // 立即发射几个烟花
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.launchRandom(), i * 500);
        }

        // 持续发射烟花
        this.launchRandom();

        console.log('🎆 烟花+祝福语效果已启动');
    }

    /**
     * 停止
     */
    stop() {
        this.isActive = false;
        this.fireworks = [];
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.blessingContainer.innerHTML = '';
    }

    /**
     * 销毁
     */
    destroy() {
        this.stop();
        this.canvas.remove();
        this.blessingContainer.remove();
        window.removeEventListener('resize', () => this.resize());
    }
}

// 导出到全局
window.Fireworks = Fireworks;
