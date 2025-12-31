// ===== 2026新年倒计时 =====
// 真正的翻页时钟效果

// 目标时间：2026年1月1日 00:00:00
const TARGET_DATE = new Date('2026-01-01T00:00:00').getTime();
const START_DATE = new Date('2025-01-01T00:00:00').getTime();

// 存储上一个值的对象
let previousValues = {
    hours: null,
    minutes: null,
    seconds: null,
    milliseconds: null
};

// DOM 元素
const elements = {
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    milliseconds: document.getElementById('milliseconds'),
    progress: document.getElementById('progress'),
    progressText: document.getElementById('progressText'),
    currentTimeDisplay: document.getElementById('currentTimeDisplay'),
    message: document.getElementById('message')
};

// 格式化数字
function padNumber(num, digits = 2) {
    return num.toString().padStart(digits, '0');
}

// 更新翻页时钟
function updateFlipUnit(element, value, type) {
    const paddedValue = padNumber(value, type === 'milliseconds' ? 3 : 2);
    const flipCard = element.querySelector('.flip-card');

    if (!flipCard) return;

    const top = flipCard.querySelector('.top');
    const bottom = flipCard.querySelector('.bottom');
    const topNext = flipCard.querySelector('.top-next');
    const bottomNext = flipCard.querySelector('.bottom-next');

    const currentValue = flipCard.dataset.current;

    // 如果值改变了，触发翻页动画
    if (currentValue !== paddedValue) {
        // 设置下一个值
        topNext.setAttribute('data-value', paddedValue);
        bottomNext.setAttribute('data-value', paddedValue);

        // 添加翻页动画类
        flipCard.classList.add('flipping');

        // 动画完成后更新当前值
        setTimeout(() => {
            top.setAttribute('data-value', paddedValue);
            bottom.setAttribute('data-value', paddedValue);
            topNext.setAttribute('data-value', paddedValue);
            bottomNext.setAttribute('data-value', paddedValue);
            flipCard.classList.remove('flipping');
        }, 600);

        // 更新数据属性
        flipCard.dataset.current = paddedValue;
    } else if (currentValue === '00' || currentValue === '000') {
        // 初始化时设置值
        top.setAttribute('data-value', paddedValue);
        bottom.setAttribute('data-value', paddedValue);
        topNext.setAttribute('data-value', paddedValue);
        bottomNext.setAttribute('data-value', paddedValue);
        flipCard.dataset.current = paddedValue;
    }

    previousValues[type] = paddedValue;
}

// 直接更新毫秒（不翻页）
function updateMilliseconds(element, value) {
    const paddedValue = padNumber(value, 3);
    const flipCard = element.querySelector('.flip-card');

    if (!flipCard) return;

    const top = flipCard.querySelector('.top');
    const bottom = flipCard.querySelector('.bottom');
    const topNext = flipCard.querySelector('.top-next');
    const bottomNext = flipCard.querySelector('.bottom-next');

    // 直接更新所有部分，不触发动画
    top.setAttribute('data-value', paddedValue);
    bottom.setAttribute('data-value', paddedValue);
    topNext.setAttribute('data-value', paddedValue);
    bottomNext.setAttribute('data-value', paddedValue);
    flipCard.dataset.current = paddedValue;
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

    // 时分秒使用翻页动画
    updateFlipUnit(elements.hours, hours, 'hours');
    updateFlipUnit(elements.minutes, minutes, 'minutes');
    updateFlipUnit(elements.seconds, seconds, 'seconds');

    // 毫秒直接更新
    updateMilliseconds(elements.milliseconds, milliseconds);

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

    updateFlipUnit(elements.hours, 0, 'hours');
    updateFlipUnit(elements.minutes, 0, 'minutes');
    updateFlipUnit(elements.seconds, 0, 'seconds');
    updateMilliseconds(elements.milliseconds, 0);

    elements.progress.style.width = '100%';
    elements.progressText.textContent = '2025年已过去 100%';

    elements.message.innerHTML = `
        <p class="message-text">🎉 2026新年快乐！🎉</p>
        <p class="message-text-sub">愿新的一年，所愿皆成真</p>
    `;

    triggerFireworks();
}

// 烟花效果
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

// 初始化
function init() {
    createParticles();
    updateCountdown();
    requestAnimationFrame(animate);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面可见性检测
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Countdown paused');
    } else {
        console.log('Countdown resumed');
        updateCountdown();
    }
});

