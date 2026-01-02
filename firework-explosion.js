/**
 * 真实烟花升起 + 菊花型爆炸效果
 * 参考：NianBroken/Firework_Simulator + 真实烟花物理模拟
 */

class RealisticFirework {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rockets = []; // 烟花火箭（升起阶段）
        this.stars = []; // 爆炸星花（主粒子）
        this.sparks = []; // 火花（小粒子）
        this.burstFlashes = []; // 爆炸闪光

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
     * 爆炸烟花 - 使用球形粒子分布算法
     */
    explode(x, y) {
        const colors = this.getRandomColorScheme();
        const starCount = 180; // 总星花数

        // 使用球形分布算法（参考 createBurst 函数）
        const R = 0.5 * Math.sqrt(starCount / Math.PI);
        const C = 2 * R * Math.PI;
        const C_HALF = C / 2;

        for (let i = 0; i <= C_HALF; i++) {
            const ringAngle = (i / C_HALF) * (Math.PI / 2);
            const ringSize = Math.cos(ringAngle);
            const partsPerFullRing = C * ringSize;
            const angleInc = (Math.PI * 2) / partsPerFullRing;
            const angleOffset = Math.random() * angleInc;

            for (let j = 0; j < partsPerFullRing; j++) {
                const randomAngleOffset = Math.random() * angleInc * 0.33;
                const angle = angleInc * j + angleOffset + randomAngleOffset;

                // 根据距离中心的位置决定层次
                const distance = ringSize; // 0-1
                let layer, color;
                if (distance > 0.8) {
                    layer = 'outer';
                    color = colors.outer;
                } else if (distance > 0.4) {
                    layer = 'middle';
                    color = colors.middle;
                } else {
                    layer = 'inner';
                    color = colors.inner;
                }

                this.stars.push(new Star(x, y, angle, ringSize, color, layer));
            }
        }

        // 添加爆炸闪光效果
        this.burstFlashes.push({
            x: x,
            y: y,
            radius: 150,
            alpha: 1
        });
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
        // 使用更透明的方式清除，制造更长拖尾效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 绘制爆炸闪光（在底层）
        for (let i = this.burstFlashes.length - 1; i >= 0; i--) {
            const flash = this.burstFlashes[i];
            this.drawBurstFlash(flash);
            flash.alpha -= 0.08;
            if (flash.alpha <= 0) {
                this.burstFlashes.splice(i, 1);
            }
        }

        // 更新和绘制火箭
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            const shouldExplode = rocket.update();
            rocket.draw(this.ctx);

            if (shouldExplode) {
                this.explode(rocket.x, rocket.y);
                this.rockets.splice(i, 1);
            }
        }

        // 更新和绘制星花
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.update(this);
            star.draw(this.ctx);

