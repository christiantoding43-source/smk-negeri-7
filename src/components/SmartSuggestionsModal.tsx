import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Compass,
  BookOpen,
  Users,
  Lightbulb,
  Search,
  Loader2,
  Check,
  ArrowRight,
  RefreshCw,
  Clock,
  HelpCircle,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { SmartSuggestionsResponse, SmartMateriSaran, SmartMetodeSaran, SmartAktivitasSaran, JenjangPendidikan } from '../types';

interface SmartSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToNewRPP: (data: {
    mataPelajaran: string;
    topikMateri: string;
    modelPembelajaran: string;
    selectedAktivitas: string[];
    catatanTambahan: string;
    jenjang: JenjangPendidikan;
  }) => void;
  initialMataPelajaran?: string;
  initialTopik?: string;
  initialJenjang?: JenjangPendidikan;
}

const INSPIRASI_PRESETS = [
  { mapel: 'Informatika', topik: 'Kecerdasan Buatan (AI) & Etika Penggunaan Digital', jenjang: 'SMA' as JenjangPendidikan },
  { mapel: 'Pengembangan Perangkat Lunak (PPLG)', topik: 'Desain Antarmuka (UI/UX) dan Pembuatan Prototipe Figma', jenjang: 'SMK' as JenjangPendidikan },
  { mapel: 'Teknik Komputer dan Jaringan', topik: 'Konfigurasi Firewall dan Keamanan Jaringan Server', jenjang: 'SMK' as JenjangPendidikan },
  { mapel: 'Ilmu Pengetahuan Alam (IPA)', topik: 'Sistem Peredaran Darah Manusia dan Penyakitnya', jenjang: 'SMP' as JenjangPendidikan },
  { mapel: 'Ilmu Pengetahuan Alam & Sosial (IPAS)', topik: 'Siklus Air dan Upaya Pelestarian Lingkungan Hidup', jenjang: 'SD' as JenjangPendidikan },
  { mapel: 'Matematika', topik: 'Statistika Data dan Analisis Peluang Berbasis Masalah Nyata', jenjang: 'SMA' as JenjangPendidikan },
  { mapel: 'Bahasa Indonesia', topik: 'Menulis Teks Negosiasi dan Praktik Simulasi Bisnis', jenjang: 'SMK' as JenjangPendidikan },
];

