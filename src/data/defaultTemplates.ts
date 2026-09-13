import { RPPData } from '../types';

export const sampleRPPList: RPPData[] = [
  {
    id: 'sample-smk-rpl',
    judul: 'Modul Ajar: Desain Antarmuka Pengguna (UI/UX) Berbasis Web & Mobile',
    kurikulum: 'merdeka_smk',
    jenjang: 'SMK',
    fase: 'Fase F (Kls 11-12)',
    kelas: 'XI (Sebelas)',
    semester: 'Ganjil',
    tahunPelajaran: '2024/2025',
    mataPelajaran: 'Pengembangan Perangkat Lunak dan GIM (PPLG)',
    programKeahlian: 'Rekayasa Perangkat Lunak (RPL)',
    namaSekolah: 'SMK Negeri 1 Makassar',
    namaGuru: 'Christian Toding, S.Pd., Gr.',
    nipGuru: '19880512 201503 1 002',
    namaKepalaSekolah: 'Drs. H. Muhammad Arifin, M.Pd.',
    nipKepalaSekolah: '19680315 199303 1 008',
    kotaTanggal: 'Makassar, 15 Juli 2024',
    alokasiWaktu: '4 x 45 Menit (1 Pertemuan)',
    jumlahPertemuan: 1,
    topikMateri: 'Prinsip Desain Antarmuka (UI/UX) dan Prototyping Interaktif',
    modelPembelajaran: 'Project Based Learning (PjBL) & Teaching Factory',
    metodePembelajaran: ['Studi Kasus Industri', 'Praktik Laboratorium (Figma)', 'Diskusi Kelompok Kolaboratif', 'Peer Review'],
    pendekatan: 'Teaching at The Right Level (TaRL) & Saintifik Terintegrasi Industri',

    capaianPembelajaran: 'Pada akhir Fase F, peserta didik mampu menerapkan prinsip-prinsip User Experience (UX) dan User Interface (UI) dalam merancang antarmuka aplikasi berbasis web dan perangkat bergerak yang ramah pengguna, berdaya guna, serta sesuai standar kebutuhan industri digital.',
    alurTujuanPembelajaran: '11.1 Menjelaskan konsep hierarki visual, konsistensi elemen, dan usability heuristics. 11.2 Menganalisis wireframe dan user journey berdasarkan persona pengguna. 11.3 Merancang high-fidelity prototype interaktif menggunakan perangkat lunak industri.',
    tujuanPembelajaran: [
      'Melalui studi kasus aplikasi riil (A), peserta didik (B) mampu menganalisis minimal 3 masalah usability antarmuka (C) secara kritis dan akurat (D).',
      'Melalui demonstrasi praktikum dan panduan jobsheet (A), peserta didik (B) mampu menyusun wireframe dan prototipe interaktif (C) dengan menerapkan hierarki visual yang estetik dan terstandar (D).',
      'Secara berkelompok (A), peserta didik (B) mampu mempresentasikan prototipe UI/UX (C) serta menerima masukan rekan kerja dengan sikap komunikatif dan terbuka (D).'
    ],
    pemahamanBermakna: 'Desain antarmuka yang baik bukan hanya tentang estetika visual, melainkan bagaimana sistem memudahkan pengguna menyelesaikan masalah sehari-hari secara efisien, inklusif, dan memuaskan.',
    pertanyaanPemantik: [
      'Mengapa ada aplikasi perbankan yang terasa rumit digunakan sedangkan aplikasi e-commerce terasa sangat mudah dan cepat?',
      'Bagaimana cara seorang desainer UI memastikan tombol dan teks dapat dibaca nyaman oleh pengguna segala usia?'
    ],
    profilPelajarPancasila: ['Bernalar Kritis', 'Kreatif', 'Gotong Royong', 'Mandiri'],
    saranaPrasarana: {
      media: ['Slide Interaktif Canva/PPT', 'Figma Workspace Lab', 'Proyektor/Smart TV', 'Video Studi Kasus UX Redesign'],
      alat: ['Komputer/Laptop PC Lab Sekolah', 'Koneksi Internet Berkecepatan Tinggi', 'Sticky Notes / Kertas Sketsa Wireframe'],
      sumberBelajar: ['Modul Ajar PPLG Kemendikbudristek', 'Design Guidelines (Material 3 & Apple HIG)', 'Dokumentasi Figma Community']
    },
    targetPesertaDidik: 'Peserta didik reguler/tipikal, peserta didik dengan hambatan belajar (disediakan scaffolding template sketsa dasar), serta peserta didik pencapaian tinggi (diberi tantangan micro-interactions).',

    diferensiasiKonten: 'Menyediakan ringkasan materi infografis bagi pembelajar visual, video demo interaktif bagi pembelajar auditori/kinestetik, dan modul teks teknis standar W3C.',
    diferensiasiProses: 'Memberikan bimbingan terfokus (scaffolding) pada kelompok pemula dengan template wireframe siap pakai, sementara kelompok mahir dipacu mengeksplorasi autolayout dan components lanjutan.',
    diferensiasiProduk: 'Peserta didik dapat menyajikan prototipe berupa aplikasi mobile e-commerce lokal, sistem administrasi sekolah, ataupun platform reservasi jasa UMKM sesuai minat.',

    skenarioPertemuan: [
      {
        pertemuanKe: 1,
        fokusMateri: 'Heuristik Usability dan Perancangan High-Fidelity Prototype',
        alokasiMenit: 180,
        kegiatanPendahuluan: {
          durasiMenit: 20,
          poinKegiatan: [
            'Guru membuka dengan salam, doa bersama yang dipimpin ketua kelas, dan memeriksa kehadiran peserta didik.',
            'Guru mengaitkan materi pertemuan sebelumnya tentang User Journey dengan antarmuka aplikasi harian yang sering dipakai siswa (Apersepsi).',
            'Menyampaikan tujuan pembelajaran, dimensi Profil Pelajar Pancasila, dan skema penilaian proyek jobsheet hari ini.',
            'Memberikan pre-test diagnostik singkat melalui 2 pertanyaan interaktif langsung di layar proyektor.'
          ]
        },
        kegiatanInti: {
          durasiMenit: 140,
          sintaksModel: 'Sintaks Project Based Learning (PjBL) - Terintegrasi Teaching Factory',
          langkahSintaks: [
            {
              fase: 'Penentuan Pertanyaan Mendasar (Start with the Essential Question)',
              kegiatanGuru: 'Guru menampilkan studi kasus aplikasi UMKM lokal yang mengalami drop-off transaksi karena tombol checkout sulit ditemukan. Guru memancing respon siswa terkait solusi layout.',
              kegiatanSiswa: 'Siswa mengamati tampilan, mengidentifikasi kelemahan layout, dan merumuskan hipotesis perbaikan tata letak berbasis hierarki visual.',
              catatanKarakter: 'Bernalar Kritis, Komunikatif'
            },
            {
              fase: 'Mendesain Perencanaan Proyek (Design a Plan for the Project)',
              kegiatanGuru: 'Guru membagikan Jobsheet Praktik 01 dan mengorganisasikan siswa ke dalam tim berpasangan (Pair Design) dengan mempertimbangkan variasi kemampuan.',
              kegiatanSiswa: 'Siswa berdiskusi menentukan pembagian peran, memilih tema aplikasi (UMKM / Portal Sekolah), dan menyusun palet warna serta tipografi standar.',
              catatanKarakter: 'Gotong Royong, Tanggung Jawab'
            },
            {
              fase: 'Menyusun Jadwal Praktik (Create a Schedule)',
              kegiatanGuru: 'Guru menetapkan batasan waktu pengerjaan: 20 menit sketsa wireframe kertas, 50 menit digitalisasi Figma, 20 menit interaksi prototype.',
              kegiatanSiswa: 'Siswa menyepakati timeline dan mulai menggambar layout dasar (low-fidelity) sebelum berpindah ke komputer lab.',
              catatanKarakter: 'Manajemen Waktu, Disiplin'
            },
            {
              fase: 'Memonitor Siswa dan Kemajuan Proyek (Monitor the Students and the Progress)',
              kegiatanGuru: 'Guru berkeliling memberikan bimbingan diferensiasi. Membantu kelompok yang kesulitan auto-layout dan mengarahkan kelompok mahir membuat variant animasi tombol.',
              kegiatanSiswa: 'Siswa membuat komponen reusable di Figma, menyusun tata letak antarmuka, dan menghubungkan frame ke frame (prototyping).',
              catatanKarakter: 'Kreatif, Kemandirian'
            },
            {
              fase: 'Menguji Hasil (Assess the Outcome)',
              kegiatanGuru: 'Guru memfasilitasi sesi "Usability Testing": setiap tim saling mencoba prototipe tim sebelah dan mencatat feedback.',
              kegiatanSiswa: 'Siswa menjalankan prototype di smartphone/desktop, mencatat masukan dari tim penguji, dan melakukan perbaikan cepat.',
              catatanKarakter: 'Reflektif, Berpikir Terbuka'
            },
            {
              fase: 'Mengevaluasi Pengalaman (Evaluate the Experience)',
              kegiatanGuru: 'Guru meminta 2 perwakilan tim untuk mempresentasikan hasil di depan kelas melalui proyektor.',
              kegiatanSiswa: 'Siswa memaparkan rasionalisasi desain tombol, kontras warna, dan kemudahan navigasi.',
              catatanKarakter: 'Percaya Diri, Santun'
            }
          ]
        },
        kegiatanPenutup: {
          durasiMenit: 20,
          poinKegiatan: [
            'Guru bersama peserta didik menyimpulkan 3 prinsip utama perancangan UI/UX: kejelasan, konsistensi, dan empati pengguna.',
            'Memberikan apresiasi atas kedisiplinan dan hasil karya seluruh kelompok kerja di lab.',
            'Pemberian tugas pengayaan reflektif mengunggah file Figma ke portofolio digital masing-masing.',
            'Doa penutup dan merapikan kembali perangkat komputer laboratorium.'
          ],
          refleksiSiswa: [
            'Bagian mana dari pembuatan prototipe hari ini yang paling menantang bagi Anda?',
            'Apakah menurut Anda desain yang dibuat kelompok Anda sudah cukup mudah dipahami oleh orang tua atau pemula?'
          ],
          refleksiGuru: [
            'Apakah alokasi waktu 50 menit di Figma mencukupi bagi seluruh kelompok atau memerlukan scaffolding tambahan?',
            'Apakah peserta didik yang sebelumnya pasif terlihat mulai aktif berkontribusi saat praktik berpasangan?'
          ]
        }
      }
    ],

    asesmenDiagnostik: {
      kognitif: [
        'Sebutkan 3 komponen utama dalam tampilan layar aplikasi mobile yang paling sering Anda perhatikan!',
        'Apa yang dimaksud dengan rasio kontras warna antara teks dan background?'
      ],
      nonKognitif: [
        'Bagaimana kesiapan fisik dan emosional Anda sebelum memulai praktik di laboratorium hari ini?',
        'Apa gaya belajar yang paling membuat Anda nyaman (menonton video tutorial, membaca panduan jobsheet, atau langsung mencoba alat)?'
      ]
    },
    asesmenFormatif: {
      teknik: 'Observasi Perilaku Kerja & Penilaian Kinerja Praktik (Jobsheet)',
      keterangan: 'Penilaian dilakukan selama proses praktikum berlangsung menggunakan lembar observasi keaktifan kelompok dan checklist ketercapaian fitur prototipe.'
    },
    asesmenSumatif: {
      teknik: 'Tes Penugasan Proyek Berkas Digital & Rubrik Unjuk Kerja',
      kisiKisiDanSoal: [
        {
          nomor: 1,
          indikator: 'Menganalisis prinsip hierarki visual pada layar beranda aplikasi',
          levelKognitif: 'C4 (HOTS)',
          butirPertanyaan: 'Jelaskan mengapa ukuran tombol "Call to Action" (CTA) utama harus lebih kontras dan menonjol dibanding tombol sekunder berdasarkan prinsip Fitts\' Law!',
          kunciAtauRubrik: 'Tombol utama harus menarik perhatian mata pertama kali untuk mengurangi friksi mental dan mempercepat pengambilan keputusan pengguna tanpa kebingungan.'
        },
        {
          nomor: 2,
          indikator: 'Menyusun prototipe interaktif dengan komponen responsif',
          levelKognitif: 'C6 (HOTS)',
          butirPertanyaan: 'Rancanglah alur transisi dari halaman Login menuju Halaman Utama dengan menyertakan pesan validasi jika pengguna salah memasukkan kata sandi!',
          kunciAtauRubrik: 'Prototipe memuat interaksi trigger On Click -> Open Overlay/Navigate to, dengan indikator feedback visual berupa teks error berwarna merah.'
        }
      ]
    },
    rubrikPenilaian: [
      {
        aspek: 'Tata Letak & Hierarki Visual',
        skor1PerluBimbingan: 'Elemen berantakan, tidak ada konsistensi jarak margin/padding, teks sulit dibaca.',
        skor2Cukup: 'Elemen tertata cukup rapi namun hierarki judul dan teks isi belum terlalu jelas.',
        skor3Baik: 'Tata letak rapi, margin dan padding konsisten, hierarki visual jelas dan nyaman dipandang.',
        skor4SangatBaik: 'Sangat profesional, menerapkan grid 8pt industri, autolayout presisi, estetika tinggi.'
      },
      {
        aspek: 'Fungsionalitas Prototype Interaktif',
        skor1PerluBimbingan: 'Hanya berupa gambar mati tanpa link interaksi antar halaman.',
        skor2Cukup: 'Terdapat link berpindah halaman namun terjadi banyak dead-end atau link macet.',
        skor3Baik: 'Seluruh alur dasar utama dapat diklik dan berjalan lancar dari awal hingga akhir.',
        skor4SangatBaik: 'Lengkap dengan animasi transisi halus (smart animate), validasi pesan error, dan simulasi micro-interaction.'
      },
      {
        aspek: 'Kolaborasi & Kemitraan Tim',
        skor1PerluBimbingan: 'Hanya dikerjakan oleh satu orang dalam tim, anggota lain pasif.',
        skor2Cukup: 'Ada pembagian tugas namun komunikasi antar anggota masih minim.',
        skor3Baik: 'Bekerja sama dengan baik, saling berbagi komponen dan mendengarkan saran teman.',
        skor4SangatBaik: 'Sangat solid, proaktif saling membantu menyelesaikan bug desain, presentasi kompak.'
      }
    ],

    lkpd: {
      judul: 'Lembar Kerja Peserta Didik (Jobsheet 01): Prototyping Antarmuka Aplikasi Digital',
      tujuanAktivitas: 'Peserta didik mampu merancang antarmuka aplikasi sederhana yang interaktif dan memuat prinsip user experience yang berpusat pada pengguna (User-Centered Design).',
      alatBahan: ['PC Komputer Laboratorium Sekolah', 'Akun Figma Edukasi', 'Kertas HVS/Sticky Notes untuk Sketsa Kasar', 'Format Panduan Jobsheet'],
      langkahKerja: [
        'Buka browser dan login ke akun Figma yang telah didaftarkan dengan email sekolah.',
        'Buat file baru di dalam Project Lab Tim Anda dengan nama: [NamaKelompok]_Jobsheet01_UIUX.',
        'Tentukan Frame perangkat: Mobile (iPhone 14 / Android Large) atau Desktop (Desktop 1440px).',
        'Terapkan Style Guide: Tentukan minimal 2 warna utama (Primary Color & Accent Color) dan 1 font utama yang mudah dibaca.',
        'Rancang 3 layar utama: 1) Layar Selamat Datang / Login, 2) Layar Beranda / Daftar Produk, 3) Layar Rincian Transaksi.',
        'Hubungkan interaksi Prototype di tab sebelah kanan dan uji coba menggunakan tombol Play.'
      ],
      tugasPertanyaan: [
        'Uraikan alasan mengapa tim Anda memilih kombinasi warna tersebut untuk target pengguna yang dituju!',
        'Catat 2 masukan paling berharga yang diberikan oleh tim lain saat sesi usability testing dan bagaimana solusi perbaikannya!'
      ],
      panduanPenilaian: 'Kriteria kelulusan praktikum: Skor total minimal 75 dari akumulasi aspek kerapian desain, alur prototype, dan kelengkapan respon LKPD.'
    },

    bahanAjarRingkas: `RINGKASAN MATERI: PRINSIP DASAR UI/UX DESIGN

1. Definisi UI vs UX:
- User Interface (UI) adalah jembatan visual yang berinteraksi langsung dengan panca indera pengguna (warna, tombol, tipografi, ikonografi, dan tata letak).
- User Experience (UX) adalah keseluruhan rasa, kemudahan, dan persepsi emosional yang dialami pengguna saat memakai produk dari awal hingga tuntas.

2. Prinsip Hierarki Visual:
- Skala (Scale): Elemen yang lebih penting dibuat lebih besar secara proporsional.
- Kontras (Contrast): Warna yang mencolok memandu mata pengguna ke target aksi (Call-to-Action).
- Kedekatan (Proximity): Objek-objek yang berkaitan diletakkan berdekatan satu sama lain.
- Ruang Negatif (Whitespace): Memberikan "napas" visual agar layar tidak sesak dan nyaman dipindai.

3. 10 Usability Heuristics (Jakob Nielsen) yang Wajib Diingat:
- Status visibilitas sistem: Pengguna selalu tahu apa yang sedang terjadi (misal: loading bar).
- Kecocokan dengan dunia nyata: Menggunakan kata dan konsep yang lazim bagi pengguna.
- Kontrol dan kebebasan pengguna: Adanya tombol 'Batal' atau 'Kembali' yang jelas.
- Konsistensi dan standar: Tidak mengubah letak tombol kembali di setiap halaman yang berbeda.`,

    programRemedial: 'Bagi peserta didik yang belum mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP < 75): Diberikan sesi mentoring klinis khusus di luar jam pelajaran dengan fokus merancang ulang 1 halaman sederhana menggunakan komponen wireframe yang telah disederhanakan oleh guru.',
    programPengayaan: 'Bagi peserta didik yang telah melampaui KKTP (>= 85): Diberikan proyek mandiri mengeksplorasi pembuatan Design System lengkap (Variables, Auto-layout advanced, dan pembuatan micro-animation interaktif) untuk diaplikasikan ke portofolio industri nyata.',
    glosarium: [
      { istilah: 'UI (User Interface)', definisi: 'Titik kontak visual di mana manusia berinteraksi dengan komputer, website, atau aplikasi.' },
      { istilah: 'UX (User Experience)', definisi: 'Bagaimana perasaan pengguna dan kemudahan yang dirasakan saat berinteraksi dengan setiap elemen produk digital.' },
      { istilah: 'Wireframe', definisi: 'Kerangka dasar struktural hitam-putih dari sebuah halaman web atau aplikasi sebelum tahap desain visual final.' },
      { istilah: 'Prototype', definisi: 'Model simulasi interaktif dari produk akhir yang dapat diklik untuk menguji alur kerja pengguna.' },
      { istilah: 'Whitespace', definisi: 'Area kosong di sekitar elemen desain yang menjaga keterbacaan dan kerapian layout.' }
    ],
    daftarPustaka: [
      'Badan Standar, Kurikulum, dan Asesmen Pendidikan Kemendikbudristek. (2024). Capaian Pembelajaran Fase F Kejuruan PPLG. Jakarta.',
      'Nielsen, Jakob. (2020). 10 Usability Heuristics for User Interface Design. Nielsen Norman Group.',
      'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2022). Panduan Pembelajaran dan Asesmen Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Menengah. Jakarta.'
    ],
    createdAt: '2024-07-15T08:00:00.000Z',
    updatedAt: '2024-07-15T08:00:00.000Z'
  },
  {
    id: 'sample-smp-ipa',
    judul: 'Modul Ajar: Sistem Peredaran Darah Manusia Berdiferensiasi',
    kurikulum: 'rpp_berdiferensiasi',
    jenjang: 'SMP',
    fase: 'Fase D (Kls 7-9)',
    kelas: 'VIII (Delapan)',
    semester: 'Ganjil',
    tahunPelajaran: '2024/2025',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    namaSekolah: 'SMP Negeri 2 Nusantara',
    namaGuru: 'Siti Rahmawati, S.Pd., M.Si.',
    nipGuru: '19900214 201708 2 004',
    namaKepalaSekolah: 'Bambang Supriyanto, M.Pd.',
    nipKepalaSekolah: '19710820 199802 1 003',
    kotaTanggal: 'Bandung, 22 Juli 2024',
    alokasiWaktu: '3 x 40 Menit (1 Pertemuan)',
    jumlahPertemuan: 1,
    topikMateri: 'Struktur dan Fungsi Organ Peredaran Darah (Jantung & Pembuluh)',
    modelPembelajaran: 'Problem Based Learning (PBL) Berdiferensiasi',
    metodePembelajaran: ['Eksperimen Sederhana Hitung Denyut Nadi', 'Diskusi Kelompok Kolaboratif', 'Presentasi Beragam Media'],
    pendekatan: 'Saintifik & Diferensiasi Konten, Proses, serta Produk',

    capaianPembelajaran: 'Peserta didik mampu melakukan analisis untuk menemukan keterkaitan sistem organ peredaran darah manusia dengan fungsinya serta kelainan atau gangguan yang muncul pada sistem organ tersebut.',
    alurTujuanPembelajaran: '8.4 Mengidentifikasi komponen darah, organ jantung, dan pembuluh darah. 8.5 Menyelidiki faktor-faktor yang mempengaruhi frekuensi denyut nadi manusia melalui percobaan sederhana. 8.6 Menyajikan upaya menjaga kesehatan organ peredaran darah.',
    tujuanPembelajaran: [
      'Melalui tayangan video animasi dan torso jantung (A), peserta didik (B) dapat membedakan fungsi ruang jantung dan pembuluh darah (C) dengan tepat minimal 3 perbedaan (D).',
      'Melalui praktikum mengukur denyut nadi saat istirahat dan setelah beraktivitas fisik (A), peserta didik (B) dapat menganalisis pengaruh aktivitas terhadap kerja jantung (C) secara teliti (D).',
      'Dalam kelompok berdiferensiasi (A), peserta didik (B) mampu membuat media edukasi kesehatan jantung (infografis, poster, podcast, atau drama singkat) (C) secara kreatif dan bertanggung jawab (D).'
    ],
    pemahamanBermakna: 'Jantung berdetak tanpa henti sepanjang hayat memompa oksigen dan nutrisi ke seluruh sel tubuh. Gaya hidup sehat, pola makan, dan olahraga teratur secara langsung menentukan daya tahan dan kebugaran organ peredaran darah.',
    pertanyaanPemantik: [
      'Pernahkah kalian merasakan dada berdebar kencang setelah berlari keliling lapangan? Mengapa hal tersebut terjadi?',
      'Bagaimana darah dapat mengalir ke otak kita yang posisinya berada di atas jantung melawan gravitasi bumi?'
    ],
    profilPelajarPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
    saranaPrasarana: {
      media: ['Torso Model Jantung Manusia', 'Video Animasi 3D Peredaran Darah', 'Stopwatch / Handphone'],
      alat: ['Kertas Karton, Spidol Warna, Stopwatch, Lembar Praktikum'],
      sumberBelajar: ['Buku Siswa IPA Kelas VIII Kemendikbud', 'Artikel Edukasi Kesehatan Kemenkes RI']
    },
    targetPesertaDidik: 'Peserta didik reguler, peserta didik yang memerlukan pendampingan visual kongkret, dan peserta didik akselerasi kognitif.',

    diferensiasiKonten: 'Disediakan 3 stasiun sumber belajar: Stasiun Audio-Visual (Video bedah jantung), Stasiun Manipulatif (Torso model 3D dan kartu pasangan organ), dan Stasiun Teks/Artikel ilmiah singkat.',
    diferensiasiProses: 'Siswa dibagi dalam kelompok berdasarkan hasil tes diagnostik awal gaya belajar dan tingkat kesiapan materi. Kelompok bertahap dipandu guru secara langsung, kelompok mandiri bekerja dengan instruksi LKPD.',
    diferensiasiProduk: 'Laporan hasil belajar dapat disajikan dalam bentuk poster digital (Canva), booklet bergambar tangan, rekaman suara podcast, atau tabel analisis ilmiah.',

    skenarioPertemuan: [
      {
        pertemuanKe: 1,
        fokusMateri: 'Mekanisme Denyut Jantung dan Aliran Darah',
        alokasiMenit: 120,
        kegiatanPendahuluan: {
          durasiMenit: 15,
          poinKegiatan: [
            'Guru menyapa dengan hangat, berdoa, dan memeriksa kehadiran siswa.',
            'Apersepsi fisik: Guru mengajak siswa menempelkan dua jari di leher atau pergelangan tangan untuk merasakan denyut nadi istirahat selama 15 detik.',
            'Menyampaikan tujuan pembelajaran dan memotivasi pentingnya mengenali kerja jantung sejak usia remaja.'
          ]
        },
        kegiatanInti: {
          durasiMenit: 90,
          sintaksModel: 'Sintaks Problem Based Learning (PBL) Berdiferensiasi',
          langkahSintaks: [
            {
              fase: 'Orientasi Siswa pada Masalah',
              kegiatanGuru: 'Guru menayangkan video atlet maraton yang pingsan karena kelelahan ekstrim dan dehidrasi.',
              kegiatanSiswa: 'Siswa mengamati dan mengajukan pertanyaan kritis tentang mengapa jantung atlet bekerja begitu keras saat maraton.',
              catatanKarakter: 'Rasa Ingin Tahu, Kritis'
            },
            {
              fase: 'Mengorganisasikan Siswa untuk Belajar',
              kegiatanGuru: 'Membagi siswa ke dalam kelompok praktikum heterogen dan membagikan LKPD Denyut Nadi.',
              kegiatanSiswa: 'Siswa berbagi tugas: ada yang menjadi relawan pengukur denyut (kondisi duduk vs naik turun tangga 1 menit), ada yang memegang stopwatch dan pencatat data.',
              catatanKarakter: 'Kerja Sama, Tanggung Jawab'
            },
            {
              fase: 'Membimbing Penyelidikan Individu maupun Kelompok',
              kegiatanGuru: 'Guru berkeliling memastikan teknik perabaan nadi arteri radialis tepat dan membimbing kelompok yang datanya kurang stabil.',
              kegiatanSiswa: 'Melakukan pengukuran secara jujur, mengulang 2 kali untuk validitas, dan mencatat dalam tabel perbandingan.',
              catatanKarakter: 'Jujur, Teliti'
            },
            {
              fase: 'Mengembangkan dan Menyajikan Hasil Karya',
              kegiatanGuru: 'Mengarahkan siswa mengolah data percobaan ke dalam bentuk grafik batang atau narasi simpulan sesuai pilihan diferensiasi kelompok.',
              kegiatanSiswa: 'Menghubungkan peningkatan denyut nadi dengan kebutuhan pasokan oksigen sel otot saat beraktivitas berat.',
              catatanKarakter: 'Kreatif, Kolaboratif'
            },
            {
              fase: 'Menganalisis dan Mengevaluasi Proses Pemecahan Masalah',
              kegiatanGuru: 'Memandu sesi pleno presentasi dan meluruskan miskonsepsi peredaran darah besar vs peredaran darah kecil.',
              kegiatanSiswa: 'Memberikan tanggapan atas temuan kelompok lain dengan bahasa yang santun.',
              catatanKarakter: 'Santun, Komunikatif'
            }
          ]
        },
        kegiatanPenutup: {
          durasiMenit: 15,
          poinKegiatan: [
            'Guru bersama siswa merangkum materi inti: 4 ruang jantung (atrium kanan-kiri, ventrikel kanan-kiri) dan fungsi katup jantung.',
            'Memberikan penghargaan kelompok paling kompak dan data terinci.',
            'Kuis kilat 3 nomor via papan tulis/mentimeter.',
            'Doa penutup pelajaran.'
          ],
          refleksiSiswa: [
            'Apakah kalian kini memahami mengapa olahraga rutin membuat jantung kita lebih efisien memompa darah?',
            'Kegiatan mana yang paling menyenangkan dalam pembelajaran tadi?'
          ],
          refleksiGuru: [
            'Apakah seluruh siswa berhasil menemukan titik arteri radialis untuk menghitung denyut nadi secara mandiri?'
          ]
        }
      }
    ],

    asesmenDiagnostik: {
      kognitif: [
        'Organ apa saja yang menyusun sistem peredaran darah manusia?',
        'Mengapa darah yang mengalir dari paru-paru kaya akan oksigen?'
      ],
      nonKognitif: [
        'Aktivitas apa yang paling sering membuat tubuhmu berkeringat dalam seminggu terakhir?'
      ]
    },
    asesmenFormatif: {
      teknik: 'Lembar Observasi Praktikum & Penilaian Kinerja LKPD',
      keterangan: 'Menilai keterampilan mengambil data denyut nadi, ketepatan membaca stopwatch, dan kerjasama regu.'
    },
    asesmenSumatif: {
      teknik: 'Tes Tertulis Uraian Objektif & Penilaian Produk Diferensiasi',
      kisiKisiDanSoal: [
        {
          nomor: 1,
          indikator: 'Menganalisis hubungan antara dinding ventrikel kiri yang lebih tebal dengan fungsinya',
          levelKognitif: 'C4 (HOTS)',
          butirPertanyaan: 'Mengapa dinding otot bilik (ventrikel) kiri jantung jauh lebih tebal dan berotot kuat dibandingkan bilik kanan? Hubungkan dengan jangkauan aliran darahnya!',
          kunciAtauRubrik: 'Bilik kiri memompa darah ke seluruh tubuh yang membutuhkan tekanan hidrolik tinggi dan melawan gravitasi, sedangkan bilik kanan hanya memompa ke paru-paru yang jaraknya dekat.'
        }
      ]
    },
    rubrikPenilaian: [
      {
        aspek: 'Keterampilan Praktikum Pengukuran Nadi',
        skor1PerluBimbingan: 'Tidak dapat menemukan letak denyut nadi tanpa bantuan penuh guru.',
        skor2Cukup: 'Mampu menemukan denyut nadi namun sering salah hitung dalam rentang waktu.',
        skor3Baik: 'Dapat menghitung denyut nadi secara konsisten dan mencatat data dengan tepat.',
        skor4SangatBaik: 'Sangat terampil, mandiri, dan mampu membantu rekan tim yang kesulitan.'
      },
      {
        aspek: 'Analisis dan Penarikan Simpulan',
        skor1PerluBimbingan: 'Simpulan tidak sesuai dengan data pengamatan praktikum.',
        skor2Cukup: 'Simpulan menyebutkan pengaruh aktivitas namun belum mengaitkan alasan biologisnya.',
        skor3Baik: 'Mampu mengaitkan peningkatan denyut dengan suplai oksigen dan energi sel.',
        skor4SangatBaik: 'Analisis sangat mendalam, mengaitkan faktor beban kerja jantung, usia, dan kebugaran.'
      }
    ],

    lkpd: {
      judul: 'LKPD Percobaan: Pengaruh Intensitas Aktivitas Fisik terhadap Frekuensi Denyut Nadi',
      tujuanAktivitas: 'Menyelidiki dan membuktikan keterkaitan antara beban aktivitas tubuh dengan kecepatan kerja jantung manusia.',
      alatBahan: ['Stopwatch / Timer Smartphone', 'Alat Tulis & Penggaris', 'Lembar Tabel Pengamatan'],
      langkahKerja: [
        'Pilihlah satu orang perwakilan dari kelompok sebagai subjek praktikum.',
        'Mintalah subjek duduk tenang selama 3 menit.',
        'Temukan denyut nadi pada pergelangan tangan (arteri radialis) searah pangkal ibu jari menggunakan jari telunjuk dan jari tengah (jangan pakai jempol).',
        'Hitung jumlah denyutan selama 1 menit penuh (atau 15 detik dikali 4). Catat hasilnya pada kolom "Kondisi Istirahat".',
        'Mintalah subjek melakukan aktivitas jalan cepat atau naik-turun bangku/tangga selama 1 menit.',
        'Segera hitung kembali denyut nadi selama 1 menit dan catat pada kolom "Setelah Aktivitas".',
        'Bandingkan kedua data tersebut dan diskusikan bersama kelompok.'
      ],
      tugasPertanyaan: [
        'Berapa selisih rata-rata denyut nadi saat istirahat dan setelah beraktivitas?',
        'Mengapa tubuh memerlukan frekuensi denyut nadi yang lebih tinggi saat beraktivitas berat?'
      ],
      panduanPenilaian: 'Ketepatan data pengamatan: 40%, Kualitas analisis jawaban: 40%, Ketertiban praktikum: 20%.'
    },

    bahanAjarRingkas: `RINGKASAN MATERI IPA: PEREDARAN DARAH MANUSIA

1. Jantung Manusia:
- Memiliki 4 ruang utama: Atrium Kanan (menerima darah kotor dari tubuh), Atrium Kiri (menerima darah bersih dari paru-paru), Ventrikel Kanan (memompa darah ke paru-paru), Ventrikel Kiri (memompa darah ke seluruh tubuh).
- Katup Jantung (Valvula): Berfungsi mencegah darah mengalir kembali ke arah yang berlawanan.

2. Pembuluh Darah:
- Arteri (Nadi): Membawa darah keluar dari jantung, dinding tebal, elastis, denyut terasa.
- Vena (Balik): Membawa darah kembali ke jantung, dinding tipis, ada katup di sepanjang pembuluh.
- Kapiler: Pembuluh sangat halus tempat pertukaran gas oksigen, karbon dioksida, dan nutrisi dengan jaringan sel.

3. Frekuensi Denyut Nadi Normal:
- Dewasa/Remaja saat istirahat: 60 - 100 denyut per menit (bpm).
- Faktor yang mempengaruhi: Aktivitas fisik, suhu lingkungan, emosi/stres, posisi tubuh, dan usia.`,

    programRemedial: 'Bimbingan terfokus dengan kartu puzzle aliran darah bagi siswa yang belum memahami siklus peredaran darah besar dan kecil.',
    programPengayaan: 'Menganalisis artikel jurnal sederhana tentang penyakit jantung koroner dan teknologi ring jantung (stent).',
    glosarium: [
      { istilah: 'Arteri Radialis', definisi: 'Pembuluh nadi utama yang terletak di pergelangan tangan dekat pangkal ibu jari.' },
      { istilah: 'Ventrikel', definisi: 'Bilik jantung yang bertugas memompa darah keluar dari jantung.' },
      { istilah: 'Atrium', definisi: 'Serambi jantung yang menerima darah yang masuk ke jantung.' },
      { istilah: 'Hemoglobin', definisi: 'Protein pengikat oksigen yang terkandung di dalam sel darah merah (eritrosit).' }
    ],
    daftarPustaka: [
      'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2022). Ilmu Pengetahuan Alam untuk SMP Kelas VIII. Jakarta: Pusat Perbukuan.',
      'Campbell, N. A., & Reece, J. B. (2018). Biologi Edisi Kedelapan Jilid 3. Jakarta: Erlangga.'
    ],
    createdAt: '2024-07-22T09:00:00.000Z',
    updatedAt: '2024-07-22T09:00:00.000Z'
  }
];
