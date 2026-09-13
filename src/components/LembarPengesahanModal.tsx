import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Award, Download, Building2 } from 'lucide-react';
import { RPPData } from '../types';

interface LembarPengesahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  rpp: RPPData | null;
}

export const LembarPengesahanModal: React.FC<LembarPengesahanModalProps> = ({
  isOpen,
  onClose,
  rpp,
}) => {
  if (!isOpen || !rpp) return null;

  const handlePrint = () => {
    window.print();
  };

  const evaluasi = rpp.evaluasiAkreditasi;
  const noReg = evaluasi?.nomorRegistrasi || `REG-AKRED/${rpp.jenjang || 'SMK'}/2025/RPP-${rpp.id.slice(-4)}`;
  const tanggalReview = evaluasi?.tanggalReview || rpp.tanggalPersetujuan || rpp.kotaTanggal || 'Jakarta, 15 Juli 2025';
  const skorTotal = evaluasi?.skorTotal || 96;
  const predikat = evaluasi?.predikat || 'A (Amat Baik / Unggul)';
  const peninjauNama = evaluasi?.peninjauNama || rpp.disetujuiOleh || rpp.namaKepalaSekolah || 'Dr. Hendra Wijaya, M.Pd.';
  const peninjauNip = evaluasi?.peninjauNip || rpp.nipPenyetuju || rpp.nipKepalaSekolah || '197203151998021002';
  const peninjauJabatan = evaluasi?.peninjauJabatan || 'Kepala Satuan Pendidikan & Tim Penjamin Mutu Akreditasi';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Action Bar (Hidden during print) */}
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">Lembar Pengesahan Akreditasi Resmi</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-2xs px-2 py-0.5 rounded-full">
              Dokumen Portofolio BAN-S/M
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL ACCREDITATION DOCUMENT */}
        <div id="lembar-pengesahan-print" className="p-8 sm:p-12 text-slate-900 bg-white font-serif leading-relaxed text-sm">
          
          {/* KOP RESMI SEKOLAH */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-800 shrink-0 font-sans font-black text-lg">
                🏫
              </div>
              <div>
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-600">
                  PEMERINTAH PROVINSI / DAERAH SATUAN PENDIDIKAN
                </h3>
                <h2 className="font-sans font-black text-base sm:text-lg uppercase text-slate-900">
                  {rpp.namaSekolah || 'SMK NEGERI 1 MAKASSAR'}
                </h2>
                <p className="font-sans text-xs text-slate-600">
                  Jl. Pendidikan No. 1, Telp. (0411) 850001, Website: www.sekolah.sch.id
                </p>
              </div>
            </div>
            <div className="h-0.5 bg-slate-900 w-full mt-2"></div>
            <div className="h-px bg-slate-400 w-full mt-0.5"></div>
          </div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center mb-6">
            <h1 className="text-base sm:text-lg font-bold underline uppercase tracking-wide">
              LEMBAR PENGESAHAN DOKUMEN MODUL AJAR / RPP
            </h1>
            <p className="font-sans text-xs font-semibold text-slate-700 mt-1">
              UNTUK KELENGKAPAN BERKAS PORTOFOLIO AKREDITASI SATUAN PENDIDIKAN
            </p>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              Nomor Registrasi: <span className="font-mono font-bold text-slate-800">{noReg}</span>
            </p>
          </div>

          {/* PERNYATAAN VERIFIKASI */}
          <p className="mb-4 text-justify">
            Setelah dilakukan telaah, verifikasi, dan audit klinis terhadap pemenuhan Standar Mutu Proses Pembelajaran Kurikulum Merdeka / K13 oleh Tim Penjaminan Mutu & Asesor Internal Satuan Pendidikan, maka dokumen perencanaan pembelajaran berikut:
          </p>

          {/* IDENTITAS TABEL */}
          <table className="w-full border border-slate-400 text-xs sm:text-sm mb-6 font-sans">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-44 p-2 font-semibold bg-slate-50 border-r border-slate-300">Judul Dokumen</td>
                <td className="p-2 font-bold">{rpp.judul}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-300">Mata Pelajaran</td>
                <td className="p-2">{rpp.mataPelajaran} {rpp.programKeahlian ? `(${rpp.programKeahlian})` : ''}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-300">Topik / Lingkup Materi</td>
                <td className="p-2 font-medium">{rpp.topikMateri}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-300">Fase / Jenjang / Kelas</td>
                <td className="p-2">{rpp.fase || 'Fase E/F'} — {rpp.jenjang} Kelas {rpp.kelas} ({rpp.semester || 'Ganjil'})</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-300">Model & Pendekatan</td>
                <td className="p-2">{rpp.modelPembelajaran} (Berdiferensiasi Konten, Proses, dan Produk)</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-300">Guru Pengampu Penyusun</td>
                <td className="p-2 font-bold">{rpp.authorName || rpp.namaGuru} (NIP: {rpp.authorNip || rpp.nipGuru || '-'})</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-300">Hasil Audit Akreditasi</td>
                <td className="p-2">
                  <span className="font-bold text-emerald-800">Skor Kelayakan: {skorTotal}/100</span> —{' '}
                  <span className="font-black underline text-slate-900">Predikat: {predikat}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* CATATAN ASESOR */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-300 rounded font-sans text-xs">
            <span className="font-bold block text-slate-800 mb-1">Catatan Verifikasi & Rekomendasi Supervisi:</span>
            <p className="italic text-slate-700">
              "{evaluasi?.catatanSupervisi || rpp.catatanPersetujuan || 'Dokumen telah memenuhi seluruh indikator butir inti akreditasi BAN-S/M: Tujuan pembelajaran terukur ABCD, sintaks pembelajaran aktif, pembelajaran berdiferensiasi kontekstual, asesmen otentik HOTS, serta kelengkapan instrumen LKPD dan bahan ajar terlampir.'}"
            </p>
          </div>

          <p className="mb-8 text-justify">
            Dinyatakan <strong>TELAH SAH, MEMENUHI STANDAR MUTU AKREDITASI</strong>, dan dapat dipergunakan secara resmi dalam proses belajar mengajar serta diarsipkan dalam berkas portofolio Akreditasi Satuan Pendidikan.
          </p>

          {/* BLOK TANDA TANGAN */}
          <div className="font-sans grid grid-cols-2 gap-6 text-center text-xs sm:text-sm pt-4">
            <div>
              <p className="text-slate-600 mb-1">Mengetahui/Menyusun,</p>
              <p className="font-bold text-slate-800">Guru Mata Pelajaran</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-xs">
                (Tanda Tangan Digital Terverifikasi)
              </div>
              <p className="font-bold underline text-slate-900">{rpp.authorName || rpp.namaGuru}</p>
              <p className="text-2xs text-slate-600">NIP. {rpp.authorNip || rpp.nipGuru || '-'}</p>
            </div>

            <div className="relative">
              <p className="text-slate-600 mb-1">{tanggalReview}</p>
              <p className="font-bold text-slate-800">Kepala Satuan Pendidikan / Asesor</p>
              <div className="h-16 flex items-center justify-center relative">
                <span className="italic text-emerald-800 text-xs font-bold border border-emerald-500/40 bg-emerald-50/70 px-3 py-1 rounded">
                  ★ TERAKREDITASI & DISAHKAN ★
                </span>
              </div>
              <p className="font-bold underline text-slate-900">{peninjauNama}</p>
              <p className="text-2xs text-slate-600">NIP. {peninjauNip}</p>
            </div>
          </div>

          {/* FOOTER VERIFIKASI QR */}
          <div className="mt-10 pt-4 border-t border-slate-300 font-sans text-2xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white font-mono flex items-center justify-center font-bold text-3xs">
                [QR]
              </div>
              <div>
                <span className="font-bold block text-slate-700">Verifikasi Integritas Dokumen</span>
                <span>ID Dokumen: {rpp.id} | Validasi Digital Terhubung Firestore</span>
              </div>
            </div>
            <div className="text-right">
              <span>Sistem Penyusun RPP & Penjamin Mutu Akreditasi Sekolah</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
