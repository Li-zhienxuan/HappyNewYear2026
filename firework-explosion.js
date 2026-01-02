/**
 * 烟花爆炸效果 - 真实粒子物理模拟
 */

class FireworkExplosion {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isActive = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    /**
     * 创建爆炸效果
     */
    explode(x, y) {
        const particleCount = 150;
        const colors = [
            '#ff0040', '#ff0080', '#ff00bf', '#ff00ff',
            '#8000ff', '#4000ff', '#0040ff', '#0080ff',
            '#00ffff', '#00ff80', '#00ff40', '#80ff00',
            '#ffff00', '#ff8000', '#ff4000', '#ffffff'
        ];

        // 创建多个爆炸点
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            this.createExplosion(x + offsetX, y + offsetY, particleCount, colors);
        }

        if (!this.isActive) {
            this.isActive = true;
            this.animate();
        }
    }

    /**
     * 创建单个爆炸
     */
    createExplosion(x, y, count, colors) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const velocity = 5 + Math.random() * 10;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                alpha: 1,
                color: color,
                size: 2 + Math.random() * 3,
                decay: 0.015 + Math.random() * 0.01,
                gravity: 0.15
            });
        }
    }

    /**
     * 动画循环
     */
    animate() {
        if (!this.isActive && this.particles.length === 0) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            return;
        }

        // 使用半透明背景创建拖尾效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 更新和绘制粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // 更新位置
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.alpha -= p.decay;

            // 绘制粒子
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // 移除消失的粒子
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 检查是否还有粒子
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isActive = false;
        }
    }

    /**
     * 触发连续爆炸（用于按钮点击）
     */
    burst(x, y) {
        // 立即爆炸一次
        this.explode(x, y);

        // 后续自动触发几次
        let count = 0;
        const maxBursts = 5;
        const interval = setInterval(() => {
            const burstX = this.width * 0.2 + Math.random() * this.width * 0.6;
            const burstY = this.height * 0.2 + Math.random() * this.height * 0.6;
            this.explode(burstX, burstY);
            count++;

            if (count >= maxBursts) {
                clearInterval(interval);
            }
        }, 200);
    }

    /**
     * 清除所有粒子
     */
    clear() {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

// 导出到全局
window.FireworkExplosion = FireworkExplosion;
