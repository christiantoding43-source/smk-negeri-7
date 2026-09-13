import React, { useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2, Wand2, Check } from 'lucide-react';
import { RPPData } from '../types';

interface DocumentEditorProps {
  rpp: RPPData;
  onSave: (updatedRPP: RPPData) => void;
  onBackToView: () => void;
  onRefineSection: (sectionName: string, content: any) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  rpp,
  onSave,
  onBackToView,
  onRefineSection,
}) => {
  const [formData, setFormData] = useState<RPPData>({ ...rpp });
  const [activeTab, setActiveTab] = useState<'identitas' | 'tujuan' | 'skenario' | 'asesmen' | 'lampiran'>('identitas');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleFieldChange = (field: keyof RPPData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // Helper to add/remove objectives
  const handleAddTujuan = () => {
    setFormData((prev) => ({
      ...prev,
      tujuanPembelajaran: [...prev.tujuanPembelajaran, 'Melalui kegiatan diskusi dan penugasan, peserta didik mampu...'],
    }));
  };

  const handleRemoveTujuan = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tujuanPembelajaran: prev.tujuanPembelajaran.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateTujuan = (index: number, val: string) => {
    const updated = [...formData.tujuanPembelajaran];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, tujuanPembelajaran: updated }));
  };

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToView}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Tampilan Resmi</span>
          </button>
          <span className="text-sm font-bold text-slate-800">
            Mode Edit Interaktif
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showSavedToast && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Berhasil Disimpan!
            </span>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'identitas', label: '1. Identitas & Sekolah' },
          { id: 'tujuan', label: '2. Tujuan & Profil Pancasila' },
          { id: 'skenario', label: '3. Langkah Sintaks Pembelajaran' },
          { id: 'asesmen', label: '4. Asesmen & Rubrik' },
          { id: 'lampiran', label: '5. LKPD & Bahan Ajar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: IDENTITAS */}
      {activeTab === 'identitas' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Informasi Umum Dokumen</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Judul Dokumen RPP / Modul Ajar</label>
              <input
                type="text"
                value={formData.judul}
                onChange={(e) => handleFieldChange('judul', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Satuan Pendidikan / Sekolah</label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={(e) => handleFieldChange('namaSekolah', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={formData.mataPelajaran}
                onChange={(e) => handleFieldChange('mataPelajaran', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Kelas / Semester</label>
              <input
                type="text"
                value={formData.kelas}
                onChange={(e) => handleFieldChange('kelas', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Alokasi Waktu</label>
              <input
                type="text"
                value={formData.alokasiWaktu}
                onChange={(e) => handleFieldChange('alokasiWaktu', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Guru Mata Pelajaran</label>
              <input
                type="text"
                value={formData.namaGuru}
                onChange={(e) => handleFieldChange('namaGuru', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NIP / NUPTK Guru</label>
              <input
                type="text"
                value={formData.nipGuru}
                onChange={(e) => handleFieldChange('nipGuru', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={formData.namaKepalaSekolah}
                onChange={(e) => handleFieldChange('namaKepalaSekolah', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.nipKepalaSekolah}
                onChange={(e) => handleFieldChange('nipKepalaSekolah', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tempat & Tanggal Pengesahan</label>
            <input
              type="text"
              value={formData.kotaTanggal}
              onChange={(e) => handleFieldChange('kotaTanggal', e.target.value)}
              placeholder="Contoh: Makassar, 15 Juli 2024"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* TAB 2: TUJUAN & PROFIL PANCASILA */}
      {activeTab === 'tujuan' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900">Tujuan & Karakter Pelajar</h3>
            <button
              onClick={() => onRefineSection('Tujuan Pembelajaran', formData.tujuanPembelajaran)}
              className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Sempurnakan Tujuan
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Capaian Pembelajaran (CP):</label>
            <textarea
              rows={3}
              value={formData.capaianPembelajaran}
              onChange={(e) => handleFieldChange('capaianPembelajaran', e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">Tujuan Pembelajaran (Kaidah ABCD):</label>
              <button
                type="button"
                onClick={handleAddTujuan}
                className="text-xs text-emerald-600 font-semibold hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Butir Tujuan
              </button>
            </div>
            <div className="space-y-2">
              {formData.tujuanPembelajaran.map((tp, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-500 mt-2">{idx + 1}.</span>
                  <textarea
                    rows={2}
                    value={tp}
                    onChange={(e) => handleUpdateTujuan(idx, e.target.value)}
                    className="flex-1 p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTujuan(idx)}
                    className="text-slate-400 hover:text-red-600 p-1.5"
                    title="Hapus Tujuan Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pemahaman Bermakna:</label>
              <textarea
                rows={3}
                value={formData.pemahamanBermakna}
                onChange={(e) => handleFieldChange('pemahamanBermakna', e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Peserta Didik:</label>
              <textarea
                rows={3}
                value={formData.targetPesertaDidik}
                onChange={(e) => handleFieldChange('targetPesertaDidik', e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKENARIO SINTAKS PEMBELAJARAN */}
      {activeTab === 'skenario' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900">Skenario Sintaks Kegiatan Belajar</h3>
            <button
              onClick={() => onRefineSection('Skenario Pembelajaran', formData.skenarioPertemuan)}
              className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Sempurnakan Aktivitas
            </button>
          </div>

          <div className="space-y-6">
            {formData.skenarioPertemuan.map((pertemuan, pIdx) => (
              <div key={pIdx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between">
                  <span>Pertemuan Ke-{pertemuan.pertemuanKe}: {pertemuan.fokusMateri}</span>
                  <span className="text-xs text-slate-500">{pertemuan.alokasiMenit} Menit</span>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1 uppercase">
                    Aktivitas Sintaks Kegiatan Inti:
                  </label>
                  <div className="space-y-3">
                    {pertemuan.kegiatanInti.langkahSintaks.map((fase, fIdx) => (
                      <div key={fIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-emerald-800">{fase.fase}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-2xs text-slate-500 font-medium">Aktivitas Guru:</span>
                            <textarea
                              rows={2}
                              value={fase.kegiatanGuru}
                              onChange={(e) => {
                                const newSkenario = [...formData.skenarioPertemuan];
                                newSkenario[pIdx].kegiatanInti.langkahSintaks[fIdx].kegiatanGuru = e.target.value;
                                handleFieldChange('skenarioPertemuan', newSkenario);
                              }}
                              className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded"
                            />
                          </div>
                          <div>
                            <span className="text-2xs text-slate-500 font-medium">Aktivitas Siswa:</span>
                            <textarea
                              rows={2}
                              value={fase.kegiatanSiswa}
                              onChange={(e) => {
                                const newSkenario = [...formData.skenarioPertemuan];
                                newSkenario[pIdx].kegiatanInti.langkahSintaks[fIdx].kegiatanSiswa = e.target.value;
                                handleFieldChange('skenarioPertemuan', newSkenario);
                              }}
                              className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ASESMEN & RUBRIK */}
      {activeTab === 'asesmen' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900">Asesmen & Rubrik KKTP</h3>
            <button
              onClick={() => onRefineSection('Asesmen & Soal HOTS', formData.asesmenSumatif)}
              className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Kembangkan Soal HOTS
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Teknik Asesmen Formatif:</label>
            <input
              type="text"
              value={formData.asesmenFormatif.teknik}
              onChange={(e) =>
                handleFieldChange('asesmenFormatif', {
                  ...formData.asesmenFormatif,
                  teknik: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white mb-2"
            />
            <label className="block text-xs font-medium text-slate-700 mb-1">Keterangan Asesmen Formatif:</label>
            <textarea
              rows={2}
              value={formData.asesmenFormatif.keterangan}
              onChange={(e) =>
                handleFieldChange('asesmenFormatif', {
                  ...formData.asesmenFormatif,
                  keterangan: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Butir Pertanyaan Soal Sumatif:</label>
            <div className="space-y-3">
              {formData.asesmenSumatif.kisiKisiDanSoal.map((soal, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Soal No. {soal.nomor} ({soal.levelKognitif})</span>
                    <span className="text-xs text-slate-500">{soal.indikator}</span>
                  </div>
                  <textarea
                    rows={2}
                    value={soal.butirPertanyaan}
                    onChange={(e) => {
                      const updatedSoal = [...formData.asesmenSumatif.kisiKisiDanSoal];
                      updatedSoal[idx].butirPertanyaan = e.target.value;
                      handleFieldChange('asesmenSumatif', {
                        ...formData.asesmenSumatif,
                        kisiKisiDanSoal: updatedSoal,
                      });
                    }}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LAMPIRAN & LKPD */}
      {activeTab === 'lampiran' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900">Lampiran LKPD & Ringkasan Bahan Ajar</h3>
            <button
              onClick={() => onRefineSection('LKPD Praktik', formData.lkpd)}
              className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Sempurnakan LKPD
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Judul LKPD / Jobsheet:</label>
            <input
              type="text"
              value={formData.lkpd.judul}
              onChange={(e) =>
                handleFieldChange('lkpd', { ...formData.lkpd, judul: e.target.value })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tujuan Aktivitas LKPD:</label>
            <textarea
              rows={2}
              value={formData.lkpd.tujuanAktivitas}
              onChange={(e) =>
                handleFieldChange('lkpd', { ...formData.lkpd, tujuanAktivitas: e.target.value })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Bahan Ajar Ringkas:</label>
            <textarea
              rows={6}
              value={formData.bahanAjarRingkas}
              onChange={(e) => handleFieldChange('bahanAjarRingkas', e.target.value)}
              className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
