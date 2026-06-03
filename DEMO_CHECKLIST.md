# Checklist Persiapan Demo LIDM 2026 — EVAKUACTION

## Persiapan Teknis
- [ ] Laptop demo sudah terinstall Node.js v18+
- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` atau `npm run preview` berjalan tanpa error
- [ ] Webcam laptop berfungsi dan permission sudah diberikan
- [ ] Browser: Google Chrome versi terbaru (direkomendasikan)
- [ ] Pencahayaan ruangan cukup untuk deteksi tangan
- [ ] Resolusi layar minimal 1280×720

## Persiapan Konten
- [ ] Semua 20 gambar kartu tersedia di `public/assets/cards/`
- [ ] `soal.json` berisi 5 soal lengkap
- [ ] `diagnosticSoal.json` berisi 10 soal lengkap
- [ ] Tidak ada placeholder yang tersisa (semua gambar nyata)

## Test Sebelum Demo
- [ ] Full flow: Landing → Diagnostic → Game (5 ronde) → Result
- [ ] Gesture pinch terdeteksi dengan baik di kedua tangan
- [ ] Split-screen duel berjalan tanpa interferensi
- [ ] Flip kartu saat gesture Selesai berfungsi
- [ ] Evaluasi dan skor terhitung dengan benar
- [ ] MistakeAnalysis menampilkan kesalahan dengan benar
- [ ] Tombol MAIN LAGI langsung ke game baru
- [ ] Tombol KEMBALI KE AWAL mereset semua state

## Skenario Demo yang Disarankan untuk Juri
1. Tunjukkan landing page dan jelaskan konsep.
2. Jalankan tes diagnostik (jawab 3-4 soal saja, lalu skip).
3. Demo game: 1 ronde penuh dengan 2 pemain.
4. Tunjukkan gesture pinch drag kartu.
5. Tunjukkan flip kartu saat selesai.
6. Tunjukkan evaluasi dan penjelasan ilmiah.
7. Tunjukkan halaman hasil dan MistakeAnalysis.
