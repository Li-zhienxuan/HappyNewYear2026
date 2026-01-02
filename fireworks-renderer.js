/*
Copyright © 2022 NianBroken. All rights reserved.
烟花模拟器渲染引擎 - 简化集成版

核心渲染循环和动画系统
*/

// ===== 全局变量 =====
let stageW, stageH;
let quality = 2; // QUALITY_NORMAL
const QUALITY_LOW = 1;
const QUALITY_NORMAL = 2;
const QUALITY_HIGH = 3;

const SKY_LIGHT_NONE = 0;
const SKY_LIGHT_DIM = 1;
const SKY_LIGHT_NORMAL = 2;

let simSpeed = 1;
let currentFrame = 0;

// 创建 Stage 实例（延迟初始化）
let trailsStage, mainStage, stages;

function initStages() {
    if (!trailsStage) {
        trailsStage = new Stage("trails-canvas");
        mainStage = new Stage("main-canvas");
        stages = [trailsStage, mainStage];
    }
}

// ===== 天空照亮效果 =====
const currentSkyColor = { r: 0, g: 0, b: 0 };
const targetSkyColor = { r: 0, g: 0, b: 0 };

function colorSky(speed) {
    const maxSkySaturation = SKY_LIGHT_NORMAL * 15;
    const maxStarCount = 500;
    let totalStarCount = 0;

    targetSkyColor.r = 0;
    targetSkyColor.g = 0;
    targetSkyColor.b = 0;

    // 统计所有星花并计算颜色
    COLOR_CODES.forEach((color) => {
        const tuple = {
            r: parseInt(color.substr(1, 2), 16),
            g: parseInt(color.substr(3, 2), 16),
            b: parseInt(color.substr(5, 2), 16)
        };
        const count = Star.active[color].length;
        totalStarCount += count;
        targetSkyColor.r += tuple.r * count;
        targetSkyColor.g += tuple.g * count;
        targetSkyColor.b += tuple.b * count;
    });

    const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
    const maxColorComponent = Math.max(1, targetSkyColor.r, targetSkyColor.g, targetSkyColor.b);

    targetSkyColor.r = (targetSkyColor.r / maxColorComponent) * maxSkySaturation * intensity;
    targetSkyColor.g = (targetSkyColor.g / maxColorComponent) * maxSkySaturation * intensity;
    targetSkyColor.b = (targetSkyColor.b / maxColorComponent) * maxSkySaturation * intensity;

    const colorChange = 10;
    currentSkyColor.r += ((targetSkyColor.r - currentSkyColor.r) / colorChange) * speed;
    currentSkyColor.g += ((targetSkyColor.g - currentSkyColor.g) / colorChange) * speed;
    currentSkyColor.b += ((targetSkyColor.b - currentSkyColor.b) / colorChange) * speed;

    // 更新背景色
    const canvasContainer = document.querySelector('.canvas-container') ||
                            document.getElementById('music-prompt') ||
                            document.body;
    if (canvasContainer) {
        canvasContainer.style.backgroundColor = `rgb(${currentSkyColor.r | 0}, ${currentSkyColor.g | 0}, ${currentSkyColor.b | 0})`;
    }
}

// ===== 核心更新循环 =====
function update(frameTime, lag) {
    const width = stageW;
    const height = stageH;
    const timeStep = frameTime * simSpeed;
    const speed = simSpeed * lag;

    currentFrame++;

    const starDrag = 1 - (1 - Star.airDrag) * speed;
    const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
    const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
    const gAcc = (timeStep / 1000) * GRAVITY;

    COLOR_CODES_W_INVIS.forEach((color) => {
        // 更新星花
        const stars = Star.active[color];
        for (let i = stars.length - 1; i >= 0; i--) {
            const star = stars[i];

            if (star.updateFrame === currentFrame) continue;
            star.updateFrame = currentFrame;

            star.life -= timeStep;

            if (star.life <= 0) {
                stars.splice(i, 1);
                Star.returnInstance(star);
            } else {
                const burnRate = Math.pow(star.life / star.fullLife, 0.5);
                const burnRateInverse = 1 - burnRate;

                star.prevX = star.x;
                star.prevY = star.y;
                star.x += star.speedX * speed;
                star.y += star.speedY * speed;

                if (!star.heavy) {
                    star.speedX *= starDrag;
                    star.speedY *= starDrag;
                } else {
                    star.speedX *= starDragHeavy;
                    star.speedY *= starDragHeavy;
                }

                star.speedY += gAcc;

                if (star.spinRadius) {
                    star.spinAngle += star.spinSpeed * speed;
                    star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                    star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                }

                if (star.sparkFreq) {
                    star.sparkTimer -= timeStep;
                    while (star.sparkTimer < 0) {
                        star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
                        Spark.add(
                            star.x, star.y,
                            star.sparkColor,
                            Math.random() * PI_2,
                            Math.random() * star.sparkSpeed * burnRate,
                            star.sparkLife * 0.8 + Math.random() * star.sparkLife * star.sparkLifeVariation
                        );
                    }
                }

                // 处理颜色过渡
                if (star.life < star.transitionTime) {
                    if (star.secondColor && !star.colorChanged) {
                        star.colorChanged = true;
                        const oldColor = star.color;
                        star.color = star.secondColor;
                        stars.splice(i, 1);
                        Star.active[star.secondColor].push(star);

                        if (star.secondColor === "_INVISIBLE_") {
                            star.sparkFreq = 0;
                        }
                    }
                }
            }
        }

        // 更新火花
        const sparks = Spark.active[color];
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            spark.life -= timeStep;

            if (spark.life <= 0) {
                sparks.splice(i, 1);
                Spark.returnInstance(spark);
            } else {
                spark.prevX = spark.x;
                spark.prevY = spark.y;
                spark.x += spark.speedX * speed;
                spark.y += spark.speedY * speed;
                spark.speedX *= sparkDrag;
                spark.speedY *= sparkDrag;
                spark.speedY += gAcc;
            }
        }
    });

    render(speed);
}

