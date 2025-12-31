// ===== 2026新年倒计时 - 庆祝效果模块 =====
// 实现跨年时刻的庆祝特效：烟花 + "2026"大字 + 祝福语 + 音乐

(function() {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        // 烟花配置
        fireworks: {
            count: 50,                          // 持续烟花数量
            particlesPerFirework: 100,          // 每个烟花的粒子数
            colors: [
                '#ff0000', '#ff4d4d',           // 红色系
                '#ffd700', '#ffec8b',           // 金色系
                '#00ff00', '#90ee90',           // 绿色系
                '#00ffff', '#87ceeb',           // 青色系
                '#ff00ff', '#da70d6',           // 紫色系
                '#ffffff'                       // 白色
            ],
            gravity: 0.08,                      // 重力
            friction: 0.99,                     // 摩擦力
            spread: 6                           // 扩散速度
        },

        // "2026"文字配置
        yearText: {
            chars: ['2', '0', '2', '6'],
            fontSize: '30vw',                   // 响应式字体大小
            animationDelay: 500                 // 每个字展开的间隔(ms)
        },

        // 祝福语配置
        blessings: {
            messages: [
                '新年快乐', '万事如意', '心想事成', '身体健康',
                '工作顺利', '财源滚滚', '阖家幸福', '好运连连',
                '步步高升', '恭喜发财', '吉祥如意', '福星高照',
                'Happy New Year', 'Good Luck', 'Best Wishes',
                'Good Fortune', 'Happy Holidays'
            ],
            count: 30,                          // 屏幕上同时显示的祝福语数量
            duration: 8000,                     // 每个祝福语动画持续时间(ms)
            interval: 300                       // 创建新祝福语的间隔(ms)
        },

        // 音乐配置
        music: {
            src: './assets/music/new-year-2026.mp3',
            volume: 0.5,
            fadeInDuration: 2000                // 淡入时间(ms)
        }
    };

    // ==================== 设备检测 ====================
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 根据设备调整配置
    if (isMobile()) {
        CONFIG.fireworks.count = 20;
        CONFIG.fireworks.particlesPerFirework = 50;
        CONFIG.blessings.count = 15;
        CONFIG.blessings.interval = 500;
    }

    // ==================== Canvas烟花系统 ====================
    class FireworksCanvas {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fireworks-canvas';
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.isRunning = false;

            this.setupCanvas();
            window.addEventListener('resize', () => this.setupCanvas());
        }

        setupCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        // 创建烟花爆炸
        createFirework() {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height * 0.6); // 上半部分
            const color = CONFIG.fireworks.colors[Math.floor(Math.random() * CONFIG.fireworks.colors.length)];

            // 创建爆炸粒子
            for (let i = 0; i < CONFIG.fireworks.particlesPerFirework; i++) {
                const angle = (Math.PI * 2 / CONFIG.fireworks.particlesPerFirework) * i;
                const velocity = Math.random() * CONFIG.fireworks.spread + 2;

                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    alpha: 1,
                    color: color,
                    decay: Math.random() * 0.015 + 0.01,
                    size: Math.random() * 3 + 2
                });
            }
        }

        // 动画循环
        animate() {
            if (!this.isRunning) return;

            // 清除画布（带拖尾效果）
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 更新和绘制粒子
            this.particles = this.particles.filter(p => p.alpha > 0);

            this.particles.forEach(p => {
                // 物理更新
                p.x += p.vx;
                p.y += p.vy;
                p.vy += CONFIG.fireworks.gravity;  // 重力
                p.vx *= CONFIG.fireworks.friction; // 摩擦力
                p.vy *= CONFIG.fireworks.friction;
                p.alpha -= p.decay;

                // 绘制粒子
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();

                // 添加发光效果
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = p.color;
            });

            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;

            // 随机创建新烟花
            if (Math.random() < 0.08) {
                this.createFirework();
            }

            requestAnimationFrame(() => this.animate());
        }

        start() {
            document.body.appendChild(this.canvas);
            this.isRunning = true;
            this.animate();

            // 初始爆发
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.createFirework(), i * 200);
            }
        }

        stop() {
            this.isRunning = false;
            this.canvas.remove();
        }
    }

    // ==================== "2026"文字展开效果 ====================
    class YearTextAnimation {
        constructor() {
            this.container = document.createElement('div');
            this.container.className = 'year-text-container';
        }

        start() {
            CONFIG.yearText.chars.forEach((char, index) => {
                const charEl = document.createElement('div');
                charEl.className = 'year-char';
                charEl.textContent = char;
                charEl.style.animationDelay = `${index * CONFIG.yearText.animationDelay}ms`;
                this.container.appendChild(charEl);
            });

            document.body.appendChild(this.container);
        }

        stop() {
            this.container.remove();
        }
    }

    // ==================== 满屏祝福语 ====================
    class BlessingsRain {
        constructor() {
            this.container = document.createElement('div');
            this.container.className = 'blessings-container';
            this.interval = null;
        }

        // 创建单个祝福语
        createBlessing() {
            const text = CONFIG.blessings.messages[Math.floor(Math.random() * CONFIG.blessings.messages.length)];
            const blessing = document.createElement('div');
            blessing.className = 'blessing-item';
            blessing.textContent = text;

            // 随机方向：0:上, 1:右, 2:下, 3:左
            const side = Math.floor(Math.random() * 4);

            // 起始位置
            const startPositions = [
                { left: Math.random() * 100 + '%', top: '-50px', transform: 'translateY(0)' },
                { left: '100vw', top: Math.random() * 100 + '%', transform: 'translateX(0)' },
                { left: Math.random() * 100 + '%', top: '100vh', transform: 'translateY(0)' },
                { left: '-200px', top: Math.random() * 100 + '%', transform: 'translateX(0)' }
            ];

            // 结束位置
            const endPositions = [
                { left: Math.random() * 100 + '%', top: '110vh', transform: 'translateY(0)' },
                { left: '-200px', top: Math.random() * 100 + '%', transform: 'translateX(0)' },
                { left: Math.random() * 100 + '%', top: '-50px', transform: 'translateY(0)' },
                { left: '100vw', top: Math.random() * 100 + '%', transform: 'translateX(0)' }
            ];

            // 随机颜色
            const colors = ['#ffd700', '#ff6b9d', '#00ffff', '#a58cff', '#ffffff', '#90ee90'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // 应用样式
            const startStyle = startPositions[side];
            const endStyle = endPositions[side];

            blessing.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 1 + 1}rem;
                color: ${color};
                opacity: 0;
                white-space: nowrap;
                text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
                left: ${startStyle.left};
                top: ${startStyle.top};
                ${startStyle.transform ? 'transform: ' + startStyle.transform : ''}
            `;

            // 添加自定义属性用于动画
            blessing.dataset.endLeft = endStyle.left;
            blessing.dataset.endTop = endStyle.top;
            if (endStyle.transform) {
                blessing.dataset.endTransform = endStyle.transform;
            }

            this.container.appendChild(blessing);

            // 触发动画
            requestAnimationFrame(() => {
                blessing.style.transition = `all ${CONFIG.blessings.duration}ms linear`;
                blessing.style.opacity = '0.8';
                blessing.style.left = endStyle.left;
                blessing.style.top = endStyle.top;
                if (endStyle.transform) {
                    blessing.style.transform = endStyle.transform;
                }
            });

            // 清理
            setTimeout(() => {
                blessing.style.opacity = '0';
                setTimeout(() => blessing.remove(), 500);
            }, CONFIG.blessings.duration - 500);
        }

        start() {
            document.body.appendChild(this.container);

            // 持续创建祝福语
            this.interval = setInterval(() => {
                this.createBlessing();
            }, CONFIG.blessings.interval);
        }

        stop() {
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.container.remove();
        }
    }

    // ==================== 背景音乐控制 ====================
    class BackgroundMusic {
        constructor() {
            this.audio = null;
            this.volume = CONFIG.music.volume;
        }

        async play() {
            try {
                this.audio = new Audio(CONFIG.music.src);
                this.audio.loop = true;
                this.audio.volume = 0;

                const playPromise = this.audio.play();

                if (playPromise !== undefined) {
                    await playPromise;

                    // 音量淡入
                    let volume = 0;
                    const fadeInStep = this.volume / (CONFIG.music.fadeInDuration / 50);

                    const fadeIn = setInterval(() => {
                        volume += fadeInStep;
                        if (volume >= this.volume) {
                            volume = this.volume;
                            clearInterval(fadeIn);
                        }
                        if (this.audio) {
                            this.audio.volume = volume;
                        }
                    }, 50);
                }

                console.log('✨ 音乐播放成功');
            } catch (error) {
                console.log('❌ 音频播放失败:', error.message);
                this.showMusicButton();
            }
        }

        showMusicButton() {
            const button = document.getElementById('musicControl');
            if (button) {
                button.style.display = 'block';
            }
        }

        toggle() {
            if (this.audio) {
                if (this.audio.paused) {
                    this.audio.play();
                    return false;
                } else {
                    this.audio.pause();
                    return true;
                }
            }
            return false;
        }

        stop() {
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }
        }
    }

    // ==================== 主控制器 ====================
    let fireworks = null;
    let yearText = null;
    let blessings = null;
    let music = null;

    // 导出的API
    const Celebration = {
        start: function() {
            console.log('🎆 启动2026新年庆祝效果');

            // 1. 启动Canvas烟花
            fireworks = new FireworksCanvas();
            fireworks.start();

            // 2. 延迟启动"2026"文字
            setTimeout(() => {
                yearText = new YearTextAnimation();
                yearText.start();
                console.log('✨ "2026"文字展开');
            }, 500);

            // 3. 延迟启动祝福语雨
            setTimeout(() => {
                blessings = new BlessingsRain();
                blessings.start();
                console.log('🎊 祝福语飘落开始');
            }, 1000);

            // 4. 延迟播放音乐
            setTimeout(() => {
                music = new BackgroundMusic();
                music.play();
                console.log('🎵 音乐播放尝试');
            }, 1500);

            // 5. 隐藏倒计时容器（平滑淡出）
            const countdownEl = document.querySelector('.countdown-container');
            if (countdownEl) {
                countdownEl.style.transition = 'opacity 1s ease-out';
                countdownEl.style.opacity = '0';
                setTimeout(() => {
                    countdownEl.style.display = 'none';
                }, 1000);
            }

            // 隐藏标题和进度条
            const elementsToHide = ['.header', '.progress-container', '.current-time-section'];
            elementsToHide.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) {
                    el.style.transition = 'opacity 1s ease-out';
                    el.style.opacity = '0';
                    setTimeout(() => {
                        el.style.display = 'none';
                    }, 1000);
                }
            });
        },

        stop: function() {
            if (fireworks) fireworks.stop();
            if (yearText) yearText.stop();
            if (blessings) blessings.stop();
            if (music) music.stop();
        },

        toggleMusic: function() {
            if (music) {
                const isPaused = music.toggle();
                const button = document.querySelector('#musicControl button');
                if (button) {
                    button.textContent = isPaused ? '🎵 播放音乐' : '🔇 暂停音乐';
                }
            }
        }
    };

    // 导出到全局
    window.Celebration = Celebration;

    console.log('🎉 2026新年庆祝模块已加载');

})();
