import React, { useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  Edit3,
  Wand2,
  Share2,
  FileCheck,
  Calendar,
  Clock,
  Award,
  Layers,
  HelpCircle,
  Sparkles,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

import { RPPData, AppUser } from '../types';

interface DocumentViewerProps {
  rpp: RPPData;
  onEditClick: () => void;
  onDownloadWord: () => void;
  onPrint: () => void;
  onRefineSection: (sectionName: string, content: any) => void;
  onOpenSmartSuggestions?: () => void;
  currentUser?: AppUser;
  onSubmitForApproval?: () => void;
  onOpenAdminAudit?: () => void;
  onViewLembarPengesahan?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  rpp,
  onEditClick,
  onDownloadWord,
  onPrint,
  onRefineSection,
  onOpenSmartSuggestions,
  currentUser,
  onSubmitForApproval,
  onOpenAdminAudit,
  onViewLembarPengesahan,
}) => {

  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    const textToCopy = `
${rpp.namaSekolah.toUpperCase()}
${rpp.judul.toUpperCase()}
Mata Pelajaran: ${rpp.mataPelajaran} (${rpp.jenjang} Kelas ${rpp.kelas})
Alokasi Waktu: ${rpp.alokasiWaktu}
Model Pembelajaran: ${rpp.modelPembelajaran}

I. TUJUAN PEMBELAJARAN
${rpp.tujuanPembelajaran.map((tp, i) => `${i + 1}. ${tp}`).join('\n')}

II. LANGKAH-LANGKAH PEMBELAJARAN
${rpp.skenarioPertemuan
  .map(
    (p) => `Pertemuan ${p.pertemuanKe}: ${p.fokusMateri} (${p.alokasiMenit} Menit)
- Pendahuluan: ${p.kegiatanPendahuluan.poinKegiatan.join('; ')}
- Inti (${p.kegiatanInti.sintaksModel}):
${p.kegiatanInti.langkahSintaks.map((s) => `  * [${s.fase}] Guru: ${s.kegiatanGuru} | Siswa: ${s.kegiatanSiswa}`).join('\n')}
- Penutup: ${p.kegiatanPenutup.poinKegiatan.join('; ')}`
  )
  .join('\n\n')}

III. ASESMEN & EVALUASI
- Formatif: ${rpp.asesmenFormatif.teknik} (${rpp.asesmenFormatif.keterangan})
- Sumatif: ${rpp.asesmenSumatif.kisiKisiDanSoal.map((s) => `[${s.levelKognitif}] ${s.butirPertanyaan}`).join('\n')}

IV. LKPD / JOBSHEET:
${rpp.lkpd.judul}
Tujuan: ${rpp.lkpd.tujuanAktivitas}
Langkah Kerja:
${rpp.lkpd.langkahKerja.map((l, i) => `${i + 1}. ${l}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const kurikulumTitle =
    rpp.kurikulum === 'merdeka_smk'
      ? 'MODUL AJAR KURIKULUM MERDEKA (SMK)'
      : rpp.kurikulum === 'merdeka_lengkap'
      ? 'MODUL AJAR KURIKULUM MERDEKA'
      : rpp.kurikulum === 'rpp_berdiferensiasi'
      ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) BERDIFERENSIASI'
      : rpp.kurikulum === 'rpp_1_lembar'
      ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) 1 LEMBAR'
      : 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) K-13 REVISI';

  return (
    <div className="space-y-6">
      {/* Top Document Controls Bar (Hidden in Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {rpp.jenjang} • Kelas {rpp.kelas}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Terakhir disesuaikan: {new Date(rpp.updatedAt || rpp.createdAt).toLocaleDateString('id-ID')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSmartSuggestions && (
            <button
              onClick={onOpenSmartSuggestions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-lg transition-colors shadow-2xs"
              title="Lihat ide materi, variasi metode pengajaran (diskusi, simulasi, PjBL), dan aktivitas siswa"
            >
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Saran Cerdas</span>
            </button>
          )}

          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
          >

            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mode Edit RPP</span>
          </button>

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={onDownloadWord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
            title="Download Word (.doc) yang kompatibel dengan Microsoft Office"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Word (.doc)</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Accreditation & Approval Status Banner (Hidden in Print) */}
      <div className="print:hidden">
        {rpp.statusPersetujuan === 'disetujui' ? (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 rounded-xl shadow-xs border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-emerald-200">
                    Dokumen Terverifikasi & Lolos Akreditasi Sekolah
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {rpp.evaluasiAkreditasi?.predikat || 'Predikat A (Unggul)'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5">
                  No. Registrasi: <span className="font-mono text-emerald-300 font-semibold">{rpp.evaluasiAkreditasi?.nomorRegistrasi || `REG-AKRED/SMK/2025/RPP-${rpp.id.slice(-4)}`}</span> • Skor: <strong className="text-white">{rpp.evaluasiAkreditasi?.skorTotal || 96}/100</strong> • Disahkan oleh: {rpp.disetujuiOleh || rpp.evaluasiAkreditasi?.peninjauNama || 'Kepala Sekolah & Tim Asesor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onViewLembarPengesahan && (
                <button
                  type="button"
                  onClick={onViewLembarPengesahan}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Lihat Lembar Pengesahan Resmi</span>
                </button>
              )}
              {currentUser?.role === 'admin' && onOpenAdminAudit && (
                <button
                  type="button"
                  onClick={onOpenAdminAudit}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-xs transition-colors"
                >
                  Ubah Audit
                </button>
              )}
            </div>
          </div>
        ) : rpp.statusPersetujuan === 'diajukan' ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-amber-900">
                    Menunggu Verifikasi & Persetujuan Akreditasi
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-200 text-amber-900">
                    Status: Diajukan
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-0.5">
                  Dokumen ini telah diajukan oleh guru pengampu ({rpp.authorName || rpp.namaGuru}) dan sedang menunggu telaah klinis oleh Kepala Sekolah / Asesor Akreditasi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentUser?.role === 'admin' && onOpenAdminAudit ? (
                <button
                  type="button"
                  onClick={onOpenAdminAudit}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Audit & Sahkan Akreditasi Sekarang</span>
                </button>
              ) : (
                <span className="text-2xs italic text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-md border border-amber-200">
                  Asesor sedang meninjau dokumen
                </span>
              )}
            </div>
          </div>
        ) : rpp.statusPersetujuan === 'revisi' ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-rose-900">
                  Dokumen Memerlukan Perbaikan / Revisi Akreditasi
                </h4>
                <p className="text-xs text-rose-800 mt-0.5 font-medium">
                  Catatan Supervisi Asesor: "{rpp.catatanPersetujuan || rpp.evaluasiAkreditasi?.catatanSupervisi || 'Periksa kembali kelengkapan asesmen dan sintaks pembelajaran aktif.'}"
                </p>
                <p className="text-2xs text-rose-600 mt-1">
                  Silakan perbaiki modul ajar ini melalui tombol "Mode Edit RPP", lalu ajukan kembali.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onSubmitForApproval && (
                <button
                  type="button"
                  onClick={onSubmitForApproval}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Ajukan Ulang Setelah Revisi</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 text-slate-800 p-3.5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Status Dokumen: Draf Guru Pengampu ({rpp.authorName || rpp.namaGuru})
                </span>
                <span className="text-2xs text-slate-500">
                  Belum diajukan ke Tim Asesor Penjaminan Mutu & Akreditasi Satuan Pendidikan.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onSubmitForApproval && (
                <button
                  type="button"
                  onClick={onSubmitForApproval}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-emerald-200" />
                  <span>Ajukan ke Admin untuk Akreditasi Sekolah</span>
                </button>
              )}
              {currentUser?.role === 'admin' && onOpenAdminAudit && (
                <button
                  type="button"
                  onClick={onOpenAdminAudit}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Audit Akreditasi Langsung
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* THE OFFICIAL DOCUMENT PAPER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-12 max-w-5xl mx-auto print:p-0 print:border-none print:shadow-none print:m-0 text-slate-900 font-serif leading-relaxed">
        {/* KOP RESMI */}
        <div className="text-center pb-4 mb-6 border-b-4 border-double border-slate-900">
          <p className="text-xs sm:text-sm uppercase tracking-widest font-sans font-semibold text-slate-700">
            PEMERINTAH DAERAH DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h1 className="text-xl sm:text-2xl font-sans font-extrabold uppercase text-slate-900 mt-1">
            {rpp.namaSekolah}
          </h1>
          <p className="text-xs font-sans text-slate-600 mt-1 italic">
            Jl. Pendidikan Karakter Bangsa No. 1 • Tahun Pelajaran {rpp.tahunPelajaran} • Akreditasi A
          </p>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-8">
          <h2 className="text-base sm:text-lg font-sans font-bold underline uppercase tracking-wide">
            {kurikulumTitle}
          </h2>
          <p className="text-sm sm:text-base font-sans font-semibold text-slate-800 mt-1">
            {rpp.judul.toUpperCase()}
          </p>
        </div>

        {/* SECTION A: INFORMASI UMUM */}
        <section className="mb-8">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-3">
            <h3 className="font-sans font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
              A. INFORMASI UMUM
            </h3>
            <button
              onClick={() => onRefineSection('Informasi Umum & Identitas', rpp)}
              className="text-xs font-sans text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 print:hidden"
            >
              <Wand2 className="w-3 h-3" /> AI Sempurnakan
            </button>
          </div>

          <table className="w-full text-xs sm:text-sm mb-4 border-collapse font-sans">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 w-1/4 font-semibold text-slate-700">Nama Penyusun / Guru</td>
                <td className="w-4">:</td>
                <td className="py-1.5 font-medium">{rpp.namaGuru} {rpp.nipGuru && `(NIP: ${rpp.nipGuru})`}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Satuan Pendidikan</td>
                <td>:</td>
                <td className="py-1.5">{rpp.namaSekolah}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Jenjang / Fase / Kelas</td>
                <td>:</td>
                <td className="py-1.5">{rpp.jenjang} / {rpp.fase} / Kelas {rpp.kelas} ({rpp.semester})</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Mata Pelajaran</td>
                <td>:</td>
                <td className="py-1.5 font-medium">{rpp.mataPelajaran} {rpp.programKeahlian ? `(${rpp.programKeahlian})` : ''}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Topik / Materi Pokok</td>
                <td>:</td>
                <td className="py-1.5 font-bold text-slate-900">{rpp.topikMateri}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Alokasi Waktu</td>
                <td>:</td>
                <td className="py-1.5">{rpp.alokasiWaktu} ({rpp.jumlahPertemuan} Pertemuan)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Model Pembelajaran</td>
                <td>:</td>
                <td className="py-1.5 font-medium text-emerald-800">{rpp.modelPembelajaran}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Metode & Pendekatan</td>
                <td>:</td>
                <td className="py-1.5">{rpp.metodePembelajaran.join(', ')} • {rpp.pendekatan}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 font-semibold text-slate-700">Target Peserta Didik</td>
                <td>:</td>
                <td className="py-1.5">{rpp.targetPesertaDidik}</td>
              </tr>
            </tbody>
          </table>

          {/* Sarana & Prasarana */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs sm:text-sm font-sans mb-3">
            <span className="font-bold block text-slate-800 mb-1">Sarana dan Prasarana:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              <li><strong>Media Pembelajaran:</strong> {rpp.saranaPrasarana.media.join(', ')}</li>
              <li><strong>Alat dan Bahan:</strong> {rpp.saranaPrasarana.alat.join(', ')}</li>
              <li><strong>Sumber Belajar:</strong> {rpp.saranaPrasarana.sumberBelajar.join(', ')}</li>
            </ul>
          </div>

          {/* Profil Pelajar Pancasila */}
          <div className="text-xs sm:text-sm font-sans">
            <span className="font-bold text-slate-800 mr-2">Dimensi Profil Pelajar Pancasila:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {rpp.profilPelajarPancasila.map((p, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200 font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION B: KOMPONEN INTI */}
        <section className="mb-8">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-3">
            <h3 className="font-sans font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
              B. KOMPONEN INTI
            </h3>
            <button
              onClick={() => onRefineSection('Tujuan Pembelajaran & Diferensiasi', rpp.tujuanPembelajaran)}
              className="text-xs font-sans text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 print:hidden"
            >
              <Wand2 className="w-3 h-3" /> AI Sempurnakan
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* CP */}
            <div>
              <h4 className="font-sans font-bold text-slate-800">1. Capaian Pembelajaran (CP) / Kompetensi:</h4>
              <p className="p-3 bg-slate-50 border-l-4 border-emerald-600 text-slate-800 rounded-r-md mt-1 leading-relaxed">
                {rpp.capaianPembelajaran}
              </p>
            </div>

            {/* ATP */}
            <div>
              <h4 className="font-sans font-bold text-slate-800">2. Alur Tujuan Pembelajaran (ATP):</h4>
              <p className="text-slate-700 mt-1">{rpp.alurTujuanPembelajaran}</p>
            </div>

            {/* Tujuan Pembelajaran ABCD */}
            <div>
              <h4 className="font-sans font-bold text-slate-800">
                3. Tujuan Pembelajaran (Kaidah ABCD - Audience, Behavior, Condition, Degree):
              </h4>
              <ol className="list-decimal list-outside ml-5 space-y-1.5 mt-1.5 text-slate-800">
                {rpp.tujuanPembelajaran.map((tp, idx) => (
                  <li key={idx} className="pl-1">{tp}</li>
                ))}
              </ol>
            </div>

            {/* Pemahaman Bermakna & Pertanyaan Pemantik */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                <h4 className="font-sans font-bold text-emerald-950 text-xs uppercase tracking-wide">
                  4. Pemahaman Bermakna (Essential Meaning):
                </h4>
                <p className="mt-1 text-slate-800 italic">"{rpp.pemahamanBermakna}"</p>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-sans font-bold text-blue-950 text-xs uppercase tracking-wide">
                  5. Pertanyaan Pemantik (Trigger Questions):
                </h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-800">
                  {rpp.pertanyaanPemantik.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pembelajaran Berdiferensiasi */}
            <div>
              <h4 className="font-sans font-bold text-slate-800 mb-1.5">
                6. Strategi Pembelajaran Berdiferensiasi:
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-1/3 text-left">Diferensiasi Konten</th>
                      <th className="p-2 border-r border-slate-300 w-1/3 text-left">Diferensiasi Proses</th>
                      <th className="p-2 w-1/3 text-left">Diferensiasi Produk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5 border-r border-slate-300 align-top text-slate-700 leading-relaxed">
                        {rpp.diferensiasiKonten}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 align-top text-slate-700 leading-relaxed">
                        {rpp.diferensiasiProses}
                      </td>
                      <td className="p-2.5 align-top text-slate-700 leading-relaxed">
                        {rpp.diferensiasiProduk}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION C: SKENARIO PEMBELAJARAN */}
        <section className="mb-8">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-3">
            <h3 className="font-sans font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
              C. SKENARIO / LANGKAH-LANGKAH PEMBELAJARAN
            </h3>
            <button
              onClick={() => onRefineSection('Skenario & Sintaks Pembelajaran', rpp.skenarioPertemuan)}
              className="text-xs font-sans text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 print:hidden"
            >
              <Wand2 className="w-3 h-3" /> AI Sempurnakan
            </button>
          </div>

          <div className="space-y-6">
            {rpp.skenarioPertemuan.map((pertemuan, pIdx) => (
              <div key={pIdx} className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-800 text-white px-4 py-2 font-sans font-bold text-xs sm:text-sm flex items-center justify-between">
                  <span>
                    Pertemuan Ke-{pertemuan.pertemuanKe}: {pertemuan.fokusMateri}
                  </span>
                  <span className="text-emerald-300 font-normal">
                    {pertemuan.alokasiMenit} Menit
                  </span>
                </div>

                <div className="p-4 space-y-4 font-sans text-xs sm:text-sm">
                  {/* Kegiatan Pendahuluan */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                      <span>1. Kegiatan Pendahuluan</span>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {pertemuan.kegiatanPendahuluan.durasiMenit} Menit
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {pertemuan.kegiatanPendahuluan.poinKegiatan.map((poin, idx) => (
                        <li key={idx}>{poin}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Kegiatan Inti (Tabel Sintaks) */}
                  <div>
                    <div className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                      <span>2. Kegiatan Inti: {pertemuan.kegiatanInti.sintaksModel}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                        {pertemuan.kegiatanInti.durasiMenit} Menit
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border border-slate-300 border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                            <th className="p-2 border-r border-slate-300 w-1/4 text-left font-bold">Fase / Sintaks</th>
                            <th className="p-2 border-r border-slate-300 w-2/5 text-left font-bold">Aktivitas Guru</th>
                            <th className="p-2 w-1/3 text-left font-bold">Aktivitas Siswa & Nilai Karakter</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pertemuan.kegiatanInti.langkahSintaks.map((fase, fIdx) => (
                            <tr key={fIdx} className="border-b border-slate-200">
                              <td className="p-2.5 border-r border-slate-300 align-top font-semibold text-slate-900 bg-slate-50/50">
                                {fase.fase}
                              </td>
                              <td className="p-2.5 border-r border-slate-300 align-top text-slate-700">
                                {fase.kegiatanGuru}
                              </td>
                              <td className="p-2.5 align-top text-slate-700">
                                <p>{fase.kegiatanSiswa}</p>
                                <span className="inline-block mt-1 text-2xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-medium">
                                  Karakter: {fase.catatanKarakter}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Kegiatan Penutup & Refleksi */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                      <span>3. Kegiatan Penutup & Refleksi Pembelajaran</span>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {pertemuan.kegiatanPenutup.durasiMenit} Menit
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 mb-3">
                      {pertemuan.kegiatanPenutup.poinKegiatan.map((poin, idx) => (
                        <li key={idx}>{poin}</li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1">Refleksi Siswa:</span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {pertemuan.kegiatanPenutup.refleksiSiswa.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1">Refleksi Guru:</span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {pertemuan.kegiatanPenutup.refleksiGuru.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION D: ASESMEN DAN PENILAIAN */}
        <section className="mb-8">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-3">
            <h3 className="font-sans font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
              D. ASESMEN DAN EVALUASI PEMBELAJARAN
            </h3>
            <button
              onClick={() => onRefineSection('Asesmen & Rubrik Penilaian', rpp.asesmenSumatif)}
              className="text-xs font-sans text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 print:hidden"
            >
              <Wand2 className="w-3 h-3" /> AI Sempurnakan
            </button>
          </div>

          <div className="space-y-4 font-sans text-xs sm:text-sm">
            {/* Diagnostik & Formatif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 p-3 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-1.5">1. Asesmen Diagnostik Awal:</h4>
                <p className="text-xs font-semibold text-slate-600">A. Kognitif:</p>
                <ul className="list-disc list-inside text-xs text-slate-700 mb-2">
                  {rpp.asesmenDiagnostik.kognitif.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
                <p className="text-xs font-semibold text-slate-600">B. Non-Kognitif:</p>
                <ul className="list-disc list-inside text-xs text-slate-700">
                  {rpp.asesmenDiagnostik.nonKognitif.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>

              <div className="border border-slate-200 p-3 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-1.5">2. Asesmen Formatif (Proses):</h4>
                <p className="text-xs text-slate-700 mb-1">
                  <strong>Teknik:</strong> {rpp.asesmenFormatif.teknik}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Keterangan:</strong> {rpp.asesmenFormatif.keterangan}
                </p>
              </div>
            </div>

            {/* Sumatif & Kisi-kisi Soal HOTS */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1.5">
                3. Asesmen Sumatif (Kisi-Kisi & Butir Soal Berpikir Tingkat Tinggi / HOTS):
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                <strong>Teknik Penilaian:</strong> {rpp.asesmenSumatif.teknik}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-300 border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                      <th className="p-2 border-r border-slate-300 w-1/4 text-left">Indikator Ketercapaian</th>
                      <th className="p-2 border-r border-slate-300 w-16 text-center">Level</th>
                      <th className="p-2 border-r border-slate-300 w-2/5 text-left">Butir Pertanyaan</th>
                      <th className="p-2 w-1/4 text-left">Kunci / Rubrik Jawaban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpp.asesmenSumatif.kisiKisiDanSoal.map((soal) => (
                      <tr key={soal.nomor} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{soal.nomor}</td>
                        <td className="p-2 border-r border-slate-300 align-top">{soal.indikator}</td>
                        <td className="p-2 border-r border-slate-300 align-top text-center">
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-bold rounded text-2xs border border-purple-200">
                            {soal.levelKognitif}
                          </span>
                        </td>
                        <td className="p-2 border-r border-slate-300 align-top text-slate-800 font-medium">
                          {soal.butirPertanyaan}
                        </td>
                        <td className="p-2 align-top text-slate-600 italic">{soal.kunciAtauRubrik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rubrik KKTP */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1.5">
                4. Rubrik Kriteria Ketercapaian Tujuan Pembelajaran (KKTP):
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-300 border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-1/5 text-left">Aspek Penilaian</th>
                      <th className="p-2 border-r border-slate-300 w-1/5 text-left bg-red-50/50">Perlu Bimbingan (1)</th>
                      <th className="p-2 border-r border-slate-300 w-1/5 text-left bg-amber-50/50">Cukup (2)</th>
                      <th className="p-2 border-r border-slate-300 w-1/5 text-left bg-blue-50/50">Baik (3)</th>
                      <th className="p-2 w-1/5 text-left bg-emerald-50/50">Sangat Baik (4)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpp.rubrikPenilaian.map((rubrik, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 font-semibold align-top">{rubrik.aspek}</td>
                        <td className="p-2 border-r border-slate-300 align-top text-slate-600">{rubrik.skor1PerluBimbingan}</td>
                        <td className="p-2 border-r border-slate-300 align-top text-slate-600">{rubrik.skor2Cukup}</td>
                        <td className="p-2 border-r border-slate-300 align-top text-slate-600">{rubrik.skor3Baik}</td>
                        <td className="p-2 align-top text-slate-700 font-medium">{rubrik.skor4SangatBaik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION E: LAMPIRAN DOKUMEN */}
        <section className="mb-10 page-break">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-4">
            <h3 className="font-sans font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
              E. LAMPIRAN DOKUMEN
            </h3>
            <button
              onClick={() => onRefineSection('LKPD / Jobsheet Praktik', rpp.lkpd)}
              className="text-xs font-sans text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 print:hidden"
            >
              <Wand2 className="w-3 h-3" /> AI Sempurnakan
            </button>
          </div>

          <div className="space-y-6 font-sans text-xs sm:text-sm">
            {/* LKPD / JOBSHEET */}
            <div className="border-2 border-slate-900 rounded-xl p-5 bg-white">
              <div className="text-center border-b border-slate-300 pb-3 mb-3">
                <span className="text-2xs font-bold uppercase tracking-widest text-emerald-700 block">
                  LEMBAR KERJA PESERTA DIDIK (LKPD)
                </span>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                  {rpp.lkpd.judul}
                </h4>
              </div>

              <div className="space-y-3 text-slate-800">
                <p><strong>Tujuan Aktivitas:</strong> {rpp.lkpd.tujuanAktivitas}</p>
                <p><strong>Alat dan Bahan:</strong> {rpp.lkpd.alatBahan.join(', ')}</p>

                <div>
                  <strong>Langkah Kerja Praktik:</strong>
                  <ol className="list-decimal list-outside ml-5 space-y-1 mt-1 text-slate-700">
                    {rpp.lkpd.langkahKerja.map((langkah, idx) => (
                      <li key={idx}>{langkah}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <strong>Tugas dan Pertanyaan Diskusi:</strong>
                  <ol className="list-decimal list-outside ml-5 space-y-1 mt-1 text-slate-700">
                    {rpp.lkpd.tugasPertanyaan.map((tugas, idx) => (
                      <li key={idx}>{tugas}</li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-600 text-xs italic">
                  Pedoman Penilaian: {rpp.lkpd.panduanPenilaian}
                </div>
              </div>
            </div>

            {/* RINGKASAN BAHAN BACAAN */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="font-bold text-slate-800 mb-2">2. Bahan Bacaan Ringkas Guru & Peserta Didik:</h4>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
                {rpp.bahanAjarRingkas}
              </div>
            </div>

            {/* REMEDIAL & PENGAYAAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-red-50/40 rounded-lg border border-red-200">
                <h4 className="font-bold text-red-950 text-xs mb-1">3. Program Pembelajaran Remedial:</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{rpp.programRemedial}</p>
              </div>
              <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200">
                <h4 className="font-bold text-emerald-950 text-xs mb-1">4. Program Pembelajaran Pengayaan:</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{rpp.programPengayaan}</p>
              </div>
            </div>

            {/* GLOSARIUM */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1.5">5. Glosarium Istilah Penting:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-300 border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-1/3 text-left">Istilah</th>
                      <th className="p-2 w-2/3 text-left">Definisi Operasional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpp.glosarium.map((g, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-800">{g.istilah}</td>
                        <td className="p-2 text-slate-700">{g.definisi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DAFTAR PUSTAKA */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1">6. Daftar Pustaka:</h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 ml-1">
                {rpp.daftarPustaka.map((pustaka, idx) => (
                  <li key={idx}>{pustaka}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* LEMBAR PENGESAHAN TANDA TANGAN */}
        <section className="pt-6 border-t border-slate-300 font-sans print:break-inside-avoid">
          <table className="w-full text-xs sm:text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 align-top text-left">
                  <p>Mengetahui,</p>
                  <p className="font-medium">Kepala {rpp.namaSekolah}</p>
                  <div className="h-20 sm:h-24 flex items-end relative">
                    {rpp.statusPersetujuan === 'disetujui' && (
                      <div className="absolute top-0 left-0 bg-emerald-50 border-2 border-dashed border-emerald-600/70 rounded-lg p-1.5 text-center transform -rotate-3 text-emerald-800">
                        <span className="block font-sans font-black text-3xs uppercase tracking-wider text-emerald-900">
                          ★ DISAHKAN AKREDITASI ★
                        </span>
                        <span className="block font-mono text-3xs text-emerald-700">
                          {rpp.evaluasiAkreditasi?.nomorRegistrasi || 'REG-AKRED/2025'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold underline text-slate-900">{rpp.disetujuiOleh || rpp.namaKepalaSekolah}</p>
                      <p className="text-xs text-slate-600">NIP. {rpp.nipPenyetuju || rpp.nipKepalaSekolah || '...........................................'}</p>
                    </div>
                  </div>
                </td>
                <td className="w-1/2 align-top text-right">
                  <p>{rpp.kotaTanggal || '........................, .................... 2024'}</p>
                  <p className="font-medium">Guru Mata Pelajaran,</p>
                  <div className="h-20 sm:h-24 flex items-end justify-end">
                    <div>
                      <p className="font-bold underline text-slate-900">{rpp.namaGuru}</p>
                      <p className="text-xs text-slate-600">NIP. {rpp.nipGuru || '...........................................'}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};
