import React from 'react';
import { X, CheckCircle, ArrowRight, BookOpen, Layers, Award } from 'lucide-react';
import { sampleRPPList } from '../data/defaultTemplates';
import { RPPData } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: RPPData) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Pustaka Contoh & Format Modul Ajar Resmi</h2>
              <p className="text-xs text-slate-300">
                Dokumen referensi berstandar Kurikulum Merdeka & K13 siap langsung dipelajari dan disesuaikan
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {sampleRPPList.map((tpl) => (
            <div
              key={tpl.id}
              className="border border-slate-200 hover:border-emerald-500 rounded-xl p-5 bg-white hover:bg-emerald-50/20 transition-all shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                    {tpl.jenjang} • Kelas {tpl.kelas}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                    {tpl.modelPembelajaran}
                  </span>
                  {tpl.programKeahlian && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                      {tpl.programKeahlian}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <span>Pakai Contoh Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{tpl.judul}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>Mata Pelajaran:</strong> {tpl.mataPelajaran} • <strong>Alokasi Waktu:</strong> {tpl.alokasiWaktu}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100 space-y-1">
                <p><strong>Capaian Pembelajaran (CP):</strong> {tpl.capaianPembelajaran.substring(0, 180)}...</p>
                <p><strong>Tujuan Utama:</strong> {tpl.tujuanPembelajaran[0]}</p>
                <p><strong>Asesmen & LKPD:</strong> Dilengkapi diagnostik, formatif unjuk kerja, sumatif HOTS, rubrik KKTP, dan jobsheet.</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-2xs text-slate-500">
                <span className="font-semibold text-slate-700">Profil Pancasila:</span>
                {tpl.profilPelajarPancasila.map((p, idx) => (
                  <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
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