// ===== 渲染函数 =====
function render(speed) {
    const { dpr } = mainStage;
    const width = stageW;
    const height = stageH;

    const trailsCtx = trailsStage.ctx;
    const mainCtx = mainStage.ctx;

    // 照亮天空
    colorSky(speed);

    // 缩放上下文
    trailsCtx.scale(dpr, dpr);
    mainCtx.scale(dpr, dpr);

    // 清除尾迹画布（制造长曝光效果）
    trailsCtx.globalCompositeOperation = "source-over";
    trailsCtx.fillStyle = `rgba(0, 0, 0, 0.175 * speed)`;
    trailsCtx.fillRect(0, 0, width, height);

    mainCtx.clearRect(0, 0, width, height);

    // 绘制爆炸闪光
    while (BurstFlash.active.length) {
        const bf = BurstFlash.active.pop();
        const burstGradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
        burstGradient.addColorStop(0.024, "rgba(255, 255, 255, 1)");
        burstGradient.addColorStop(0.125, "rgba(255, 160, 20, 0.2)");
        burstGradient.addColorStop(0.32, "rgba(255, 140, 20, 0.11)");
        burstGradient.addColorStop(1, "rgba(255, 120, 20, 0)");

        trailsCtx.fillStyle = burstGradient;
        trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
        BurstFlash.returnInstance(bf);
    }

    // 使用 lighten 混合模式绘制尾迹
    trailsCtx.globalCompositeOperation = "lighten";

    // 绘制星花
    trailsCtx.lineWidth = 3;
    trailsCtx.lineCap = "round";
    mainCtx.strokeStyle = "#fff";
    mainCtx.lineWidth = 1;
    mainCtx.beginPath();

    COLOR_CODES.forEach((color) => {
        const stars = Star.active[color];
        trailsCtx.strokeStyle = color;
        trailsCtx.beginPath();

        stars.forEach((star) => {
            if (star.visible) {
                trailsCtx.lineWidth = star.size;
                trailsCtx.moveTo(star.x, star.y);
                trailsCtx.lineTo(star.prevX, star.prevY);
                mainCtx.moveTo(star.x, star.y);
                mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
            }
        });

        trailsCtx.stroke();
    });

    mainCtx.stroke();

    // 绘制火花
    trailsCtx.lineWidth = Spark.drawWidth;
    trailsCtx.lineCap = "butt";

    COLOR_CODES.forEach((color) => {
        const sparks = Spark.active[color];
        trailsCtx.strokeStyle = color;
        trailsCtx.beginPath();

        sparks.forEach((spark) => {
            trailsCtx.moveTo(spark.x, spark.y);
            trailsCtx.lineTo(spark.prevX, spark.prevY);
        });

        trailsCtx.stroke();
    });

    // 重置变换
    trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
    mainCtx.setTransform(1, 0, 0, 1, 0, 0);
}

// ===== 窗口大小调整 =====
function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const containerW = Math.min(w, 7680);
    const containerH = w <= 420 ? h : Math.min(h, 4320);

    stages.forEach((stage) => stage.resize(containerW, containerH));
    stageW = containerW;
    stageH = containerH;
}

// ===== 启动动画循环 =====
function startAnimationLoop() {
    let lastTime = 0;
    const ticker = (time) => {
        const frameTime = Math.min(time - lastTime, 100); // 限制最大帧时间
        lastTime = time;

        update(frameTime, 1); // lag = 1 表示正常速度

        requestAnimationFrame(ticker);
    };

    requestAnimationFrame(ticker);
}

// ===== 初始化 =====
function initFireworks() {
    console.log('🎆 初始化烟花模拟器...');

    // 先初始化 Stage
    initStages();

    handleResize();
    window.addEventListener('resize', handleResize);

    // 设置 Spark.drawWidth
    Spark.drawWidth = quality === QUALITY_HIGH ? 0.75 : 1;

    startAnimationLoop();

    console.log('✅ 烟花模拟器已启动');
}

// ===== 发射烟花 =====
function launchFirework() {
    console.log('🚀 发射烟花...');
    const shell = new Shell(crysanthemumShell(3)); // size = 3
    const x = 0.3 + Math.random() * 0.4; // 屏幕中间 30%-70% 区域
    const y = 0.3 + Math.random() * 0.4;
    shell.launch(x, y);
    console.log('✅ 烟花已发射');
}

// ===== 发射多枚烟花 =====
function launchMultipleFireworks(count = 5) {
    // 确保系统已初始化
    if (!trailsStage || !mainStage) {
        console.warn('⚠️ 烟花系统未初始化，先初始化...');
        initFireworks();
    }

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            launchFirework();
        }, i * 200);
    }
}

// 导出到全局
window.initFireworks = initFireworks;
window.launchFirework = launchFirework;
window.launchMultipleFireworks = launchMultipleFireworks;
window.trailsStage = trailsStage;
window.mainStage = mainStage;
