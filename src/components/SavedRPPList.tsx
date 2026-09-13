import React, { useState } from 'react';
import { Search, FolderOpen, Trash2, Copy, Eye, X, BookOpen, Clock, Download, Plus } from 'lucide-react';
import { RPPData } from '../types';

interface SavedRPPListProps {
  isOpen: boolean;
  onClose: () => void;
  savedRPPs: RPPData[];
  onSelectRPP: (rpp: RPPData) => void;
  onDuplicateRPP: (rpp: RPPData) => void;
  onDeleteRPP: (id: string) => void;
  onDownloadWord: (rpp: RPPData) => void;
  onOpenGenerator: () => void;
}

export const SavedRPPList: React.FC<SavedRPPListProps> = ({
  isOpen,
  onClose,
  savedRPPs,
  onSelectRPP,
  onDuplicateRPP,
  onDeleteRPP,
  onDownloadWord,
  onOpenGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = savedRPPs.filter((rpp) => {
    const matchJenjang = selectedJenjang === 'ALL' || rpp.jenjang === selectedJenjang;
    const matchSearch =
      rpp.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rpp.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rpp.topikMateri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rpp.namaSekolah.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJenjang && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Daftar Dokumen RPP Tersimpan</h2>
              <p className="text-xs text-slate-300">
                Tersimpan aman di peramban Anda ({savedRPPs.length} Dokumen)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul, mapel, atau topik..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'SMK', 'SMA', 'SMP', 'SD'].map((j) => (
              <button
                key={j}
                onClick={() => setSelectedJenjang(j)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedJenjang === j
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {j === 'ALL' ? 'Semua' : j}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Tidak ada dokumen RPP yang sesuai filter.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenGenerator();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Susun RPP Baru Sekarang</span>
              </button>
            </div>
          ) : (
            filtered.map((rpp) => (
              <div
                key={rpp.id}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 p-4 rounded-xl transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-2xs font-bold bg-emerald-100 text-emerald-800 rounded">
                      {rpp.jenjang} • Kelas {rpp.kelas}
                    </span>
                    <span className="text-2xs text-slate-500">
                      {rpp.alokasiWaktu}
                    </span>
                    {rpp.programKeahlian && (
                      <span className="text-2xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                        {rpp.programKeahlian}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {rpp.judul}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {rpp.mataPelajaran} • Topik: {rpp.topikMateri}
                  </p>
                  <p className="text-2xs text-slate-400">
                    Sekolah: {rpp.namaSekolah} | Guru: {rpp.namaGuru}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => {
                      onSelectRPP(rpp);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka</span>
                  </button>

                  <button
                    onClick={() => onDownloadWord(rpp)}
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Unduh Word (.doc)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDuplicateRPP(rpp)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Duplikasi Dokumen"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus dokumen "${rpp.judul}"?`)) {
                        onDeleteRPP(rpp.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Menampilkan {filtered.length} dari {savedRPPs.length} RPP tersimpan</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
