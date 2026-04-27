/**
 * TİVİM - Gelişmiş Video Oynatıcı
 * HLS, DASH, FLV, MP4, MKV desteği
 */
const Player = {
    videoElement: null,
    hlsInstance: null,
    dashInstance: null,
    flvInstance: null,
    currentChannel: null,
    controlsTimeout: null,
    controlsVisible: true,
    aspectRatioModes: ['contain', 'cover', 'fill'],
    currentAspectRatio: 0,
    isPlaying: false,
    volume: 100,
    retryCount: 0,
    maxRetries: 3,
    retryTimeout: null,

    init() {
        this.videoElement = document.getElementById('videoPlayer');
        this.volume = Storage.getSettings().volume || 100;
        this.videoElement.volume = this.volume / 100;

        // Video event listeners
        this.videoElement.addEventListener('playing', () => this.onPlaying());
        this.videoElement.addEventListener('waiting', () => this.onBuffering());
        this.videoElement.addEventListener('error', (e) => this.onError(e));
        this.videoElement.addEventListener('ended', () => this.onEnded());
        this.videoElement.addEventListener('pause', () => this.onPause());
        this.videoElement.addEventListener('volumechange', () => this.onVolumeChange());

        console.log('🎬 Player başlatıldı');
    },

    /**
     * Kanal oynat
     */
    async play(channel) {
        if (!channel || !channel.url) {
            console.error('Geçersiz kanal:', channel);
            return false;
        }

        this.currentChannel = channel;
        this.retryCount = 0;

        // Önceki stream'i temizle
        this.destroyStreams();

        // UI güncelle
        this.showLoading();
        this.hideError();
        this.updatePlayerUI(channel);

        // Son izlenen olarak kaydet
        Storage.addRecent(channel.id);
        Storage.setLastChannel(channel.id);

        console.log(`▶️ Oynatılıyor: ${channel.name} (${channel.type})`);
        console.log(`📡 URL: ${channel.url}`);

        try {
            await this.loadStream(channel.url, channel.type);
            return true;
        } catch (error) {
            console.error('Oynatma hatası:', error);
            this.handlePlayError(error);
            return false;
        }
    },

    /**
     * Stream'i yükle
     */
    async loadStream(url, type) {
        switch (type) {
            case 'hls':
                return this.loadHLS(url);
            case 'dash':
                return this.loadDASH(url);
            case 'flv':
                return this.loadFLV(url);
            case 'mp4':
            case 'mkv':
            case 'avi':
            case 'ts':
                return this.loadDirect(url);
            default:
                // Önce HLS dene, başarısız olursa direct
                try {
                    return await this.loadHLS(url);
                } catch (e) {
                    console.warn('HLS başarısız, direkt yükleme deneniyor...');
                    return this.loadDirect(url);
                }
        }
    },

    /**
     * HLS Stream
     */
    loadHLS(url) {
        return new Promise((resolve, reject) => {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                    maxBufferSize: 60 * 1000 * 1000,
                    maxBufferHole: 0.5,
                    lowLatencyMode: false,
                    startLevel: -1,
                    debug: false,
                    enableWorker: true,
                    xhrSetup: (xhr, url) => {
                        xhr.withCredentials = false;
                    },
                    // Hata toleransı yüksek
                    fragLoadingMaxRetry: 6,
                    manifestLoadingMaxRetry: 4,
                    levelLoadingMaxRetry: 4,
                    fragLoadingRetryDelay: 1000,
                });

                hls.loadSource(url);
                hls.attachMedia(this.videoElement);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('✅ HLS manifest yüklendi');
                    this.videoElement.play().then(resolve).catch(reject);
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.warn('HLS Error:', data.type, data.details);

                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log('Ağ hatası, tekrar deneniyor...');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('Medya hatası, kurtarılıyor...');
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                reject(new Error('HLS fatal error: ' + data.details));
                                break;
                        }
                    }
                });

                this.hlsInstance = hls;
            } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS
                this.videoElement.src = url;
                this.videoElement.addEventListener('loadedmetadata', () => {
                    this.videoElement.play().then(resolve).catch(reject);
                }, { once: true });
            } else {
                reject(new Error('HLS desteklenmiyor'));
            }
        });
    },

    /**
     * DASH Stream
     */
    loadDASH(url) {
        return new Promise((resolve, reject) => {
            if (typeof dashjs !== 'undefined') {
                const player = dashjs.MediaPlayer().create();
                player.initialize(this.videoElement, url, true);

                player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
                    console.log('✅ DASH stream yüklendi');
                    resolve();
                });

                player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
                    reject(new Error('DASH error: ' + e.error));
                });

                this.dashInstance = player;
            } else {
                reject(new Error('DASH player yüklenmemiş'));
            }
        });
    },

    /**
     * FLV Stream
     */
    loadFLV(url) {
        return new Promise((resolve, reject) => {
            if (typeof flvjs !== 'undefined' && flvjs.isSupported()) {
                const player = flvjs.createPlayer({
                    type: 'flv',
                    url: url,
                    isLive: true
                });

                player.attachMediaElement(this.videoElement);
                player.load();
                player.play().then(resolve).catch(reject);

                this.flvInstance = player;
            } else {
                reject(new Error('FLV desteklenmiyor'));
            }
        });
    },

    /**
     * Direkt video (MP4, MKV, vs.)
     */
    loadDirect(url) {
        return new Promise((resolve, reject) => {
            this.videoElement.src = url;

            this.videoElement.addEventListener('canplay', () => {
                console.log('✅ Direkt video yüklendi');
                this.videoElement.play().then(resolve).catch(reject);
            }, { once: true });

            this.videoElement.addEventListener('error', () => {
                reject(new Error('Video yüklenemedi'));
            }, { once: true });

            this.videoElement.load();
        });
    },

    /**
     * Tüm stream instance'ları temizle
     */
    destroyStreams() {
        if (this.hlsInstance) {
            this.hlsInstance.destroy();
            this.hlsInstance = null;
        }
        if (this.dashInstance) {
            this.dashInstance.reset();
            this.dashInstance = null;
        }
        if (this.flvInstance) {
            this.flvInstance.pause();
            this.flvInstance.unload();
            this.flvInstance.detachMediaElement();
            this.flvInstance.destroy();
            this.flvInstance = null;
        }

        this.videoElement.removeAttribute('src');
        this.videoElement.load();

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
    },

    /**
     * Oynatmayı durdur
     */
    stop() {
        this.destroyStreams();
        this.currentChannel = null;
        this.isPlaying = false;
        this.hideLoading();
    },

    /**
     * Oynat/Duraklat
     */
    togglePlayPause() {
        if (this.videoElement.paused) {
            this.videoElement.play();
        } else {
            this.videoElement.pause();
        }
    },

    /**
     * Ses ayarla (0-100)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(100, level));
        this.videoElement.volume = this.volume / 100;
        this.videoElement.muted = this.volume === 0;
        Storage.updateSettings({ volume: this.volume });
        this.showVolumeIndicator();
    },

    /**
     * Ses artır
     */
    volumeUp() {
        this.setVolume(this.volume + 5);
    },

    /**
     * Ses azalt
     */
    volumeDown() {
        this.setVolume(this.volume - 5);
    },

    /**
     * Sessiz/Sesli
     */
    toggleMute() {
        if (this.videoElement.muted || this.volume === 0) {
            this.videoElement.muted = false;
            if (this.volume === 0) this.setVolume(50);
        } else {
            this.videoElement.muted = true;
        }
        this.showVolumeIndicator();
    },

    /**
     * En-boy oranı değiştir
     */
    cycleAspectRatio() {
        this.currentAspectRatio = (this.currentAspectRatio + 1) % this.aspectRatioModes.length;
        const mode = this.aspectRatioModes[this.currentAspectRatio];

        this.videoElement.className = '';
        if (mode === 'cover') this.videoElement.classList.add('fill');
        if (mode === 'fill') this.videoElement.classList.add('stretch');

        // OSD göster
        this.showOSD(`Ekran: ${mode === 'contain' ? 'Sığdır' : mode === 'cover' ? 'Doldur' : 'Ger'}`);
    },

    /**
     * Tam ekran
     */
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    },

    // ======== UI Yardımcıları ========

    showLoading() {
        document.getElementById('playerLoading').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('playerLoading').classList.add('hidden');
    },

    showError(message) {
        const errorEl = document.getElementById('playerError');
        document.getElementById('errorMessage').textContent = message;
        errorEl.classList.remove('hidden');
        this.hideLoading();
    },

    hideError() {
        document.getElementById('playerError').classList.add('hidden');
    },

    updatePlayerUI(channel) {
        document.getElementById('playerChannelName').textContent = channel.name;
        document.getElementById('playerChannelCategory').textContent = channel.group;

        const logoEl = document.getElementById('playerChannelLogo');
        if (channel.logo) {
            logoEl.src = channel.logo;
            logoEl.style.display = 'block';
        } else {
            logoEl.style.display = 'none';
        }

        // Favori durumu
        this.updateFavoriteButton(channel.id);
    },

    updateFavoriteButton(channelId) {
        const btn = document.getElementById('btnToggleFav');
        const isFav = Storage.isFavorite(channelId);
        btn.querySelector('i').className = isFav ? 'fas fa-star' : 'far fa-star';
        btn.querySelector('span').textContent = isFav ? 'Favoride' : 'Favori';
        btn.style.color = isFav ? '#f59e0b' : 'white';
    },

    showVolumeIndicator() {
        const indicator = document.getElementById('volumeIndicator');
        const level = document.getElementById('volumeLevel');
        const text = document.getElementById('volumeText');
        const icon = indicator.querySelector('i');

        level.style.height = this.volume + '%';
        text.textContent = this.volume + '%';

        if (this.videoElement.muted || this.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.volume < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }

        indicator.classList.remove('hidden');
        clearTimeout(this._volumeTimeout);
        this._volumeTimeout = setTimeout(() => {
            indicator.classList.add('hidden');
        }, 2000);
    },

    showControls() {
        const controls = document.getElementById('playerControls');
        controls.classList.remove('hidden-controls');
        this.controlsVisible = true;

        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => {
            if (this.isPlaying) {
                controls.classList.add('hidden-controls');
                this.controlsVisible = false;
            }
        }, 5000);
    },

    hideControls() {
        const controls = document.getElementById('playerControls');
        controls.classList.add('hidden-controls');
        this.controlsVisible = false;
    },

    showOSD(message) {
        // Basit OSD mesajı
        let osd = document.getElementById('osdMessage');
        if (!osd) {
            osd = document.createElement('div');
            osd.id = 'osdMessage';
            osd.style.cssText = `
                position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.8); color: white; padding: 12px 24px;
                border-radius: 8px; font-size: 18px; z-index: 30;
                backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
            `;
            document.getElementById('playerOverlay').appendChild(osd);
        }
        osd.textContent = message;
        osd.classList.remove('hidden');

        clearTimeout(this._osdTimeout);
        this._osdTimeout = setTimeout(() => {
            osd.classList.add('hidden');
        }, 2000);
    },

    // ======== Event Handlers ========

    onPlaying() {
        console.log('▶️ Oynatılıyor');
        this.isPlaying = true;
        this.hideLoading();
        this.hideError();
        this.retryCount = 0;

        const btn = document.getElementById('btnPlayPause');
        btn.querySelector('i').className = 'fas fa-pause';
        btn.querySelector('span').textContent = 'Duraklat';

        // 5 saniye sonra kontrolleri gizle
        this.showControls();
    },

    onBuffering() {
        console.log('⏳ Tamponlanıyor...');
        this.showLoading();
    },

    onPause() {
        this.isPlaying = false;
        const btn = document.getElementById('btnPlayPause');
        btn.querySelector('i').className = 'fas fa-play';
        btn.querySelector('span').textContent = 'Oynat';
        this.showControls();
    },

    onError(e) {
        console.error('❌ Video hatası:', e);
        this.handlePlayError(e);
    },

    onEnded() {
        console.log('⏹️ Video bitti');
        // Canlı yayın ise tekrar dene
        if (this.currentChannel) {
            this.retryPlay();
        }
    },

    onVolumeChange() {
        this.volume = Math.round(this.videoElement.volume * 100);
    },

    /**
     * Hata yönetimi
     */
    handlePlayError(error) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Tekrar deneniyor (${this.retryCount}/${this.maxRetries})...`);
            this.showLoading();

            this.retryTimeout = setTimeout(() => {
                if (this.currentChannel) {
                    this.destroyStreams();

                    // Farklı yöntem dene
                    if (this.retryCount === 2) {
                        // İkinci denemede direkt yükleme dene
                        this.loadDirect(this.currentChannel.url).catch(() => {
                            this.handlePlayError(error);
                        });
                    } else {
                        this.loadStream(this.currentChannel.url, this.currentChannel.type).catch(() => {
                            this.handlePlayError(error);
                        });
                    }
                }
            }, 2000 * this.retryCount);
        } else {
            this.showError('Yayın açılamadı. Kanal şu an yayında olmayabilir.');
        }
    },

    retryPlay() {
        if (this.currentChannel) {
            this.retryCount = 0;
            this.play(this.currentChannel);
        }
    }
};
