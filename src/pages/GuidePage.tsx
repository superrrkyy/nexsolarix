import { useI18n } from '../i18n';
import { SITE, instagramUrl } from '../core/site';
import { CopyButton, Reveal } from '../components/Ui';
import { IconInstagram, IconInfo } from '../components/icons';

function CopyBlock({ code, copyLabel, copiedLabel }: { code: string; copyLabel: string; copiedLabel: string }) {
  return (
    <div className="copy-block">
      <pre>{code}</pre>
      <div className="copy-block__btn">
        <CopyButton className="btn btn--ghost btn--sm" text={code} label={copyLabel} copiedLabel={copiedLabel} />
      </div>
    </div>
  );
}

export function GuidePage() {
  const { t } = useI18n();
  const copyLabel = t('guide.copyCommand');
  const copiedLabel = t('common.copied');

  const sections = [
    { id: 'upload', title: t('guide.s1.title') },
    { id: 'edit', title: t('guide.s2.title') },
    { id: 'why', title: t('guide.s3.title') },
    { id: 'broken', title: t('guide.s4.title') },
    { id: 'polish', title: t('guide.s5.title') },
    { id: 'license', title: t('guide.s6.title') },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">{t('guide.toc')}</span>
          <h1>{t('guide.title')}</h1>
          <p>{t('guide.subtitle')}</p>
        </div>

        <div className="guide-layout">
          <nav className="guide-toc" aria-label={t('guide.toc')}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </nav>

          <div className="prose">
            <Reveal>
              <section id="upload">
                <h2 style={{ marginTop: 0 }}>{t('guide.s1.title')}</h2>
                <ol>
                  <li>Buka halaman template, pilih yang kamu suka, lalu atur warna dan teksnya.</li>
                  <li>
                    Klik <strong>Unduh ZIP lengkap</strong>. Isinya: <code>README.md</code>, folder <code>assets/</code> berisi
                    file <code>.svg</code>, <code>nexsolarix.config.json</code>, dan <code>HOW-TO.md</code>.
                  </li>
                  <li>
                    Ekstrak, lalu upload semua file ke repository GitHub kamu. Kalau repo kamu punya README di root, cukup
                    drag &amp; drop saja.
                  </li>
                  <li>Commit. Buka halaman repo — animasinya langsung jalan.</li>
                </ol>
                <p>
                  Kalau kamu ingin menyimpan aset di repo lain (misalnya repo <code>assets</code> khusus), ganti mode tautan
                  gambar ke <strong>URL mentah GitHub</strong> di halaman template sebelum mengunduh.
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section id="edit">
                <h2>{t('guide.s2.title')}</h2>
                <p>
                  Setiap animasi adalah file SVG biasa berisi teks dan angka. Kamu tidak perlu aplikasi desain untuk
                  mengubahnya — editor teks sudah cukup.
                </p>
                <CopyBlock
                  code={`<text x="450" y="120" font-family="monospace" font-size="48" fill="#eef1ff">NAMA KAMU</text>`}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
                <ul>
                  <li>
                    <code>fill</code> dan <code>stroke</code> menentukan warna. Formatnya hex, misal <code>#7c5cff</code>.
                  </li>
                  <li>
                    <code>dur</code> menentukan kecepatan animasi, misal <code>3.2s</code>. Angka lebih besar = lebih lambat.
                  </li>
                  <li>
                    <code>repeatCount="indefinite"</code> membuat animasi berulang tanpa henti.
                  </li>
                  <li>
                    Elemen <code>&lt;animate&gt;</code> dan <code>&lt;animateTransform&gt;</code> adalah mesin animasinya.
                    Mengubah <code>values</code> akan mengubah gerakannya.
                  </li>
                </ul>
                <div className="note note--accent">
                  <strong>Jangan ubah nama file</strong> kalau tidak mau memperbarui jalur di <code>README.md</code>. Kalau
                  kamu memang ingin mengganti nama, ubah juga <code>src="./assets/namabaru.svg"</code> di README.
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section id="why">
                <h2>{t('guide.s3.title')}</h2>
                <p>
                  GitHub menyanitasi README: tag <code>&lt;script&gt;</code> dan <code>&lt;style&gt;</code> dihapus, begitu juga
                  sebagian besar atribut <code>class</code> dan <code>id</code>. Tapi sebuah gambar{' '}
                  <code>&lt;img src="file.svg"&gt;</code> diperlakukan sebagai gambar biasa — dan browser merender isi SVG itu
                  lengkap, termasuk animasi SMIL di dalamnya.
                </p>
                <p>
                  Itulah alasan semua animasi NexSolarix disimpan di dalam file SVG, bukan di README. README-nya sendiri hanya
                  berisi teks dan beberapa tag <code>&lt;img&gt;</code>.
                </p>
                <CopyBlock
                  code={`<img src="./assets/aurora-banner.svg" alt="banner" width="100%" />`}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
                <div className="row small" style={{ color: 'var(--muted)' }}>
                  <IconInfo size={15} />
                  SVG kita tidak menjalankan script, tidak memuat file eksternal, dan tidak bisa membaca data pengunjung.
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section id="broken">
                <h2>{t('guide.s4.title')}</h2>
                <ul>
                  <li>
                    <strong>Gambar kosong / ikon rusak.</strong> Cek huruf besar-kecil nama file. GitHub membedakan{' '}
                    <code>Aurora.svg</code> dan <code>aurora.svg</code> (lihat catatan di bawah).
                  </li>
                  <li>
                    <strong>Pakai URL mentah tapi tetap kosong.</strong> Pastikan formatnya benar:{' '}
                    <code>https://raw.githubusercontent.com/&lt;user&gt;/&lt;repo&gt;/&lt;branch&gt;/assets/&lt;file&gt;.svg</code>{' '}
                    dan repo-nya publik.
                  </li>
                  <li>
                    <strong>Masih terlihat versi lama setelah diedit.</strong> GitHub menyimpan cache gambar (Camo). Tunggu 1–5
                    menit, atau ubah nama file lalu perbarui jalurnya di README.
                  </li>
                  <li>
                    <strong>Animasi tidak bergerak di aplikasi GitHub Android/iOS.</strong> Aplikasi mobile memakai renderer
                    berbeda; buka lewat browser untuk melihat animasinya.
                  </li>
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section id="polish">
                <h2>{t('guide.s5.title')}</h2>
                <ul>
                  <li>
                    Gunakan <code>width="100%"</code> untuk banner supaya mengikuti lebar kolom README, dan ukuran tetap
                    (misal <code>width="320"</code>) untuk kartu.
                  </li>
                  <li>
                    Batasi jumlah animasi: satu banner, satu kartu statistik, dan satu pemisah sudah cukup. Terlalu banyak
                    animasi membuat halaman berat dan sulit dibaca.
                  </li>
                  <li>
                    Tulis <code>alt</code> yang jelas pada setiap gambar — membantu pembaca layar dan tetap informatif kalau
                    gambarnya gagal dimuat.
                  </li>
                  <li>
                    Simpan semua aset di satu folder <code>assets/</code> supaya rapi dan mudah dicari.
                  </li>
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section id="license">
                <h2>{t('guide.s6.title')}</h2>
                <p>
                  Template dan animasi gratis boleh kamu pakai, ubah, dan sebarkan untuk proyek pribadi maupun komersial tanpa
                  perlu mencantumkan kredit. Yang kami minta cuma satu: jangan jual ulang koleksi ini sebagai produk.
                </p>
                <p>
                  Template premium dilisensikan ke satu akun pembeli. Kamu boleh memakainya di repo pribadi, repo proyek, dan
                  portofolio; paket <strong>Studio</strong> juga mencakup repo klien. Yang tidak boleh: menyebarkan file
                  premiumnya ke publik.
                </p>
                <a className="btn btn--ghost" href={instagramUrl()} target="_blank" rel="noreferrer noopener">
                  <IconInstagram size={16} />
                  @{SITE.instagram}
                </a>
              </section>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
