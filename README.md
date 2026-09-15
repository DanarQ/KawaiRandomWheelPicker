# Simple Project Random Wheel Picker

Project ini pakai react versi 18 yang di install melalui Vite, Silahkan yang mau clone terus di edit untuk keperluan pribadi

## Menjalankan dan memeriksa

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Perilaku wheel

- Opsi dan warnanya disimpan otomatis di localStorage untuk setiap browser/profil. Refresh mempertahankan daftar, termasuk daftar kosong. Tidak ada sinkronisasi antarperangkat.
- Jika data gagal dibaca atau disimpan, aplikasi menampilkan peringatan. Data yang gagal dibaca tidak ditimpa otomatis saat aplikasi dibuka.
- Tab pada browser/profil yang sama otomatis menyinkronkan daftar. Saat spin berlangsung, pembaruan dari tab lain ditunda hingga spin selesai dan mereset hasil serta siklus.
- Sebelum menyimpan, aplikasi memeriksa apakah daftar di tab masih terbaru. Jika terjadi konflik, daftar terbaru dimuat dan pengguna diminta mengulangi edit; teks input tetap dipertahankan.
- Penyimpanan memakai Web Locks untuk mencegah dua tab menulis bersamaan. Gunakan browser yang mendukung Web Locks melalui HTTPS (termasuk GitHub Pages) atau localhost. Semua tab harus menjalankan versi aplikasi terbaru. Jika penyimpanan gagal, edit tidak diterapkan.
- Mode biasa memberi peluang sama untuk setiap entri dan mengizinkan hasil berulang.
- Mode **No repeats until every name wins** memilih nama yang belum menang dalam siklus tersebut. Setelah semua nama menang, putaran berikutnya memulai siklus baru.
- Nama duplikat baru ditolak, termasuk perbedaan kapital dan spasi. Duplikat dari simpanan lama diberi peringatan agar bisa dirapikan tanpa menghapus data otomatis.
- Pengeditan opsi dan perubahan mode dikunci selama animasi. Pemenang ditetapkan saat spin dimulai.
- Daftar panjang memakai nomor roda yang cocok dengan nama lengkap di Options. Irisan tetap makin sempit seiring bertambahnya opsi.
- Riwayat menampilkan 20 hasil terakhir. Mengubah opsi atau refresh mereset hasil, riwayat, mode, dan siklus. Tombol Clear hanya menghapus riwayat.

## Tampilan dan aksesibilitas

- Roda dan Options berdampingan mulai 960 px; layar lebih kecil memakai satu kolom. Kontrol musik berada di header.
- Recent results dan How it works dapat dibuka/tutup. Riwayat tertutup secara bawaan dan menampilkan jumlah hasil.
- Status penyimpanan dibedakan menjadi saving, saved, synced, conflict, dan error. Konflik/error tetap tampil hingga tindakan atau pemulihan berikutnya; teks input dipertahankan jika penambahan gagal.
- Enter menambah opsi dan fokus kembali ke input setelah berhasil. Popover volume ditutup dengan Escape atau klik di luar.
- Musik mencoba autoplay ketika halaman dibuka. Jika diblokir, aplikasi mencoba lagi pada klik atau penekanan tombol pertama yang sesuai. Jika tetap ditolak, tombol Play tetap tersedia tanpa mengganggu aplikasi.
- Preferensi musik dan volume disimpan terpisah dari daftar opsi. Pause menghentikan percobaan otomatis, termasuk setelah refresh; penolakan autoplay oleh browser tidak dianggap sebagai pilihan Pause pengguna.
- Kontrol sentuh minimal 44 px, fokus keyboard terlihat, dan reduced motion menonaktifkan animasi dekoratif tanpa mengubah animasi roda.

## Package yang di pakai
### react-custom-roulette
Digunakan untuk membuat komponen roda undian (wheel picker)
- Install:
  ```bash
  npm install react-custom-roulette
  ```
### react kawaii
Digunakan untuk emoticon di aplikasi
- Install
  ```bash
  npm install --save react-kawaii
  ```

### Screenshot aplikasi
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ee84fe0d-6978-4cf5-969c-0265cb61828b" />
