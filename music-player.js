/**
 * 简化音乐播放器 - 仅播放 China-E
 * 无UI界面，后台循环播放
 */

const MusicPlayer = {
    // 歌曲库 - 只有 China-E
    playlist: [
        {
            id: 1,
            title: 'China-E',
            artist: '中国风',
            url: 'https://music.163.com/song/media/outer/url?id=2713923553.mp3',
            lyrics: `China-E
中国风电子音乐
[纯音乐 - 感受中华文化的韵味]

🎵 传统乐器与现代电子的完美融合
🎶 让音乐带您领略中华之美`,
            cover: '🎊'
        }
    ],

    // 当前状态
    state: {
        currentSongIndex: 0,
        isPlaying: false,
        isSearching: false,
        searchQuery: '',
        filteredPlaylist: [],
        audioElement: null,
        lyricsScrollInterval: null,
        userInteracted: false
    },

    // DOM元素缓存（空）
    elements: {},

    /**
     * 初始化
     */
    init() {
        console.log('🎵 初始化音乐播放器（仅 China-E）...');
        this.state.filteredPlaylist = [...this.playlist];
        this.createUI();
        this.initAudio();
        this.loadSong(0);
        this.bindEvents(); // 在音频初始化后绑定事件
        this.tryAutoPlay();
    },

    /**
     * 创建UI（空实现）
     */
    createUI() {
        // 不创建任何UI元素
        console.log('🎵 音乐播放器已初始化（无UI模式）');
    },

    /**
     * 缓存DOM元素（空实现）
     */
    cacheElements() {
        // 不需要缓存任何元素
        this.elements = {};
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // ✨ 监听开始按钮的点击事件
        const button = document.getElementById('start-button');
        const prompt = document.getElementById('music-prompt');

        if (!button || !prompt) {
            console.warn('⚠️ 未找到必要的元素');
            return;
        }

        const handleStart = async () => {
            if (this.state.userInteracted) return;
            this.state.userInteracted = true;

            console.log('✅ 用户点击，发射烟花并播放音乐');

            // 初始化并启动烟花模拟器（如果还未初始化）
            if (typeof initFireworks === 'function' && !window.fireworksInitialized) {
                initFireworks();
                window.fireworksInitialized = true;
            }

            // 发射多枚烟花
            if (typeof launchMultipleFireworks === 'function') {
                launchMultipleFireworks(7); // 发射7枚烟花
            }

            // 立即播放音乐
            setTimeout(async () => {
                if (this.state.audioElement) {
                    try {
                        await this.state.audioElement.play();
                        this.state.isPlaying = true;
                        console.log('✅ 音乐播放成功');
                    } catch (e) {
                        console.warn('⚠️ 音乐播放失败:', e.message);
                    }
                }

                // 延迟隐藏提示
                setTimeout(() => {
                    prompt.classList.add('hidden');
                }, 3000);
            }, 500);
        };

        button.addEventListener('click', handleStart);

        // 也支持按空格键开始
        const handleKeyPress = (e) => {
            if (e.code === 'Space' && !this.state.userInteracted) {
                e.preventDefault();
                handleStart();
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        console.log('⏳ 等待用户点击"2026 蒸蚌"按钮...');
    },

    /**
     * 初始化音频
     */
    initAudio() {
        this.state.audioElement = new Audio();
        this.state.audioElement.volume = 0.3; // 降低音量作为背景音乐

        // 播放结束后重新播放（确保循环）
        this.state.audioElement.addEventListener('ended', () => {
            this.state.audioElement.currentTime = 0;
            this.state.audioElement.play().catch(e => {
                console.warn('循环播放失败:', e.message);
            });
        });

        // 播放错误处理
        this.state.audioElement.addEventListener('error', (e) => {
            console.warn('音频加载错误:', e);
        });
    },

    /**
     * 尝试自动播放
     */
    tryAutoPlay() {
        if (!this.state.audioElement) return;

        const playPromise = this.state.audioElement.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ 自动播放成功');
                    this.state.isPlaying = true;
                })
                .catch((error) => {
                    console.log('⏳ 等待用户交互后播放...');
                    this.state.isPlaying = false;
                });
        }
    },

    /**
     * 加载歌曲
     */
    loadSong(index) {
        if (index < 0 || index >= this.state.filteredPlaylist.length) return;

        const song = this.state.filteredPlaylist[index];
        this.state.currentSongIndex = index;

        if (this.state.audioElement) {
            this.state.audioElement.src = song.url;
            this.state.audioElement.loop = true;
            this.state.audioElement.load();
        }

        console.log(`🎵 加载歌曲: ${song.title} - ${song.artist}`);
    },

    /**
     * 播放指定歌曲
     */
    playSong(index) {
        this.loadSong(index);

        if (this.state.audioElement) {
            this.state.audioElement.play()
                .then(() => {
                    this.state.isPlaying = true;
                })
                .catch(e => console.warn('播放失败:', e));
        }
    },

    /**
     * 播放/暂停
     */
    togglePlay() {
        if (!this.state.audioElement) return;

        if (this.state.isPlaying) {
            this.state.audioElement.pause();
            this.state.isPlaying = false;
        } else {
            this.state.audioElement.play();
            this.state.isPlaying = true;
        }
    },

    /**
     * 上一首
     */
    playPrev() {
        // 只有一首歌，无需切换
        this.playSong(0);
    },

    /**
     * 下一首
     */
    playNext() {
        // 只有一首歌，循环播放
        this.playSong(0);
    },

    /**
     * 搜索（空实现）
     */
    handleSearch(e) {
        // 无UI，不需要搜索
    },

    /**
     * 清除搜索（空实现）
     */
    clearSearch() {
        // 无UI，不需要搜索
    },

    /**
     * 最小化（空实现）
     */
    minimize() {
        // 无UI
    },

    /**
     * 展开（空实现）
     */
    expand() {
        // 无UI
    },

    /**
     * 更新UI（空实现）
     */
    updateUI() {
        // 无UI
    },

    /**
     * 更新歌曲信息（空实现）
     */
    updateSongInfo(song) {
        // 无UI
    },

    /**
     * 更新歌词（空实现）
     */
    updateLyrics(lyrics) {
        // 无UI
    },

    /**
     * 渲染播放列表（空实现）
     */
    renderPlaylist() {
        // 无UI
    },

    /**
     * 更新播放列表高亮（空实现）
     */
    updatePlaylistHighlight() {
        // 无UI
    },

    /**
     * 切换到跨年庆祝模式
     */
    switchToCelebration() {
        console.log('🎉 继续播放 China-E...');
        // 已经在播放 China-E，无需切换
        // ✨ 不再尝试自动播放，避免 NotAllowedError
        // 如果用户没有交互，音乐不会播放
        if (!this.state.isPlaying && this.state.audioElement && this.state.userInteracted) {
            this.state.audioElement.play().catch(e => {
                console.warn('⚠️ 跨年时刻播放失败:', e.message);
            });
        }
    }
};

// 导出到全局
window.MusicPlayer = MusicPlayer;
