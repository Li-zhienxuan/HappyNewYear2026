/**
 * 烟花效果 - Canvas实现
 */

class Fireworks {
    constructor() {
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
            color: `hsl(${Math.random() * 360}, 100%, 60%)`,
            trail: []
        };
        this.fireworks.push(firework);
    }

    /**
     * 创建爆炸粒子
     */
    createParticles(x, y, color) {
        const particleCount = 50 + Math.random() * 50;
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
                decay: 0.01 + Math.random() * 0.02,
                gravity: 0.05
            });
        }
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

            if (fw.trail.length > 10) {
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

        // 绘制上升的烟花
        this.fireworks.forEach(fw => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = fw.color;
            this.ctx.lineWidth = 2;

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
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
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
        const y = 100 + Math.random() * (this.canvas.height / 2);
        this.createFirework(x, y);

        // 随机间隔发射下一个
        setTimeout(() => this.launchRandom(), 500 + Math.random() * 1500);
    }

    /**
     * 启动
     */
    start() {
        this.isActive = true;
        // 立即发射几个烟花
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.launchRandom(), i * 300);
        }
        // 持续发射
        this.launchRandom();
    }

    /**
     * 停止
     */
    stop() {
        this.isActive = false;
        this.fireworks = [];
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 销毁
     */
    destroy() {
        this.stop();
        this.canvas.remove();
        window.removeEventListener('resize', () => this.resize());
    }
}

// 导出到全局
window.Fireworks = Fireworks;
