import React, { useState } from 'react';
import { Sparkles, X, Loader2, Wand2, Check } from 'lucide-react';
import { RPPData } from '../types';

interface AIRefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  currentContent: any;
  rppContext: RPPData;
  onApply: (updatedContent: string) => void;
}

export const AIRefineModal: React.FC<AIRefineModalProps> = ({
  isOpen,
  onClose,
  sectionName,
  currentContent,
  rppContext,
  onApply,
}) => {
  const [instruction, setInstruction] = useState('');
  const [refinedResult, setRefinedResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Perkaya dengan soal berpikir tingkat tinggi (HOTS) dan kunci jawaban lengkap',
    'Tambahkan integrasi teknologi digital dan aplikasi interaktif',
    'Perinci instruksi kerja praktikum/jobsheet agar lebih terstruktur',
    'Kembangkan skenario diferensiasi proses untuk murid yang butuh bimbingan',
    'Sederhanakan bahasa agar lebih ringkas dan to the point',
  ];

  const handleRefine = async () => {
    if (!instruction.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rpp/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName,
          currentContent,
          instruction,
          rppContext: {
            mataPelajaran: rppContext.mataPelajaran,
            kelas: rppContext.kelas,
            jenjang: rppContext.jenjang,
            topikMateri: rppContext.topikMateri,
            modelPembelajaran: rppContext.modelPembelajaran,
          },
        }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const textFallback = await res.text().catch(() => '');
        throw new Error(textFallback || 'Server membalas dengan format yang tidak terbaca.');
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Gagal menyempurnakan bagian.');
      }
      setRefinedResult(data.refinedContent);
    } catch (err: any) {
      console.error(err);
      const raw = String(err?.message || '');
      if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
        setErrorMsg('Server AI sedang mengalami lonjakan antrean trafik tinggi. Silakan ulangi instruksi perbaikan.');
      } else {
        setErrorMsg(raw || 'Terjadi kesalahan saat memproses permintaan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (refinedResult) {
      onApply(refinedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold">Sempurnakan dengan AI: {sectionName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Pilih Rekomendasi Instruksi Cepat:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(p)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-colors"
                >
                  ✨ {p}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-slate-700 mb-1">
              Atau Tulis Instruksi Khusus:
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Contoh: Tambahkan 3 contoh studi kasus industri nyata yang mudah dipahami..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRefine}
              disabled={isLoading || !instruction.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Sedang Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Proses Penyempurnaan</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}

          {refinedResult && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 block">Hasil Penyempurnaan AI:</span>
              <div className="max-h-60 overflow-y-auto text-xs sm:text-sm text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-emerald-100">
                {refinedResult}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Terapkan Perubahan ke Dokumen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
