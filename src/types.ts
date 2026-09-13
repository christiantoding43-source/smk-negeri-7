export type KurikulumType = 
  | 'merdeka_lengkap' 
  | 'merdeka_smk' 
  | 'rpp_berdiferensiasi' 
  | 'rpp_1_lembar' 
  | 'k13_revisi';

export type JenjangPendidikan = 'SD' | 'SMP' | 'SMA' | 'SMK';

export type FaseKurikulum = 'Fase A (Kls 1-2)' | 'Fase B (Kls 3-4)' | 'Fase C (Kls 5-6)' | 'Fase D (Kls 7-9)' | 'Fase E (Kls 10)' | 'Fase F (Kls 11-12)';

export interface SaranaPrasarana {
  media: string[];
  alat: string[];
  sumberBelajar: string[];
}

export interface LangkahSintaks {
  fase: string;
  kegiatanGuru: string;
  kegiatanSiswa: string;
  catatanKarakter: string;
}

export interface SkenarioPertemuan {
  pertemuanKe: number;
  fokusMateri: string;
  alokasiMenit: number;
  kegiatanPendahuluan: {
    durasiMenit: number;
    poinKegiatan: string[];
  };
  kegiatanInti: {
    durasiMenit: number;
    sintaksModel: string;
    langkahSintaks: LangkahSintaks[];
  };
  kegiatanPenutup: {
    durasiMenit: number;
    poinKegiatan: string[];
    refleksiSiswa: string[];
    refleksiGuru: string[];
  };
}

export interface RubrikItem {
  aspek: string;
  skor1PerluBimbingan: string;
  skor2Cukup: string;
  skor3Baik: string;
  skor4SangatBaik: string;
}

export interface ButirSoalSumatif {
  nomor: number;
  indikator: string;
  levelKognitif: string; // C2, C3, C4, C5 (HOTS/MOTS)
  butirPertanyaan: string;
  kunciAtauRubrik: string;
}

export interface LKPDData {
  judul: string;
  tujuanAktivitas: string;
  alatBahan: string[];
  langkahKerja: string[];
  tugasPertanyaan: string[];
  panduanPenilaian: string;
}

export interface GlosariumItem {
  istilah: string;
  definisi: string;
}

export type UserRole = 'guru' | 'admin';

export interface AppUser {
  id: string; // Firebase uid or local user id
  username: string;
  namaLengkap: string;
  email: string;
  role: UserRole;
  nip?: string;
  mataPelajaran?: string;
  namaSekolah?: string;
  jabatan?: string;
  password?: string;
}

export type StatusPersetujuan = 'draft' | 'diajukan' | 'disetujui' | 'revisi';

export interface ButirAkreditasiItem {
  id: string;
  nomor: number;
  komponen: string;
  indikator: string;
  kriteria: string;
  terpenuhi: boolean;
  skor: number; // 1 - 4
  catatan?: string;
}

export interface EvaluasiAkreditasi {
  nomorRegistrasi: string; // e.g. "AKRED-SMK/2025/RPP-042"
  tanggalReview: string;
  peninjauNama: string;
  peninjauNip: string;
  peninjauJabatan: string;
  skorTotal: number; // 0 - 100
  predikat: 'A (Amat Baik / Unggul)' | 'B (Baik / Layak)' | 'C (Cukup)' | 'Perlu Perbaikan';
  catatanSupervisi: string;
  butirPenilaian: ButirAkreditasiItem[];
  statusPersetujuan: StatusPersetujuan;
}

export interface RPPData {
  id: string;
  ownerId?: string;
  authorEmail?: string;
  authorName?: string;
  authorNip?: string;
  authorUsername?: string;

  // Akreditasi & Status Persetujuan
  statusPersetujuan?: StatusPersetujuan;
  catatanPersetujuan?: string;
  disetujuiOleh?: string;
  nipPenyetuju?: string;
  tanggalPersetujuan?: string;
  evaluasiAkreditasi?: EvaluasiAkreditasi;

