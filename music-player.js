/**
 * 高级音乐播放器模块
 * 功能：切歌、歌词显示、搜索、播放列表
 */

const MusicPlayer = {
    // 歌曲库
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
        },
        {
            id: 2,
            title: 'Eight (_prod._SUGA)',
            artist: 'IU (아이유)',
            url: 'https://music.163.com/song/media/outer/url?id=1458789991.mp3',
            lyrics: `Eight (prod. SUGA) - IU

✨ 28岁的夜晚
🌙 在梦境与现实之间
💜 时光的印记

Can you hear me?
Can you see me?
飞翔的梦
永远不会终结

You and me
Eight (8)
在这特别的夜晚

愿这首歌
带给你
无尽的力量`,
            cover: '💜'
        },
        {
            id: 3,
            title: '밤편지 (Through the Night)',
            artist: 'IU (아이유)',
            url: 'https://music.163.com/song/media/outer/url?id=440977232.mp3',
            lyrics: `밤편지 (Through the Night) - IU

[Verse]
夜深了，想对你说的话
像星星一样闪烁

🌙 在这寂静的夜晚
💜 寄出一封夜之信
✨ 穿越黑暗的光

[Chorus]
愿这温柔的音乐
陪伴你度过
每一个孤独的夜晚

IU 的声音
是最温暖的慰藉`,
            cover: '🌙'
        },
        {
            id: 4,
            title: 'Love poem',
            artist: 'IU (아이유)',
            url: 'https://music.163.com/song/media/outer/url?id=1387531257.mp3',
            lyrics: `Love poem - IU

💜 给你的诗
🎹 旋律流淌在心间

💌 每一句歌词
都是爱的告白
✨ 每一个音符
都承载着思念

Love poem
写给最特别的你
愿这份爱
永远传递`,
            cover: '💌'
        },
        {
            id: 5,
            title: 'Blueming',
            artist: 'IU (아이유)',
            url: 'https://music.163.com/song/media/outer/url?id=1387531287.mp3',
            lyrics: `Blueming - IU

🌸 绽放的蓝色
💜 心动的瞬间

✨ 像花朵一样盛开
🎨 如画卷般美丽

You make me bloom
你让我绽放
在你的季节里

IU 的音乐花园
每一首都值得珍藏
愿这份美好
传递给你`,
            cover: '🌸'
        },
        {
            id: 6,
            title: 'Celebrity',
            artist: 'IU (아이유)',
            url: 'https://music.163.com/song/media/outer/url?id=186016.mp3',
            lyrics: `Celebrity - IU

✨ 我是 Celebrity
🌟 在这个平凡的世界里
💜 我也可以闪耀

🎬 你是我的导演
我是你的主角
一起创造
最美好的故事

IU 的自信
传递给你
愿你也成为
自己的 Celebrity`,
            cover: '⭐'
        },
        {
            id: 7,
            title: 'Coin',
            artist: 'IU (아이유)',
            url: 'https://music.163.com/song/media/outer/url?id=186017.mp3',
            lyrics: `Coin - IU

💫 就像投硬币
正面反面都是你
✨ 每一面都精彩

🎲 运气与努力
缺一不可
💜 你是最棒的

Coin coin
转动命运
愿好运
永远伴随你`,
            cover: '🪙'
        },
        {
            id: 8,
            title: '新年快乐',
            artist: '喜庆祝福',
            url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
            lyrics: `新年快乐

🎊 恭喜发财，红包拿来
🧨 岁岁平安，年年有余
🏮 祝你新年快乐
✨ 万事如意，心想事成

[Chorus]
新年好呀，新年好呀
祝贺大家新年好
我们唱歌，我们跳舞
祝贺大家新年好

🎆 愿新的一年
   带给你无尽的欢乐
🎇 愿新的一年
   实现你所有的梦想

Happy New Year!
新年快乐！`,
            cover: '🎆'
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

    // DOM元素缓存
    elements: {},

    /**
     * 初始化播放器
     */
    init() {
        console.log('🎵 初始化高级音乐播放器...');
        this.state.filteredPlaylist = [...this.playlist];
        this.createUI();
        this.bindEvents();
        this.initAudio();

        // 默认播放 China-E
        const chinaEIndex = this.playlist.findIndex(song => song.title === 'China-E');
        if (chinaEIndex !== -1) {
            this.state.currentSongIndex = chinaEIndex;
        }

        this.loadSong(this.state.currentSongIndex);
        this.tryAutoPlay();
    },

    /**
     * 创建UI
     */
    createUI() {
        // 创建播放器容器
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player-container';
        playerContainer.innerHTML = `
            <div class="player-panel" id="player-panel">
                <!-- 最小化按钮 -->
                <div class="player-minimized" id="player-minimized">
                    <div class="mini-info">
                        <span class="mini-cover" id="mini-cover">🎵</span>
                        <span class="mini-title" id="mini-title">加载中...</span>
                        <span class="mini-status" id="mini-status">⏸️</span>
                    </div>
                </div>

                <!-- 完整播放器面板 -->
                <div class="player-full" id="player-full">
                    <!-- 头部 -->
                    <div class="player-header">
                        <h3>🎵 音乐播放器</h3>
                        <button class="btn-minimize" id="btn-minimize" title="最小化">➖</button>
                    </div>

                    <!-- 搜索框 -->
                    <div class="search-box">
                        <input type="text" id="search-input" placeholder="🔍 搜索歌曲或歌词...">
                        <button class="btn-clear" id="btn-clear-search" style="display:none;">✖️</button>
                    </div>

                    <!-- 歌曲信息 -->
                    <div class="song-info">
                        <div class="song-cover" id="song-cover">🎵</div>
                        <div class="song-details">
                            <div class="song-title" id="song-title">加载中...</div>
                            <div class="song-artist" id="song-artist">...</div>
                        </div>
                    </div>

                    <!-- 歌词区域 -->
                    <div class="lyrics-container" id="lyrics-container">
                        <div class="lyrics-content" id="lyrics-content">
                            <div class="lyrics-placeholder">点击播放查看歌词</div>
                        </div>
                    </div>

                    <!-- 控制按钮 -->
                    <div class="controls">
                        <button class="btn-control" id="btn-prev" title="上一首">⏮️</button>
                        <button class="btn-control btn-play" id="btn-play" title="播放/暂停">▶️</button>
                        <button class="btn-control" id="btn-next" title="下一首">⏭️</button>
                    </div>

                    <!-- 播放列表 -->
                    <div class="playlist-container">
                        <div class="playlist-header">📋 播放列表 (<span id="playlist-count">0</span>首)</div>
                        <div class="playlist" id="playlist">
                            <!-- 动态生成 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(playerContainer);
        this.cacheElements();
        this.renderPlaylist();
    },

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        this.elements = {
            container: document.getElementById('music-player-container'),
            panel: document.getElementById('player-panel'),
            minimized: document.getElementById('player-minimized'),
            full: document.getElementById('player-full'),
            miniCover: document.getElementById('mini-cover'),
            miniTitle: document.getElementById('mini-title'),
            miniStatus: document.getElementById('mini-status'),
            btnMinimize: document.getElementById('btn-minimize'),
            searchInput: document.getElementById('search-input'),
            btnClearSearch: document.getElementById('btn-clear-search'),
            songCover: document.getElementById('song-cover'),
            songTitle: document.getElementById('song-title'),
            songArtist: document.getElementById('song-artist'),
            lyricsContent: document.getElementById('lyrics-content'),
            btnPlay: document.getElementById('btn-play'),
            btnPrev: document.getElementById('btn-prev'),
            btnNext: document.getElementById('btn-next'),
            playlist: document.getElementById('playlist'),
            playlistCount: document.getElementById('playlist-count')
        };
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 最小化/展开
        this.elements.minimized.addEventListener('click', () => this.expand());
        this.elements.btnMinimize.addEventListener('click', () => this.minimize());

        // 搜索
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.elements.btnClearSearch.addEventListener('click', () => this.clearSearch());

        // 播放控制
        this.elements.btnPlay.addEventListener('click', () => this.togglePlay());
        this.elements.btnPrev.addEventListener('click', () => this.playPrev());
        this.elements.btnNext.addEventListener('click', () => this.playNext());

        // 全局点击交互
        const handleInteraction = () => {
            if (!this.state.userInteracted) {
                this.state.userInteracted = true;
                if (!this.state.isPlaying && this.state.audioElement) {
                    this.state.audioElement.play().then(() => {
                        this.state.isPlaying = true;
                        this.updateUI();
                    }).catch(e => {
                        console.warn('自动播放失败:', e.message);
                    });
                }
            }
        };

        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });
    },

    /**
     * 初始化音频
     */
    initAudio() {
        this.state.audioElement = new Audio();
        this.state.audioElement.volume = 0.5;

        // 播放结束自动下一首
        this.state.audioElement.addEventListener('ended', () => {
            this.playNext();
        });

        // 播放错误处理
        this.state.audioElement.addEventListener('error', (e) => {
            console.warn('音频加载错误:', e);
            this.updateUI();
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
                    this.updateUI();
                })
                .catch((error) => {
                    console.log('⏳ 等待用户交互后播放...');
                    this.state.isPlaying = false;
                    this.updateUI();
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
            this.state.audioElement.load();
        }

        this.updateSongInfo(song);
        this.updateLyrics(song.lyrics);
        this.updatePlaylistHighlight();

        console.log(`🎵 加载歌曲: ${song.title} - ${song.artist}`);
    },

    /**
     * 更新歌曲信息
     */
    updateSongInfo(song) {
        this.elements.songCover.textContent = song.cover;
        this.elements.songTitle.textContent = song.title;
        this.elements.songArtist.textContent = song.artist;

        this.elements.miniCover.textContent = song.cover;
        this.elements.miniTitle.textContent = song.title;
    },

    /**
     * 更新歌词
     */
    updateLyrics(lyrics) {
        if (!lyrics) {
            this.elements.lyricsContent.innerHTML = '<div class="lyrics-placeholder">暂无歌词</div>';
            return;
        }

        const formattedLyrics = lyrics
            .split('\n')
            .map(line => `<div class="lyric-line">${line}</div>`)
            .join('');

        this.elements.lyricsContent.innerHTML = formattedLyrics;
    },

    /**
     * 渲染播放列表
     */
    renderPlaylist() {
        const playlist = this.state.filteredPlaylist;
        this.elements.playlistCount.textContent = playlist.length;

        this.elements.playlist.innerHTML = playlist
            .map((song, index) => `
                <div class="playlist-item ${index === this.state.currentSongIndex ? 'active' : ''}"
                     data-index="${index}">
                    <span class="song-cover-small">${song.cover}</span>
                    <div class="song-info-small">
                        <div class="song-title-small">${song.title}</div>
                        <div class="song-artist-small">${song.artist}</div>
                    </div>
                    <span class="playing-indicator">${index === this.state.currentSongIndex && this.state.isPlaying ? '🎵' : ''}</span>
                </div>
            `)
            .join('');

        // 绑定点击事件
        this.elements.playlist.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.playSong(index);
            });
        });
    },

    /**
     * 更新播放列表高亮
     */
    updatePlaylistHighlight() {
        const items = this.elements.playlist.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            const isActive = index === this.state.currentSongIndex;
            item.classList.toggle('active', isActive);

            const indicator = item.querySelector('.playing-indicator');
            indicator.textContent = isActive && this.state.isPlaying ? '🎵' : '';
        });
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
                    this.updateUI();
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

        this.updateUI();
    },

    /**
     * 上一首
     */
    playPrev() {
        let newIndex = this.state.currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = this.state.filteredPlaylist.length - 1;
        }
        this.playSong(newIndex);
    },

    /**
     * 下一首
     */
    playNext() {
        let newIndex = this.state.currentSongIndex + 1;
        if (newIndex >= this.state.filteredPlaylist.length) {
            newIndex = 0;
        }
        this.playSong(newIndex);
    },

    /**
     * 搜索
     */
    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();

        this.elements.btnClearSearch.style.display = query ? 'block' : 'none';

        if (!query) {
            this.state.filteredPlaylist = [...this.playlist];
            this.state.isSearching = false;
        } else {
            this.state.filteredPlaylist = this.playlist.filter(song =>
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query) ||
                (song.lyrics && song.lyrics.toLowerCase().includes(query))
            );
            this.state.isSearching = true;
        }

        // 重置当前索引
        this.state.currentSongIndex = 0;
        this.renderPlaylist();
        this.loadSong(0);
    },

    /**
     * 清除搜索
     */
    clearSearch() {
        this.elements.searchInput.value = '';
        this.state.filteredPlaylist = [...this.playlist];
        this.state.isSearching = false;
        this.state.currentSongIndex = 0;
        this.elements.btnClearSearch.style.display = 'none';

        // 恢复到 China-E
        const chinaEIndex = this.playlist.findIndex(song => song.title === 'China-E');
        if (chinaEIndex !== -1) {
            this.state.currentSongIndex = chinaEIndex;
        }

        this.renderPlaylist();
        this.loadSong(this.state.currentSongIndex);
    },

    /**
     * 最小化
     */
    minimize() {
        this.elements.full.style.display = 'none';
        this.elements.minimized.style.display = 'flex';
    },

    /**
     * 展开
     */
    expand() {
        this.elements.full.style.display = 'block';
        this.elements.minimized.style.display = 'none';
    },

    /**
     * 更新UI
     */
    updateUI() {
        // 更新播放按钮
        this.elements.btnPlay.textContent = this.state.isPlaying ? '⏸️' : '▶️';

        // 更新最小化状态
        this.elements.miniStatus.textContent = this.state.isPlaying ? '🎵' : '⏸️';

        // 更新播放列表指示器
        this.updatePlaylistHighlight();
    },

    /**
     * 切换到跨年庆祝模式
     */
    switchToCelebration() {
        console.log('🎉 切换到跨年庆祝音乐...');

        // 优先播放 China-E
        const chinaEIndex = this.state.filteredPlaylist.findIndex(song => song.title === 'China-E');
        if (chinaEIndex !== -1) {
            this.playSong(chinaEIndex);
        }

        // 展开播放器以显示歌词
        this.expand();
    }
};

// 导出到全局
window.MusicPlayer = MusicPlayer;
