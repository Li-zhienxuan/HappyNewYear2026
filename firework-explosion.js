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
        // 使用半透明黑色清除，制造长拖尾效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
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
        this.trailLength = 25; // 更长的尾迹
        this.color = '#fff';

        // 加速效果（模拟火箭推进）
        this.acceleration = 0.25;
    }

    update() {
        // 记录尾迹（增加透明度渐变）
        this.trail.push({ x: this.x, y: this.y, alpha: 1, size: 2.5 });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 更新尾迹透明度和大小（更柔和的渐变）
        this.trail.forEach((point, index) => {
            const ratio = index / this.trail.length;
            point.alpha = ratio * 0.6; // 更柔和的尾迹
            point.size = ratio * 2.5;
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
        // 绘制尾迹（使用渐变颜色，从金黄色到白色）
        this.trail.forEach((point, index) => {
            ctx.save();
            ctx.globalAlpha = point.alpha;

            // 尾迹颜色渐变：金黄色 -> 橙色
            const ratio = index / this.trail.length;
            if (ratio > 0.5) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#ffd700';
            }

            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffd700';
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 绘制火箭头部（最亮的核心）
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 添加外发光环
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
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
            this.size = 2;
            this.speed = 15 + Math.random() * 8; // 更快，更猛烈
            this.decay = 0.022 + Math.random() * 0.012;
            this.gravity = 0.06; // 较小重力
        } else if (layer === 'middle') {
            this.size = 3;
            this.speed = 9 + Math.random() * 5;
            this.decay = 0.015 + Math.random() * 0.01;
            this.gravity = 0.1;
        } else {
            this.size = 4;
            this.speed = 5 + Math.random() * 4;
            this.decay = 0.01 + Math.random() * 0.008;
            this.gravity = 0.13;
        }

        // 菊花型：均匀分布的角度
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.alpha = 1;

        // 闪烁效果
        this.twinkle = Math.random() > 0.4; // 更多粒子闪烁
        this.twinkleSpeed = 0.1 + Math.random() * 0.08;
        this.twinkleOffset = Math.random() * Math.PI * 2;

        // 初始爆发速度
        this.friction = 0.96; // 更强的空气阻力

        // 颜色变化
        this.hue = this.colorToHue(color);
        this.colorShift = (Math.random() - 0.5) * 20; // 颜色偏移
    }

    colorToHue(color) {
        // 简化的颜色转换（用于真实感）
        const colorMap = {
            '#ffffff': 0,
            '#ff6b6b': 0,
            '#ee5a24': 15,
            '#ffd93d': 50,
            '#ff9f43': 35,
            '#a55eea': 280,
            '#8854d0': 270,
            '#26de81': 140,
            '#20bf6b': 150,
            '#fd79a8': 330,
            '#e84393': 320,
            '#ffeaa7': 48,
            '#fdcb6e': 45
        };
        return colorMap[color] || 0;
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
            const twinkleValue = Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset);
            this.alpha += twinkleValue * 0.15; // 更明显的闪烁
            this.alpha = Math.max(0, Math.min(1, this.alpha)); // 限制范围
        }
    }

    draw(ctx) {
        const displayAlpha = Math.max(0, Math.min(1, this.alpha));

        ctx.save();
        ctx.globalAlpha = displayAlpha;
        ctx.fillStyle = this.color;

        // 不同层次不同的发光效果（增强）
        if (this.layer === 'inner') {
            ctx.shadowBlur = 30; // 内层最亮
        } else if (this.layer === 'middle') {
            ctx.shadowBlur = 22;
        } else {
            ctx.shadowBlur = 15;
        }

        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 添加额外的闪烁光晕
        if (this.twinkle && displayAlpha > 0.5) {
            ctx.globalAlpha = displayAlpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// 导出到全局
window.RealisticFirework = RealisticFirework;
