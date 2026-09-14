import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, BookOpen, AlertCircle, Loader2, Wrench, GraduationCap, School, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { JenjangPendidikan, KurikulumType, RPPData, RPPGenerateRequest, SmartSuggestionsResponse, SmartMateriSaran, SmartMetodeSaran, SmartAktivitasSaran } from '../types';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRPP: RPPData) => void;
  initialData?: {
    mataPelajaran?: string;
    topikMateri?: string;
    modelPembelajaran?: string;
    catatanTambahan?: string;
    jenjang?: JenjangPendidikan;
  } | null;
}


const PRESET_TOPICS = [
  {
    label: 'SMK: Rekayasa Perangkat Lunak (PPLG)',
    jenjang: 'SMK' as JenjangPendidikan,
    kelas: 'XI',
    mapel: 'Pengembangan Perangkat Lunak (PPLG)',
    program: 'Rekayasa Perangkat Lunak (RPL)',
    topik: 'Prinsip Desain Antarmuka (UI/UX) dan Prototyping Interaktif',
    model: 'Project Based Learning (PjBL)',
    kurikulum: 'merdeka_smk' as KurikulumType,
  },
  {
    label: 'SMK: Teknik Komputer & Jaringan (TKJ)',
    jenjang: 'SMK' as JenjangPendidikan,
    kelas: 'XI',
    mapel: 'Teknik Jaringan Komputer dan Telekomunikasi',
    program: 'Teknik Komputer dan Jaringan (TKJ)',
    topik: 'Konfigurasi Routing Dinamis (OSPF) pada Jaringan Komputer',
    model: 'Teaching Factory (TeFa)',
    kurikulum: 'merdeka_smk' as KurikulumType,
  },
  {
    label: 'SMA: Matematika Fase E',
    jenjang: 'SMA' as JenjangPendidikan,
    kelas: 'X',
    mapel: 'Matematika',
    program: '',
    topik: 'Sistem Persamaan Linear Tiga Variabel (SPLTV) Kontekstual',
    model: 'Problem Based Learning (PBL)',
    kurikulum: 'merdeka_lengkap' as KurikulumType,
  },
  {
    label: 'SMP: IPA Fase D (Berdiferensiasi)',
    jenjang: 'SMP' as JenjangPendidikan,
    kelas: 'VIII',
    mapel: 'Ilmu Pengetahuan Alam (IPA)',
    program: '',
    topik: 'Struktur dan Fungsi Organ Sistem Pencernaan Manusia',
    model: 'Problem Based Learning (PBL)',
    kurikulum: 'rpp_berdiferensiasi' as KurikulumType,
  },
  {
    label: 'SD: IPAS Fase B',
    jenjang: 'SD' as JenjangPendidikan,
    kelas: 'IV',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    program: '',
    topik: 'Wujud Zat dan Perubahannya dalam Kehidupan Sehari-hari',
    model: 'Discovery Learning',
    kurikulum: 'merdeka_lengkap' as KurikulumType,
  },
  {
    label: 'RPP 1 Lembar Ringkas (Permendikbud No. 14/2019)',
    jenjang: 'SMA' as JenjangPendidikan,
    kelas: 'XI',
    mapel: 'Bahasa Indonesia',
    program: '',
    topik: 'Menganalisis Sistematika dan Kebahasaan Karya Ilmiah',
    model: 'Inquiry Learning',
    kurikulum: 'rpp_1_lembar' as KurikulumType,
  },
];