            // 移除消失的星花
            if (star.alpha <= 0) {
                this.stars.splice(i, 1);
            }
        }

        // 更新和绘制火花
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            spark.update();
            spark.draw(this.ctx);

            // 移除消失的火花
            if (spark.alpha <= 0) {
                this.sparks.splice(i, 1);
            }
        }

        // 检查是否还有活动
        if (this.rockets.length > 0 || this.stars.length > 0 || this.sparks.length > 0 || this.burstFlashes.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
        }
    }

    /**
     * 绘制爆炸闪光
     */
    drawBurstFlash(flash) {
        if (flash.alpha <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = flash.alpha * 0.3;

        const gradient = this.ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 200, 100, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 150, 50, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 120, 20, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
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
        this.vy = -15 - Math.random() * 5;
        this.vx = (Math.random() - 0.5) * 2;

        this.trail = [];
        this.trailLength = 25;
        this.color = '#fff';

        // 加速效果（模拟火箭推进）
        this.acceleration = 0.25;
    }

    update() {
        // 记录尾迹
        this.trail.push({ x: this.x, y: this.y, alpha: 1, size: 2.5 });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 更新尾迹透明度和大小
        this.trail.forEach((point, index) => {
            const ratio = index / this.trail.length;
            point.alpha = ratio * 0.6;
            point.size = ratio * 2.5;
        });

        // 向上加速（模拟火箭推进）
        this.vy -= this.acceleration;

        // 应用速度
        this.x += this.vx;
        this.y += this.vy;

        // 空气阻力
        this.vx *= 0.99;

        // 检查是否到达目标高度或速度变为正数（开始下落）
        return this.vy > 0 || this.y <= this.targetY;
    }

    draw(ctx) {
        // 绘制尾迹
        this.trail.forEach((point, index) => {
            ctx.save();
            ctx.globalAlpha = point.alpha;

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

        // 绘制火箭头部
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
 * 星花（爆炸主粒子）- 使用参考代码的物理系统
 */
class Star {
    constructor(x, y, angle, speedMult, color, layer) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.layer = layer;

        // 根据层次设置属性
        if (layer === 'inner') {
            this.size = 2.5;
            this.speed = (15 + Math.random() * 8) * speedMult;
            this.life = 1200;
            this.heavy = false; // 普通粒子，空气阻力更大
        } else if (layer === 'middle') {
            this.size = 3;
            this.speed = (9 + Math.random() * 5) * speedMult;
            this.life = 1500;
            this.heavy = false;
        } else {
            this.size = 3.5;
            this.speed = (5 + Math.random() * 4) * speedMult;
            this.life = 1800;
            this.heavy = true; // 外层粒子更重，空气阻力更小
        }

        // 计算速度向量
        this.vx = Math.sin(angle) * this.speed;
        this.vy = Math.cos(angle) * this.speed;

        this.alpha = 1;
        this.prevX = x;
        this.prevY = y;

        // 空气阻力系数
        this.airDrag = this.heavy ? 0.992 : 0.98;

        // 重力
        this.gravity = 0.15;

        // 闪烁效果
        this.twinkle = Math.random() > 0.4;
        this.twinkleSpeed = 0.1 + Math.random() * 0.08;
        this.twinkleOffset = Math.random() * Math.PI * 2;

        // 火花发射（星花尾巴）
        this.sparkFreq = this.heavy ? 60 : 40; // 毫秒
        this.sparkTimer = Math.random() * this.sparkFreq;
        this.sparkColor = color;
        this.sparkSpeed = 0.5;
        this.sparkLife = 500;
    }

    update(firework) {
        // 记录上一帧位置（用于绘制拖尾）
        this.prevX = this.x;
        this.prevY = this.y;

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 应用重力
        this.vy += this.gravity;

        // 应用空气阻力
        this.vx *= this.airDrag;
        this.vy *= this.airDrag;

        // 减少生命值
        this.life -= 16; // 约60fps

        // 计算透明度（基于生命值）
        this.alpha = Math.max(0, this.life / 1800);

        // 闪烁效果
        if (this.twinkle) {
            const twinkleValue = Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset);
            this.alpha += twinkleValue * 0.15;
            this.alpha = Math.max(0, Math.min(1, this.alpha));
        }

        // 发射火花（星花尾巴）
        this.sparkTimer -= 16;
        while (this.sparkTimer < 0) {
            this.sparkTimer += this.sparkFreq;
            firework.sparks.push(new Spark(
                this.x,
                this.y,
                this.sparkColor,
                Math.random() * Math.PI * 2,
                this.sparkSpeed,
                this.sparkLife
            ));
        }
    }

    draw(ctx) {
        const displayAlpha = Math.max(0, Math.min(1, this.alpha));

        ctx.save();
        ctx.globalAlpha = displayAlpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';

        // 绘制拖尾（从上一帧位置到当前位置）
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // 发光效果
        ctx.shadowBlur = this.layer === 'inner' ? 25 : 18;
        ctx.shadowColor = this.color;

        ctx.restore();
    }
}

/**
 * 火花（小粒子）- 星花发射的火花
 */
class Spark {
    constructor(x, y, color, angle, speed, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;

        // 速度
        this.vx = Math.sin(angle) * speed;
        this.vy = Math.cos(angle) * speed;

        this.alpha = 1;
        this.airDrag = 0.9;
        this.gravity = 0.1;
        this.size = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.airDrag;
        this.vy *= this.airDrag;
        this.life -= 16;
        this.alpha = Math.max(0, this.life / this.maxLife);
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 导出到全局
window.RealisticFirework = RealisticFirework;
