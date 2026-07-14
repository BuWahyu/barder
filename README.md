# Barisan & Deret Aritmetika — Website Interaktif

Materi ajar interaktif untuk Matematika SMA Kelas XI, materi Barisan dan Deret Aritmetika. Berisi kalkulator interaktif, contoh soal (bentuk angka & kontekstual), latihan mandiri dengan pengecekan otomatis, LKPD digital, dan panduan guru (rubrik + kunci jawaban).

Dibuat oleh: Wahyu Wijayanti, S.Pd., M.Pd. — SMA Negeri Karangpandan

## Struktur File

```
├── index.html        (halaman utama)
├── css/style.css      (semua styling)
├── js/main.js         (semua interaktivitas)
└── README.md
```

Situs ini murni HTML/CSS/JS (tanpa build tools atau server), sehingga bisa langsung dibuka di browser atau di-hosting gratis di GitHub Pages.

## Cara Upload & Publikasi ke GitHub Pages

1. **Buat repository baru** di GitHub (misalnya bernama `barisan-deret-aritmetika`).
2. **Upload semua file** dalam folder ini (`index.html`, folder `css/`, folder `js/`, `README.md`) ke repository tersebut — bisa lewat drag-and-drop di web GitHub ("Add file" → "Upload files"), atau lewat Git:
   ```bash
   git init
   git add .
   git commit -m "Materi ajar interaktif Barisan dan Deret Aritmetika"
   git branch -M main
   git remote add origin https://github.com/USERNAME/barisan-deret-aritmetika.git
   git push -u origin main
   ```
3. Di repository GitHub, buka **Settings → Pages**.
4. Pada bagian **Source**, pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
5. Tunggu 1–2 menit. Situs akan aktif di:
   ```
   https://USERNAME.github.io/barisan-deret-aritmetika/
   ```
6. Bagikan tautan tersebut ke siswa — bisa dibuka di HP maupun laptop.

## Catatan Penggunaan

- **LKPD & Refleksi**: jawaban siswa tersimpan otomatis di browser masing-masing perangkat (localStorage), bukan di server bersama. Jika ingin mengumpulkan hasil LKPD, siswa bisa menekan tombol **"Cetak / Simpan sebagai PDF"** lalu mengirim hasilnya ke guru.
- **Bagian Guru**: kunci jawaban dan rubrik penilaian disembunyikan di balik tombol "Tampilkan Konten Guru" pada bagian paling bawah halaman, agar tidak langsung terlihat siswa. Ini bukan proteksi keamanan (siapa pun bisa klik tombolnya), hanya untuk mencegah terlihat tidak sengaja.
- Semua kalkulator dan latihan berjalan sepenuhnya di browser (tidak butuh internet setelah halaman termuat), kecuali font Google Fonts yang perlu koneksi internet saat pertama kali dibuka.

## Kustomisasi

- Ubah warna di bagian `:root` pada `css/style.css` (variabel `--navy`, `--teal`, `--amber`, dst).
- Tambah/ubah soal latihan dengan menyalin blok `.quiz-card` di `index.html` dan mengganti `data-answer` sesuai kunci jawaban baru.
- Tambah/ubah contoh soal dengan menyalin blok `.example` di dalam `.example-list`.
