/**
 * 网易云音乐嵌入模块
 * 支持自动播放检测和降级方案
 */

const NetEaseMusic = {
    // 音乐配置
    config: {
        // 倒计时期间音乐：轻柔的背景音乐
        countdown: {
            id: 'countdown-calm',
            // 使用 Pixabay 免版税音乐
            url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_106f9f8e41.mp3', // Inspirational Piano
            name: '倒计时音乐 - Inspirational Piano'
        },
        // 跨年时刻音乐：欢快的庆祝音乐
        celebration: {
            id: 'celebration-festive',
            // 使用 Pixabay 免版税音乐
            url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', // Auld Lang Syne
            name: '友谊地久天长 - Auld Lang Syne'
        }
    },

    // 当前状态
    state: {
        currentMode: 'countdown', // countdown | celebration
        isPlaying: false,
        method: null, // 'auto' | 'iframe' | 'fallback'
        audioElement: null,
        iframeElement: null,
        userInteracted: false  // ✨ 标记用户是否已交互
    },

    /**
     * 初始化
     */
    init() {
        console.log('🎵 初始化网易云音乐模块...');
        this.createUI();
        this.tryAutoPlay();
    },

    /**
     * 创建UI元素
     */
    createUI() {
        // 创建音乐控制面板
        const musicPanel = document.createElement('div');
        musicPanel.id = 'musicControl';
        musicPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-end;
        `;

        // 创建播放按钮
        const playButton = document.createElement('button');
        playButton.id = 'musicPlayButton';
        playButton.innerHTML = '🎵 播放音乐';
        playButton.style.cssText = `
            background: rgba(0, 245, 255, 0.2);
            border: 1px solid rgba(0, 245, 255, 0.4);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        playButton.onmouseover = () => {
            playButton.style.background = 'rgba(0, 245, 255, 0.3)';
            playButton.style.transform = 'scale(1.05)';
        };
        playButton.onmouseout = () => {
            playButton.style.background = 'rgba(0, 245, 255, 0.2)';
            playButton.style.transform = 'scale(1)';
        };
        playButton.onclick = () => this.toggleMusic();

        // 创建当前播放提示
        const nowPlaying = document.createElement('div');
        nowPlaying.id = 'nowPlaying';
        nowPlaying.style.cssText = `
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            text-align: right;
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        nowPlaying.textContent = `正在播放: ${this.config.countdown.name}`;

        musicPanel.appendChild(nowPlaying);
        musicPanel.appendChild(playButton);
        document.body.appendChild(musicPanel);
    },

    /**
     * 方案1：尝试自动播放（外链）- 增强版
     */
    tryAutoPlay() {
        console.log('🎵 方案1：尝试自动播放...');

        const audio = new Audio();
        audio.src = this.config.countdown.url; // 直接使用配置的URL
        audio.loop = true;
        audio.volume = 0.5;

        // ✨ 增强策略：监听用户首次交互后重试播放
        const handleFirstInteraction = () => {
            if (this.state.userInteracted) return; // 避免重复处理

            this.state.userInteracted = true;
            console.log('👆 检测到用户交互，重试自动播放...');

            // 移除事件监听
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);

            // 重新尝试播放
            audio.play()
                .then(() => {
                    console.log('✅ 用户交互后播放成功');
                    this.state.method = 'auto';
                    this.state.isPlaying = true;
                    this.state.audioElement = audio;
                    this.updateUI();
                })
                .catch((error) => {
                    console.warn('⚠️ 用户交互后仍失败:', error.message);
                    this.updateUI(); // 显示手动播放按钮
                });
        };

        // ✨ 注册用户交互监听器
        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });
        document.addEventListener('keydown', handleFirstInteraction, { once: true });

        // 尝试立即自动播放
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ 方案1成功：自动播放立即生效');
                    this.state.method = 'auto';
                    this.state.isPlaying = true;
                    this.state.audioElement = audio;
                    this.updateUI();

                    // ✨ 成功播放后移除交互监听器
                    document.removeEventListener('click', handleFirstInteraction);
                    document.removeEventListener('touchstart', handleFirstInteraction);
                    document.removeEventListener('keydown', handleFirstInteraction);
                })
                .catch((error) => {
                    console.warn('⚠️ 方案1失败，等待用户交互:', error.message);
                    // ✨ 不立即尝试iframe，而是等待用户交互
                    console.log('⏳ 等待用户点击/触摸页面后自动播放...');
                });
        }

        // 监听播放错误
        audio.addEventListener('error', () => {
            console.warn('⚠️ 音频加载错误，请检查网络连接');
            this.state.method = 'fallback';
            this.updateUI();
        });
    },

    /**
     * 方案2：iframe嵌入
     */
    tryIframe() {
        console.log('🎵 方案2：创建iframe嵌入...');

        // 创建隐藏的iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'netease-music-iframe';
        iframe.style.cssText = `
            position: fixed;
            bottom: -500px;
            left: 10px;
            width: 300px;
            height: 400px;
            border: none;
            z-index: -1;
        `;
        iframe.src = `//music.163.com/outchain/player?type=2&id=${this.config.countdown.id}&auto=1&height=66`;

        document.body.appendChild(iframe);
        this.state.iframeElement = iframe;

        // 检测iframe是否成功播放
        setTimeout(() => {
            // 由于跨域限制，无法直接检测iframe播放状态
            // 假设iframe已加载，更新UI提示用户
            console.log('⚠️ 方案2：iframe已创建，但无法确认播放状态');
            this.state.method = 'iframe';
            this.updateUI();
        }, 2000);
    },

    /**
     * 方案3：降级方案（用户手动提供MP3）
     */
    fallback() {
        console.log('⚠️ 方案3：降级方案，等待用户手动提供MP3');
        this.state.method = 'fallback';
        this.updateUI();
    },

    /**
     * 切换播放/暂停
     */
    toggleMusic() {
        if (this.state.method === 'auto' && this.state.audioElement) {
            if (this.state.isPlaying) {
                this.state.audioElement.pause();
                this.state.isPlaying = false;
            } else {
                this.state.audioElement.play();
                this.state.isPlaying = true;
            }
        } else if (this.state.method === 'iframe' && this.state.iframeElement) {
            // iframe无法控制播放，只能重新加载
            if (this.state.isPlaying) {
                this.state.iframeElement.remove();
                this.state.isPlaying = false;
            } else {
                document.body.appendChild(this.state.iframeElement);
                this.state.isPlaying = true;
            }
        }
        this.updateUI();
    },

    /**
     * 切换到跨年音乐
     */
    switchToCelebration() {
        console.log('🎉 切换到跨年音乐:', this.config.celebration.name);

        if (this.state.method === 'auto' && this.state.audioElement) {
            const wasPlaying = this.state.isPlaying;
            const oldSrc = this.state.audioElement.src;

            // 创建新的音频元素以平滑切换
            const newAudio = new Audio();
            newAudio.src = this.config.celebration.url;
            newAudio.loop = true;
            newAudio.volume = 0;

            newAudio.addEventListener('canplaythrough', () => {
                if (wasPlaying) {
                    newAudio.play();
                    // 淡入效果
                    const fadeIn = setInterval(() => {
                        if (newAudio.volume < 0.5) {
                            newAudio.volume += 0.05;
                        } else {
                            clearInterval(fadeIn);
                            // 停止旧音频
                            this.state.audioElement.pause();
                        }
                    }, 200);
                }

                // 更新音频元素引用
                this.state.audioElement = newAudio;
            });
        } else {
            // 如果没有播放，初始化新的音频
            const audio = new Audio();
            audio.src = this.config.celebration.url;
            audio.loop = true;
            audio.volume = 0.5;
            this.state.audioElement = audio;

            // 尝试播放
            audio.play().catch(e => {
                console.warn('⚠️ 跨年音乐自动播放失败:', e.message);
            });
        }

        this.state.currentMode = 'celebration';
        this.updateUI();
    },

    /**
     * 更新UI显示
     */
    updateUI() {
        const playButton = document.getElementById('musicPlayButton');
        const nowPlaying = document.getElementById('nowPlaying');

        if (!playButton || !nowPlaying) return;

        const currentConfig = this.state.currentMode === 'countdown'
            ? this.config.countdown
            : this.config.celebration;

        // 更新当前播放提示
        const methodText = {
            'auto': '自动播放',
            'iframe': 'iframe嵌入',
            'fallback': '等待MP3文件'
        };
        nowPlaying.textContent = `${currentConfig.name} (${methodText[this.state.method]})`;

        // 更新按钮文字
        if (this.state.isPlaying) {
            playButton.innerHTML = '⏸️ 暂停音乐';
        } else {
            playButton.innerHTML = '🎵 播放音乐';
        }
    },

    /**
     * 停止音乐
     */
    stop() {
        if (this.state.audioElement) {
            this.state.audioElement.pause();
            this.state.isPlaying = false;
        }
        if (this.state.iframeElement) {
            this.state.iframeElement.remove();
        }
        this.updateUI();
    }
};

// 导出到全局
window.NetEaseMusic = NetEaseMusic;
