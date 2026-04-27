
/**
 * TİVİM - Android TV Box Kumanda Desteği
 * D-Pad navigasyon, rakam tuşları, özel tuşlar
 */
const Remote = {
    focusableElements: [],
    currentFocusIndex: -1,
    currentSection: 'channels', // categories, channels, player, admin
    channelNumberBuffer: '',
    channelNumberTimeout: null,
    longPressTimer: null,
    lastKeyTime: 0,
    keyRepeatDelay: 150,
    scrollSpeed: 200,

    // Android TV KeyCodes
    KEYS: {
        UP: [38, 19], // ArrowUp, DPAD_UP
        DOWN: [40, 20],
        LEFT: [37, 21],
        RIGHT: [39, 22],
        ENTER: [13, 23, 66], // Enter, DPAD_CENTER, KEYCODE_ENTER
        BACK: [27, 4, 8, 461], // Escape, BACK, Backspace
        HOME: [36, 3],
        MENU: [93, 82, 18], // ContextMenu, MENU, Alt
        PLAY_PAUSE: [179, 85, 415],
        PLAY: [415, 126],
        PAUSE: [19, 127],
        STOP: [178, 86],
        REWIND: [177, 89],
        FAST_FORWARD: [176, 90],
        VOLUME_UP: [175, 24],
        VOLUME_DOWN: [174, 25],
        MUTE: [173, 164],
        CHANNEL_UP: [33, 166], // PageUp
        CHANNEL_DOWN: [34, 167], // PageDown
        INFO: [457, 165],
        GUIDE: [458, 172],
        RED: [403],
        GREEN: [404],
        YELLOW: [405],
        BLUE: [406],
        SEARCH: [217, 84],
        FAVORITE: [182, 364], // bookmark
        NUM_0: [48, 96, 7],
        NUM_1: [49, 97, 8],
        NUM_2: [50, 98, 9],
        NUM_3: [51, 99, 10],
        NUM_4: [52, 100, 11],
        NUM_5: [53, 101, 12],
        NUM_6: [54, 102, 13],
        NUM_7: [55, 103, 14],
        NUM_8: [56, 104, 15],
        NUM_9: [57, 105, 16],
    },

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse hareketinde cursor göster
        document.addEventListener('mousemove', () => {
            document.body.style.cursor = 'auto';
            clearTimeout(this._cursorTimeout);
            this._cursorTimeout = setTimeout(() => {
                document.body.style.cursor = 'none';
            }, 3000);
        });

        // Click desteği (mouse fallback)
        document.addEventListener('click', (e) => {
            const focusable = e.target.closest('[data-focusable]');
            if (focusable) {
                this.focusElement(focusable);
                this.activateFocused();
            }
        });

        console.log('🎮 Kumanda desteği aktif');
    },

    /**
     * Tuş basımı
     */
    handleKeyDown(e) {
        const keyCode = e.keyCode || e.which;
        const now = Date.now();

        // Tuş tekrar hız kontrolü
        if (now - this.lastKeyTime < this.keyRepeatDelay) {
            // Yön tuşları için hız sınırı
            if (this.isKeyIn(keyCode, [...this.KEYS.UP, ...this.KEYS.DOWN, ...this.KEYS.LEFT, ...this.KEYS.RIGHT])) {
                // İzin ver ama hızlı tekrar
            }
        }
        this.lastKeyTime = now;

        // Input focus kontrolü
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            if (this.isKeyIn(keyCode, this.KEYS.BACK)) {
                document.activeElement.blur();
                e.preventDefault();
                return;
            }
            if (this.isKeyIn(keyCode, this.KEYS.ENTER)) {
                // Arama yap
                if (document.activeElement.id === 'searchInput') {
                    App.performSearch(document.activeElement.value);
                    document.activeElement.blur();
                    e.preventDefault();
                }
                return;
            }
            return; // Input'tayken diğer tuşları yoksay
        }

        e.preventDefault();
        e.stopPropagation();

        // ===== YÖN TUŞLARI =====
        if (this.isKeyIn(keyCode, this.KEYS.UP)) {
            this.navigate('up');
        }
        else if (this.isKeyIn(keyCode, this.KEYS.DOWN)) {
            this.navigate('down');
        }
        else if (this.isKeyIn(keyCode, this.KEYS.LEFT)) {
            this.navigate('left');
        }
        else if (this.isKeyIn(keyCode, this.KEYS.RIGHT)) {
            this.navigate('right');
        }

        // ===== OK / ENTER =====
        else if (this.isKeyIn(keyCode, this.KEYS.ENTER)) {
            this.activateFocused();
        }

        // ===== GERİ =====
        else if (this.isKeyIn(keyCode, this.KEYS.BACK)) {
            this.handleBack();
        }

        // ===== SES =====
        else if (this.isKeyIn(keyCode, this.KEYS.VOLUME_UP)) {
            Player.volumeUp();
        }
        else if (this.isKeyIn(keyCode, this.KEYS.VOLUME_DOWN)) {
            Player.volumeDown();
        }
        else if (this.isKeyIn(keyCode, this.KEYS.MUTE)) {
            Player.toggleMute();
        }

        // ===== KANAL DEĞİŞTİR =====
        else if (this.isKeyIn(keyCode, this.KEYS.CHANNEL_UP)) {
            App.nextChannel();
        }
        else if (this.isKeyIn(keyCode, this.KEYS.CHANNEL_DOWN)) {
            App.prevChannel();
        }

        // ===== OYNATMA KONTROL =====
        else if (this.isKeyIn(keyCode, this.KEYS.PLAY_PAUSE)) {
            if (App.isPlayerVisible()) {
                Player.togglePlayPause();
            }
        }
        else if (this.isKeyIn(keyCode, this.KEYS.STOP)) {
            if (App.isPlayerVisible()) {
                App.closePlayer();
            }
        }

        // ===== RAKAM TUŞLARI =====
        else if (this.isNumberKey(keyCode)) {
            this.handleNumberInput(this.getNumber(keyCode));
        }

        // ===== ARAMA =====
        else if (this.isKeyIn(keyCode, this.KEYS.SEARCH)) {
            App.focusSearch();
        }

        // ===== FAVORİ =====
        else if (this.isKeyIn(keyCode, this.KEYS.FAVORITE) || this.isKeyIn(keyCode, this.KEYS.YELLOW)) {
            App.toggleCurrentFavorite();
        }

        // ===== MENÜ =====
        else if (this.isKeyIn(keyCode, this.KEYS.MENU)) {
            App.toggleAdmin();
        }

        // ===== INFO =====
        else if (this.isKeyIn(keyCode, this.KEYS.INFO)) {
            if (App.isPlayerVisible()) {
                Player.showControls();
            }
        }

        // ===== GUIDE =====
        else if (this.isKeyIn(keyCode, this.KEYS.GUIDE)) {
            if (App.isPlayerVisible()) {
                App.toggleMiniList();
            }
        }

        // ===== RENKLİ TUŞLAR =====
        else if (this.isKeyIn(keyCode, this.KEYS.RED)) {
            // Kırmızı: Tam ekran
            Player.toggleFullscreen();
        }
        else if (this.isKeyIn(keyCode, this.KEYS.GREEN)) {
            // Yeşil: Aspect ratio
            if (App.isPlayerVisible()) {
                Player.cycleAspectRatio();
            }
        }
        else if (this.isKeyIn(keyCode, this.KEYS.BLUE)) {
            // Mavi: Kanal listesi
            if (App.isPlayerVisible()) {
                App.toggleMiniList();
            }
        }
    },

    handleKeyUp(e) {
        // Long press temizle
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    },

    /**
     * Navigasyon
     */
    navigate(direction) {
        const playerVisible = App.isPlayerVisible();
        const adminVisible = App.isAdminVisible();
        const miniListVisible = !document.getElementById('miniChannelList').classList.contains('hidden');

        // Player modunda
        if (playerVisible) {
            if (miniListVisible) {
                this.navigateMiniList(direction);
                return;
            }

            if (!Player.controlsVisible) {
                Player.showControls();
                this.refreshFocusableElements('player');
                if (this.focusableElements.length > 0) {
                    this.currentFocusIndex = 0;
                    this.applyFocus();
                }
                return;
            }

            // Player kontrolleri arasında gezin
            this.navigateInSection('player', direction);
            return;
        }

        // Admin modunda
        if (adminVisible) {
            this.navigateInSection('admin', direction);
            return;
        }

        // Ana sayfada
        if (direction === 'up' || direction === 'down') {
            this.navigateGrid(direction);
        } else if (direction === 'left' || direction === 'right') {
            // Kategori barında mıyız?
            const focused = this.getFocusedElement();
            if (focused && focused.dataset.focusGroup === 'categories') {
                this.navigateCategories(direction);
            } else {
                this.navigateGrid(direction);
            }
        }
    },

    /**
     * Grid navigasyon
     */
    navigateGrid(direction) {
        const grid = document.getElementById('channelGrid');
        const cards = Array.from(grid.querySelectorAll('.channel-card:not(.hidden)'));

        if (cards.length === 0) return;

        const focused = grid.querySelector('.channel-card.focused');
        let currentIdx = focused ? cards.indexOf(focused) : -1;

        // Hesapla: kaç sütun var?
        if (cards.length < 2) {
            if (currentIdx === -1) {
                this.focusChannelCard(cards[0]);
            }
            return;
        }

        const gridRect = grid.getBoundingClientRect();
        const cardRect = cards[0].getBoundingClientRect();
        const cols = Math.max(1, Math.round(gridRect.width / (cardRect.width + 16)));

        let newIdx = currentIdx;

        switch (direction) {
            case 'up':
                if (currentIdx === -1) {
                    newIdx = 0;
                } else if (currentIdx < cols) {
                    // En üst satırdayız, kategorilere git
                    this.focusCategories();
                    return;
                } else {
                    newIdx = currentIdx - cols;
                }
                break;
            case 'down':
                if (currentIdx === -1) {
                    newIdx = 0;
                } else {
                    newIdx = Math.min(currentIdx + cols, cards.length - 1);
                }
                break;
            case 'left':
                if (currentIdx <= 0) {
                    newIdx = 0;
                } else {
                    newIdx = currentIdx - 1;
                }
                break;
            case 'right':
                if (currentIdx === -1) {
                    newIdx = 0;
                } else {
                    newIdx = Math.min(currentIdx + 1, cards.length - 1);
                }
                break;
        }

        if (newIdx >= 0 && newIdx < cards.length) {
            this.focusChannelCard(cards[newIdx]);
        }
    },

    /**
     * Kategori navigasyon
     */
    navigateCategories(direction) {
        const buttons = Array.from(document.querySelectorAll('.category-btn'));
        const focused = document.querySelector('.category-btn.focused');
        let idx = focused ? buttons.indexOf(focused) : -1;

        if (direction === 'left') {
            idx = Math.max(0, idx - 1);
        } else if (direction === 'right') {
            idx = Math.min(buttons.length - 1, idx + 1);
        }

        buttons.forEach(b => b.classList.remove('focused'));
        if (buttons[idx]) {
            buttons[idx].classList.add('focused');
            buttons[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    },

    focusCategories() {
        // Aktif kategoriyi fokusla
        const activeBtn = document.querySelector('.category-btn.active') || document.querySelector('.category-btn');
        if (activeBtn) {
            document.querySelectorAll('.channel-card.focused').forEach(c => c.classList.remove('focused'));
            activeBtn.classList.add('focused');
            this.currentSection = 'categories';
        }
    },

    /**
     * Kanal kartını fokusla
     */
    focusChannelCard(card) {
        if (!card) return;

        // Önceki fokusları temizle
        document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));

        card.classList.add('focused');
        this.currentSection = 'channels';

        // Görünür alana kaydır
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    /**
     * Player kontrolleri navigasyon
     */
    navigateInSection(section, direction) {
        let elements;

        if (section === 'player') {
            elements = Array.from(document.querySelectorAll('#playerControls [data-focusable]:not(.hidden)'));
        } else {
            elements = Array.from(document.querySelectorAll('.admin-overlay [data-focusable]'));
        }

        if (elements.length === 0) return;

        const focused = elements.find(el => el.classList.contains('focused'));
        let idx = focused ? elements.indexOf(focused) : -1;

        if (direction === 'left') idx = Math.max(0, idx - 1);
        else if (direction === 'right') idx = Math.min(elements.length - 1, idx + 1);
        else if (direction === 'up') idx = Math.max(0, idx - 1);
        else if (direction === 'down') idx = Math.min(elements.length - 1, idx + 1);

        elements.forEach(el => el.classList.remove('focused'));
        if (elements[idx]) {
            elements[idx].classList.add('focused');
        }
    },

    /**
     * Mini kanal listesi navigasyon
     */
    navigateMiniList(direction) {
        const items = Array.from(document.querySelectorAll('.mini-channel-item'));
        const focused = document.querySelector('.mini-channel-item.focused');
        let idx = focused ? items.indexOf(focused) : -1;

        if (direction === 'up') idx = Math.max(0, idx - 1);
        else if (direction === 'down') idx = Math.min(items.length - 1, idx + 1);
        else if (direction === 'left') {
            App.toggleMiniList();
            return;
        }

        items.forEach(i => i.classList.remove('focused'));
        if (items[idx]) {
            items[idx].classList.add('focused');
            items[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    /**
     * Seçili öğeyi aktive et
     */
    activateFocused() {
        // Kategori buton?
        const focusedCat = document.querySelector('.category-btn.focused');
        if (focusedCat) {
            focusedCat.click();
            const category = focusedCat.dataset.category;
            App.filterByCategory(category);

            // Aktif stili güncelle
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            focusedCat.classList.add('active');

            // İlk kanala fokuslan
            setTimeout(() => {
                const firstCard = document.querySelector('.channel-card:not(.hidden)');
                if (firstCard) this.focusChannelCard(firstCard);
            }, 100);
            return;
        }

        // Kanal kartı?
        const focusedCard = document.querySelector('.channel-card.focused');
        if (focusedCard) {
            const channelId = focusedCard.dataset.channelId;
            App.playChannel(channelId);
            return;
        }

        // Player butonu?
        const focusedBtn = document.querySelector('.player-btn.focused, .player-error button.focused');
        if (focusedBtn) {
            focusedBtn.click();
            return;
        }

        // Mini kanal listesi?
        const focusedMiniItem = document.querySelector('.mini-channel-item.focused');
        if (focusedMiniItem) {
            const channelId = focusedMiniItem.dataset.channelId;
            App.playChannel(channelId);
            App.toggleMiniList();
            return;
        }

        // Admin buton?
        const focusedAdmin = document.querySelector('#btnAdmin.focused');
        if (focusedAdmin) {
            App.toggleAdmin();
            return;
        }

        // Admin nav buton?
        const focusedNav = document.querySelector('.admin-nav-btn.focused');
        if (focusedNav) {
            focusedNav.click();
            return;
        }
    },

    /**
     * Geri tuşu
     */
    handleBack() {
        const miniList = document.getElementById('miniChannelList');

        // Mini liste açık?
        if (!miniList.classList.contains('hidden')) {
            App.toggleMiniList();
            return;
        }

        // Player açık?
        if (App.isPlayerVisible()) {
            if (Player.controlsVisible) {
                Player.hideControls();
            } else {
                App.closePlayer();
            }
            return;
        }

        // Admin açık?
        if (App.isAdminVisible()) {
            App.closeAdmin();
            return;
        }

        // Arama aktif?
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value) {
            searchInput.value = '';
            App.performSearch('');
            return;
        }

        // Ana sayfadayız - çıkış sorusu gösterebiliriz
    },

    /**
     * Rakam tuşu girişi (kanal numarası ile geçiş)
     */
    handleNumberInput(num) {
        this.channelNumberBuffer += num.toString();

        // OSD göster
        if (App.isPlayerVisible()) {
            const switchEl = document.getElementById('channelSwitch');
            const switchNum = document.getElementById('switchNumber');
            const switchName = document.getElementById('switchName');

            switchNum.textContent = this.channelNumberBuffer;

            // Kanal adını bul
            const channel = App.getChannelByNumber(parseInt(this.channelNumberBuffer));
            switchName.textContent = channel ? channel.name : '';

            switchEl.classList.remove('hidden');
        }

        // Timeout - 2 saniye sonra kanala geç
        clearTimeout(this.channelNumberTimeout);
        this.channelNumberTimeout = setTimeout(() => {
            const chNum = parseInt(this.channelNumberBuffer);
            const channel = App.getChannelByNumber(chNum);

            if (channel) {
                App.playChannel(channel.id);
            }

            this.channelNumberBuffer = '';
            const switchEl = document.getElementById('channelSwitch');
            if (switchEl) switchEl.classList.add('hidden');
        }, 2000);
    },

    // ======== Yardımcı Fonksiyonlar ========

    isKeyIn(keyCode, keyArray) {
        return keyArray.includes(keyCode);
    },

    isNumberKey(keyCode) {
        return (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105) ||
               (keyCode >= 7 && keyCode <= 16);
    },

    getNumber(keyCode) {
        if (keyCode >= 48 && keyCode <= 57) return keyCode - 48;
        if (keyCode >= 96 && keyCode <= 105) return keyCode - 96;
        if (keyCode >= 7 && keyCode <= 16) return keyCode - 7;
        return 0;
    },

    getFocusedElement() {
        return document.querySelector('.focused');
    },

    focusElement(el) {
        document.querySelectorAll('.focused').forEach(e => e.classList.remove('focused'));
        el.classList.add('focused');
    },

    refreshFocusableElements(section) {
        if (section === 'player') {
            this.focusableElements = Array.from(
                document.querySelectorAll('#playerControls [data-focusable]')
            );
        }
    },

    applyFocus() {
        this.focusableElements.forEach(el => el.classList.remove('focused'));
        if (this.focusableElements[this.currentFocusIndex]) {
            this.focusableElements[this.currentFocusIndex].classList.add('focused');
        }
    }
};
