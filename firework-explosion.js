/**
 * 真实烟花升起 + 菊花型爆炸效果
 * 参考：真实烟花物理模拟
 */

class RealisticFirework {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rockets = []; // 烟花火箭（升起阶段）
        this.particles = []; // 爆炸粒子

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
     * 发射烟花
     */
    launch(startX, startY) {
        // 发射 5-7 枚烟花火箭
        const rocketCount = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < rocketCount; i++) {
            const offsetX = (Math.random() - 0.5) * 200;
            const targetY = this.height * 0.1 + Math.random() * 100;
            this.rockets.push(new FireworkRocket(startX + offsetX, startY, targetY));
        }

        // 开始动画循环
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    /**
     * 爆炸烟花
     */
    explode(x, y) {
        // 创建多层菊花型粒子
        const colors = this.getRandomColorScheme();

        // 内层：40 个粒子，快速、明亮
        for (let i = 0; i < 40; i++) {
            this.particles.push(new ExplosionParticle(x, y, 'inner', colors.inner));
        }

        // 中层：60 个粒子，中速、主要色彩
        for (let i = 0; i < 60; i++) {
            this.particles.push(new ExplosionParticle(x, y, 'middle', colors.middle));
        }

        // 外层：80 个粒子，慢速、半透明
        for (let i = 0; i < 80; i++) {
            this.particles.push(new ExplosionParticle(x, y, 'outer', colors.outer));
        }
    }

    /**
     * 获取随机颜色方案
     */
    getRandomColorScheme() {
        const schemes = [
            {
                inner: '#ffffff',
                middle: '#ff6b6b',
                outer: '#ee5a24'
            },
            {
                inner: '#ffffff',
                middle: '#ffd93d',
                outer: '#ff9f43'
            },
            {
                inner: '#ffffff',
                middle: '#a55eea',
                outer: '#8854d0'
            },
            {
                inner: '#ffffff',
                middle: '#26de81',
                outer: '#20bf6b'
            },
            {
                inner: '#ffffff',
                middle: '#fd79a8',
                outer: '#e84393'
            },
            {
                inner: '#ffffff',
                middle: '#ffeaa7',
                outer: '#fdcb6e'
            }
        ];
        return schemes[Math.floor(Math.random() * schemes.length)];
    }

    /**
     * 动画循环
     */
    animate() {
        // 完全清除画布（不保留拖尾，更真实）
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 更新和绘制火箭
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            const shouldExplode = rocket.update();
            rocket.draw(this.ctx);

            if (shouldExplode) {
                // 火箭到达目标高度，爆炸
                this.explode(rocket.x, rocket.y);
                this.rockets.splice(i, 1);
            }
        }

        // 更新和绘制粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.draw(this.ctx);

            // 移除消失的粒子
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 检查是否还有活动
        if (this.rockets.length > 0 || this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
        }
    }
}

/**
 * 烟花火箭（升起阶段）
 */
class FireworkRocket {
    constructor(startX, startY, targetY) {
        this.x = startX;
        this.y = startY;
        this.targetY = targetY;

        // 初始向上的速度
        this.vy = -15 - Math.random() * 5; // 向上，快速
        this.vx = (Math.random() - 0.5) * 2; // 轻微左右偏移

        this.trail = []; // 尾迹
        this.trailLength = 20;
        this.color = '#fff';

        // 加速效果（模拟火箭推进）
        this.acceleration = 0.3;
    }

    update() {
        // 记录尾迹
        this.trail.push({ x: this.x, y: this.y, alpha: 1, size: 3 });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 更新尾迹透明度和大小
        this.trail.forEach((point, index) => {
            point.alpha = (index / this.trail.length) * 0.8;
            point.size = (index / this.trail.length) * 3;
        });

        // 向上加速（模拟火箭推进）
        this.vy -= this.acceleration;

        // 应用速度
        this.x += this.vx;
        this.y += this.vy;

        // 空气阻力（逐渐减小横向速度）
        this.vx *= 0.99;

        // 检查是否到达目标高度或速度变为正数（开始下落）
        return this.vy > 0 || this.y <= this.targetY;
    }

    draw(ctx) {
        // 绘制尾迹（从大到小，从亮到暗）
        this.trail.forEach((point) => {
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = point.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 绘制火箭头部（最亮）
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 爆炸粒子（菊花型）
 */
class ExplosionParticle {
    constructor(x, y, layer, color) {
        this.x = x;
        this.y = y;
        this.layer = layer; // 'inner', 'middle', 'outer'
        this.color = color;

        // 根据层次设置属性
        if (layer === 'inner') {
            this.size = 2.5;
            this.speed = 12 + Math.random() * 6; // 更快
            this.decay = 0.018 + Math.random() * 0.01;
            this.gravity = 0.08; // 较小重力
        } else if (layer === 'middle') {
            this.size = 3.5;
            this.speed = 7 + Math.random() * 4;
            this.decay = 0.012 + Math.random() * 0.008;
            this.gravity = 0.12;
        } else {
            this.size = 4.5;
            this.speed = 4 + Math.random() * 3;
            this.decay = 0.008 + Math.random() * 0.005;
            this.gravity = 0.15;
        }

        // 菊花型：均匀分布的角度
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.alpha = 1;

        // 闪烁效果
        this.twinkle = Math.random() > 0.5;
        this.twinkleSpeed = 0.08 + Math.random() * 0.06;
        this.twinkleOffset = Math.random() * Math.PI * 2;

        // 初始爆发速度
        this.friction = 0.97; // 空气阻力
    }

    update() {
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 应用重力
        this.vy += this.gravity;

        // 应用空气阻力
        this.vx *= this.friction;
        this.vy *= this.friction;

        // 淡出
        this.alpha -= this.decay;

        // 闪烁效果（部分粒子）
        if (this.twinkle) {
            this.alpha += Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset) * 0.12;
            this.alpha = Math.max(0, Math.min(1, this.alpha)); // 限制范围
        }
    }

    draw(ctx) {
        const displayAlpha = Math.max(0, Math.min(1, this.alpha));

        ctx.save();
        ctx.globalAlpha = displayAlpha;
        ctx.fillStyle = this.color;

        // 不同层次不同的发光效果
        if (this.layer === 'inner') {
            ctx.shadowBlur = 25; // 内层更亮
        } else if (this.layer === 'middle') {
            ctx.shadowBlur = 18;
        } else {
            ctx.shadowBlur = 12;
        }

        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 导出到全局
window.RealisticFirework = RealisticFirework;