const PROFIL_PANCASILA_OPTIONS = [
  'Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia',
  'Berkebinekaan Global',
  'Gotong Royong',
  'Mandiri',
  'Bernalar Kritis',
  'Kreatif',
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {

  const [jenjang, setJenjang] = useState<JenjangPendidikan>('SMK');
  const [kelas, setKelas] = useState('XI');
  const [mataPelajaran, setMataPelajaran] = useState('Pengembangan Perangkat Lunak dan GIM');
  const [programKeahlian, setProgramKeahlian] = useState('Rekayasa Perangkat Lunak (RPL)');
  const [topikMateri, setTopikMateri] = useState('Prinsip Desain Antarmuka (UI/UX) dan Prototyping Interaktif');
  const [kurikulum, setKurikulum] = useState<KurikulumType>('merdeka_smk');
  const [modelPembelajaran, setModelPembelajaran] = useState('Project Based Learning (PjBL)');
  const [alokasiWaktu, setAlokasiWaktu] = useState('4 x 45 Menit (1 Pertemuan)');
  const [jumlahPertemuan, setJumlahPertemuan] = useState(1);
  const [selectedPancasila, setSelectedPancasila] = useState<string[]>([
    'Bernalar Kritis',
    'Kreatif',
    'Gotong Royong',
    'Mandiri',
  ]);

  // Administration Details
  const [namaSekolah, setNamaSekolah] = useState('SMK Negeri 1');
  const [namaGuru, setNamaGuru] = useState('Guru Pengampu, S.Pd.');
  const [nipGuru, setNipGuru] = useState('19900101 201801 1 001');
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState('Nama Kepala Sekolah, M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19750505 200003 1 005');
  const [catatanTambahan, setCatatanTambahan] = useState('');

  // Smart Suggestion System States
  const [suggestions, setSuggestions] = useState<SmartSuggestionsResponse | null>(null);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [selectedAktivitasIds, setSelectedAktivitasIds] = useState<string[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Sync initialData if passed from outside
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.mataPelajaran) setMataPelajaran(initialData.mataPelajaran);
      if (initialData.topikMateri) setTopikMateri(initialData.topikMateri);
      if (initialData.modelPembelajaran) setModelPembelajaran(initialData.modelPembelajaran);
      if (initialData.catatanTambahan) setCatatanTambahan(initialData.catatanTambahan);
      if (initialData.jenjang) setJenjang(initialData.jenjang);
    }
  }, [isOpen, initialData]);

  // Fetch Smart Suggestions from Backend API
  const fetchSmartSuggestions = async () => {
    if (!topikMateri.trim()) {
      setSuggestError('Ketik topik atau materi pembelajaran terlebih dahulu.');
      return;
    }

    setIsSuggestLoading(true);
    setSuggestError(null);
    setIsSuggestOpen(true);

    try {
      const response = await fetch('/api/rpp/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mataPelajaran,
          topikMateri,
          jenjang,
          kelas,
          kurikulum,
          programKeahlian: jenjang === 'SMK' ? programKeahlian : undefined,
        }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'Gagal memuat saran cerdas AI.');
      }

      setSuggestions(resJson.data);
    } catch (err: any) {
      console.error(err);
      setSuggestError(err.message || 'Gagal menghubungi server saran cerdas.');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const handleSelectMateri = (mat: SmartMateriSaran) => {
    // Enrich the topic if appropriate or add to notes
    const noteText = `Fokus Materi Rekomendasi: ${mat.judulMateri}. Sub-topik: ${mat.subTopik.join(', ')}`;
    setCatatanTambahan((prev) => (prev ? `${prev}\n${noteText}` : noteText));
  };

  const handleSelectMetode = (met: SmartMetodeSaran) => {
    setModelPembelajaran(met.modelTerkait);
    const noteText = `Metode Terpilih: ${met.namaMetode} (${met.kategori}). Sintaks: ${met.sintaksLangkah.slice(0, 3).join(' -> ')}`;
    setCatatanTambahan((prev) => (prev ? `${prev}\n${noteText}` : noteText));
  };

  const handleSelectAktivitas = (act: SmartAktivitasSaran) => {
    if (selectedAktivitasIds.includes(act.id)) {
      setSelectedAktivitasIds(selectedAktivitasIds.filter((id) => id !== act.id));
    } else {
      setSelectedAktivitasIds([...selectedAktivitasIds, act.id]);
      const noteText = `Aktivitas Siswa: "${act.judulAktivitas}" (Output: ${act.outputSiswa}, Peran Siswa: ${act.peranSiswa})`;
      setCatatanTambahan((prev) => (prev ? `${prev}\n${noteText}` : noteText));
    }
  };

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  if (!isOpen) return null;

  const loadingStepsText = [
    'Menghubungkan ke Gemini AI Engine...',
    'Menganalisis Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP)...',
    'Merumuskan Tujuan Pembelajaran kaidah ABCD yang terukur...',
    'Menyusun Sintaks Kegiatan Pembelajaran & Strategi Berdiferensiasi...',
    'Menyusun Asesmen Diagnostik, Formatif, dan Sumatif HOTS...',
    'Menyusun Lembar Kerja Peserta Didik (LKPD) & Rubrik KKTP...',
    'Menyelesaikan dokumen RPP lengkap siap ajar & supervisi...',
  ];

  const handleApplyPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setJenjang(preset.jenjang);
    setKelas(preset.kelas);
    setMataPelajaran(preset.mapel);
    setProgramKeahlian(preset.program);
    setTopikMateri(preset.topik);
    setModelPembelajaran(preset.model);
    setKurikulum(preset.kurikulum);
  };

  const togglePancasila = (dimensi: string) => {
    if (selectedPancasila.includes(dimensi)) {
      setSelectedPancasila(selectedPancasila.filter((p) => p !== dimensi));
    } else {
      setSelectedPancasila([...selectedPancasila, dimensi]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topikMateri.trim()) {
      setErrorMsg('Mohon masukkan topik atau materi pokok pembelajaran.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(0);

    // Simulate progressive step messages for reassuring feedback
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingStepsText.length - 1 ? prev + 1 : prev));
    }, 3500);

    try {
      const payload: RPPGenerateRequest = {
        jenjang,
        kelas,
        mataPelajaran,
        topikMateri,
        kurikulum,
        modelPembelajaran,
        alokasiWaktu,
        jumlahPertemuan,
        namaSekolah,
        namaGuru,
        nipGuru,
        namaKepalaSekolah,
        nipKepalaSekolah,
        programKeahlian: jenjang === 'SMK' ? programKeahlian : undefined,
        profilPancasilaPilihan: selectedPancasila,
        catatanTambahan,
      };

      const response = await fetch('/api/rpp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let resJson: any = null;
      try {
        resJson = await response.json();
      } catch (jsonErr) {
        const textFallback = await response.text().catch(() => '');
        throw new Error(textFallback || 'Server mengembalikan respon yang tidak dapat dibaca.');
      }
      clearInterval(interval);

      if (!response.ok || !resJson?.success) {
        throw new Error(resJson?.error || 'Gagal menyusun RPP. Silakan coba lagi.');
      }

      onSuccess(resJson.data);
      onClose();
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      const rawError = String(err?.message || '');
      if (rawError.includes('503') || rawError.includes('high demand') || rawError.includes('UNAVAILABLE')) {
        setErrorMsg('Layanan AI Google saat ini sedang mengalami lonjakan antrean trafik tinggi. Silakan klik tombol "Susun RPP Lengkap Sekarang" kembali — sistem akan otomatis mengalihkan ke server siaga.');
      } else {
        setErrorMsg(rawError || 'Terjadi kendala saat menghubungi server AI. Silakan coba sesaat lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Susun RPP & Modul Ajar Lengkap (AI)</h2>
              <p className="text-xs text-slate-300">
                Otomatis menghasilkan Capaian Pembelajaran, Sintaks Sintetik, Asesmen HOTS, Rubrik, & LKPD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Quick Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Inspirasi Cepat / Template Siap Pakai:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 transition-all text-left"
                >
                  ⚡ {preset.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="rpp-form" onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: JENJANG & FORMAT KURIKULUM */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                1. Jenjang Pendidikan & Format Kurikulum
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jenjang */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Jenjang Sekolah</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['SD', 'SMP', 'SMA', 'SMK'] as JenjangPendidikan[]).map((j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setJenjang(j);
                          if (j === 'SD') setKelas('IV');
                          else if (j === 'SMP') setKelas('VIII');
                          else if (j === 'SMA' || j === 'SMK') setKelas('XI');
                          if (j === 'SMK') setKurikulum('merdeka_smk');
                        }}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          jenjang === j
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format Kurikulum */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Format Dokumen Kurikulum</label>
                  <select
                    value={kurikulum}
                    onChange={(e) => setKurikulum(e.target.value as KurikulumType)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="merdeka_smk">Modul Ajar Kurikulum Merdeka (SMK / Kejuruan)</option>
                    <option value="merdeka_lengkap">Modul Ajar Kurikulum Merdeka Lengkap (Umum)</option>
                    <option value="rpp_berdiferensiasi">RPP Pembelajaran Berdiferensiasi (Konten, Proses, Produk)</option>
                    <option value="rpp_1_lembar">RPP 1 Lembar Ringkas (SE Mendikbud No. 14/2019)</option>
                    <option value="k13_revisi">RPP Kurikulum 2013 (Revisi)</option>
                  </select>
                </div>
              </div>

              {/* Kelas & Alokasi Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kelas / Tingkat</label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: XI (Sebelas)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Alokasi Waktu Total</label>
                  <input
                    type="text"
                    value={alokasiWaktu}
                    onChange={(e) => setAlokasiWaktu(e.target.value)}
                    placeholder="Contoh: 4 x 45 Menit"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jumlah Pertemuan</label>
                  <select
                    value={jumlahPertemuan}
                    onChange={(e) => setJumlahPertemuan(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={1}>1 Pertemuan (Tatatap Muka)</option>
                    <option value={2}>2 Pertemuan (Bertahap)</option>
                    <option value={3}>3 Pertemuan (Siklus PjBL)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: MATA PELAJARAN & MATERI POKOK */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                2. Rincian Mata Pelajaran & Materi Pokok
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                    placeholder="Contoh: Informatika / Kejuruan PPLG"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                {jenjang === 'SMK' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Program / Konsentrasi Keahlian (SMK)
                    </label>
                    <input
                      type="text"
                      value={programKeahlian}
                      onChange={(e) => setProgramKeahlian(e.target.value)}
                      placeholder="Contoh: Rekayasa Perangkat Lunak / Otomotif"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Topik / Materi Pokok Pembelajaran <span className="text-emerald-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={topikMateri}
                  onChange={(e) => setTopikMateri(e.target.value)}
                  placeholder="Contoh: Desain Antarmuka Pengguna (UI/UX) dan Pembuatan Prototipe Interaktif Menggunakan Figma"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* SISTEM SARAN CERDAS PEDAGOGIS (MATERI, METODE, DAN IDE AKTIVITAS SISWA) */}
              <div className="rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white p-3.5 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Sistem Saran Cerdas AI: Materi, Metode, & Aktivitas Siswa
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                          Rekomendasi
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Dapatkan rekomendasi metode pengajaran (diskusi, simulasi, PjBL), ide aktivitas siswa, dan materi esensial sesuai topik Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={fetchSmartSuggestions}
                      disabled={isSuggestLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all disabled:opacity-50"
                    >
                      {isSuggestLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                          <span>{suggestions ? 'Perbarui Saran' : 'Dapatkan Saran Cerdas'}</span>
                        </>
                      )}
                    </button>

                    {suggestions && (
                      <button
                        type="button"
                        onClick={() => setIsSuggestOpen(!isSuggestOpen)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title={isSuggestOpen ? 'Sembunyikan Panel Saran' : 'Buka Panel Saran'}
                      >
                        {isSuggestOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {suggestError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {suggestError}
                  </div>
                )}

                {isSuggestOpen && (
                  <SmartSuggestionsPanel
                    suggestions={suggestions}
                    isLoading={isSuggestLoading}
                    onRefresh={fetchSmartSuggestions}
                    onSelectMateri={handleSelectMateri}
                    onSelectMetode={handleSelectMetode}
                    onSelectAktivitas={handleSelectAktivitas}
                    selectedMetodeName={modelPembelajaran}
                    selectedAktivitasIds={selectedAktivitasIds}
                  />
                )}
              </div>


              {/* Model Pembelajaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Model Pembelajaran</label>
                  <select
                    value={modelPembelajaran}
                    onChange={(e) => setModelPembelajaran(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                    <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                    <option value="Teaching Factory (TeFa)">Teaching Factory (TeFa) - Khusus SMK/Industri</option>
                    <option value="Discovery Learning">Discovery Learning</option>
                    <option value="Inquiry Learning (Terbimbing)">Inquiry Learning (Terbimbing)</option>
                    <option value="Cooperative Learning (STAD/Jigsaw)">Cooperative Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Catatan Kebutuhan Khusus / Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={catatanTambahan}
                    onChange={(e) => setCatatanTambahan(e.target.value)}
                    placeholder="Misal: Perbanyak praktikum lab, terapkan K3, atau sertakan lembar jobsheet"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Profil Pelajar Pancasila */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Dimensi Profil Pelajar Pancasila yang Dikembangkan:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROFIL_PANCASILA_OPTIONS.map((dimensi) => {
                    const isSelected = selectedPancasila.includes(dimensi);
                    return (
                      <button
                        key={dimensi}
                        type="button"
                        onClick={() => togglePancasila(dimensi)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-emerald-700" />}
                        {dimensi}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: ADMINISTRASI & PENGESAHAN */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                3. Identitas Satuan Pendidikan & Lembar Pengesahan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nama Satuan Pendidikan</label>
                  <input
                    type="text"
                    value={namaSekolah}
                    onChange={(e) => setNamaSekolah(e.target.value)}
                    placeholder="SMK Negeri 1"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nama Guru Mata Pelajaran</label>
                  <input
                    type="text"
                    value={namaGuru}
                    onChange={(e) => setNamaGuru(e.target.value)}
                    placeholder="Christian Toding, S.Pd., Gr."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">NIP / NUPTK Guru</label>
                  <input
                    type="text"
                    value={nipGuru}
                    onChange={(e) => setNipGuru(e.target.value)}
                    placeholder="19880512 201503 1 002"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={namaKepalaSekolah}
                    onChange={(e) => setNamaKepalaSekolah(e.target.value)}
                    placeholder="Drs. H. Muhammad Arifin, M.Pd."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={nipKepalaSekolah}
                    onChange={(e) => setNipKepalaSekolah(e.target.value)}
                    placeholder="19680315 199303 1 008"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isLoading ? (
              <span className="flex items-center gap-2 text-emerald-700 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {loadingStepsText[loadingStep]}
              </span>
            ) : (
              <span>Dokumen siap cetak dan dilengkapi rubrik penilaian & LKPD</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              form="rpp-form"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Menyusun RPP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Susun RPP Lengkap Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
