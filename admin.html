<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TİVİM - Admin Panel</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/admin.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            overflow: auto;
            cursor: auto;
            padding: 20px;
            min-height: 100vh;
        }

        .admin-standalone {
            max-width: 1200px;
            margin: 0 auto;
        }

        .admin-standalone .admin-container {
            width: 100%;
            max-height: none;
            position: relative;
        }

        .login-form {
            max-width: 400px;
            margin: 100px auto;
            background: var(--bg-secondary);
            padding: 40px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            text-align: center;
        }

        .login-form h1 {
            margin-bottom: 8px;
            font-size: 28px;
        }

        .login-form p {
            color: var(--text-muted);
            margin-bottom: 24px;
        }

        .login-form input {
            width: 100%;
            padding: 14px 20px;
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: var(--radius-sm);
            color: white;
            font-size: 16px;
            margin-bottom: 16px;
            text-align: center;
            font-family: var(--font);
        }

        .login-form input:focus {
            outline: none;
            border-color: var(--accent);
        }

        .login-form button {
            width: 100%;
            padding: 14px;
            background: var(--accent);
            border: none;
            border-radius: var(--radius-sm);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            font-family: var(--font);
        }

        .login-form button:hover {
            background: #2563eb;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--accent);
            text-decoration: none;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="admin-standalone">
        <!-- Login Form -->
        <div id="loginForm" class="login-form">
            <div class="splash-logo" style="width:80px;height:80px;margin:0 auto 20px;border-radius:20px;font-size:32px;">
                <i class="fas fa-lock"></i>
            </div>
            <h1>Admin Giriş</h1>
            <p>TİVİM yönetim paneline erişmek için şifreyi girin</p>
            <input type="password" id="passwordInput" placeholder="Şifre" autofocus>
            <button onclick="login()">Giriş Yap</button>
            <br><br>
            <a href="index.html" class="back-link">
                <i class="fas fa-arrow-left"></i> TV'ye Dön
            </a>
        </div>

        <!-- Admin Panel (giriş sonrası) -->
        <div id="adminPanel" class="hidden">
            <a href="index.html" class="back-link">
                <i class="fas fa-arrow-left"></i> TV'ye Dön
            </a>
            <div id="adminContainer"></div>
        </div>
    </div>

    <script src="js/storage.js"></script>
    <script src="js/parser.js"></script>
    <script>
        function login() {
            const password = document.getElementById('passwordInput').value;
            const settings = Storage.getSettings();

            if (password === settings.password) {
                document.getElementById('loginForm').classList.add('hidden');
                document.getElementById('adminPanel').classList.remove('hidden');
                loadAdminPanel();
            } else {
                alert('Yanlış şifre!');
                document.getElementById('passwordInput').value = '';
                document.getElementById('passwordInput').focus();
            }
        }

        // Enter tuşu ile giriş
        document.getElementById('passwordInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') login();
        });

        async function loadAdminPanel() {
            const settings = Storage.getSettings();
            const stats = Storage.getStats();

            // Kanalları yükle
            let channels = [];
            const cache = Storage.getCachedChannels();
            if (cache && cache.data) {
                channels = cache.data;
            } else {
                try {
                    channels = await M3UParser.fetchAndParse(settings.m3uUrl);
                } catch (e) {
                    console.error(e);
                }
            }

            const categories = M3UParser.extractCategories(channels);
            const favorites = Storage.getFavorites();

            const container = document.getElementById('adminContainer');
            container.innerHTML = `
                <div class="admin-container">
                    <div class="admin-header">
                        <h1><i class="fas fa-cog"></i> TİVİM Admin Panel</h1>
                        <span style="color:var(--text-muted)">v1.0</span>
                    </div>
                    <div class="admin-body">
                        <div class="admin-sidebar">
                            <button class="admin-nav-btn active" onclick="showSection('dashboard', this)">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </button>
                            <button class="admin-nav-btn" onclick="showSection('playlist', this)">
                                <i class="fas fa-list"></i> Playlist
                            </button>
                            <button class="admin-nav-btn" onclick="showSection('channels', this)">
                                <i class="fas fa-tv"></i> Kanallar
                            </button>
                            <button class="admin-nav-btn" onclick="showSection('settings', this)">
                                <i class="fas fa-sliders-h"></i> Ayarlar
                            </button>
                            <button class="admin-nav-btn" onclick="showSection('backup', this)">
                                <i class="fas fa-database"></i> Yedekleme
                            </button>
                        </div>
                        <div class="admin-content">
                            <!-- Dashboard -->
                            <div class="admin-section active" id="sec-dashboard">
                                <h2><i class="fas fa-tachometer-alt"></i> Genel Bakış</h2>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-icon blue"><i class="fas fa-tv"></i></div>
                                        <div class="stat-value">${channels.length}</div>
                                        <div class="stat-label">Toplam Kanal</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon green"><i class="fas fa-layer-group"></i></div>
                                        <div class="stat-value">${categories.length}</div>
                                        <div class="stat-label">Kategori</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon yellow"><i class="fas fa-star"></i></div>
                                        <div class="stat-value">${favorites.length}</div>
                                        <div class="stat-label">Favori Kanal</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon purple"><i class="fas fa-clock"></i></div>
                                        <div class="stat-value">${settings.lastUpdate ? new Date(settings.lastUpdate).toLocaleDateString('tr-TR') : 'Hiç'}</div>
                                        <div class="stat-label">Son Güncelleme</div>
                                    </div>
                                </div>
                                <h3 style="margin-bottom:12px;">Kategori Dağılımı</h3>
                                ${categories.map(cat => `
                                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border);">
                                        <span><i class="fas ${cat.icon}" style="width:20px;margin-right:10px;color:var(--accent);"></i>${cat.name}</span>
                                        <div style="display:flex;align-items:center;gap:12px;">
                                            <div style="width:200px;height:6px;background:var(--bg-card);border-radius:3px;overflow:hidden;">
                                                <div style="height:100%;width:${(cat.count/channels.length*100).toFixed(0)}%;background:var(--accent);border-radius:3px;"></div>
                                            </div>
                                            <span style="color:var(--text-muted);min-width:40px;text-align:right;">${cat.count}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Playlist -->
                            <div class="admin-section" id="sec-playlist">
                                <h2><i class="fas fa-list"></i> Playlist Ayarları</h2>
                                <div class="form-group">
                                    <label>M3U/M3U8 Playlist URL</label>
                                    <input type="url" id="pUrl" value="${settings.m3uUrl}">
                                </div>
                                <div class="form-group">
                                    <label>Güncelleme Aralığı</label>
                                    <select id="pInterval">
                                        <option value="1800000" ${settings.updateInterval==1800000?'selected':''}>30 Dakika</option>
                                        <option value="3600000" ${settings.updateInterval==3600000?'selected':''}>1 Saat</option>
                                        <option value="21600000" ${settings.updateInterval==21600000?'selected':''}>6 Saat</option>
                                        <option value="86400000" ${settings.updateInterval==86400000?'selected':''}>24 Saat</option>
                                    </select>
                                </div>
                                <div style="display:flex;gap:12px;">
                                    <button class="btn btn-primary" onclick="savePlaylist()"><i class="fas fa-save"></i> Kaydet</button>
                                    <button class="btn btn-success" onclick="refreshNow()"><i class="fas fa-sync-alt"></i> Şimdi Güncelle</button>
                                </div>
                            </div>

                            <!-- Kanallar -->
                            <div class="admin-section" id="sec-channels">
                                <h2><i class="fas fa-tv"></i> Kanal Listesi (${channels.length})</h2>
                                <input type="text" placeholder="Kanal ara..." style="width:100%;padding:10px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;color:white;margin-bottom:16px;font-size:14px;"
                                    oninput="filterChannels(this.value)">
                                <div style="max-height:600px;overflow-y:auto;" id="chListContainer">
                                    <table class="channel-table" id="chTable">
                                        <thead><tr><th>#</th><th>Kanal</th><th>Kategori</th><th>Tür</th><th>Durum</th></tr></thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Ayarlar -->
                            <div class="admin-section" id="sec-settings">
                                <h2><i class="fas fa-sliders-h"></i> Genel Ayarlar</h2>
                                <div class="form-group">
                                    <label>Admin Şifresi</label>
                                    <input type="text" id="sPassword" value="${settings.password}">
                                </div>
                                <div class="form-group">
                                    <label>Varsayılan Ses: <strong id="sVolVal">${settings.volume}%</strong></label>
                                    <input type="range" id="sVolume" min="0" max="100" value="${settings.volume}" oninput="document.getElementById('sVolVal').textContent=this.value+'%'">
                                </div>
                                <button class="btn btn-primary" onclick="saveGeneralSettings()"><i class="fas fa-save"></i> Kaydet</button>
                            </div>

                            <!-- Yedekleme -->
                            <div class="admin-section" id="sec-backup">
                                <h2><i class="fas fa-database"></i> Veri Yönetimi</h2>
                                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
                                    <button class="btn btn-primary" onclick="exportBackup()"><i class="fas fa-download"></i> Dışa Aktar</button>
                                    <button class="btn btn-danger" onclick="clearCache()"><i class="fas fa-broom"></i> Cache Temizle</button>
                                    <button class="btn btn-danger" onclick="resetEverything()"><i class="fas fa-trash"></i> Tümünü Sıfırla</button>
                                </div>
                                <div class="admin-alert info">
                                    <i class="fas fa-info-circle"></i>
                                    LocalStorage: ~${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB kullanılıyor
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Kanal tablosunu doldur
            renderChannelTable(channels);
        }

        // Kanal tablosu
        let allChannels = [];
        function renderChannelTable(channels) {
            allChannels = channels;
            const tbody = document.querySelector('#chTable tbody');
            tbody.innerHTML = channels.slice(0, 200).map(ch => `
                <tr>
                    <td>${ch.number}</td>
                    <td style="display:flex;align-items:center;gap:8px;">
                        ${ch.logo ? `<img src="${ch.logo}" style="width:28px;height:28px;border-radius:4px;object-fit:contain;background:var(--bg-card);" onerror="this.style.display='none'">` : ''}
                        <span>${ch.name}</span>
                    </td>
                    <td>${ch.group}</td>
                    <td>${ch.type.toUpperCase()}</td>
                    <td>
                        <div class="toggle-switch ${Storage.isChannelHidden(ch.id)?'':'active'}" 
                             onclick="this.classList.toggle('active');Storage.toggleChannelVisibility('${ch.id}')"></div>
                    </td>
                </tr>
            `).join('');
        }

        function filterChannels(q) {
            q = q.toLowerCase();
            const filtered = allChannels.filter(ch => ch.name.toLowerCase().includes(q) || ch.group.toLowerCase().includes(q));
            renderChannelTable(filtered);
        }

        function showSection(name, btn) {
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('sec-' + name).classList.add('active');
            btn.classList.add('active');
        }

        function savePlaylist() {
            Storage.updateSettings({
                m3uUrl: document.getElementById('pUrl').value,
                updateInterval: parseInt(document.getElementById('pInterval').value)
            });
            alert('Kaydedildi!');
        }

        function refreshNow() {
            Storage.remove('channelCache');
            alert('Cache temizlendi. Ana sayfaya dönüp yeniden açın.');
        }

        function saveGeneralSettings() {
            Storage.updateSettings({
                password: document.getElementById('sPassword').value,
                volume: parseInt(document.getElementById('sVolume').value)
            });
            alert('Ayarlar kaydedildi!');
        }

        function exportBackup() {
            const data = Storage.exportData();
            const blob = new Blob([data], {type:'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'tivim_backup.json';
            a.click();
        }

        function clearCache() {
            Storage.remove('channelCache');
            alert('Cache temizlendi!');
        }

        function resetEverything() {
            if(confirm('TÜM veriler silinecek! Emin misiniz?')) {
                Storage.clearAll();
                alert('Tüm veriler silindi.');
                location.reload();
            }
        }
    </script>
</body>
</html>
