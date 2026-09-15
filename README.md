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
