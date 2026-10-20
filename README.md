# 🌌 Nova Bot

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:09090B,50:6D28D9,100:A855F7&height=230&section=header&text=NOVA%20BOT&fontSize=56&fontColor=FFFFFF&fontAlignY=38&desc=Multi-Bot%20Discord%20Infrastructure%20%7C%20TypeScript%20%7C%20Web%20Dashboard&descAlignY=58&descSize=15" width="100%" alt="Nova Bot Banner"/>

### Tek projeden, istediğin kadar botla çalışan Türkçe Discord altyapısı.

**Moderasyon · Guard · Seviye · Ekonomi · Ticket · Davet Takibi · Web Panel**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Komut](https://img.shields.io/badge/Komut-167-8B5CF6?style=for-the-badge)](#-tüm-komutlar)

</div>

---

## 📑 İçindekiler

[Hakkında](#-hakkında) · [Öne çıkanlar](#-öne-çıkanlar) · [Teknoloji](#️-teknoloji-yığını) · [Kurulum](#-kurulum) · [Çoklu bot](#-çoklu-bot-kurulumu) · [Slash ve prefix](#️-slash-ve-prefix-komutlar) · [Komut özeti](#-komut-özeti) · [Mimari](#️-mimari) · [Sistemler](#️-sistemler-ayrıntılı) · [Tüm komutlar](#-tüm-komutlar) · [Web panel](#️-web-panel) · [Ayarlar](#-ayarlar-ve-ortam-değişkenleri) · [Yetkiler](#-gerekli-yetkiler-ve-intentler) · [Proje yapısı](#️-proje-yapısı-ve-yeni-komut-ekleme) · [Sınırlar](#️-bilinen-sınırlar) · [Sorun giderme](#-sorun-giderme)

---

## 👨‍💻 Hakkında

Nova Bot; sunucu yönetimini, korumayı, topluluk etkileşimini ve eğlenceyi tek altyapıda toplayan bir Discord botu projesidir. Büyük sunucularda genelde karşılama, koruma, kayıt, istatistik gibi işler ayrı botlara bölünür; burada hepsi **tek kod tabanında**, her biri **kendi tokeniyle ayrı bot** olarak çalıştırılabilir. İstersen tek botla hepsini birden de çalıştırırsın.

- 🎯 **Amaç:** Dağınık birkaç botun işini tek, bakımı kolay bir projede toplamak
- ⚙️ **Yaklaşım:** Modüler mimari, her özellik bir modül; botlara modül atayarak dağıtım
- 🎨 **Arayüz:** Koyu temalı, mobil uyumlu, Discord girişli EJS web paneli
- 🗄️ **Veri:** Ek servis gerektirmeyen JSON dosyası (`data/db.json`)

---

## 🚀 Öne Çıkanlar

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:18181B,100:6D28D9&height=100&text=MULTI-BOT%20DISCORD%20INFRASTRUCTURE&fontSize=23&fontColor=FFFFFF" width="100%" alt="Multi-Bot Discord Infrastructure"/>

### 🤖 167 komut · 117 alt komut · sınırsız bot

**Güçlü, modüler ve tek komutla kurulabilen bir Discord altyapısı.**

[![Moderasyon](https://img.shields.io/badge/Moderasyon-AutoMod%20%7C%20Jail-EF4444?style=flat-square)](#️-sistemler-ayrıntılı)
[![Guard](https://img.shields.io/badge/Guard-Anti--Raid%20%7C%20Yedek-7C3AED?style=flat-square)](#️-sistemler-ayrıntılı)
[![Topluluk](https://img.shields.io/badge/Topluluk-Seviye%20%7C%20Market%20%7C%20Ticket-22C55E?style=flat-square)](#️-sistemler-ayrıntılı)
[![Panel](https://img.shields.io/badge/Panel-EJS%20%2B%20Express-B4CA65?style=flat-square)](#️-web-panel)

</div>

### ✨ Ana Özellikler

- 🧩 **Çoklu Bot Mimarisi:** `bots.json` ile her bota istediğin modülleri ver (Guard, karşılama, istatistik...). Hepsi aynı süreçte çalışır ve veriyi paylaşır.
- ⌨️ **Hibrit Komutlar:** `/yasakla` ve `.yasakla` aynı kodu çalıştırır. Prefix sunucu başına değişir (varsayılan `.`), İngilizce takma adlar (`.ban`, `.kick`) hazırdır.
- 🛡️ **Koruma Katmanı:** Guard (kanal/rol silme, izinsiz bot, ban limiti), anti-raid, AutoMod ve günlük otomatik yedek.
- ⚙️ **Tek Komutla Kurulum:** `/kurulum hepsi` log kanallarını, jail'i, özel oda sistemini ve üye sayacını kurar.
- 📈 **Topluluk Sistemleri:** Seviye + rol ödülleri, ekonomi + market, ticket (transkriptli), çekiliş, starboard, **davet takibi**, kayıt, özel ses odaları.
- 🎬 **Animasyon & GIF:** 24 hareketli GIF etkileşimi, animasyonlu slot/rulet/zar, özel hareketli emoji desteği.
- 🌐 **Canlı Bilgi:** Spotify dinleme durumu, YouTube/Twitch bildirimi, hava, döviz, kripto, TDK, namaz vakti, deprem, anime ve daha fazlası.
- 📋 **Ayrı Log Kanalları:** Mesaj, ses, üye, mod ve guard logları ayrı kanallara akar.
- 🖥️ **Web Panel:** Discord ile giriş, tarayıcıdan ayar yönetimi, herkese açık sıralama sayfası.
- 🧪 **Genişletilebilir:** Yeni komut eklemek için tek dosya yeterli; hiçbir yere kayıt gerekmez.

---

## 🛠️ Teknoloji Yığını

| Kategori | Teknolojiler |
|---|---|
| Diller | TypeScript, JavaScript |
| Discord Framework | discord.js v14 |
| Çalışma Zamanı | Node.js ≥ 18.17 |
| Web Panel | Express, EJS, express-session, Discord OAuth2 |
| Veri | JSON dosyası (`data/db.json`), atomik yazma |
| Geliştirme | tsx (watch), TypeScript derleyici |
| Yapılandırma | Ortam değişkenleri (`.env`), `bots.json`, `emojis.json` |
| Dış Servisler | nekos.best, Jikan, CoinGecko, wttr.in, Aladhan, Vikipedi, YouTube RSS, Twitch Helix ve diğerleri |

---

## 📦 Kurulum

**Gereksinimler**

- Node.js 18.17 veya üstü ve npm
- Bir Discord uygulaması ve bot tokeni
- *(Panel için)* OAuth2 Client Secret

**1. Discord uygulaması**
[Developer Portal](https://discord.com/developers/applications) → *New Application*

- **Bot** sekmesi → Token'ı kopyala ve iki **Privileged Intent**'i aç: ✅ *Server Members* ✅ *Message Content*
- **OAuth2** sekmesi → *Client Secret*'ı kopyala, *Redirects*'e `http://localhost:3000/callback` ekle

**2. Projeyi kur**

**Linux / macOS**

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
npm install
cp .env.example .env
# .env dosyasını doldur
npm run dev
```

**Windows PowerShell**

```powershell
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
npm install
Copy-Item .env.example .env
# .env dosyasını doldur
npm run dev
```

**3. Botu sunucuna ekle ve kur**
Panelde `http://localhost:3000` → *Botu Ekle* (veya sunucuda `/davet`). Sonra yönetici olarak: **`/kurulum hepsi`**

> 💡 Test için `.env` içine `GUILD_ID` yaz: komutlar o sunucuya anında yüklenir. Boşsa global yüklenir (yayılması uzun sürebilir).

⚠️ Gerçek `.env` dosyanı, bot tokenlerini ve `bots.json`'u asla GitHub'a yükleme. İkisi de `.gitignore` içindedir.

### ⚙️ Yayın (PM2)

```bash
npm run build
pm2 start dist/index.js --name nova-bot
pm2 save
```

Yayında `DASHBOARD_URL`'yi `https://` alan adına çevir, aynı adresi Discord'daki *Redirects*'e ekle ve `SESSION_SECRET`'ı rastgele uzun bir değerle değiştir. Çalışma dizini proje kökü olmalı (panel dosyaları ve `data/` oradan okunur).

---

## 🧩 Çoklu Bot Kurulumu

Büyük sunuculardaki "6-10 botlu" düzeni tek projeyle kurarsın.

**1.** Developer Portal'da her bot için ayrı uygulama oluştur (her birinde Server Members + Message Content intent'ini aç).
**2.** `bots.example.json` → `bots.json` olarak kopyala.
**3.** Her bota token, clientId ve modülleri yaz:

```json
{
  "bots": [
    { "name": "Ana",       "token": "...", "clientId": "...", "modules": ["core", "moderation", "level", "economy", "fun", "tools"] },
    { "name": "Guard",     "token": "...", "clientId": "...", "modules": ["guard", "jail"] },
    { "name": "Karşılama", "token": "...", "clientId": "...", "modules": ["welcome", "register"] },
    { "name": "İstatistik","token": "...", "clientId": "...", "modules": ["stats", "logs", "rooms"] }
  ]
}
```

**4.** `npm run dev`. `bots.json` varsa `.env`'deki `TOKEN`/`CLIENT_ID` kullanılmaz.

### 🧱 Modüller

| Modül | Önerilen bot | İçerdiği |
|---|---|---|
| `core` | Ana | `/ayarla`, `/kurulum`, `/yardim`, `/davet`, `/bilgi`, `/sunucuyonet`, `/cekilis`, `/ticket-kur`, bilgi komutları |
| `moderation` | Ana | yasakla/at/sustur/uyar..., rol-kanal-ses yönetimi, **AutoMod** |
| `guard` | Guard | `/guard`, `/yedek`, kanal/rol/bot koruması, **anti-raid**, günlük otomatik yedek |
| `jail` | Guard | `/jail`, `/unjail`, süre takibi, kaçanı yakalama |
| `welcome` | Karşılama | hoş geldin/ayrılma, otorol, kayıtsız rol, **davet takibi**, boost duyurusu |
| `register` | Karşılama | `/kayit` |
| `logs` | İstatistik | mesaj, ses, üye ve rol logları |
| `level` | Ana | XP, seviye, seviye rolleri, sıralamalar |
| `economy` | Ana | para, banka, market, yönetici ekonomi komutları |
| `fun` | Ana | oyunlar, GIF'ler, internet komutları, metin araçları |
| `tools` | Ana | ticket/çekiliş/hatırlatıcı arka işleri, starboard, AFK, snipe, anket, emoji, oto cevap, özel komut |
| `stats` | İstatistik | `/istatistik`, ses süresi takibi, üye sayacı |
| `rooms` | İstatistik | özel ses odaları (`/oda`) |
| `notify` | Herhangi | `/yayin` (YouTube/Twitch) |
| `spotify` | Herhangi | `/spotify` (**Presence Intent** ister) |

### 📌 Kurallar

- ⚠️ **Aynı modülü iki bota verme.** Komutlar iki kez cevaplanır.
- `bots.json` yoksa `.env`'deki tek token ile **`spotify` hariç tüm modüller** tek botta çalışır.
- `spotify` modülünü verdiğin uygulamada **Presence Intent**'i de aç, yoksa o bot giriş yapamaz.
- `/cekilis` ve `/ticket-kur` `core` modülünde, ama çekilişi bitiren ve hatırlatıcıları gönderen zamanlayıcılar `tools` modülündedir. **`core` ve `tools` modüllerini aynı bota ver.**
- Tüm botlar **aynı süreçte** çalıştığı için aynı `db.json` verisini paylaşır. Ayrı süreç/sunucuda çalıştırırsan veri paylaşılmaz.
- Web panel **`bots.json`'daki ilk botun** uygulamasıyla Discord girişi yapar (o uygulamanın Client Secret'ı `.env` içindeki `CLIENT_SECRET` olmalı). En sağlam botu ilk sıraya koy.
- Bir bot giriş yapamazsa (yanlış token, kapalı intent) diğerleri çalışır, konsolda hata görürsün.
- Discord bir uygulamaya en fazla **100 slash komut** yükletir. Fazlası yüklenmez (konsolda uyarı çıkar) ama **prefix ile yine çalışır**.

---

## ⌨️ Slash ve Prefix Komutlar

Her komut tek bir kodla hem `/komut` hem `.komut` olarak çalışır.

```text
/yasakla kullanici:@Ali sebep:spam      ←→      .yasakla @Ali spam
/zar kenar:20 adet:2                    ←→      .zar 20 2
/internet kur kaynak:usd hedef:try      ←→      .internet kur usd try 100
.ban @Ali spam                          # İngilizce takma ad
.yardim snipe                           # bir komutun detayı
```

- **Varsayılan prefix `.`**: `/ayarla prefix` ya da panelden değişir. Botu etiketleyerek de çağırabilirsin: `@Nova yardim`.
- **Boşluklu ilk argüman** için tırnak: `.cekilis baslat "Nitro Classic" 60`.
- Seçenekleri atlamak serbest: `.snipe 2` ve `.snipe duzenlenen` ikisi de çalışır.
- Yanlış kullanımda bot doğru biçimi gösterir. Prefix de slash ile aynı yetkiyi arar.
- **Sadece prefix komutları** (68 tane) slash menüsünde görünmez, Discord'un 100 komut sınırına sayılmaz. Örn. `.saril`, `.market`, `.base64`.
- Liste: `.yardim` · Detay: `.yardim <komut>`

---

## 🎼 Komut Özeti

| Kategori | Komutlar |
|---|---|
| Moderasyon | `/yasakla`, `/at`, `/sustur`, `/uyar`, `/temizle`, `/kanal`, `/rol`, `/nick` |
| Gelişmiş Yönetim | `/rolyonet`, `/kanalyonet`, `/sesyonet`, `/sunucuyonet`, `/sunucukilit`, `/nuke` |
| Koruma | `/guard`, `/yedek`, `/jail`, `/unjail` |
| Kurulum | `/kurulum`, `/ayarla`, `/ticket-kur`, `/dogrulama`, `/butonrol` |
| Seviye | `/seviye`, `/profil`, `/siralama`, `/seviyerol`, `/rep` |
| Ekonomi | `/bakiye`, `/gunluk`, `/calis`, `/yatir`, `/cek`, `/soygun`, `/ekoyonet` · `.market` |
| Oyunlar | `/slot`, `/rulet`, `/xox`, `/tkm`, `/trivia`, `/adamasmaca`, `/sayitahmin` |
| Etkileşim | `/etkilesim` · `.saril`, `.tokat`, `.dans` ... (24 GIF) |
| İnternet | `/internet`, `/ceviri`, `/tdk`, `/namaz`, `/deprem`, `/github`, `/anime` |
| Araçlar | `/snipe`, `/otocevap`, `/hatirlat`, `/anket`, `/emoji`, `/qr`, `/zaman` |
| Müzik/Medya | `/spotify` (dinlenen şarkı), `/yayin` (YouTube/Twitch bildirimi) |

Tam liste aşağıda: [Tüm komutlar](#-tüm-komutlar).

---

## 🏗️ Mimari

```text
                    DISCORD KULLANICILARI
                            |
         +------------------+------------------+
         |                  |                  |
     Bot: Ana          Bot: Guard         Bot: Karşılama   ...  (bots.json)
   core, moderation,     guard, jail       welcome, register
   level, economy ...
         |                  |                  |
         +------------------+------------------+
                            |
                            v
              Komut Yükleyici + Olay Sistemi
        (klasör = modül, olaylar modüle göre kapanır)
                            |
         +------------------+------------------+
         |                                     |
         v                                     v
   Prefix ↔ Slash Köprüsü                Web Panel (Express + EJS)
 (tek execute, iki giriş)               Discord OAuth2, CSRF, ayarlar
         |                                     |
         +------------------+------------------+
                            |
                            v
                  JSON Veri Deposu (db.json)
                  tüm botlar için ortak
```

### 🎯 Geliştirme Hedefleri

- [ ] Müzik modülü (ayrı bir Lavalink sunucusuyla)
- [ ] SQLite/PostgreSQL desteği (büyük sunucu sayıları için)
- [ ] Dockerfile ve docker compose yapılandırması
- [ ] Panelde komut açma/kapama ve rol-seviye yönetimi

*(Bunlar henüz yapılmadı; yol haritasıdır.)*

---

## 🛠️ Sistemler Ayrıntılı

<details>
<summary><b>🛡️ AutoMod</b> (<code>moderation</code>)</summary>

Davet linki, tüm linkler, aşırı büyük harf, spam (5 sn'de 6 mesaj) ve yasaklı kelime filtresi. Her biri `/ayarla automod` ya da panelden ayrı ayrı açılır. İhlal eden mesaj silinir, kısa uyarı verilir, **mod-log**'a yazılır. *Mesajları Yönet* yetkisi olanlar muaftır. AutoMod'un sildiği mesajlar `/snipe`'a düşmez.
</details>

<details>
<summary><b>🔒 Guard</b> (<code>guard</code>) · sadece sunucu sahibi yönetir</summary>

`/guard durum acik:true` ile açılır. Denetim kaydına bakarak işlemi yapanı bulur; sahip, bu botlar ve beyaz listedekiler dışında herkese uygular:

| Olay | Tepki |
|---|---|
| Kanal silme | Cezalandırır, kanalı aynı ayarlarla **geri açar** |
| İzinsiz kanal/rol açma | Cezalandırır, açılanı siler |
| Rol silme | Cezalandırır, rolü geri açar |
| Role tehlikeli izin ekleme | Eklenen izni geri alır, cezalandırır |
| Üyeye tehlikeli rol verme | Rolü alır, vereni cezalandırır |
| İzinsiz bot ekleme | Botu atar, ekleyeni cezalandırır |
| Dakikada ban/kick limiti aşımı | Yasağı kaldırır, cezalandırır |
| Sunucu adı değiştirme | Eski adı geri yazar |

Ceza: `ban`, `kick` veya `strip` (rollerini al). Beyaz liste: `/guard izinver`. **Botun rolü en üstte olmalı ve *Denetim Kaydını Görüntüle* yetkisi olmalı.**
</details>

<details>
<summary><b>💾 Yedek</b> (<code>guard</code>)</summary>

`/yedek al` rol ve kanal yapısını (kategori, izin yazıları, konu, bitrate vs.) kaydeder. `/yedek yukle` yedekte olup sunucuda **eksik olanları** oluşturur, var olanlara dokunmaz. Guard açık sunucularda **günde bir otomatik yedek** alınır. Mesaj geçmişi, üye rolleri ve emojiler yedeklenmez.
</details>

<details>
<summary><b>🚨 Anti-raid</b> (<code>guard</code>)</summary>

`/ayarla antiraid`: belirlediğin sürede (örn. 10 sn) belirlediğin sayıda (örn. 5) giriş olursa o penceredeki herkes atılır ve koruma sürer. İsteğe bağlı minimum hesap yaşı (gün) belirlersin, daha yeni hesaplar atılır. Botlar kapsam dışıdır.
</details>

<details>
<summary><b>⚙️ Otomatik kurulum</b> (<code>core</code>)</summary>

`/kurulum <log|jail|oda|sayac|hepsi>`

- **log:** `SUNUCU LOGLARI` kategorisi ve 5 kanal (mod, mesaj, ses, üye, guard). Sadece yöneticiler ve bot görür.
- **jail:** `Cezalı` rolü, `cezali-bilgi` kanalı; rol diğer tüm kanallarda gizlenir.
- **oda:** `➕ Oda Oluştur` ses kanalı (özel oda sistemi).
- **sayac:** `👥 Üye: N` ses kanalı (10 dakikada bir güncellenir).

Tekrar çalıştırmak aynı kanalları yeniden kullanır, çift oluşturmaz.
</details>

<details>
<summary><b>📋 Log kanalları</b> (<code>logs</code> + diğerleri)</summary>

Türe göre ayrı kanallar: **mesaj** (silinen/düzenlenen), **ses** (giriş/çıkış/taşınma), **üye** (giriş/çıkış, takma ad ve rol değişimi), **mod** (yasak, atma, susturma, uyarı, jail, kayıt, AutoMod) ve **guard**. Tür için kanal ayarlı değilse genel log kanalı (`/ayarla log`) kullanılır.
</details>

<details>
<summary><b>⛓️ Jail</b> (<code>jail</code>)</summary>

`/jail uye dakika sebep`: üyenin rolleri kaydedilir, yalnızca Cezalı rolü kalır, seste ise çıkarılır. Süre bitince ya da `/unjail` ile eski rolleri geri verilir. `0` dakika = süresiz. Cezalıyken sunucudan çıkıp tekrar girenlere cezalı rolü yeniden verilir.
</details>

<details>
<summary><b>🔊 Özel ses odaları</b> (<code>rooms</code>)</summary>

Hub kanalına girince kullanıcı için kendi adıyla bir ses odası açılır, kullanıcı oraya taşınır ve odada kanalı yönetme yetkisi alır. Oda boşalınca silinir. Sahibi `/oda kilitle`, `ac`, `limit`, `isim` ile yönetir.
</details>

<details>
<summary><b>📝 Kayıt sistemi</b> (<code>register</code> + <code>welcome</code>)</summary>

`/ayarla kayit uye_rolu yetkili_rol kayitsiz_rol`: yeni giren **kayıtsız** rolü alır. Yetkili `/kayit @uye isim yas` yazınca üyenin adı `İsim | Yaş` olur, üye rolü verilir, kayıtsız rolü alınır. Kayıt yapan yetkilinin sayacı artar (`/istatistik`).
</details>

<details>
<summary><b>👋 Karşılama, otorol, davet takibi</b> (<code>welcome</code>)</summary>

Hoş geldin/ayrılma mesajı, otorol ve kayıtsız rol. Mesajda şu değişkenler kullanılır: `{user}` `{server}` `{count}` `{inviter}` `{invites}`. **Davet takibi:** üye girince hangi davetin kullanıldığına bakılıp davet eden bulunur; aktif/ayrılan sayısı tutulur (`/bilgi davet`, `.topdavet`). Bunun için botta **Sunucuyu Yönet** yetkisi olmalıdır. Sunucuya boost basılınca karşılama kanalında duyuru çıkar.
</details>

<details>
<summary><b>📈 Seviye ve 💰 ekonomi</b> (<code>level</code>, <code>economy</code>)</summary>

- **XP:** mesaj başına 15–25 XP, 60 sn bekleme. Seviye eşiği `5·seviye² + 50·seviye + 100`. `/seviyerol` ile seviyeye göre otomatik rol verilir.
- **Ses süresi** `stats` modülünde tutulur (`.topses`).
- **Para:** `/gunluk` (24 sa), `/calis` (1 sa), `/balikci` (30 dk), `/maden` (45 dk), `/suc` (1 sa, %40 ceza riski), `/haftalik` (7 gün), `/soygun` (1 sa, %40 şans). **Banka** (`/yatir`, `/cek`) soygundan korur.
- **Market:** yöneticiler `.marketekle 500 "VIP" @rol` ile ürün ekler; ürün rol verir ya da envantere girer. `.market`, `.satinal`, `.envanter`.
- **Kumar/oyun:** `/slot`, `/rulet`, `/yazitura` bahisli ve animasyonludur.
- **Yönetici:** `/ekoyonet` ile para/XP/seviye ver, al, sıfırla.
</details>

<details>
<summary><b>🎫 Ticket · 🎉 Çekiliş · ⭐ Starboard</b> (<code>core</code> + <code>tools</code>)</summary>

- **Ticket:** `/ticket-kur kanal yetkili_rol [kategori]` butonlu panel gönderir. Kullanıcı başına tek ticket; yetkili rolü ve kullanıcı görür. Kapanınca son 100 mesajın **transkripti** log kanalına ve kullanıcıya özelden gönderilir.
- **Çekiliş:** `/cekilis baslat odul dakika [kazanan]`; butonla katılım, süre dolunca otomatik biter (15 sn'de bir kontrol), `/cekilis bitir` ile erken bitirilir.
- **Starboard:** `/ayarla yildiz kanal [esik]`. Bir mesaj eşik kadar ⭐ alınca (varsayılan 3) kanala düşer, sayı canlı güncellenir.
</details>

<details>
<summary><b>🎬 GIF, animasyon ve emoji</b> (<code>fun</code>, <code>tools</code>)</summary>

- **GIF:** `/etkilesim` ya da kısa komutlar (`.saril @kisi`, `.tokat`, `.dans` ...): 24 farklı hareketli GIF ([nekos.best](https://nekos.best)).
- **Animasyon:** `/slot`, `/rulet`, `/zar`, `/yazitura` mesajı düzenleyerek animasyon yapar.
- **Hareketli emoji:** Bot hareketli emojiyi yalnızca **özel emoji** olarak gösterebilir. `emojis.example.json` dosyasını `emojis.json` yap ve kendi `<a:ad:id>` kodlarını yaz; animasyonlarda kullanılır. `/emoji ekle` başka sunucudaki hareketli emojiyi kendi sunucuna **Nitro gerektirmeden** kopyalar.
</details>

<details>
<summary><b>🎧 Spotify · 📺 Yayın bildirimi</b> (<code>spotify</code>, <code>notify</code>)</summary>

- **Spotify:** `/spotify [uye]` üyenin dinlediği şarkıyı kapak, sanatçı, albüm, ilerleme çubuğu ve "Spotify'da aç" butonuyla gösterir. Kullanıcının Spotify'ı Discord'a bağlı ve durumu görünür olmalı. *Presence Intent* gerekir. (Botun kendisi müzik **çalmaz**.)
- **Yayın:** `/yayin ekle platform hedef #kanal [mesaj]`
  - **YouTube:** kanal ID'si (`UC...`) ile, API anahtarı **gerekmez** (RSS kullanılır).
  - **Twitch:** kullanıcı adıyla; `.env`'de `TWITCH_CLIENT_ID` ve `TWITCH_CLIENT_SECRET` gerekir.
  - 3 dakikada bir kontrol edilir. Mesajda `{user}` `{title}` `{url}` kullanılır; `@everyone` yazabilirsin.
</details>

<details>
<summary><b>🕵️ Snipe · 💬 Oto cevap · ⌨️ Özel komut</b> (<code>tools</code>)</summary>

- **Snipe:** `.snipe` kanalda **son silinen** mesajı gösterir (son 10 tutulur: `.snipe 2`). `.snipe duzenlenen` düzenlenen mesajın eski ve yeni halini gösterir. Bellekte tutulur (bot kapanınca sıfırlanır), sadece yazıldığı kanalın kayıtları gösterilir, AutoMod'un sildikleri hariçtir.
- **Oto cevap:** `/otocevap ekle selam "Aleyküm selam {user}"`. Tam kelime eşleşir, kanalda 5 sn'de bir cevap verir, en fazla 50 kayıt.
- **Özel komut:** `/ozelkomut ekle kural "Kurallar #kurallar kanalında"` → `.kural` yazılınca cevap verir.
</details>

---

## 📚 Tüm Komutlar

> **S** = slash + prefix · **P** = sadece prefix · Hepsinde `.yardim <komut>` ile ayrıntı alırsın.

### 🛡️ Moderasyon (`moderation`) · 23

| Komut | Açıklama |
|---|---|
| **S** `yasakla` `at` `sustur` | Yasakla, at, süreli sustur (rol hiyerarşisi kontrol edilir) |
| **S** `yasakkaldir` `banliste` | Yasağı kaldır, son yasaklıları listele |
| **S** `uyar` `uyarilar` `uyarisil` | Uyarı sistemi, 3 uyarıda otomatik 1 saat susturma |
| **S** `temizle` | Toplu mesaj sil (kullanıcıya göre filtre) |
| **S** `kanal` | `kilitle` · `ac` · `yavasmod` |
| **S** `kanalyonet` | `olustur` `sil` `isim` `konu` `tasi` `klonla` `gizle` `goster` `nsfw` `sabitle` `sabitkaldir` `ilkmesaj` `liste` |
| **S** `rolyonet` | `topluver` `toplual` `renk` `isim` `sil` `ayir` `etiket` `kopyala` `uyeler` `liste` `temizle` |
| **S** `rol` `rololustur` `nick` | Rol ver/al, rol oluştur, takma ad |
| **S** `sesyonet` | `tasi` `at` `sustur` `sagirlastir` `herkesitasi` `bosalt` `liste` |
| **S** `sunucukilit` `nuke` | Acil durumda tüm kanalları kilitle, kanalı sıfırla |
| **P** `kilit` `kilitac` `yavas` `unmute` `zamanasimi` | Kısayollar ve susturulanlar listesi |

### 🔒 Koruma ve Ceza (`guard`, `jail`) · 4

| Komut | Açıklama |
|---|---|
| **S** `guard` | `durum` `ceza` `limit` `izinver` `izinal` `liste` |
| **S** `yedek` | `al` `yukle` `bilgi` |
| **S** `jail` `unjail` | Süreli cezalı sistemi |

### ⚙️ Sistem ve Bilgi (`core`) · 25

| Komut | Açıklama |
|---|---|
| **S** `ayarla` | `log` `hosgeldin` `ayrilma` `otorol` `automod` `seviye` `prefix` `yildiz` `antiraid` `kayit` `jail` `oda` `sayac` `panel` |
| **S** `kurulum` | `log` `jail` `oda` `sayac` `hepsi` |
| **S** `sunucuyonet` | `isim` `ikon` `bildirim` `dogrulama` `sistemkanal` `afk` `davetler` `davetolustur` `istatistik` |
| **S** `cekilis` `ticket-kur` | Çekiliş ve destek paneli |
| **S** `yardim` `davet` `ping` `bilgi` | Yardım, tüm botların davet linkleri, gecikme, `bilgi rol/kanal/bot/davet` |
| **S** `kullanici` `avatar` `banner` `yetkiler` `sunucu` | Üye ve sunucu bilgileri |
| **P** `sunucuikon` `sunucubanner` `uyesayisi` `botlar` `yoneticiler` `boosterlar` `yeniuyeler` `eskiuyeler` `rastgeleuye` `hesapyasi` `id` | Sunucu ve üye listeleri |

### 📈 Seviye (`level`) · 11

| Komut | Açıklama |
|---|---|
| **S** `seviye` `profil` `siralama` | Kart, tam profil, sıralama (seviye/para/ses/mesaj/davet/itibar) |
| **S** `seviyerol` | `ekle` `sil` `liste` |
| **S** `rep` `hakkimda` | Günde bir itibar ver, profil yazısı |
| **P** `topmesaj` `topses` `topdavet` `toprep` `zenginler` | Kısa sıralamalar |

### 💰 Ekonomi ve Market (`economy`) · 17

| Komut | Açıklama |
|---|---|
| **S** `bakiye` `gunluk` `haftalik` `calis` `balikci` `maden` `suc` | Para kazanma |
| **S** `yatir` `cek` `gonder` `soygun` | Banka, transfer, soygun |
| **S** `ekoyonet` | `paraver` `parasil` `parasifirla` `herkesepara` `xpver` `seviyeayarla` `sifirla` |
| **P** `market` `satinal` `envanter` `marketekle` `marketsil` | Sunucu marketi |

### 🎮 Eğlence ve Araçlar (`fun`) · 68

| Komut | Açıklama |
|---|---|
| **S** `slot` `rulet` `yazitura` | Animasyonlu, bahisli |
| **S** `zar` `tkm` `xox` `sayitahmin` `adamasmaca` `trivia` | Oyunlar (butonlu veya sohbetle) |
| **S** `eglence` | `espri` `tersyaz` `alayci` `emojiyaz` `sec` `ship` |
| **S** `sor` `fal` `soz` `iltifat` `dogruluk` `yuzde` | Eğlence |
| **S** `etkilesim` | 24 hareketli GIF etkileşimi |
| **S** `internet` | `hava` `kur` `kripto` `wiki` `meme` `hayvan` |
| **S** `ceviri` `tdk` `namaz` `deprem` `github` `minecraft` `anime` | Canlı bilgi komutları |
| **S** `hesapla` | Güvenli matematik ayrıştırıcı (`eval` yok) |
| **P** 24 GIF komutu | `saril` `oksa` `tokat` `opucuk` `sarmala` `durt` `dans` `agla` `gul` `elsalla` `isir` `kizar` `gulumse` `goz` `yumruk` `tekme` `gidikla` `facepalm` `omuzsilk` `sikil` `dusun` `surat` `firlat` `eletut` |
| **P** `bilmece` `matematik` `hizliyazi` `kartcek` `kim` `sans` `burc` | Yarışmalar ve günlük şans/burç |
| **P** `base64` `mors` `binary` `hash` `uuid` `sifreolustur` `rastgele` `harfsay` `buyukharf` `kucukharf` `baslik` | Metin ve kodlama araçları |

### 🧰 Araçlar (`tools`, `register`, `stats`, `rooms`, `notify`, `spotify`) · 19

| Komut | Açıklama |
|---|---|
| **S** `afk` `hatirlat` `anket` `oneri` | Günlük araçlar |
| **S** `snipe` | Silinen/düzenlenen mesaj |
| **S** `butonrol` `dogrulama` | Buton rol paneli, doğrulama paneli |
| **S** `otocevap` `ozelkomut` | Otomatik cevap, özel komutlar |
| **S** `emoji` | `ekle` `buyut` `liste` |
| **S** `duyuru` `renk` `qr` `zaman` | Duyuru embed'i, renk önizleme, QR kod, zaman damgası |
| **S** `kayit` | Kayıt (`register`) |
| **S** `istatistik` | Mesaj, ses, kayıt sayısı (`stats`) |
| **S** `oda` | Özel ses odası (`rooms`) |
| **S** `yayin` | YouTube/Twitch bildirimi (`notify`) |
| **S** `spotify` | Dinlenen şarkı (`spotify`) |

---

## 🖥️ Web Panel

Adres: `DASHBOARD_URL` (varsayılan `http://localhost:3000`).

- **Discord ile giriş**, sadece *Sunucuyu Yönet* yetkin olan sunucular listelenir.
- **Ayarlar:** log kanalı, prefix, seviye, hoş geldin/ayrılma kanalı ve mesajı, otorol, starboard, anti-raid, AutoMod (davet, link, büyük harf, spam, yasaklı kelimeler), jail rolü, özel oda hub'ı, üye sayacı, Guard.
- **Guard ayarlarını** yalnızca sunucu sahibi değiştirebilir.
- **Herkese açık sıralama:** `/leaderboard/<sunucuId>` (ilk 50, seviye sırası).
- `/api/stats`: bot, sunucu, kullanıcı ve komut sayısı (JSON).
- Form korumaları: OAuth `state`, CSRF anahtarı, `httpOnly` çerez. Oturumlar bellekte tutulur.

---

## 🔧 Ayarlar ve Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `TOKEN` | `bots.json` yoksa | Bot tokeni |
| `CLIENT_ID` | `bots.json` yoksa | Uygulama ID |
| `CLIENT_SECRET` | Panel girişi için | OAuth2 gizli anahtarı |
| `DASHBOARD_URL` | Hayır | Panel adresi (varsayılan `http://localhost:3000`). Yayında `https://` yap ve aynı adresi *Redirects*'e ekle |
| `PORT` | Hayır | Panel portu (varsayılan 3000) |
| `SESSION_SECRET` | Önerilir | Oturum gizli anahtarı: uzun rastgele bir değer yaz |
| `GUILD_ID` | Hayır | Doluysa komutlar sadece bu sunucuya anında yüklenir (test) |
| `TWITCH_CLIENT_ID` · `TWITCH_CLIENT_SECRET` | Twitch için | [dev.twitch.tv](https://dev.twitch.tv/console) |

Ek dosyalar: `bots.json` (çoklu bot), `emojis.json` (özel/hareketli emojiler). İkisi de `.gitignore` içindedir ve repoya girmez. (Not: `.env.example` Twitch alanlarını içermeyebilir; yukarıdaki tabloya göre elle ekle.)

---

## 🔐 Gerekli Yetkiler ve Intent'ler

**Privileged Intent'ler (Developer Portal'da her bot için aç):**

| Intent | Neden |
|---|---|
| Server Members | giriş/çıkış, kayıt, otorol, toplu işlemler |
| Message Content | prefix komutları, AutoMod, XP, oto cevap |
| Presence *(sadece `spotify` modülü için)* | Spotify durumu |

Diğer intent'ler (Guilds, Moderation, Messages, Reactions, Voice States, Emojis, Invites) ayrıcalıklı değildir, otomatik istenir.

**Sunucuda bot yetkileri:** davet bağlantısı kolaylık için *Yönetici* ister. Daraltmak istersen `src/registry.ts` içindeki `permissions=8` değerini değiştir. Özellik başına gerekenler: Rolleri Yönet (rol/jail/kayıt), Kanalları Yönet (kurulum/kilit/oda), Üyeleri Yasakla-At-Sustur (moderasyon), **Denetim Kaydını Görüntüle** (Guard), **Sunucuyu Yönet** (davet takibi). **Botun rolü, yönetmesini istediğin rollerin üstünde olmalı.**

---

## 🗂️ Proje Yapısı ve Yeni Komut Ekleme

```text
src/
  index.ts              çoklu bot başlatıcı, komut/event yükleyici
  config.ts             .env + bots.json okuma, modül listesi
  registry.ts           çalışan botlar, davet bağlantısı
  db.ts                 JSON veri deposu (data/db.json)
  types.ts              Command / BotEvent tipleri
  commands/<klasör>/    klasör adı = modül (system,general→core; moderation; guard; level; ...)
  events/               olay işleyicileri (modüle göre kendini kapatır)
  utils/                prefix köprüsü, embed, log, guard, jail, invites, notify ...
  dashboard/            Express + EJS panel (views/, public/)
```

**Yeni komut eklemek:** `src/commands/<modül klasörü>/` altına bir dosya aç, bir komut ya da komut dizisi `export default` yap. Başka hiçbir yere kayıt gerekmez.

```ts
import { makeCommand } from '../../utils/factory';
import { info } from '../../utils/embed';

export default makeCommand({
  name: 'selam',
  desc: 'Selam verir.',
  category: 'Eğlence',
  prefixOnly: false,           // true (varsayılan): sadece prefix, slash sınırına sayılmaz
  options: (b) => b.addUserOption((o) => o.setName('uye').setDescription('Kime?')),
  run: async (i) => i.reply({ embeds: [info(`Selam ${i.options.getUser('uye') ?? i.user}!`)] }),
});
```

Daha tam kontrol için `Command` tipinde (`SlashCommandBuilder` + `execute`) yaz; mevcut dosyalar örnek olur.
Yeni bir **olay** için `src/events/` altına `BotEvent` export et ve içinde `client.modules.has('modül')` ile kapıla.

---

## ⚠️ Bilinen Sınırlar

- **100 slash komut sınırı:** Discord kuralı. Fazla komut sadece prefix ile çalışır ya da komutları birden çok bota dağıtırsın.
- **Veri JSON dosyasında:** yüzlerce sunucuya kadar sorunsuzdur. Binlerce sunucuda `src/db.ts` SQLite/PostgreSQL ile değiştirilmeli (tüm erişim o dosyadan geçer).
- **Müzik çalma yok.** YouTube'dan yayın çekmek YouTube'un şartlarına aykırıdır; düzgün çözüm ayrı bir Lavalink sunucusudur.
- **Doğrulama:** 100 sunucuya yaklaşınca Discord, *Server Members* ve *Message Content* intent'leri için bot doğrulaması ister.
- **Dış servisler:** hava (wttr.in), döviz (open.er-api.com), kripto (CoinGecko), Vikipedi, meme, hayvan fotoğrafları, çeviri (MyMemory), TDK, namaz (Aladhan), deprem (**resmi olmayan** bir Kandilli arayüzü), GitHub, Minecraft (mcsrvstat), anime (Jikan), trivia (OpenTDB), GIF (nekos.best). Bir servis kapanırsa o komut "ulaşılamadı" der, bot çökmez.
- **Bellekte tutulanlar:** panel oturumları, snipe kayıtları, spam sayaçları ve davet önbelleği bot yeniden başlayınca sıfırlanır.
- **Proje durumu:** Kod TypeScript ile derlenir, komut tanımları doğrulanır ve prefix köprüsü sahte mesajlarla test edilmiştir. Bu depoda Discord'a gerçek bağlantı üzerinden test **yapılmamıştır**; ilk açılışta test sunucusunda (`GUILD_ID`) denemeni öneririm.
- **Lisans:** Bu depoda lisans dosyası yok; yayınlamadan önce sen belirle. Başka açık kaynak projelerden kod kopyalayacaksan lisanslarına bak (GPL kod eklersen projenin tamamı GPL olur).

---

## 🩺 Sorun Giderme

| Belirti | Çözüm |
|---|---|
| `Used disallowed intents` | Developer Portal → Bot → *Server Members* ve *Message Content* intent'lerini aç. `spotify` modülü varsa *Presence*'ı da aç. |
| Slash komutlar görünmüyor | Global yükleme gecikir; test için `GUILD_ID` yaz. Bot sunucuda `applications.commands` kapsamıyla eklenmiş olmalı. |
| Prefix komutları cevap vermiyor | *Message Content Intent* kapalıdır; prefix'i kontrol et (`.yardim` ya da bota etiket at). |
| Aynı komut iki kez cevaplanıyor | Aynı modülü iki bota vermişsin (`bots.json`). |
| Rol/kanal işlemi "yetki yok" diyor | Botun rolünü hedef rolün üstüne taşı ve gerekli yetkiyi ver. |
| Guard çalışmıyor | `/guard durum acik:true`, botta *Denetim Kaydını Görüntüle*, rolü en üstte. İşlemi yapan sahip/beyaz listedeyse tepki verilmez. |
| Davet takibi `bilinmiyor` | Bota *Sunucuyu Yönet* yetkisi ver; vanity davetler izlenemez. |
| Panelde giriş hatası | `CLIENT_SECRET` dolu mu, `DASHBOARD_URL` Discord'daki *Redirects* ile birebir aynı mı kontrol et. |
| `Twitch için ... gerekli` | `.env`'ye `TWITCH_CLIENT_ID` ve `TWITCH_CLIENT_SECRET` ekle. |
| Konsolda "100 slash komuta izin verir" | Normal: fazlası prefix ile çalışır. Slash istiyorsan modülleri bölerek botlara dağıt. |

---

## 🧰 Kullanılan Araçlar

<div align="center">

<img src="https://skillicons.dev/icons?i=ts,js,nodejs,express,html,css,discord,git,github,vscode&perline=10" alt="Technologies and Tools"/>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:A855F7,50:6D28D9,100:09090B&height=120&section=footer" width="100%" alt="Footer Banner"/>

*Komut sayıları ve listeler kodun kendisinden çıkarıldı. Komut eklediğinde `.yardim` otomatik güncellenir.*

</div>
