import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCheck,
  FileEdit,
  Award,
  Filter,
  Search,
  BookOpen,
  User,
  ArrowRight,
  ChevronRight,
  Printer,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react';
import { RPPData, AppUser, StatusPersetujuan, ButirAkreditasiItem } from '../types';
import {
  STANDAR_BUTIR_AKREDITASI,
  auditRPPUntukAkreditasi,
  hitungSkorAkreditasi,
  generateNomorRegistrasiAkreditasi,
} from '../data/akreditasiStandards';

interface AdminAkreditasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  rpps: RPPData[];
  currentUser: AppUser;
  onApproveRPP: (rppId: string, evaluasiData: any) => Promise<void>;
  onRequestRevisionRPP: (rppId: string, catatan: string) => Promise<void>;
  onViewLembarPengesahan: (rpp: RPPData) => void;
  onOpenRPP: (rpp: RPPData) => void;
}

export const AdminAkreditasiModal: React.FC<AdminAkreditasiModalProps> = ({
  isOpen,
  onClose,
  rpps,
  currentUser,
  onApproveRPP,
  onRequestRevisionRPP,
  onViewLembarPengesahan,
  onOpenRPP,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRPP, setSelectedRPP] = useState<RPPData | null>(null);

  // Review drawer state
  const [auditItems, setAuditItems] = useState<ButirAkreditasiItem[]>([]);
  const [catatanSupervisi, setCatatanSupervisi] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Initialize audit items when selecting an RPP
  const handleSelectRPPForAudit = (rpp: RPPData) => {
    setSelectedRPP(rpp);
    if (rpp.evaluasiAkreditasi?.butirPenilaian && rpp.evaluasiAkreditasi.butirPenilaian.length > 0) {
      setAuditItems(rpp.evaluasiAkreditasi.butirPenilaian);
      setCatatanSupervisi(rpp.evaluasiAkreditasi.catatanSupervisi || rpp.catatanPersetujuan || '');
    } else {
      const autoAudited = auditRPPUntukAkreditasi(rpp);
      setAuditItems(autoAudited);
      setCatatanSupervisi(
        rpp.catatanPersetujuan ||
          'Dokumen perencanaan pembelajaran (RPP / Modul Ajar) telah ditelaah dan memenuhi butir standar mutu proses pembelajaran sesuai instrumen akreditasi satuan pendidikan.'
      );
    }
  };

  const handleToggleButir = (index: number) => {
    setAuditItems((prev) => {
      const copy = [...prev];
      const current = copy[index];
      const newTerpenuhi = !current.terpenuhi;
      copy[index] = {
        ...current,
        terpenuhi: newTerpenuhi,
        skor: newTerpenuhi ? 4 : 2,
        catatan: newTerpenuhi
          ? 'Kriteria terpenuhi secara komprehensif.'
          : 'Kriteria belum tuntas dipenuhi dalam modul.',
      };
      return copy;
    });
  };

  const handleScoreChange = (index: number, newScore: number) => {
    setAuditItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        skor: newScore,
        terpenuhi: newScore >= 3,
      };
      return copy;
    });
  };

  const currentScoreData = hitungSkorAkreditasi(auditItems);

  const handleApprove = async () => {
    if (!selectedRPP) return;
    setIsProcessing(true);
    try {
      const nomorReg =
        selectedRPP.evaluasiAkreditasi?.nomorRegistrasi ||
        generateNomorRegistrasiAkreditasi(selectedRPP.id, selectedRPP.jenjang);

      const evaluasiData = {
        nomorRegistrasi: nomorReg,
        tanggalReview: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        peninjauNama: currentUser.namaLengkap,
        peninjauNip: currentUser.nip || '197203151998021002',
        peninjauJabatan: currentUser.jabatan || 'Kepala Sekolah & Tim Asesor Akreditasi',
        skorTotal: currentScoreData.skorTotal,
        predikat: currentScoreData.predikat,
        catatanSupervisi: catatanSupervisi.trim(),
        butirPenilaian: auditItems,
        statusPersetujuan: 'disetujui' as StatusPersetujuan,
      };

      await onApproveRPP(selectedRPP.id, evaluasiData);
      setSelectedRPP(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedRPP) return;
    if (!catatanSupervisi.trim()) {
      alert('Mohon tuliskan catatan perbaikan/revisi untuk guru pengampu.');
      return;
    }
    setIsProcessing(true);
    try {
      await onRequestRevisionRPP(selectedRPP.id, catatanSupervisi.trim());
      setSelectedRPP(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics
  const totalCount = rpps.length;
  const pendingCount = rpps.filter((r) => r.statusPersetujuan === 'diajukan').length;
  const approvedCount = rpps.filter((r) => r.statusPersetujuan === 'disetujui').length;
  const revisionCount = rpps.filter((r) => r.statusPersetujuan === 'revisi').length;

  // Filtered List
  const filteredRPPs = rpps.filter((r) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'diajukan'
        ? r.statusPersetujuan === 'diajukan'
        : filterStatus === 'disetujui'
        ? r.statusPersetujuan === 'disetujui'
        : filterStatus === 'revisi'
        ? r.statusPersetujuan === 'revisi'
        : r.statusPersetujuan === 'draft' || !r.statusPersetujuan;

    const matchesQuery =
      searchQuery === ''
        ? true
        : r.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.authorName && r.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          r.namaGuru.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Panel Admin & Asesor Akreditasi</h2>
                <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Standar BAN-S/M & IASP
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Verifikasi, audit butir mutu pembelajaran, dan terbitkan lembar pengesahan akreditasi sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-2xs uppercase tracking-wider font-semibold">Total RPP Guru</span>
              <span className="text-xl font-black text-slate-800">{totalCount}</span>
            </div>
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-amber-700 block text-2xs uppercase tracking-wider font-semibold">Menunggu Telaah</span>
              <span className="text-xl font-black text-amber-800">{pendingCount}</span>
            </div>
            <Clock className="w-6 h-6 text-amber-500" />
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-emerald-700 block text-2xs uppercase tracking-wider font-semibold">Lolos Akreditasi</span>
              <span className="text-xl font-black text-emerald-800">{approvedCount}</span>
            </div>
            <Award className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-rose-700 block text-2xs uppercase tracking-wider font-semibold">Butuh Revisi</span>
              <span className="text-xl font-black text-rose-800">{revisionCount}</span>
            </div>
            <FileEdit className="w-6 h-6 text-rose-500" />
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT LIST PANEL */}
          <div className={`flex-1 flex flex-col overflow-hidden ${selectedRPP ? 'hidden md:flex md:w-1/2 md:border-r border-slate-200' : 'w-full'}`}>
            {/* Search & Filter Bar */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-2.5 items-center justify-between shrink-0">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari guru, judul, mapel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 overflow-x-auto w-full sm:w-auto text-2xs font-semibold">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'diajukan', label: `Diajukan (${pendingCount})` },
                  { key: 'disetujui', label: `Disetujui (${approvedCount})` },
                  { key: 'revisi', label: `Revisi (${revisionCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterStatus(tab.key)}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                      filterStatus === tab.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List items */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-slate-50/50">
              {filteredRPPs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada dokumen RPP yang sesuai filter.</p>
                </div>
              ) : (
                filteredRPPs.map((rpp) => {
                  const isSelected = selectedRPP?.id === rpp.id;
                  const status = rpp.statusPersetujuan || 'draft';

                  return (
                    <div
                      key={rpp.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {rpp.judul}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-2xs text-slate-500">
                            <span className="font-semibold text-slate-700">
                              👨‍🏫 {rpp.authorName || rpp.namaGuru}
                            </span>
                            <span>•</span>
                            <span>{rpp.mataPelajaran}</span>
                            <span>•</span>
                            <span>{rpp.jenjang} Kelas {rpp.kelas}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-bold shrink-0 ${
                            status === 'disetujui'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : status === 'diajukan'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : status === 'revisi'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {status === 'disetujui' && '⭐ Lolos Akreditasi'}
                          {status === 'diajukan' && '⏳ Diajukan'}
                          {status === 'revisi' && '⚠️ Butuh Revisi'}
                          {status === 'draft' && 'Draft Guru'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-3xs text-slate-400">
                          Update: {new Date(rpp.updatedAt || rpp.createdAt).toLocaleDateString('id-ID')}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {status === 'disetujui' && (
                            <button
                              type="button"
                              onClick={() => onViewLembarPengesahan(rpp)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-2xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Award className="w-3 h-3" />
                              <span>Pengesahan</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectRPPForAudit(rpp)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-amber-700 text-white rounded-lg text-2xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>{status === 'disetujui' ? 'Lihat Audit' : 'Audit & Verifikasi'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT AUDIT / VERIFICATION DRAWER */}
          {selectedRPP ? (
            <div className="flex-1 md:w-1/2 flex flex-col bg-white overflow-hidden border-t md:border-t-0 md:border-l border-slate-200">
              {/* Review Drawer Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-2xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Audit Standar Akreditasi BAN-S/M</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {selectedRPP.judul}
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Guru: {selectedRPP.authorName || selectedRPP.namaGuru} ({selectedRPP.mataPelajaran})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenRPP(selectedRPP)}
                    className="px-2 py-1 text-2xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    Buka Isi RPP
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRPP(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 md:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Audit Checklist & Form */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                
                {/* Score Indicator Banner */}
                <div className="p-3.5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-2xs text-emerald-300 block uppercase tracking-wider font-semibold">
                      Skor Kelayakan Akreditasi
                    </span>
                    <span className="text-2xl font-black text-white">{currentScoreData.skorTotal}/100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xs text-slate-300 block">Predikat Mutu:</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 inline-block mt-0.5">
                      {currentScoreData.predikat}
                    </span>
                  </div>
                </div>

                {/* Butir Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Checklist Butir Instrumen Akreditasi:</span>
                    <span className="text-2xs text-slate-500 font-normal">Klik untuk ubah status butir</span>
                  </h4>

                  <div className="space-y-2.5">
                    {auditItems.map((butir, idx) => (
                      <div
                        key={butir.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          butir.terpenuhi
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleButir(idx)}
                            className="mt-0.5 shrink-0 text-slate-600 hover:text-emerald-700 cursor-pointer"
                          >
                            {butir.terpenuhi ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-bold text-slate-800">
                                Butir {butir.nomor}: {butir.komponen}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {[1, 2, 3, 4].map((skorVal) => (
                                  <button
                                    key={skorVal}
                                    type="button"
                                    onClick={() => handleScoreChange(idx, skorVal)}
                                    className={`w-5 h-5 rounded text-3xs font-bold flex items-center justify-center transition-colors ${
                                      butir.skor === skorVal
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {skorVal}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <p className="text-2xs text-slate-600 mb-1">{butir.kriteria}</p>
                            <p className="text-3xs italic text-slate-500 font-sans">
                              Komentar: {butir.catatan}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catatan Supervisi / Umpan Balik */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Catatan Supervisi Klinis / Rekomendasi Asesor
                  </label>
                  <textarea
                    rows={3}
                    value={catatanSupervisi}
                    onChange={(e) => setCatatanSupervisi(e.target.value)}
                    placeholder="Tuliskan catatan arahan atau catatan pengesahan untuk guru..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50/50"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setCatatanSupervisi(
                          'Dokumen perencanaan pembelajaran sangat lengkap, terstruktur, berbasis HOTS, dan memenuhi seluruh kriteria kelayakan akreditasi satuan pendidikan dengan predikat Amat Baik.'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-3xs transition-colors"
                    >
                      + Rekomendasi Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCatatanSupervisi(
                          'Mohon sempurnakan kembali butir asesmen sumatif dengan menyertakan rubrik KKTP yang lebih rinci dan lengkapi diferensiasi proses pada langkah kegiatan inti.'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-3xs transition-colors"
                    >
                      + Catatan Revisi Asesmen
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRequestRevision}
                  className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Minta Revisi</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Setujui & Sahkan Akreditasi</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-slate-400 text-xs bg-slate-50/50">
              <div>
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm mb-1">Pilih Dokumen RPP untuk Ditelaah</h4>
                <p className="max-w-xs text-slate-500">
                  Pilih salah satu RPP yang diajukan oleh guru dari daftar di samping untuk melakukan audit butir akreditasi dan menerbitkan pengesahan.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
