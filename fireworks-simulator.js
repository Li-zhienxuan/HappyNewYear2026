/*
Copyright © 2022 NianBroken. All rights reserved.
本项目采用 Apache-2.0 许可证

烟花模拟器核心代码 - 简化集成版
提取自：https://github.com/NianBroken/Firework_Simulator

核心功能：
- Shell 类：烟花火箭（发射阶段）
- Star 类：爆炸星花（主粒子）
- Spark 类：火花（小粒子）
- BurstFlash：爆炸闪光效果
*/

// ===== 全局配置 =====
const GRAVITY = 0.9; // 重力加速度
const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI * 0.5;

// 颜色定义
const COLOR = {
    Red: "#ff0043",
    Green: "#14fc56",
    Blue: "#1e7fff",
    Purple: "#e60aff",
    Gold: "#ffbf36",
    White: "#ffffff",
};

const COLOR_CODES = Object.values(COLOR);
const COLOR_CODES_W_INVIS = [...COLOR_CODES, "_INVISIBLE_"];

// ===== Stage 类（Canvas管理）=====
class Stage {
    constructor(id) {
        this.canvas = document.getElementById(id);
        if (!this.canvas) {
            console.error(`Canvas with id "${id}" not found`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.dpr = 1;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.dpr = window.devicePixelRatio || 1;

        // 设置 Canvas 尺寸（考虑高清屏）
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;

        // 缩放上下文
        this.ctx.scale(this.dpr, this.dpr);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

// ===== 对象池管理 =====
function createParticleCollection() {
    const collection = {};
    COLOR_CODES_W_INVIS.forEach((color) => {
        collection[color] = [];
    });
    return collection;
}

// ===== Star 类（星花 - 主爆炸粒子）=====
const Star = {
    airDrag: 0.98,
    airDragHeavy: 0.992,
    active: createParticleCollection(),
    _pool: [],

    _new() {
        return {};
    },

    add(x, y, color, angle, speed, life, speedOffX, speedOffY, size = 3) {
        const instance = this._pool.pop() || this._new();
        instance.visible = true;
        instance.heavy = false;
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed + (speedOffX || 0);
        instance.speedY = Math.cos(angle) * speed + (speedOffY || 0);
        instance.life = life;
        instance.fullLife = life;
        instance.size = size;
        instance.spinAngle = Math.random() * PI_2;
        instance.spinSpeed = 0.8;
        instance.spinRadius = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.strobe = false;
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;

        this.active[color].push(instance);
        return instance;
    },

    returnInstance(instance) {
        if (instance.onDeath) {
            instance.onDeath(instance);
        }
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        this._pool.push(instance);
    }
};

// ===== Spark 类（火花 - 小粒子）=====
const Spark = {
    drawWidth: 1,
    airDrag: 0.9,
    active: createParticleCollection(),
    _pool: [],

    _new() {
        return {};
    },

    add(x, y, color, angle, speed, life) {
        const instance = this._pool.pop() || this._new();
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed;
        instance.speedY = Math.cos(angle) * speed;
        instance.life = life;
        this.active[color].push(instance);
        return instance;
    },

    returnInstance(instance) {
        this._pool.push(instance);
    }
};

// ===== BurstFlash 类（爆炸闪光）=====
const BurstFlash = {
    active: [],
    _pool: [],

    _new() {
        return {};
    },

    add(x, y, radius) {
        const instance = this._pool.pop() || this._new();
        instance.x = x;
        instance.y = y;
        instance.radius = radius;
        this.active.push(instance);
        return instance;
    },

    returnInstance(instance) {
        this._pool.push(instance);
    }
};

// ===== 辅助函数：球形粒子爆发 =====
function createBurst(count, particleFactory, startAngle = 0, arcLength = PI_2) {
    const R = 0.5 * Math.sqrt(count / Math.PI);
    const C = 2 * R * Math.PI;
    const C_HALF = C / 2;

    for (let i = 0; i <= C_HALF; i++) {
        const ringAngle = (i / C_HALF) * PI_HALF;
        const ringSize = Math.cos(ringAngle);
        const partsPerFullRing = C * ringSize;
        const partsPerArc = partsPerFullRing * (arcLength / PI_2);
        const angleInc = PI_2 / partsPerFullRing;
        const angleOffset = Math.random() * angleInc;

        for (let i = 0; i < partsPerArc; i++) {
            const randomAngleOffset = Math.random() * angleInc * 0.33;
            const angle = angleInc * i + angleOffset + randomAngleOffset;
            particleFactory(angle, ringSize);
        }
    }
}

// ===== Shell 类（烟花火箭）=====
class Shell {
    constructor(options) {
        Object.assign(this, options);
        this.starLifeVariation = options.starLifeVariation || 0.125;
        this.color = options.color || this.randomColor();
        this.glitterColor = options.glitterColor || this.color;

        // 设置默认星花数量
        if (!this.starCount) {
            const density = options.starDensity || 1;
            const scaledSize = this.spreadSize / 54;
            this.starCount = Math.max(6, scaledSize * scaledSize * density);
        }
    }

    randomColor() {
        return COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
    }

    /**
     * 发射烟花
     */
    launch(position, launchHeight) {
        if (!mainStage || !mainStage.width) {
            console.warn('⚠️ Stage 未初始化，无法发射烟花');
            return;
        }

        const width = mainStage.width;
        const height = mainStage.height;

        const hpad = 60;
        const vpad = 50;
        const minHeightPercent = 0.45;
        const minHeight = height - height * minHeightPercent;

        const launchX = position * (width - hpad * 2) + hpad;
        const launchY = height;
        const burstY = minHeight - launchHeight * (minHeight - vpad);
        const launchDistance = launchY - burstY;

        // 计算发射速度
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        // 创建彗星（火箭）
        const comet = Star.add(
            launchX,
            launchY,
            typeof this.color === "string" && this.color !== "random" ? this.color : COLOR.White,
            Math.PI,
            launchVelocity,
            launchVelocity * (this.horsetail ? 100 : 400)
        );

        comet.heavy = true;

        // 彗星火花尾巴
        comet.spinRadius = MyMath.random(0.32, 0.85);
        comet.sparkFreq = 32;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;

        if (this.color === "_INVISIBLE_") {
            comet.sparkColor = COLOR.Gold;
        }

        // 随机让彗星提前消失
        if (Math.random() > 0.4 && !this.horsetail) {
            comet.secondColor = "_INVISIBLE_";
            comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
        }

        // 爆炸回调
        comet.onDeath = (comet) => this.burst(comet.x, comet.y);
    }

    /**
     * 爆炸
     */
    burst(x, y) {
        const speed = this.spreadSize / 96;
        let color;
        let sparkFreq, sparkSpeed, sparkLife;
        let sparkLifeVariation = 0.25;

        // 设置 glitter 属性
        if (this.glitter === "light") {
            sparkFreq = 400;
            sparkSpeed = 0.3;
            sparkLife = 300;
            sparkLifeVariation = 2;
        } else if (this.glitter === "medium") {
            sparkFreq = 200;
            sparkSpeed = 0.44;
            sparkLife = 700;
            sparkLifeVariation = 2;
        } else if (this.glitter === "heavy") {
            sparkFreq = 80;
            sparkSpeed = 0.8;
            sparkLife = 1400;
            sparkLifeVariation = 2;
        }

        // 星花工厂函数
        const starFactory = (angle, speedMult) => {
            const standardInitialSpeed = this.spreadSize / 1800;

            const star = Star.add(
                x,
                y,
                color || this.randomColor(),
                angle,
                speedMult * speed,
                this.starLife + Math.random() * this.starLife * this.starLifeVariation,
                this.horsetail ? this.comet && this.comet.speedX : 0,
                this.horsetail ? this.comet && this.comet.speedY : -standardInitialSpeed
            );

            if (this.secondColor) {
                star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
                star.secondColor = this.secondColor;
            }

            if (this.glitter) {
                star.sparkFreq = sparkFreq;
                star.sparkSpeed = sparkSpeed;
                star.sparkLife = sparkLife;
                star.sparkLifeVariation = sparkLifeVariation;
                star.sparkColor = this.glitterColor;
                star.sparkTimer = Math.random() * star.sparkFreq;
            }
        };

        // 创建球形爆发
        if (typeof this.color === "string") {
            if (this.color === "random") {
                color = null;
            } else {
                color = this.color;
            }
            createBurst(this.starCount, starFactory);
        } else if (Array.isArray(this.color)) {
            // 双色烟花
            const start = Math.random() * Math.PI;
            const start2 = start + Math.PI;
            const arc = Math.PI;

            color = this.color[0];
            createBurst(this.starCount, starFactory, start, arc);

            color = this.color[1];
            createBurst(this.starCount, starFactory, start2, arc);
        }

        // 添加爆炸闪光
        BurstFlash.add(x, y, this.spreadSize / 4);
    }
}

// ===== 创建烟花工厂函数 =====
function crysanthemumShell(size = 1) {
    const glitter = Math.random() < 0.25;
    const singleColor = Math.random() < 0.72;
    const color = singleColor ? randomColorSimple() : [randomColorSimple(), randomColorSimple()];

    return {
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starDensity: 1.25,
        color,
        glitter: glitter ? "light" : "",
        glitterColor: COLOR.White,
    };
}

function randomColorSimple() {
    return COLOR_CODES[(Math.random() * COLOR_CODES.length) | 0];
}

// 导出到全局
window.Shell = Shell;
window.Star = Star;
window.Spark = Spark;
window.BurstFlash = BurstFlash;
window.createBurst = createBurst;
window.crysanthemumShell = crysanthemumShell;
window.COLOR = COLOR;
window.COLOR_CODES = COLOR_CODES;
window.GRAVITY = GRAVITY;