export const SmartSuggestionsModal: React.FC<SmartSuggestionsModalProps> = ({
  isOpen,
  onClose,
  onApplyToNewRPP,
  initialMataPelajaran = 'Informatika',
  initialTopik = 'Pengembangan Aplikasi Berbasis Web',
  initialJenjang = 'SMK',
}) => {
  const [mapel, setMapel] = useState(initialMataPelajaran);
  const [topik, setTopik] = useState(initialTopik);
  const [jenjang, setJenjang] = useState<JenjangPendidikan>(initialJenjang);
  const [kelas, setKelas] = useState('XI');

  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartSuggestionsResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selection states
  const [selectedMetode, setSelectedMetode] = useState<SmartMetodeSaran | null>(null);
  const [selectedAktivitasList, setSelectedAktivitasList] = useState<SmartAktivitasSaran[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<SmartMateriSaran | null>(null);

  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const fetchSuggestions = async (m = mapel, t = topik, j = jenjang) => {
    if (!t.trim()) {
      setErrorMsg('Mohon masukkan topik materi terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/rpp/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mataPelajaran: m,
          topikMateri: t,
          jenjang: j,
          kelas,
        }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'Gagal memproses saran cerdas.');
      }

      setSuggestions(resJson.data);
      // Auto-select first method as recommendation default
      if (resJson.data.rekomendasiMetode?.length > 0) {
        setSelectedMetode(resJson.data.rekomendasiMetode[0]);
      }
      if (resJson.data.rekomendasiAktivitas?.length > 0) {
        setSelectedAktivitasList([resJson.data.rekomendasiAktivitas[0]]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mendapatkan saran cerdas dari AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof INSPIRASI_PRESETS[0]) => {
    setMapel(preset.mapel);
    setTopik(preset.topik);
    setJenjang(preset.jenjang);
    fetchSuggestions(preset.mapel, preset.topik, preset.jenjang);
  };

  const toggleAktivitas = (act: SmartAktivitasSaran) => {
    const exists = selectedAktivitasList.some((a) => a.id === act.id);
    if (exists) {
      setSelectedAktivitasList(selectedAktivitasList.filter((a) => a.id !== act.id));
    } else {
      setSelectedAktivitasList([...selectedAktivitasList, act]);
    }
  };

  const handleApplyToRPP = () => {
    const actNotes = selectedAktivitasList
      .map((a) => `- ${a.judulAktivitas}: ${a.deskripsiKegiatan} (Output: ${a.outputSiswa})`)
      .join('\n');

    const additionalNotes = [
      selectedMateri ? `Fokus Materi: ${selectedMateri.judulMateri}. Subtopik: ${selectedMateri.subTopik.join(', ')}` : '',
      selectedAktivitasList.length > 0 ? `Ide Aktivitas Siswa yang Disarankan:\n${actNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    onApplyToNewRPP({
      mataPelajaran: mapel,
      topikMateri: selectedMateri ? `${topik} (${selectedMateri.judulMateri})` : topik,
      modelPembelajaran: selectedMetode?.modelTerkait || 'Project Based Learning (PjBL)',
      selectedAktivitas: selectedAktivitasList.map((a) => a.judulAktivitas),
      catatanTambahan: additionalNotes,
      jenjang,
    });
    onClose();
  };

  const handleCopySummary = () => {
    if (!suggestions) return;
    const summaryText = `=== SARAN CERDAS RPP / MODUL AJAR ===
Mata Pelajaran: ${suggestions.mataPelajaran}
Topik: ${suggestions.topik}
Fokus Pedagogis: ${suggestions.ringkasanPedagogis}

1. REKOMENDASI METODE PENGAJARAN:
${suggestions.rekomendasiMetode.map((m, i) => `${i + 1}. ${m.namaMetode} (${m.modelTerkait}) - ${m.deskripsi}`).join('\n')}

2. IDE AKTIVITAS SISWA:
${suggestions.rekomendasiAktivitas.map((a, i) => `${i + 1}. ${a.judulAktivitas} (${a.estimasiMenit} mnt) - Peran Siswa: ${a.peranSiswa} | Output: ${a.outputSiswa}`).join('\n')}

3. CAKUPAN MATERI:
${suggestions.rekomendasiMateri.map((m, i) => `${i + 1}. ${m.judulMateri} - ${m.subTopik.join(', ')}`).join('\n')}
`;

    navigator.clipboard.writeText(summaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Sistem Saran Cerdas Pedagogis (AI)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Materi • Metode • Aktivitas
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Dapatkan rekomendasi materi ajar mendalam, variasi metode (diskusi, simulasi, PjBL), dan ide aktivitas siswa interaktif.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Query Inputs Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang</label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value as JenjangPendidikan)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Contoh: Informatika / IPA"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topik / Materi Pembelajaran</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions()}
                    placeholder="Contoh: Desain Antarmuka Pengguna (UI/UX) atau Struktur Sel"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fetchSuggestions()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Cari Saran</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Inspirasi Topik Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRASI_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all text-left"
                  >
                    💡 <span className="font-semibold">{p.mapel}:</span> {p.topik}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Menganalisis Kurikulum & Merumuskan Saran Cerdas...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Menghubungkan topik dengan metode pengajaran terbaik (PjBL, simulasi, diskusi) dan ide aktivitas siswa bermakna.
              </p>
            </div>
          )}

          {/* Result Content */}
          {!isLoading && suggestions && (
            <div className="space-y-6">
              {/* Pedagogical Focus Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Fokus Pedagogis Rekomendasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {suggestions.ringkasanPedagogis}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="self-end sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0"
                >
                  {copiedText ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua Saran</span>
                    </>
                  )}
                </button>
              </div>

              {/* SECTION 1: METODE PENGAJARAN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    1. Rekomendasi Metode Pengajaran (Diskusi, Simulasi, PjBL, dll.)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Pilih 1 metode utama untuk RPP
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {suggestions.rekomendasiMetode.map((metode, idx) => {
                    const isSelected = selectedMetode?.namaMetode === metode.namaMetode;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedMetode(metode)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {metode.namaMetode}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                              {metode.kategori}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-snug">
                            {metode.deskripsi}
                          </p>

                          <div className="p-2 rounded bg-slate-100/80 text-[11px] text-slate-700">
                            <strong className="text-emerald-800">Kesesuaian:</strong> {metode.alasanKesesuaian}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Model: {metode.modelTerkait}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            {isSelected ? 'Terpilih' : 'Pilih Metode'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: IDE AKTIVITAS SISWA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    2. Rekomendasi Ide Aktivitas Siswa yang Interaktif & Bermakna
                  </h3>
                  <span className="text-xs text-slate-500">
                    {selectedAktivitasList.length} aktivitas dipilih untuk disertakan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.rekomendasiAktivitas.map((act) => {
                    const isSelected = selectedAktivitasList.some((a) => a.id === act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleAktivitas(act)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-400'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {act.kategori}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">
                              {act.judulAktivitas}
                            </h4>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {act.deskripsiKegiatan}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Peran Siswa:</span>
                            <span className="text-slate-700 font-medium">{act.peranSiswa}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Output / Karya:</span>
                            <span className="text-emerald-800 font-semibold">{act.outputSiswa}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: MATERI AJAR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    3. Rekomendasi Cakupan Materi Ajar Esensial
                  </h3>
                  <span className="text-xs text-slate-500">
                    Klik untuk memilih fokus materi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {suggestions.rekomendasiMateri.map((materi, idx) => {
                    const isSelected = selectedMateri?.judulMateri === materi.judulMateri;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedMateri(isSelected ? null : materi)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <h4 className="text-xs font-bold text-slate-900">
                            {materi.judulMateri}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-600 leading-snug mb-2">
                          {materi.deskripsi}
                        </p>

                        <div className="text-[11px] space-y-1">
                          <span className="font-semibold text-slate-700 block">Sub-Topik:</span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                            {materi.subTopik.map((sub, sIdx) => (
                              <li key={sIdx} className="line-clamp-1">{sub}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: PERTANYAAN PEMANTIK */}
              {suggestions.pertanyaanPemantik && suggestions.pertanyaanPemantik.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    Ide Pertanyaan Pemantik untuk Awal Pembelajaran:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {suggestions.pertanyaanPemantik.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>&quot;{q}&quot;</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!isLoading && !suggestions && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Masukkan mata pelajaran dan topik di atas atau klik inspirasi topik cepat
              </p>
              <p className="text-xs text-slate-400">
                Sistem saran cerdas AI akan merekomendasikan metode (diskusi, simulasi, PjBL), ide aktivitas siswa, dan materi esensial secara otomatis.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {selectedMetode && (
              <span>
                Metode Terpilih: <strong className="text-slate-800">{selectedMetode.namaMetode}</strong>
                {selectedAktivitasList.length > 0 && (
                  <> • {selectedAktivitasList.length} Aktivitas Terpilih</>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleApplyToRPP}
              disabled={!suggestions}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Gunakan Saran & Buat RPP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
