import { ButirAkreditasiItem, EvaluasiAkreditasi, RPPData, StatusPersetujuan } from '../types';

export const STANDAR_BUTIR_AKREDITASI: Omit<ButirAkreditasiItem, 'terpenuhi' | 'skor' | 'catatan'>[] = [
  {
    id: 'butir-1',
    nomor: 1,
    komponen: 'Standar Proses - Perumusan Tujuan Pembelajaran',
    indikator: 'Tujuan pembelajaran dirumuskan secara terukur mencakup kaidah ABCD dan Taksonomi Kognitif Abad ke-21.',
    kriteria: 'Memuat komponen Audience, Behavior, Condition, Degree, serta mengintegrasikan Profil Pelajar Pancasila dan pemahaman bermakna.',
  },
  {
    id: 'butir-2',
    nomor: 2,
    komponen: 'Standar Mutu Pembelajaran - Model Pembelajaran Aktif & Kontekstual',
    indikator: 'Skenario pembelajaran memuat sintaks model pembelajaran inovatif yang berpusat pada peserta didik.',
    kriteria: 'Sintaks model (seperti PjBL, PBL, Discovery Learning, atau Teaching Factory/TeFa) dijabarkan runut dengan alokasi waktu dan peran aktif siswa.',
  },
  {
    id: 'butir-3',
    nomor: 3,
    komponen: 'Standar Mutu Pengelolaan - Pembelajaran Berdiferensiasi',
    indikator: 'Mengakomodasi keragaman kebutuhan, kesiapan belajar, minat, dan modalitas peserta didik.',
    kriteria: 'Menyediakan diferensiasi konten (ragam media), diferensiasi proses (scaffolding/pendampingan), dan diferensiasi produk tugas.',
  },
  {
    id: 'butir-4',
    nomor: 4,
    komponen: 'Standar Penilaian - Asesmen Otentik Berkesinambungan',
    indikator: 'Rancangan asesmen mencakup Asesmen Diagnostik (Awal), Asesmen Formatif, dan Asesmen Sumatif berbasis HOTS.',
    kriteria: 'Dilengkapi kisi-kisi soal HOTS (C3-C6), kunci jawaban, serta rubrik Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) 4 skala terstandar.',
  },
  {
    id: 'butir-5',
    nomor: 5,
    komponen: 'Standar Sarana & Pemanfaatan Teknologi - Media Berbasis TIK/Industri',
    indikator: 'Pemanfaatan media ajar interaktif, perangkat digital/TIK, serta relevansi dengan lingkungan dan dunia kerja.',
    kriteria: 'Mencantumkan media presentasi interaktif, jobsheet, perangkat praktik nyata, serta sumber belajar terpercaya (Kemendikbudristek/PMM).',
  },
  {
    id: 'butir-6',
    nomor: 6,
    komponen: 'Kelengkapan Berkas Portofolio Akreditasi Satuan Pendidikan',
    indikator: 'Kelengkapan lampiran dokumen pembelajaran yang siap diobservasi dan diaudit oleh Asesor Akreditasi.',
    kriteria: 'Tersedia LKPD operasional, ringkasan materi ajar, program remedial dan pengayaan terstruktur, glosarium, serta daftar pustaka resmi.',
  },
];

/**
 * Otomatis mengecek pemenuhan kriteria akreditasi awal dari struktur data RPP
 */
