// ===== 2026新年倒计时 =====
// 精确到毫秒的实时倒计时

// 目标时间：2026年1月1日 00:00:00
const TARGET_DATE = new Date('2026-01-01T00:00:00').getTime();
const START_DATE = new Date('2025-01-01T00:00:00').getTime(); // 2025年开始

// DOM 元素
const elements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    milliseconds: document.getElementById('milliseconds'),
    progress: document.getElementById('progress'),
    progressText: document.getElementById('progressText'),
    currentTimeDisplay: document.getElementById('currentTimeDisplay'),
    message: document.getElementById('message')
};

// 格式化数字，确保两位/三位数
function padNumber(num, digits = 2) {
    return num.toString().padStart(digits, '0');
}

// 更新倒计时显示
function updateCountdown() {
    const now = Date.now();
    const difference = TARGET_DATE - now;

    // 检查是否已经到达2026年
    if (difference <= 0) {
        displayNewYear();
        return;
    }

    // 计算时间单位
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = difference % 1000;

    // 更新显示
    elements.days.textContent = padNumber(days, 3);
    elements.hours.textContent = padNumber(hours);
    elements.minutes.textContent = padNumber(minutes);
    elements.seconds.textContent = padNumber(seconds);
    elements.milliseconds.textContent = padNumber(milliseconds, 3);

    // 更新进度条（2025年已过百分比）
    updateProgress(now);

    // 更新当前时间显示
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

// 更新当前时间显示
function updateCurrentTime() {
    const now = new Date();
    const hours = padNumber(now.getHours());
    const minutes = padNumber(now.getMinutes());
    const seconds = padNumber(now.getSeconds());
    const milliseconds = padNumber(now.getMilliseconds(), 3);

    elements.currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// 新年到来时的显示
function displayNewYear() {
    document.body.classList.add('new-year-arrived');

    elements.days.textContent = '000';
    elements.hours.textContent = '00';
    elements.minutes.textContent = '00';
    elements.seconds.textContent = '00';
    elements.milliseconds.textContent = '000';

    elements.progress.style.width = '100%';
    elements.progressText.textContent = '2025年已过去 100%';

    // 更改祝福语
    elements.message.innerHTML = `
        <p class="message-text">🎉 2026新年快乐！🎉</p>
        <p class="message-text-sub">愿新的一年，所愿皆成真</p>
    `;

    // 触发烟花效果（可选）
    triggerFireworks();
}

// 简单的烟花效果（用粒子实现）
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

// 创建背景粒子效果（彩色粒子）
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 60; // 增加粒子数量

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        // 随机分配颜色：青色、粉色、金色
        const colorClass = Math.random() < 0.33 ? 'particle pink' :
                          Math.random() < 0.66 ? 'particle gold' : 'particle';
        particle.className = colorClass;

        const size = Math.random() * 6 + 2; // 稍微增大粒子
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 12 + 8; // 8-20秒
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

// 使用 requestAnimationFrame 实现流畅的毫秒级更新
let lastUpdate = 0;
const updateInterval = 16; // 约60fps

function animate(currentTime) {
    if (currentTime - lastUpdate >= updateInterval) {
        updateCountdown();
        lastUpdate = currentTime;
    }
    requestAnimationFrame(animate);
}

// 初始化
function init() {
    createParticles();
    updateCountdown(); // 立即执行一次
    requestAnimationFrame(animate); // 开始动画循环
}

// 页面加载完成后启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 添加页面可见性检测，节省资源
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时可以降低更新频率
        console.log('Countdown paused - page hidden');
    } else {
        // 页面可见时恢复正常更新
        console.log('Countdown resumed - page visible');
        updateCountdown();
    }
});
