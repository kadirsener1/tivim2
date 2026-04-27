/**
 * TİVİM - Veri Yönetim Modülü
 * LocalStorage tabanlı veri saklama
 */
const Storage = {
    PREFIX: 'tivim_',

    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', key, e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', key, e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    },

    // Favoriler
    getFavorites() {
        return this.get('favorites', []);
    },

    toggleFavorite(channelId) {
        let favs = this.getFavorites();
        const idx = favs.indexOf(channelId);
        if (idx > -1) {
            favs.splice(idx, 1);
        } else {
            favs.push(channelId);
        }
        this.set('favorites', favs);
        return idx === -1; // true = eklendi
    },

    isFavorite(channelId) {
        return this.getFavorites().includes(channelId);
    },

    // Son izlenen
    getRecent() {
        return this.get('recent', []);
    },

    addRecent(channelId) {
        let recent = this.getRecent();
        recent = recent.filter(id => id !== channelId);
        recent.unshift(channelId);
        if (recent.length > 50) recent = recent.slice(0, 50);
        this.set('recent', recent);
    },

    // Ayarlar
    getSettings() {
        return this.get('settings', {
            m3uUrl: 'https://raw.githubusercontent.com/kadirsener1/tivim/refs/heads/main/merged.m3u',
            theme: 'dark',
            autoplay: true,
            volume: 100,
            aspectRatio: 'contain',
            gridSize: 'medium',
            showChannelNumbers: true,
            showCategories: true,
            hiddenCategories: [],
            hiddenChannels: [],
            channelOrder: {},
            customChannels: [],
            password: 'admin123',
            lastUpdate: null,
            updateInterval: 3600000 // 1 saat
        });
    },

    updateSettings(newSettings) {
        const settings = { ...this.getSettings(), ...newSettings };
        this.set('settings', settings);
        return settings;
    },

    // Kanal cache
    getCachedChannels() {
        return this.get('channelCache', null);
    },

    setCachedChannels(channels) {
        this.set('channelCache', {
            data: channels,
            timestamp: Date.now()
        });
    },

    // Gizli kanallar
    isChannelHidden(channelId) {
        const settings = this.getSettings();
        return settings.hiddenChannels.includes(channelId);
    },

    toggleChannelVisibility(channelId) {
        const settings = this.getSettings();
        const idx = settings.hiddenChannels.indexOf(channelId);
        if (idx > -1) {
            settings.hiddenChannels.splice(idx, 1);
        } else {
            settings.hiddenChannels.push(channelId);
        }
        this.set('settings', settings);
        return idx > -1; // true = artık görünür
    },

    // Son izlenen kanal
    getLastChannel() {
        return this.get('lastChannel', null);
    },

    setLastChannel(channelId) {
        this.set('lastChannel', channelId);
    },

    // İstatistikler
    getStats() {
        return this.get('stats', {
            totalWatchTime: 0,
            channelPlayCounts: {},
            lastVisit: null
        });
    },

    updateWatchTime(channelId, seconds) {
        const stats = this.getStats();
        stats.totalWatchTime += seconds;
        stats.channelPlayCounts[channelId] = (stats.channelPlayCounts[channelId] || 0) + 1;
        stats.lastVisit = Date.now();
        this.set('stats', stats);
    },

    // Tüm verileri temizle
    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },

    // Veriyi dışa aktar
    exportData() {
        const data = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                data[key.replace(this.PREFIX, '')] = JSON.parse(localStorage.getItem(key));
            }
        });
        return JSON.stringify(data, null, 2);
    },

    // Veriyi içe aktar
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.keys(data).forEach(key => {
                this.set(key, data[key]);
            });
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};
