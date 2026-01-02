// ===== 2026新年倒计时 - 简洁版 =====

// 目标时间：2026年1月1日 00:00:00
const TARGET_DATE = new Date('2026-01-01T00:00:00').getTime();
const START_DATE = new Date('2025-01-01T00:00:00').getTime();

// Canvas时钟实例
let clocks = {
    hours: null,
    minutes: null,
    seconds: null,
    milliseconds: null
};

// DOM 元素
const elements = {
    message: document.getElementById('message')
};

// 上一次的值
let previousValues = {
    hours: -1,
    minutes: -1,
    seconds: '-1', // ✨ 使用字符串格式以匹配比较逻辑
    milliseconds: -1
};

// 状态
let isNewYear = false; // 是否已进入2026年

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
        clocks.hours = new FlipClock('canvas-hours');
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

// 更新倒计时（2026年到来前）
function updateCountdown() {
    const now = Date.now();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
        // 🎉 检测到跨年时刻！
        if (!isNewYear) {
            console.log('🎊 2026年到来了！');
            isNewYear = true;

            // 切换到跨年音乐
            if (typeof MusicPlayer !== 'undefined') {
                console.log('🎵 切换到跨年庆祝音乐...');
                MusicPlayer.switchToCelebration();
            }
        }

        updateForwardTimer();
        return;
    }

    // 计算时、分、秒、毫秒
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = difference % 1000;

    // 更新时钟显示
    if (clocks.hours) {
        // 小时：只在值改变时翻页
        if (hours !== previousValues.hours) {
            clocks.hours.update(hours);
            previousValues.hours = hours;
        }

        // 分钟：只在值改变时翻页
        if (minutes !== previousValues.minutes) {
            clocks.minutes.update(minutes);
            previousValues.minutes = minutes;
        }

        // 秒：只在值改变时翻页（格式化为两位数）
        const paddedSeconds = seconds.toString().padStart(2, '0');
        if (paddedSeconds !== previousValues.seconds) {
            clocks.seconds.update(seconds);
            previousValues.seconds = paddedSeconds;
        }

        // 毫秒：快速变化，不翻页（直接更新）
        const ms = Math.floor(milliseconds / 10);
        if (ms !== previousValues.milliseconds) {
            clocks.milliseconds.setValue(ms);
            previousValues.milliseconds = ms;
        }
    }
}

// 更新正计时（2026年到来后）
function updateForwardTimer() {
    const now = Date.now();
    const elapsed = now - TARGET_DATE;

    // 计算时、分、秒、毫秒
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    const milliseconds = elapsed % 1000;

    // 更新时钟显示
    if (clocks.hours) {
        // 小时：只在值改变时翻页
        if (hours !== previousValues.hours) {
            clocks.hours.update(hours);
            previousValues.hours = hours;
        }

        // 分钟：只在值改变时翻页
        if (minutes !== previousValues.minutes) {
            clocks.minutes.update(minutes);
            previousValues.minutes = minutes;
        }

        // 秒：只在值改变时翻页（格式化为两位数）
        const paddedSeconds = seconds.toString().padStart(2, '0');
        if (paddedSeconds !== previousValues.seconds) {
            clocks.seconds.update(seconds);
            previousValues.seconds = paddedSeconds;
        }

        // 毫秒：快速变化，不翻页（直接更新）
        const ms = Math.floor(milliseconds / 10);
        if (ms !== previousValues.milliseconds) {
            clocks.milliseconds.setValue(ms);
            previousValues.milliseconds = ms;
        }
    }
}

// 动画循环
function animate() {
    if (isNewYear) {
        updateForwardTimer();
    } else {
        updateCountdown();
    }
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

    // 启动烟花效果
    if (typeof Fireworks !== 'undefined') {
        const fireworks = new Fireworks();
        fireworks.start();
        console.log('🎊 祝福语效果已启动');
    }

    // ✨ 初始化高级音乐播放器
    if (typeof MusicPlayer !== 'undefined') {
        MusicPlayer.init();
        console.log('🎵 高级音乐播放器已初始化');
    } else {
        console.warn('⚠️ MusicPlayer模块未加载，音乐功能不可用');
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
        if (isNewYear) {
            updateForwardTimer();
        } else {
            updateCountdown();
        }
    }
});
