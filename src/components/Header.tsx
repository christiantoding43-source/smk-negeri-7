import React from 'react';
import { BookOpen, Sparkles, FolderOpen, Plus, FileText, Printer, Download, Lightbulb } from 'lucide-react';
import { RPPData } from '../types';

interface HeaderProps {
  onOpenGenerator: () => void;
  onOpenSavedList: () => void;
  onOpenTemplates: () => void;
  onOpenSmartSuggestions: () => void;
  currentRPP: RPPData | null;
  onDownloadWord: () => void;
  onPrint: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGenerator,
  onOpenSavedList,
  onOpenTemplates,
  onOpenSmartSuggestions,
  currentRPP,
  onDownloadWord,
  onPrint,
  savedCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  SiRPP <span className="text-emerald-600">Digital</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Kurikulum Merdeka & K13
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Penyusun RPP & Modul Ajar Lengkap dengan Asesmen & LKPD
              </p>
            </div>
          </div>

          {/* Navigation & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSmartSuggestions}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
              title="Sistem Saran Cerdas: Rekomendasi Materi, Metode (Diskusi, Simulasi, PjBL), & Aktivitas Siswa"
            >
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Saran Cerdas</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-200/70 text-emerald-900 font-bold hidden md:inline">
                AI
              </span>
            </button>

            <button
              onClick={onOpenTemplates}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Lihat Contoh Template Siap Pakai"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Contoh Template</span>
            </button>


            <button
              onClick={onOpenSavedList}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Daftar RPP Tersimpan"
            >
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">RPP Tersimpan</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            {currentRPP && (
              <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={onDownloadWord}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  title="Unduh File Word (.doc)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Word</span>
                </button>

                <button
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Cetak atau Simpan PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
              </div>
            )}

            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow-emerald-600/25"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Susun RPP Baru (AI)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