export function auditRPPUntukAkreditasi(rpp: RPPData): ButirAkreditasiItem[] {
  return STANDAR_BUTIR_AKREDITASI.map((std) => {
    let terpenuhi = true;
    let skor = 4;
    let catatan = 'Kriteria telah terpenuhi secara memadai sesuai panduan kurikulum.';

    if (std.nomor === 1) {
      const hasTP = rpp.tujuanPembelajaran && rpp.tujuanPembelajaran.length >= 2;
      const hasABCD = rpp.tujuanPembelajaran?.some(
        (t) => t.includes('Condition') || t.includes('Audience') || t.includes('mampu') || t.includes('melalui')
      );
      if (!hasTP) {
        terpenuhi = false;
        skor = 2;
        catatan = 'Tujuan pembelajaran minimal 2 butir belum lengkap.';
      } else if (!hasABCD) {
        skor = 3;
        catatan = 'Tujuan sudah ada, disarankan mempertegas rumusan ABCD.';
      }
    } else if (std.nomor === 2) {
      const hasSkenario = rpp.skenarioPertemuan && rpp.skenarioPertemuan.length > 0;
      const hasSintaks = rpp.skenarioPertemuan?.some((s) => s.kegiatanInti?.langkahSintaks?.length >= 3);
      if (!hasSkenario || !hasSintaks) {
        terpenuhi = false;
        skor = 2;
        catatan = 'Sintaks model pembelajaran belum dijabarkan secara rinci.';
      }
    } else if (std.nomor === 3) {
      const hasDif =
        Boolean(rpp.diferensiasiKonten) &&
        Boolean(rpp.diferensiasiProses) &&
        Boolean(rpp.diferensiasiProduk);
      if (!hasDif) {
        terpenuhi = false;
        skor = 2;
        catatan = 'Komponen diferensiasi konten, proses, atau produk belum lengkap.';
      }
    } else if (std.nomor === 4) {
      const hasDiagnostik = rpp.asesmenDiagnostik?.kognitif?.length > 0;
      const hasSumatif = rpp.asesmenSumatif?.kisiKisiDanSoal?.length > 0;
      const hasRubrik = rpp.rubrikPenilaian?.length > 0;
      if (!hasDiagnostik || !hasSumatif || !hasRubrik) {
        terpenuhi = false;
        skor = 2;
        catatan = 'Instrumen asesmen atau rubrik KKTP masih perlu dilengkapi.';
      }
    } else if (std.nomor === 5) {
      const hasSarana =
        rpp.saranaPrasarana?.media?.length > 0 &&
        rpp.saranaPrasarana?.alat?.length > 0 &&
        rpp.saranaPrasarana?.sumberBelajar?.length > 0;
      if (!hasSarana) {
        skor = 3;
        catatan = 'Media TIK dan sumber belajar sebaiknya diperkaya.';
      }
    } else if (std.nomor === 6) {
      const hasLKPD = Boolean(rpp.lkpd?.judul && rpp.lkpd?.langkahKerja?.length > 0);
      const hasMateri = Boolean(rpp.bahanAjarRingkas && rpp.bahanAjarRingkas.length > 50);
      const hasRemedial = Boolean(rpp.programRemedial && rpp.programPengayaan);
      if (!hasLKPD || !hasMateri || !hasRemedial) {
        terpenuhi = false;
        skor = 2;
        catatan = 'Lampiran LKPD, bahan ajar, atau program remedial-pengayaan belum lengkap.';
      }
    }

    return {
      ...std,
      terpenuhi,
      skor,
      catatan,
    };
  });
}

export function hitungSkorAkreditasi(butir: ButirAkreditasiItem[]): {
  skorTotal: number;
  predikat: 'A (Amat Baik / Unggul)' | 'B (Baik / Layak)' | 'C (Cukup)' | 'Perlu Perbaikan';
} {
  const maxScore = butir.length * 4;
  const currentScore = butir.reduce((acc, b) => acc + (b.skor || 1), 0);
  const skorTotal = Math.round((currentScore / maxScore) * 100);

  let predikat: 'A (Amat Baik / Unggul)' | 'B (Baik / Layak)' | 'C (Cukup)' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (skorTotal >= 90) {
    predikat = 'A (Amat Baik / Unggul)';
  } else if (skorTotal >= 80) {
    predikat = 'B (Baik / Layak)';
  } else if (skorTotal >= 70) {
    predikat = 'C (Cukup)';
  }

  return { skorTotal, predikat };
}

export function generateNomorRegistrasiAkreditasi(rppId: string, jenjang: string = 'SMK'): string {
  const year = new Date().getFullYear();
  const randNum = (Math.abs(rppId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 900) + 100;
  return `REG-AKRED/${jenjang}/${year}/RPP-${randNum}`;
}
