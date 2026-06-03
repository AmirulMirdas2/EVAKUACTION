# EVAKUACTION

> Game Kartu Interaktif Berbasis Hand Gesture Recognition untuk Pembelajaran Kesiapsiagaan Bencana Siswa SMP Kelas VII

## Tim EVAKUACTION — LIDM 2026

- **Amirul Mirdas (2308107010070)** — Ketua
- **Farhan Mujiburrahman (2308107010078)** — Anggota
- **Riyan Hadi Samudra (2308107010068)** — Anggota

Universitas Syiah Kuala, Banda Aceh

---

## Tentang Project

**EVAKUACTION** adalah media pembelajaran interaktif berbasis web (educational game) yang dirancang khusus untuk meningkatkan pemahaman siswa SMP kelas VII tentang mitigasi dan kesiapsiagaan terhadap berbagai bencana alam (Gempa Bumi, Tsunami, Letusan Gunung Api, Banjir, Tanah Longsor).

Game ini memanfaatkan kecerdasan buatan berbasis _Computer Vision_ (Google MediaPipe Hands) untuk melacak gestur tangan pemain melalui kamera web (webcam). Pemain dapat memainkan game ini dengan mode **duel (split-screen)** di satu perangkat, berlomba menyusun urutan kartu tindakan evakuasi menggunakan gestur _pinch_ (mencubit jari). 

**Tujuan Pedagogis:**
1. Meningkatkan keterlibatan aktif (active learning) siswa dalam mengingat prosedur mitigasi bencana secara berurutan.
2. Memberikan pemahaman ilmiah di balik tindakan evakuasi melalui evaluasi interaktif.
3. Menjadi alternatif asesmen yang menyenangkan melalui integrasi pre-test diagnostik dan post-game mistake analysis.

## Teknologi Utama

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Framer Motion (untuk animasi antarmuka yang sangat dinamis)
- **State Management**: Zustand (ringan, cepat, cocok untuk performa game dan tracking _round history_)
- **Computer Vision**: `@mediapipe/hands` (mendeteksi koordinat 21 titik jari dalam bentuk 3D secara *real-time*)
- **Routing**: React Router DOM (Navigasi alur `Landing -> Diagnostic -> Game -> Result`)
- **Lain-lain**: Canvas Confetti (animasi hasil pemenang)

## Cara Menjalankan (Development)

Pastikan Anda memiliki [Node.js](https://nodejs.org/en) (versi 18 ke atas) terinstall.

1. **Clone repositori ini** (atau _extract_ kode sumber):
   ```bash
   git clone <url-repository>
   cd EVAKUACTION
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan _Development Server_**:
   ```bash
   npm run dev
   ```

4. Buka browser dan arahkan ke alamat yang tertera di terminal (biasanya `http://localhost:5173`).
5. **Izinkan akses Kamera**: Saat masuk ke halaman diagnostik atau game, browser akan meminta izin untuk menggunakan kamera. Pastikan pencahayaan cukup untuk pendeteksian tangan yang lancar.

## Cara Bermain

1. **Test Diagnostik**: Saat memulai permainan, sistem akan menyajikan 10 soal pre-test seputar mitigasi bencana.
2. **Gesture Onboarding**: Saat masuk ke area Game, layar akan menampilkan _tutorial singkat_ cara menggunakan tangan.
3. **Mulai Duel**: Dua pemain berdiri bersebelahan menghadap layar laptop. Layar terbagi menjadi dua zona (Player 1 Kiri, Player 2 Kanan).
4. **Pinch untuk Menyeret Kartu**: Pertemukan ujung ibu jari (thumb) dan jari telunjuk (index finger) tepat di atas area gambar kartu untuk _menjepitnya_. Pindahkan tangan Anda untuk menyeret kartu ke slot yang kosong. Lepaskan _pinch_ untuk meletakkan.
5. **Swap Kartu**: Jika ingin mengubah urutan, Anda bisa menjepit kartu yang sudah terletak di slot, lalu letakkan di slot lain. Posisi kedua kartu akan bertukar.
6. **Selesai dan Evaluasi**: Jepit tombol "SELESAI" selama 1.5 detik (loading melingkar) untuk mengunci jawaban. Sistem akan otomatis menilai, membalik kartu (flip), dan menampilkan popup evaluasi dengan penjelasan mitigasi ilmiah.
7. **Analisis Kesalahan**: Di akhir ronde ke-5, pemain bisa melihat papan skor dan menekan "Analisis Kesalahan" untuk mengulas letak kartu mana saja yang salah ditaruh pada ronde-ronde sebelumnya.

## Struktur Project

```text
src/
├── components/          # Kumpulan komponen antarmuka modular
│   ├── camera/          # Integrasi MediaPipe & Video Stream (CameraView, GestureOverlay)
│   ├── card/            # Komponen kartu draggable dan slot jawaban (Card, AnswerAnchor)
│   ├── diagnostic/      # Komponen untuk Assessment Awal (DiagnosticQuestion, Result)
│   ├── game/            # Inti permainan (GameBoard, PlayerZone, ScenarioDisplay)
│   └── result/          # Komponen evaluasi akhir (MistakeAnalysis, ScoreBoard, dsb.)
├── data/                # Data JSON statis (soal.json, diagnosticSoal.json)
├── hooks/               # Custom React hooks (useMediaPipe, useDragGesture)
├── pages/               # Routing halaman utama (Landing, Diagnostic, Game, Result, NotFound)
├── stores/              # Zustand state manager (gameStore, gestureStore, diagnosticStore)
├── types/               # TypeScript interfaces & type definitions (aman & konsisten)
├── App.tsx              # Router Utama
└── main.tsx             # Entry point
```

## Lisensi

Aplikasi ini dikembangkan khusus sebagai prototipe media pembelajaran untuk ajang **LIDM (Lomba Inovasi Digital Mahasiswa) 2026**. Hak cipta penuh dipegang oleh Tim Pengembang (Amirul Mirdas dkk) dan institusi terkait.
