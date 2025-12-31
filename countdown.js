// ===== 2026新年倒计时 - 简洁版 =====

// 目标时间：2026年1月1日 00:00:00
const TARGET_DATE = new Date('2026-01-01T00:00:00').getTime();
const START_DATE = new Date('2025-01-01T00:00:00').getTime();

// Canvas时钟实例
let clocks = {
    minutes: null,
    seconds: null,
    milliseconds: null
};

// DOM 元素
const elements = {
    progress: document.getElementById('progress'),
    progressText: document.getElementById('progressText'),
    message: document.getElementById('message')
};

// 上一次的值
let previousValues = {
    minutes: -1,
    seconds: -1,
    milliseconds: -1
};

// 格式化数字
function padNumber(num, digits = 2) {
    return num.toString().padStart(digits, '0');
}

// 初始化Canvas时钟
function initClocks() {
    if (typeof FlipClock === 'undefined') {
        console.error('FlipClock未加载');
        return false;
    }

    try {
        clocks.minutes = new FlipClock('canvas-minutes');
        clocks.seconds = new FlipClock('canvas-seconds');
        clocks.milliseconds = new FlipClock('canvas-milliseconds');

        console.log('✅ Canvas时钟初始化成功');
        return true;
    } catch (error) {
        console.error('❌ Canvas时钟初始化失败:', error);
        return false;
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

    // 计算分、秒、毫秒
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = difference % 1000;

    // 更新时钟显示
    if (clocks.minutes) {
        // 分钟：只在值改变时翻页
        if (minutes !== previousValues.minutes) {
            clocks.minutes.update(minutes);
            previousValues.minutes = minutes;
        }

        // 秒：只在值改变时翻页
        if (seconds !== previousValues.seconds) {
            clocks.seconds.update(seconds);
            previousValues.seconds = seconds;
        }

        // 毫秒：快速变化，不翻页（直接更新）
        const ms = Math.floor(milliseconds / 10);
        if (ms !== previousValues.milliseconds) {
            clocks.milliseconds.setValue(ms);
            previousValues.milliseconds = ms;
        }
    }

    updateProgress(now);
}

// 更新进度条
function updateProgress(now) {
    const total2025 = TARGET_DATE - START_DATE;
    const elapsed = now - START_DATE;
    const percentage = Math.max(0, Math.min(100, (elapsed / total2025) * 100));

    elements.progress.style.width = `${percentage}%`;
    elements.progressText.textContent = `2025年已过去 ${percentage.toFixed(6)}%`;
}

// 新年到来
function displayNewYear() {
    // 更新倒计时显示为00:00:00.000
    if (clocks.minutes) {
        clocks.minutes.setValue(0);
        clocks.seconds.setValue(0);
        clocks.milliseconds.setValue(0);
    }

    elements.progress.style.width = '100%';
    elements.progressText.textContent = '2025年已过去 100%';

    // 更新祝福语
    elements.message.innerHTML = '<p>🎉 2026新年快乐！🎉</p>';
}

// 动画循环
function animate() {
    updateCountdown();
    requestAnimationFrame(animate);
}

// 窗口大小改变时重新初始化Canvas
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (clocks.minutes) {
            Object.values(clocks).forEach(clock => {
                if (clock && typeof clock.resize === 'function') {
                    clock.resize();
                }
            });
        }
    }, 250);
}

// 初始化
function init() {
    console.log('🚀 初始化倒计时...');

    const success = initClocks();

    if (!success) {
        console.error('❌ 时钟初始化失败');
        return;
    }

    // 初始更新
    updateCountdown();

    // 启动动画循环
    animate();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    console.log('✅ 倒计时启动成功');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面可见性检测
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ 倒计时暂停');
    } else {
        console.log('▶️ 倒计时恢复');
        updateCountdown();
    }
});