  judul: string;
  kurikulum: KurikulumType;

  jenjang: JenjangPendidikan;
  fase: FaseKurikulum;
  kelas: string;
  semester: 'Ganjil' | 'Genap';
  tahunPelajaran: string;
  mataPelajaran: string;
  programKeahlian?: string; // Khusus SMK
  namaSekolah: string;
  namaGuru: string;
  nipGuru: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  kotaTanggal: string;
  alokasiWaktu: string;
  jumlahPertemuan: number;
  topikMateri: string;
  modelPembelajaran: string;
  metodePembelajaran: string[];
  pendekatan: string;

  // Komponen Kurikulum & Tujuan
  capaianPembelajaran: string;
  alurTujuanPembelajaran: string;
  tujuanPembelajaran: string[];
  pemahamanBermakna: string;
  pertanyaanPemantik: string[];
  profilPelajarPancasila: string[];
  saranaPrasarana: SaranaPrasarana;
  targetPesertaDidik: string;

  // Pembelajaran Berdiferensiasi
  diferensiasiKonten: string;
  diferensiasiProses: string;
  diferensiasiProduk: string;

  // Skenario Pembelajaran
  skenarioPertemuan: SkenarioPertemuan[];

  // Asesmen
  asesmenDiagnostik: {
    kognitif: string[];
    nonKognitif: string[];
  };
  asesmenFormatif: {
    teknik: string;
    keterangan: string;
  };
  asesmenSumatif: {
    teknik: string;
    kisiKisiDanSoal: ButirSoalSumatif[];
  };
  rubrikPenilaian: RubrikItem[];

  // Lampiran
  lkpd: LKPDData;
  bahanAjarRingkas: string;
  programRemedial: string;
  programPengayaan: string;
  glosarium: GlosariumItem[];
  daftarPustaka: string[];

  createdAt: string;
  updatedAt: string;
}

export interface RPPGenerateRequest {
  jenjang: JenjangPendidikan;
  kelas: string;
  mataPelajaran: string;
  topikMateri: string;
  kurikulum: KurikulumType;
  modelPembelajaran: string;
  alokasiWaktu: string;
  jumlahPertemuan: number;
  namaSekolah?: string;
  namaGuru?: string;
  nipGuru?: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  kotaTanggal?: string;
  programKeahlian?: string;
  profilPancasilaPilihan?: string[];
  catatanTambahan?: string;
}

// ==========================================
// SMART SUGGESTION SYSTEM (Sistem Saran Cerdas)
// ==========================================

export interface SmartMateriSaran {
  judulMateri: string;
  deskripsi: string;
  subTopik: string[];
  poinKunci: string[];
}

export interface SmartMetodeSaran {
  namaMetode: string;
  modelTerkait: string; // e.g. 'Project Based Learning (PjBL)', 'Problem Based Learning (PBL)', 'Discovery Learning', etc.
  kategori: 'Diskusi & Kolaborasi' | 'Simulasi & Praktik' | 'Project-Based Learning' | 'Inquiry / Investigasi' | 'Studi Kasus' | 'Demonstrasi Interaktif';
  deskripsi: string;
  alasanKesesuaian: string;
  sintaksLangkah: string[];
}

export interface SmartAktivitasSaran {
  id: string;
  judulAktivitas: string;
  kategori: 'proyek' | 'diskusi' | 'simulasi' | 'presentasi' | 'penyelidikan';
  deskripsiKegiatan: string;
  peranSiswa: string;
  peranGuru: string;
  estimasiMenit: number;
  outputSiswa: string;
}

export interface SmartSuggestionsResponse {
  topik: string;
  mataPelajaran: string;
  jenjang?: string;
  ringkasanPedagogis: string;
  rekomendasiMateri: SmartMateriSaran[];
  rekomendasiMetode: SmartMetodeSaran[];
  rekomendasiAktivitas: SmartAktivitasSaran[];
  pertanyaanPemantik: string[];
  ideMediaAjar: string[];
}

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}


