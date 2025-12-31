// ===== 2026新年倒计时 =====
// Canvas翻页时钟实现

// 目标时间：2026年1月1日 00:00:00
const TARGET_DATE = new Date('2026-01-01T00:00:00').getTime();
const START_DATE = new Date('2025-01-01T00:00:00').getTime();

// Canvas翻页时钟实例
let canvasClocks = {
    hours: null,
    minutes: null,
    seconds: null,
    milliseconds: null
};

// DOM 元素
const elements = {
    progress: document.getElementById('progress'),
    progressText: document.getElementById('progressText'),
    currentTimeDisplay: document.getElementById('currentTimeDisplay'),
    message: document.getElementById('message')
};

// 上一次的值（用于判断是否需要更新）
let previousValues = {
    hours: -1,
    minutes: -1,
    seconds: -1,
    milliseconds: -1
};

// 格式化数字
function padNumber(num, digits = 2) {
    return num.toString().padStart(digits, '0');
}

// 初始化Canvas时钟
function initCanvasClocks() {
    // 等待CanvasFlipClock类加载
    if (typeof CanvasFlipClock === 'undefined') {
        console.error('CanvasFlipClock未加载，请确保flip-clock-canvas.js已引入');
        return false;
    }

    try {
        canvasClocks.hours = new CanvasFlipClock('canvas-hours', {
            fontSize: 660,
            fontFamily: 'Arial Black, Arial, sans-serif',
            showBackground: true,
            animationDuration: 600
        });

        canvasClocks.minutes = new CanvasFlipClock('canvas-minutes', {
            fontSize: 660,
            fontFamily: 'Arial Black, Arial, sans-serif',
            showBackground: true,
            animationDuration: 600
        });

        canvasClocks.seconds = new CanvasFlipClock('canvas-seconds', {
            fontSize: 660,
            fontFamily: 'Arial Black, Arial, sans-serif',
            showBackground: true,
            animationDuration: 600
        });

        canvasClocks.milliseconds = new CanvasFlipClock('canvas-milliseconds', {
            fontSize: 660,
            fontFamily: 'Arial Black, Arial, sans-serif',
            showBackground: true,
            animationDuration: 600
        });

        console.log('✅ Canvas时钟初始化成功');
        return true;
    } catch (error) {
        console.error('❌ Canvas时钟初始化失败:', error);
        return false;
    }
}

// 更新Canvas时钟
function updateCanvasClock(time) {
    // 只在值改变时触发翻页动画
    if (time.hours !== previousValues.hours) {
        canvasClocks.hours.update(time.hours);
        previousValues.hours = time.hours;
    }

    if (time.minutes !== previousValues.minutes) {
        canvasClocks.minutes.update(time.minutes);
        previousValues.minutes = time.minutes;
    }

    if (time.seconds !== previousValues.seconds) {
        canvasClocks.seconds.update(time.seconds);
        previousValues.seconds = time.seconds;
    }

    // 毫秒不需要翻页动画，每100ms更新一次显示
    const ms = Math.floor(time.milliseconds / 10);
    if (ms !== previousValues.milliseconds) {
        canvasClocks.milliseconds.setValue(ms);
        previousValues.milliseconds = ms;
    }
}

// 更新倒计时
function updateCountdown() {
    const now = Date.now();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
        displayNewYear();
        return;
    }

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = difference % 1000;

    const time = { hours, minutes, seconds, milliseconds };

    // 使用Canvas更新显示
    if (canvasClocks.hours) {
        updateCanvasClock(time);
    }

    updateProgress(now);
    updateCurrentTime();
}

// 更新进度条
function updateProgress(now) {
    const total2025 = TARGET_DATE - START_DATE;
    const elapsed = now - START_DATE;
    const percentage = Math.max(0, Math.min(100, (elapsed / total2025) * 100));

    elements.progress.style.width = `${percentage}%`;
    elements.progressText.textContent = `2025年已过去 ${percentage.toFixed(6)}%`;
}

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    const hours = padNumber(now.getHours());
    const minutes = padNumber(now.getMinutes());
    const seconds = padNumber(now.getSeconds());
    const milliseconds = padNumber(now.getMilliseconds(), 3);

    elements.currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// 新年到来
function displayNewYear() {
    document.body.classList.add('new-year-arrived');

    // 更新倒计时显示为00:00:00.000
    if (canvasClocks.hours) {
        canvasClocks.hours.setValue(0);
        canvasClocks.minutes.setValue(0);
        canvasClocks.seconds.setValue(0);
        canvasClocks.milliseconds.setValue(0);
    }

    elements.progress.style.width = '100%';
    elements.progressText.textContent = '2025年已过去 100%';

    // 隐藏祝福语（准备显示庆祝效果）
    elements.message.innerHTML = '';

    // 启动庆祝效果
    if (typeof Celebration !== 'undefined') {
        console.log('🎆 触发2026新年庆祝效果');
        Celebration.start();
    } else {
        // 降级方案：保留原有简单烟花
        console.log('⚠️ Celebration模块未加载，使用降级方案');
        triggerFireworks();
        elements.message.innerHTML = `
            <p class="message-text">🎉 2026新年快乐！🎉</p>
            <p class="message-text-sub">愿新的一年，所愿皆成真</p>
        `;
    }
}

// 烟花效果（降级方案）
function triggerFireworks() {
    const container = document.getElementById('particles');

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createFireworkParticle(container);
        }, i * 50);
    }
}

function createFireworkParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: radial-gradient(circle,
            hsl(${Math.random() * 360}, 100%, 50%),
            transparent);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: firework 1s ease-out forwards;
    `;
    container.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
}

// 添加烟花动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes firework {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 创建粒子
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const colorClass = Math.random() < 0.33 ? 'particle pink' :
                          Math.random() < 0.66 ? 'particle gold' : 'particle';
        particle.className = colorClass;

        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 12 + 8;
        const animationDelay = Math.random() * 15;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-duration: ${animationDuration}s;
            animation-delay: ${animationDelay}s;
        `;

        container.appendChild(particle);
    }
}

// 动画循环
let lastUpdate = 0;
const updateInterval = 16;

function animate(currentTime) {
    if (currentTime - lastUpdate >= updateInterval) {
        updateCountdown();
        lastUpdate = currentTime;
    }
    requestAnimationFrame(animate);
}

// 窗口大小改变时重新初始化Canvas
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (canvasClocks.hours) {
            Object.values(canvasClocks).forEach(clock => {
                if (clock && typeof clock.resize === 'function') {
                    clock.resize();
                }
            });
        }
    }, 250);
}

// 初始化
function init() {
    console.log('🚀 初始化Canvas倒计时...');

    // 初始化Canvas时钟
    const success = initCanvasClocks();

    if (!success) {
        console.error('❌ Canvas时钟初始化失败，倒计时无法启动');
        return;
    }

    // 创建背景粒子
    createParticles();

    // 初始更新
    updateCountdown();

    // 启动动画循环
    requestAnimationFrame(animate);

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    console.log('✅ Canvas倒计时启动成功');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面可见性检测
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ 倒计时暂停（页面隐藏）');
    } else {
        console.log('▶️ 倒计时恢复（页面可见）');
        updateCountdown();
    }
});
