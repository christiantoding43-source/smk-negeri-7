import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Check,
  Compass,
  Users,
  Lightbulb,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Loader2,
  HelpCircle,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { SmartSuggestionsResponse, SmartMateriSaran, SmartMetodeSaran, SmartAktivitasSaran } from '../types';

interface SmartSuggestionsPanelProps {
  suggestions: SmartSuggestionsResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectMateri: (materi: SmartMateriSaran) => void;
  onSelectMetode: (metode: SmartMetodeSaran) => void;
  onSelectAktivitas: (aktivitas: SmartAktivitasSaran) => void;
  selectedMetodeName?: string;
  selectedAktivitasIds?: string[];
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  suggestions,
  isLoading,
  onRefresh,
  onSelectMateri,
  onSelectMetode,
  onSelectAktivitas,
  selectedMetodeName,
  selectedAktivitasIds = [],
}) => {
  const [activeTab, setActiveTab] = useState<'metode' | 'aktivitas' | 'materi' | 'pemantik'>('metode');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-white rounded-xl border border-emerald-200/80 p-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Sistem Saran Cerdas Sedang Menganalisis...
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Merumuskan materi ajar esensial, metode pedagogis yang relevan (diskusi, simulasi, PjBL), dan ide aktivitas siswa aktif...
          </p>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                Sistem Saran Cerdas Pedagogis
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                AI Rekomendasi
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 line-clamp-1">
              Topik: &quot;{suggestions.topik}&quot; • {suggestions.mataPelajaran}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-all"
            title="Muat ulang alternatif saran lain"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Alternatif Lain</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Pedagogis */}
      <div className="bg-emerald-50/60 border-b border-emerald-100 px-4 py-2.5 text-xs text-emerald-900 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <span className="leading-relaxed">
          <strong className="font-semibold">Fokus Pedagogis:</strong> {suggestions.ringkasanPedagogis}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 px-3 pt-2 gap-1 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('metode')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'metode'
              ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Metode & Model ({suggestions.rekomendasiMetode.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aktivitas')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'aktivitas'
              ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ide Aktivitas Siswa ({suggestions.rekomendasiAktivitas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'materi'
              ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cakupan Materi Ajar ({suggestions.rekomendasiMateri.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pemantik')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'pemantik'
              ? 'border-emerald-600 text-emerald-700 font-bold bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pemantik & Media</span>
        </button>
      </div>

      {/* Notification Toast */}
      {copiedNotification && (
        <div className="bg-slate-900 text-white text-xs px-3 py-1.5 text-center font-medium flex items-center justify-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-4 max-h-80 overflow-y-auto space-y-3">
        {/* TAB 1: METODE PENGAJARAN */}
        {activeTab === 'metode' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 italic">
              Pilih salah satu metode pengajaran di bawah ini untuk langsung menerapkan model & sintaks pembelajaran pada RPP:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.rekomendasiMetode.map((metode, idx) => {
                const isSelected = selectedMetodeName === metode.modelTerkait;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {metode.namaMetode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                          {metode.kategori}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-snug">
                        {metode.deskripsi}
                      </p>

                      <div className="p-2 rounded-lg bg-slate-100/70 text-[11px] text-slate-700">
                        <strong className="text-emerald-800 font-semibold">Mengapa Cocok:</strong>{' '}
                        {metode.alasanKesesuaian}
                      </div>

                      {metode.sintaksLangkah && metode.sintaksLangkah.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Sintaks Utama:
                          </span>
                          <ul className="space-y-0.5 text-[11px] text-slate-600 list-disc list-inside">
                            {metode.sintaksLangkah.slice(0, 3).map((st, sIdx) => (
                              <li key={sIdx} className="line-clamp-1">{st}</li>
                            ))}
                            {metode.sintaksLangkah.length > 3 && (
                              <li className="text-[10px] text-slate-400 list-none pl-3">
                                +{metode.sintaksLangkah.length - 3} tahapan sintaks lainnya
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Model: <strong className="text-slate-700">{metode.modelTerkait}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectMetode(metode);
                          notify(`Metode "${metode.namaMetode}" diterapkan ke form RPP!`);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Terpilih</span>
                          </>
                        ) : (
                          <>
                            <span>Terapkan Metode</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: IDE AKTIVITAS SISWA */}
        {activeTab === 'aktivitas' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 italic">
              Klik &quot;Sisipkan Ide Ini&quot; untuk menyertakan aktivitas siswa ke dalam catatan instruksional atau skenario pertemuan RPP:
            </p>

            <div className="space-y-2.5">
              {suggestions.rekomendasiAktivitas.map((act) => {
                const isSelected = selectedAktivitasIds.includes(act.id);
                return (
                  <div
                    key={act.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {act.kategori}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">
                          {act.judulAktivitas}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {act.estimasiMenit} Menit
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectAktivitas(act);
                            notify(`Aktivitas "${act.judulAktivitas}" disisipkan!`);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Tersisip</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Sisipkan Ide Ini</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {act.deskripsiKegiatan}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded">
                        <strong className="text-slate-700 font-semibold block mb-0.5">
                          Peran Siswa (Student-Centered):
                        </strong>
                        <span className="text-slate-600">{act.peranSiswa}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <strong className="text-slate-700 font-semibold block mb-0.5">
                          Output / Produk Nyata:
                        </strong>
                        <span className="text-emerald-800 font-medium">{act.outputSiswa}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MATERI AJAR */}
        {activeTab === 'materi' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 italic">
              Pilihan cakupan materi ajar esensial yang dapat diperluas ke dalam RPP:
            </p>

            <div className="grid grid-cols-1 gap-3">
              {suggestions.rekomendasiMateri.map((mat, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      {mat.judulMateri}
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMateri(mat);
                        notify(`Materi "${mat.judulMateri}" diterapkan ke topik materi!`);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      Gunakan Materi Ini
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mat.deskripsi}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="font-semibold text-slate-700 block mb-1">Sub-Pokok Bahasan:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {mat.subTopik.map((sub, sIdx) => (
                          <li key={sIdx}>{sub}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100">
                      <span className="font-semibold text-emerald-900 block mb-1">Poin Kunci Penguasaan:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                        {mat.poinKunci.map((pk, pIdx) => (
                          <li key={pIdx}>{pk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERTANYAAN PEMANTIK & MEDIA */}
        {activeTab === 'pemantik' && (
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                Pertanyaan Pemantik Kontekstual:
              </h5>
              <div className="space-y-1.5">
                {suggestions.pertanyaanPemantik.map((q, qIdx) => (
                  <div key={qIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </span>
                    <span className="leading-relaxed">&quot;{q}&quot;</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                Rekomendasi Media & Alat Ajar Interaktif:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.ideMediaAjar.map((med, mIdx) => (
                  <div key={mIdx} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-900 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{med}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
