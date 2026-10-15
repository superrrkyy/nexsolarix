# NexSolarix

**Template README.md & animasi SVG premium — satu situs, dua klik, README kamu langsung hidup.**

NexSolarix adalah studio web untuk mempercantik profil atau repo GitHub: **22 template README siap pakai** dan **37 animasi SVG** yang bisa dikustomisasi langsung di browser, lalu disalin sebagai teks atau diunduh sebagai ZIP lengkap (README.md + file animasi) yang bebas kamu ubah.

> Semua animasi tetap berjalan di GitHub karena ditaruh **di dalam file SVG**, bukan di markdown — lihat [Mengapa animasinya jalan](#mengapa-animasinya-jalan-di-github).

---

## Daftar isi

- [Fitur](#fitur)
- [Mulai cepat](#mulai-cepat)
- [Struktur proyek](#struktur-proyek)
- [Mengapa animasinya jalan di GitHub](#mengapa-animasinya-jalan-di-github)
- [Sistem premium & kode lisensi](#sistem-premium--kode-lisensi)
- [Deploy](#deploy)
- [Menambah animasi atau template baru](#menambah-animasi-atau-template-baru)
- [Pengujian](#pengujian)
- [Lisensi](#lisensi)

---

## Fitur

**Konten**
- 22 template README: 12 gratis + 10 premium (profil, proyek, portofolio, kreatif, minimal, data).
- 37 animasi SVG: 25 gratis + 12 premium (banner, kartu, data, efek, pemisah).
- 18 palet warna terkurasi (10 gratis + 8 signature premium) plus input warna aksen bebas.
- Setiap template = `README.md` + folder `assets/` berisi file `.svg` + `nexsolarix.config.json` + `HOW-TO.md` (panduan dua bahasa).

**Interaksi**
- Kustomisasi langsung: palet, warna aksen, ukuran, kecepatan, kerapatan elemen, radius, font, perataan, glow, latar transparan, dan semua teks.
- Preview real-time dalam bingkai mirip GitHub, lengkap dengan toggle tampilan terang/gelap.
- Salin teks README, salin kode SVG per aset, unduh README saja, atau unduh ZIP lengkap.
- Dua mode tautan aset: **relatif** (file di repo yang sama) atau **URL mentah GitHub** (aset di repo lain).
- Command palette (`⌘K` / `Ctrl+K`) untuk lompat ke template, animasi, atau halaman mana pun.
- Pencarian, filter tier/kategori/jenis, urutkan, acak, dan daftar favorit (tersimpan lokal).
- Bilingual **Indonesia / English** dengan toggle, mode **terang/gelap**, PWA + service worker (bisa dibuka offline).

**Teknis**
- React 19 + Vite 6 + TypeScript strict. Tanpa backend, tanpa database, tanpa API key.
- Penulis ZIP sendiri (memakai `CompressionStream('deflate-raw')`, fallback ke STORE) — nol dependency.
- 353 tes: validasi setiap SVG (referensi `url(#id)` harus resolve, tanpa `<script>`, durasi valid), audit tata letak teks, struktur ZIP + CRC32, kebijakan salin/unduh, algoritme kode lisensi, dan smoke test semua halaman — termasuk uji runtime di DOM (jsdom) untuk halaman detail, kunci premium, tab README, filter galeri, dan command palette.

---

## Mulai cepat

Butuh **Node.js 20+**.

```bash
npm install
npm run dev          # http://localhost:5173
```

Perintah lain:

```bash
npm run build        # typecheck + build produksi ke dist/
npm run preview      # jalankan hasil build
npm run typecheck    # TypeScript strict
npm test             # 353 tes (vitest)
npm run test:watch   # tes mode watch
npm run audit:layout # audit tata letak teks semua animasi + template
npm run samples      # render semua aset ke ./samples untuk diperiksa
```

Konfigurasi opsional — salin `.env.example` menjadi `.env.local`:

| Variabel | Fungsi |
| --- | --- |
| `VITE_INSTAGRAM_HANDLE` | Handle Instagram owner untuk CTA premium (default `superryinz`). |
| `VITE_LICENSE_SECRET` | Secret untuk menandatangani kode lisensi. Kosong = memakai demo secret. |
| `VITE_SITE_URL` | URL absolut situs (untuk tag canonical/OG). |
| `VITE_BASE` | Base path saat di-host di sub-folder, misal `/nexsolarix/`. |

---

## Struktur proyek

```text
src/
  core/
    types.ts          Tipe domain (RenderConfig, AnimationAsset, TemplateAsset…)
    palettes.ts       18 palet + config default + resolver
    site.ts           Metadata brand & statistik situs
  lib/
    svgkit.ts         Toolkit SVG: builder, konteks render, komposit (blob, partikel, equalizer…)
    markdown.ts       Renderer markdown mini untuk preview (escape-first + whitelist tag)
    zip.ts            Penulis ZIP tanpa dependency (DEFLATE + fallback STORE)
    license.ts        Pembuatan & validasi kode lisensi
    exporter.ts       Bangun file template, unduh ZIP/SVG/CSV, util data URI
    hash.ts           CRC32, FNV-1a, obfuscate
  animations/
    banners.ts        banner    · aurora, starfield, neon grid, shimmer, dot matrix
    cards.ts          kartu     · terminal, profil, glass, HUD, quote, code
    data.ts           data      · skill bars, equalizer, loading, badges, ring stats
    effects.ts        efek      · constellation, radar, matrix, pulse rings, sparkle
    dividers.ts       pemisah   · wave, pulse line, marquee, orbit
    premium.ts        premium   · holo card, aurora flow, glitch, kinetic, liquid metal,
                                  retro sun, dashboard, stat rings, IDE window, particle
                                  depth, nebula, prism
  templates/
    free.ts           12 template gratis
    premium.ts        10 template premium
    shared.ts         Blok penulisan markdown + perakitan file ZIP
  components/         AppShell, CommandPalette, Customizer, SvgPreview, kartu, UI kit
  pages/              Home, Templates, TemplateDetail, Animations, AnimationDetail,
                      Premium, Guide, Owner, 404
  styles/             tokens.css, base.css, components.css, pages.css
  i18n/               Kamus Indonesia & Inggris
tools/                Skrip bantu pengembangan (render contoh, audit tata letak, smoke HTTP)
```

---

## Mengapa animasinya jalan di GitHub

GitHub menyanitasi HTML di README: `<script>` dan `<style>` dihapus, begitu juga sebagian besar `class`/`id`. Tapi `<img src="file.svg">` diperlakukan sebagai gambar biasa — dan browser merender isi SVG itu **lengkap**, termasuk animasi SMIL di dalamnya.

Konsekuensinya, semua animasi NexSolarix:

- disimpan sebagai file `.svg` mandiri (bukan CSS di README);
- hanya memakai SMIL (`<animate>`, `<animateTransform>`) dan CSS di dalam file SVG;
- tidak memuat sumber eksternal, tidak menjalankan script, tidak bisa membaca data pengunjung;
- semua `id` di-namespace per render sehingga beberapa aset aman ditampilkan bersamaan.

README-nya sendiri hanya berisi teks dan tag `<img>`:

```html
<img src="./assets/aurora-banner.svg" alt="banner" width="100%" />
```

---

## Sistem premium & kode lisensi

Alur jual-beli sepenuhnya manual lewat Instagram — situs tidak menyimpan data siapa pun.

1. Pengunjung membuka halaman **Premium** lalu klik tombol menuju Instagram owner (**@superryinz**).
2. Setelah pembayaran, owner membuat kode di halaman tersembunyi **`/owner`**.
3. Pembeli menempelkan kode di halaman Premium; konten premium terbuka dan tersimpan di browser itu.

**Format kode:** `NXS-XXXX-XXXX-XXXX`
- karakter pertama payload menandakan paket: `P` = Pro, `S` = Studio;
- 7 karakter berikutnya acak (memakai `crypto.getRandomValues`);
- 4 karakter terakhir adalah tanda tangan dari `secret + payload`;
- alfabetnya membuang `I`, `O`, `0`, `1` supaya aman diketik ulang dari chat.

### Membuat kode sebagai owner

```bash
# 1. Tentukan secret pribadi, lalu build dengan secret itu
printf 'VITE_LICENSE_SECRET=rahasia-panjang-kamu\n' > .env.local
npm run build

# 2. Jalankan /owner di browser, ketik secret yang sama, pilih paket, generate.
#    Kode yang dihasilkan langsung valid untuk build tersebut.
```

Halaman `/owner` menghitung semuanya di browser — secret yang kamu ketik **tidak dikirim ke mana pun**.

### Catatan keamanan (jujur)

Karena situs ini murni statis, validasi kode berjalan di browser. Artinya:

- ini **soft gate** — orang yang membongkar bundle bisa memulihkan secret dan membuat kode sendiri;
- dengan `VITE_LICENSE_SECRET` diset saat build, secret bawaan demo tidak lagi dipakai dan kode publik tidak otomatis valid, tapi secret tetap bisa diekstrak dari bundle;
- ruang tanda tangan 4 karakter (≈2²⁰) cukup untuk mencegah coba-coba manual, bukan untuk melawan script;
- kalau kamu butuh penegakan keras (kode terikat akun/perangkat, bisa dicabut), itu perlu backend — dan itu keputusan produk yang terpisah.

Yang **tidak** dilakukan NexSolarix: mengirim data pembeli ke server, menyimpan kode di database, atau memasang pelacak.

Template & animasi gratis boleh dipakai, diubah, dan disebarkan — termasuk untuk proyek komersial — tanpa wajib mencantumkan kredit. Koleksi ini tidak boleh dijual ulang sebagai produk.

---

## Deploy

Situs ini statis; build-nya (`dist/`) bisa ditaruh di mana saja.

**Vercel / Netlify** — sudah ada `vercel.json` dan `netlify.toml` dengan rewrite SPA.

**Cloudflare Pages / hosting statis lain** — build command `npm run build`, output `dist/`.

**GitHub Pages** (di sub-folder, misal `username.github.io/nexsolarix/`):

```bash
VITE_BASE=/nexsolarix/ npm run build
```

Lihat `.github/workflows/deploy-pages.yml` untuk alur otomatis, dan `public/404.html` yang menangani deep link pada hosting statis tanpa rewrite.

---

## Menambah animasi atau template baru

Animasi baru cukup satu objek di `src/animations/`:

```ts
import { defineAnimation, softBlob, h, animate, textEl } from '../lib/svgkit';

export const myAnimation = defineAnimation({
  id: 'my-animation',
  name: { id: 'Animasi Saya', en: 'My Animation' },
  blurb: { id: 'Deskripsi singkat.', en: 'Short description.' },
  tier: 'free',
  group: 'banner',
  tags: ['banner', 'demo'],
  aria: 'Animated demo banner',
  defaults: { height: 240 },
  body: (x) => [
    softBlob(x, { cx: x.W * 0.3, cy: x.H * 0.5, r: x.H * 0.6, color: x.g1, dur: 9 }),
    textEl(x.config.title, { x: x.anchorX(), y: x.H * 0.55, size: x.dev(40, 'h'), fill: x.text, font: x.font, weight: 800 }),
    h('rect', { x: 0, y: x.H * 0.7, width: x.W, height: 3, fill: x.g2 }, [
      animate('width', { dur: x.dur(3), values: `0;${x.W}`, repeatCount: 'indefinite' }),
    ].join('')),
  ].join(''),
});
```

Lalu daftarkan di `src/animations/index.ts`. Tes akan otomatis memvalidasi: SVG valid, semua `url(#id)` resolve, tidak ada `<script>`, durasi masuk akal, dan berjalan di semua palet.

Template baru dibuat dengan memanggil `buildFiles()` di `src/templates/shared.ts` dan mengisi blok markdown — lihat `src/templates/free.ts` sebagai contoh. Semua template wajib bilingual (`name` dan `blurb` dalam `id` dan `en`).

---

## Pengujian

```bash
npm test
```

Yang diperiksa (353 tes):

| Berkas | Cakupan |
| --- | --- |
| `src/animations/animations.test.ts` | 37 animasi × validitas SVG, referensi id, dimensi, transparansi, semua palet; 22 template × kelengkapan file & tautan aset |
| `src/animations/layout.test.ts` | Audit tata letak: tidak ada teks yang keluar kanvas atau bertabrakan, di tiga ukuran (kecil, default, besar), untuk animasi maupun aset di dalam template |
| `src/lib/zip.test.ts` | Struktur ZIP, CRC32, ukuran, kompresi, nama non-latin, arsip kosong |
| `src/lib/license.test.ts` | Format kode, tier, normalisasi input, penolakan kode palsu, keunikan |
| `src/app/acceptance.test.tsx` | Aturan produk: "copy" hanya teks README.md (tanpa SVG inline), ZIP berisi README + semua file animasi, skala ukuran proporsional, dan kunci premium |
| `src/app/pages.test.tsx` | Smoke test semua halaman lewat SSR, penguncian premium, keamanan renderer markdown |
| `src/app/runtime.test.tsx` | Aplikasi asli di-mount di DOM: rute lazy, filter galeri, tab README, ganti tema/bahasa, kunci premium, palette ⌘K, 404 |

---

## Lisensi

Kode sumber NexSolarix: **MIT** — lihat [LICENSE](./LICENSE).

Aset template & animasi yang dihasilkan: bebas dipakai di repo pribadi maupun komersial. Aset premium dilisensikan ke pembeli dan tidak boleh disebarkan ulang.

NexSolarix tidak berafiliasi dengan GitHub, Inc.

---

Dibuat oleh [@superryinz](https://instagram.com/superryinz) · [github.com/superrrkyy/nexsolarix](https://github.com/superrrkyy/nexsolarix)
