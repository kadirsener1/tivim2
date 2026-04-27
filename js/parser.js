/**
 * TİVİM - M3U/M3U8 Playlist Parser
 * Gelişmiş kategori ve logo desteği
 */
const M3UParser = {
    /**
     * M3U içeriğini parse et
     */
    parse(content) {
        const channels = [];
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (!lines[0] || !lines[0].startsWith('#EXTM3U')) {
            console.warn('Geçersiz M3U dosyası - #EXTM3U başlığı bulunamadı');
        }

        let currentInfo = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('#EXTINF:')) {
                currentInfo = this.parseExtInf(line);
            } else if (line.startsWith('#EXTVLCOPT:') || line.startsWith('#KODIPROP:')) {
                // VLC/Kodi opsiyonları - şimdilik atla
                if (currentInfo) {
                    if (!currentInfo.options) currentInfo.options = [];
                    currentInfo.options.push(line);
                }
            } else if (!line.startsWith('#') && currentInfo) {
                // URL satırı
                const channel = {
                    id: this.generateId(currentInfo.name, channels.length),
                    number: channels.length + 1,
                    name: currentInfo.name || `Kanal ${channels.length + 1}`,
                    url: line.trim(),
                    logo: currentInfo.logo || '',
                    group: currentInfo.group || 'Diğer',
                    language: currentInfo.language || '',
                    country: currentInfo.country || '',
                    tvgId: currentInfo.tvgId || '',
                    tvgName: currentInfo.tvgName || '',
                    catchup: currentInfo.catchup || '',
                    options: currentInfo.options || [],
                    type: this.detectStreamType(line.trim()),
                    isWorking: true
                };

                channels.push(channel);
                currentInfo = null;
            }
        }

        console.log(`✅ ${channels.length} kanal parse edildi`);
        return channels;
    },

    /**
     * #EXTINF satırını parse et
     */
    parseExtInf(line) {
        const info = {
            name: '',
            logo: '',
            group: 'Diğer',
            language: '',
            country: '',
            tvgId: '',
            tvgName: '',
            catchup: ''
        };

        // tvg-logo
        const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
        if (logoMatch) info.logo = logoMatch[1];

        // group-title
        const groupMatch = line.match(/group-title="([^"]*)"/i);
        if (groupMatch) info.group = groupMatch[1] || 'Diğer';

        // tvg-id
        const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
        if (tvgIdMatch) info.tvgId = tvgIdMatch[1];

        // tvg-name
        const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
        if (tvgNameMatch) info.tvgName = tvgNameMatch[1];

        // tvg-language
        const langMatch = line.match(/tvg-language="([^"]*)"/i);
        if (langMatch) info.language = langMatch[1];

        // tvg-country
        const countryMatch = line.match(/tvg-country="([^"]*)"/i);
        if (countryMatch) info.country = countryMatch[1];

        // catchup
        const catchupMatch = line.match(/catchup="([^"]*)"/i);
        if (catchupMatch) info.catchup = catchupMatch[1];

        // Kanal adı - son virgülden sonraki kısım
        const nameMatch = line.match(/,\s*(.+)$/);
        if (nameMatch) info.name = nameMatch[1].trim();

        return info;
    },

    /**
     * Stream tipini tespit et
     */
    detectStreamType(url) {
        const urlLower = url.toLowerCase();

        if (urlLower.includes('.m3u8') || urlLower.includes('m3u8')) {
            return 'hls';
        } else if (urlLower.includes('.mpd')) {
            return 'dash';
        } else if (urlLower.includes('.flv')) {
            return 'flv';
        } else if (urlLower.includes('.mp4')) {
            return 'mp4';
        } else if (urlLower.includes('.mkv')) {
            return 'mkv';
        } else if (urlLower.includes('.ts')) {
            return 'ts';
        } else if (urlLower.includes('.avi')) {
            return 'avi';
        } else if (urlLower.includes('rtmp://')) {
            return 'rtmp';
        } else if (urlLower.includes('rtsp://')) {
            return 'rtsp';
        } else if (urlLower.includes('/live/') || urlLower.includes('/stream/')) {
            return 'hls'; // Çoğu IPTV stream'i HLS'dir
        }

        return 'hls'; // Default olarak HLS dene
    },

    /**
     * Benzersiz ID üret
     */
    generateId(name, index) {
        const base = (name || 'channel')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 30);
        return `${base}_${index}`;
    },

    /**
     * Kategorileri çıkar
     */
    extractCategories(channels) {
        const categories = new Map();

        channels.forEach(ch => {
            const group = ch.group || 'Diğer';
            if (!categories.has(group)) {
                categories.set(group, {
                    name: group,
                    count: 0,
                    icon: this.getCategoryIcon(group)
                });
            }
            categories.get(group).count++;
        });

        // Sayıya göre sırala
        return Array.from(categories.values()).sort((a, b) => b.count - a.count);
    },

    /**
     * Kategori ikonu
     */
    getCategoryIcon(category) {
        const cat = category.toLowerCase();
        const iconMap = {
            'haber': 'fa-newspaper',
            'news': 'fa-newspaper',
            'spor': 'fa-futbol',
            'sport': 'fa-futbol',
            'sports': 'fa-futbol',
            'sinema': 'fa-film',
            'film': 'fa-film',
            'movie': 'fa-film',
            'movies': 'fa-film',
            'dizi': 'fa-tv',
            'series': 'fa-tv',
            'entertainment': 'fa-masks-theater',
            'eğlence': 'fa-masks-theater',
            'müzik': 'fa-music',
            'music': 'fa-music',
            'çocuk': 'fa-child',
            'kids': 'fa-child',
            'children': 'fa-child',
            'belgesel': 'fa-earth-americas',
            'documentary': 'fa-earth-americas',
            'eğitim': 'fa-graduation-cap',
            'education': 'fa-graduation-cap',
            'din': 'fa-mosque',
            'religious': 'fa-mosque',
            'yemek': 'fa-utensils',
            'food': 'fa-utensils',
            'doğa': 'fa-leaf',
            'nature': 'fa-leaf',
            'bilim': 'fa-flask',
            'science': 'fa-flask',
            'teknoloji': 'fa-microchip',
            'technology': 'fa-microchip',
            'sağlık': 'fa-heart-pulse',
            'health': 'fa-heart-pulse',
            'alışveriş': 'fa-shopping-bag',
            'shopping': 'fa-shopping-bag',
            'genel': 'fa-globe',
            'general': 'fa-globe',
            'ulusal': 'fa-flag',
            'national': 'fa-flag',
            'bölgesel': 'fa-map-marker-alt',
            'regional': 'fa-map-marker-alt',
            'radyo': 'fa-radio',
            'radio': 'fa-radio',
            'xxx': 'fa-ban',
            'adult': 'fa-ban',
            'diğer': 'fa-layer-group',
            'other': 'fa-layer-group',
            'undefined': 'fa-layer-group',
            'auto': 'fa-car',
            'travel': 'fa-plane',
            'seyahat': 'fa-plane',
            'türkiye': 'fa-flag',
            'turkey': 'fa-flag',
        };

        for (const [key, icon] of Object.entries(iconMap)) {
            if (cat.includes(key)) return icon;
        }

        return 'fa-layer-group';
    },

    /**
     * URL'den M3U dosyasını indir ve parse et
     */
    async fetchAndParse(url) {
        try {
            // CORS proxy dene
            let response;
            const proxyUrls = [
                url, // Direkt dene
                `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
                `https://corsproxy.io/?${encodeURIComponent(url)}`,
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
            ];

            for (const proxyUrl of proxyUrls) {
                try {
                    response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/plain, application/x-mpegurl, */*'
                        }
                    });

                    if (response.ok) {
                        console.log('✅ M3U başarıyla indirildi:', proxyUrl.substring(0, 50));
                        break;
                    }
                } catch (e) {
                    console.warn('Proxy denendi:', proxyUrl.substring(0, 50), e.message);
                    continue;
                }
            }

            if (!response || !response.ok) {
                throw new Error('M3U dosyası indirilemedi');
            }

            const content = await response.text();

            if (!content || content.length < 10) {
                throw new Error('Boş M3U dosyası');
            }

            return this.parse(content);
        } catch (error) {
            console.error('M3U fetch hatası:', error);
            throw error;
        }
    }
};
