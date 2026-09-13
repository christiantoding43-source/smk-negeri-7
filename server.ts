import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy/safe initialization for GoogleGenAI
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint to generate full Indonesian RPP / Modul Ajar
app.post('/api/rpp/generate', async (req: Request, res: Response) => {
  try {
    const {
      jenjang = 'SMK',
      kelas = 'XI',
      mataPelajaran = 'Informatika',
      topikMateri = 'Pemrograman Web',
      kurikulum = 'merdeka_smk',
      modelPembelajaran = 'Project Based Learning (PjBL)',
      alokasiWaktu = '4 x 45 Menit (1 Pertemuan)',
      jumlahPertemuan = 1,
      namaSekolah = 'SMK Negeri 1',
      namaGuru = 'Guru Pengampu',
      nipGuru = '-',
      namaKepalaSekolah = 'Kepala Sekolah',
      nipKepalaSekolah = '-',
      kotaTanggal = '',
      programKeahlian = '',
      profilPancasilaPilihan = ['Bernalar Kritis', 'Kreatif', 'Gotong Royong', 'Mandiri'],
      catatanTambahan = '',
    } = req.body;

    const ai = getGeminiClient();

    // Select suitable Fase based on Jenjang/Kelas
    let suggestedFase = 'Fase E (Kls 10)';
    if (jenjang === 'SD') {
      suggestedFase = kelas.includes('1') || kelas.includes('2') ? 'Fase A (Kls 1-2)' : kelas.includes('3') || kelas.includes('4') ? 'Fase B (Kls 3-4)' : 'Fase C (Kls 5-6)';
    } else if (jenjang === 'SMP') {
      suggestedFase = 'Fase D (Kls 7-9)';
    } else if (jenjang === 'SMA' || jenjang === 'SMK') {
      suggestedFase = kelas.includes('X') || kelas.includes('10') ? 'Fase E (Kls 10)' : 'Fase F (Kls 11-12)';
    }

    const systemPrompt = `Anda adalah Pakar Pengembang Kurikulum Nasional Indonesia, Instruktur Guru Penggerak, dan Konsultan Pembelajaran Kemendikbudristek (Kurikulum Merdeka dan Kurikulum 2013).
Tugas Anda adalah menyusun dokumen Rencana Pelaksanaan Pembelajaran (RPP) atau Modul Ajar yang SANGAT LENGKAP, OTENTIK, DAN LANGSUNG SIAP DIPAKAI MENGAJAR serta siap lolos supervisi pengawas sekolah.

Karakteristik Dokumen:
1. Sesuai regulasi Kepmendikbudristek No. 262/M/2022 & Panduan Pembelajaran dan Asesmen (PPA) terbaru.
2. Memuat tujuan pembelajaran ABCD (Audience, Behavior, Condition, Degree) yang terukur.
3. Sintaks langkah pembelajaran runut sesuai sintaks resmi dari model pembelajaran yang dipilih (contoh: PjBL memiliki 6 fase, PBL memiliki 5 fase, Discovery Learning memiliki 6 fase, TeFa SMK memiliki fase orientasi industri/order - desain - pengerjaan - quality control - penyerahan).
4. Dilengkapi diferensiasi konten, proses, dan produk.
5. Asesmen komprehensif: Diagnostik, Formatif (LKPD/Kinerja), dan Sumatif HOTS dengan kisi-kisi dan rubrik 4 tingkatan skor.
6. Lampiran nyata: LKPD dengan instruksi kerja jelas, ringkasan materi ajar, remedial/pengayaan, glosarium, dan daftar pustaka resmi.

PENTING: Berikan output dalam format JSON valid sesuai skema yang diminta. Jangan sertakan teks pengantar di luar JSON.`;

    const userPrompt = `Buatkan RPP / Modul Ajar lengkap dengan data:
- Kurikulum: ${kurikulum}
- Jenjang: ${jenjang}
- Fase: ${suggestedFase}
- Kelas/Semester: Kelas ${kelas} / Semester Ganjil
- Mata Pelajaran: ${mataPelajaran}
${programKeahlian ? `- Program/Konsentrasi Keahlian: ${programKeahlian}` : ''}
- Topik / Materi Pokok: ${topikMateri}
- Model Pembelajaran: ${modelPembelajaran}
- Alokasi Waktu: ${alokasiWaktu} (${jumlahPertemuan} Pertemuan)
- Dimensi Profil Pelajar Pancasila: ${profilPancasilaPilihan.join(', ')}
- Identitas Satuan Pendidikan: ${namaSekolah}, Guru: ${namaGuru}, NIP: ${nipGuru}
${catatanTambahan ? `- Catatan Khusus/Kebutuhan Guru: ${catatanTambahan}` : ''}

Pastikan isi setiap bagian sangat mendalam, detail, dan realistis untuk guru di Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul: { type: Type.STRING },
            capaianPembelajaran: { type: Type.STRING },
            alurTujuanPembelajaran: { type: Type.STRING },
            tujuanPembelajaran: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pemahamanBermakna: { type: Type.STRING },
            pertanyaanPemantik: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            profilPelajarPancasila: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            saranaPrasarana: {
              type: Type.OBJECT,
              properties: {
                media: { type: Type.ARRAY, items: { type: Type.STRING } },
                alat: { type: Type.ARRAY, items: { type: Type.STRING } },
                sumberBelajar: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['media', 'alat', 'sumberBelajar'],
            },
            targetPesertaDidik: { type: Type.STRING },
            diferensiasiKonten: { type: Type.STRING },
            diferensiasiProses: { type: Type.STRING },
            diferensiasiProduk: { type: Type.STRING },
            skenarioPertemuan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pertemuanKe: { type: Type.INTEGER },
                  fokusMateri: { type: Type.STRING },
                  alokasiMenit: { type: Type.INTEGER },
                  kegiatanPendahuluan: {
                    type: Type.OBJECT,
                    properties: {
                      durasiMenit: { type: Type.INTEGER },
                      poinKegiatan: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['durasiMenit', 'poinKegiatan'],
                  },
                  kegiatanInti: {
                    type: Type.OBJECT,
                    properties: {
                      durasiMenit: { type: Type.INTEGER },
                      sintaksModel: { type: Type.STRING },
                      langkahSintaks: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            fase: { type: Type.STRING },
                            kegiatanGuru: { type: Type.STRING },
                            kegiatanSiswa: { type: Type.STRING },
                            catatanKarakter: { type: Type.STRING },
                          },
                          required: ['fase', 'kegiatanGuru', 'kegiatanSiswa', 'catatanKarakter'],
                        },
                      },
                    },
                    required: ['durasiMenit', 'sintaksModel', 'langkahSintaks'],
                  },
                  kegiatanPenutup: {
                    type: Type.OBJECT,
                    properties: {
                      durasiMenit: { type: Type.INTEGER },
                      poinKegiatan: { type: Type.ARRAY, items: { type: Type.STRING } },
                      refleksiSiswa: { type: Type.ARRAY, items: { type: Type.STRING } },
                      refleksiGuru: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['durasiMenit', 'poinKegiatan', 'refleksiSiswa', 'refleksiGuru'],
                  },
                },
                required: ['pertemuanKe', 'fokusMateri', 'alokasiMenit', 'kegiatanPendahuluan', 'kegiatanInti', 'kegiatanPenutup'],
              },
            },
            asesmenDiagnostik: {
              type: Type.OBJECT,
              properties: {
                kognitif: { type: Type.ARRAY, items: { type: Type.STRING } },
                nonKognitif: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['kognitif', 'nonKognitif'],
            },
            asesmenFormatif: {
              type: Type.OBJECT,
              properties: {
                teknik: { type: Type.STRING },
                keterangan: { type: Type.STRING },
              },
              required: ['teknik', 'keterangan'],
            },
            asesmenSumatif: {
              type: Type.OBJECT,
              properties: {
                teknik: { type: Type.STRING },
                kisiKisiDanSoal: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      nomor: { type: Type.INTEGER },
                      indikator: { type: Type.STRING },
                      levelKognitif: { type: Type.STRING },
                      butirPertanyaan: { type: Type.STRING },
                      kunciAtauRubrik: { type: Type.STRING },
                    },
                    required: ['nomor', 'indikator', 'levelKognitif', 'butirPertanyaan', 'kunciAtauRubrik'],
                  },
                },
              },
              required: ['teknik', 'kisiKisiDanSoal'],
            },
            rubrikPenilaian: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  aspek: { type: Type.STRING },
                  skor1PerluBimbingan: { type: Type.STRING },
                  skor2Cukup: { type: Type.STRING },
                  skor3Baik: { type: Type.STRING },
                  skor4SangatBaik: { type: Type.STRING },
                },
                required: ['aspek', 'skor1PerluBimbingan', 'skor2Cukup', 'skor3Baik', 'skor4SangatBaik'],
              },
            },
            lkpd: {
              type: Type.OBJECT,
              properties: {
                judul: { type: Type.STRING },
                tujuanAktivitas: { type: Type.STRING },
                alatBahan: { type: Type.ARRAY, items: { type: Type.STRING } },
                langkahKerja: { type: Type.ARRAY, items: { type: Type.STRING } },
                tugasPertanyaan: { type: Type.ARRAY, items: { type: Type.STRING } },
                panduanPenilaian: { type: Type.STRING },
              },
              required: ['judul', 'tujuanAktivitas', 'alatBahan', 'langkahKerja', 'tugasPertanyaan', 'panduanPenilaian'],
            },
            bahanAjarRingkas: { type: Type.STRING },
            programRemedial: { type: Type.STRING },
            programPengayaan: { type: Type.STRING },
            glosarium: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  istilah: { type: Type.STRING },
                  definisi: { type: Type.STRING },
                },
                required: ['istilah', 'definisi'],
              },
            },
            daftarPustaka: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'judul',
            'capaianPembelajaran',
            'alurTujuanPembelajaran',
            'tujuanPembelajaran',
            'pemahamanBermakna',
            'pertanyaanPemantik',
            'profilPelajarPancasila',
            'saranaPrasarana',
            'targetPesertaDidik',
            'diferensiasiKonten',
            'diferensiasiProses',
            'diferensiasiProduk',
            'skenarioPertemuan',
            'asesmenDiagnostik',
            'asesmenFormatif',
            'asesmenSumatif',
            'rubrikPenilaian',
            'lkpd',
            'bahanAjarRingkas',
            'programRemedial',
            'programPengayaan',
            'glosarium',
            'daftarPustaka',
          ],
        },
      },
    });

    const rawText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawText);

    // Merge with metadata provided by user
    const dateFormatted = kotaTanggal || `${namaSekolah.includes('Negeri') ? 'Jakarta' : 'Kota Setempat'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    const completeRPP = {
      id: `rpp-${Date.now()}`,
      ...parsedData,
      kurikulum,
      jenjang,
      fase: suggestedFase,
      kelas,
      semester: 'Ganjil',
      tahunPelajaran: '2024/2025',
      mataPelajaran,
      programKeahlian,
      namaSekolah,
      namaGuru,
      nipGuru,
      namaKepalaSekolah,
      nipKepalaSekolah,
      kotaTanggal: dateFormatted,
      alokasiWaktu,
      jumlahPertemuan,
      topikMateri,
      modelPembelajaran,
      metodePembelajaran: [
        'Diskusi Kelompok Kolaboratif',
        'Praktik Unjuk Kerja / Proyek',
        'Tanya Jawab Interaktif',
        'Presentasi Hasil Belajar',
      ],
      pendekatan: 'Saintifik & Pembelajaran Berdiferensiasi (TaRL)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: completeRPP });
  } catch (err: any) {
    console.error('Error generating RPP:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Terjadi kendala saat menyusun RPP dengan AI.',
    });
  }
});

// Endpoint to refine a specific section of an RPP
app.post('/api/rpp/refine-section', async (req: Request, res: Response) => {
  try {
    const { sectionName, currentContent, instruction, rppContext } = req.body;
    const ai = getGeminiClient();

    const prompt = `Anda adalah ahli kurikulum dan pedagogi Indonesia.
Lakukan perbaikan/pengembangan pada bagian '${sectionName}' dari Modul Ajar/RPP berikut sesuai instruksi guru.

Konteks Pembelajaran:
- Mata Pelajaran: ${rppContext?.mataPelajaran || '-'}
- Kelas / Jenjang: ${rppContext?.kelas || '-'} (${rppContext?.jenjang || '-'})
- Topik: ${rppContext?.topikMateri || '-'}
- Model Pembelajaran: ${rppContext?.modelPembelajaran || '-'}

Konten Saat Ini:
${typeof currentContent === 'string' ? currentContent : JSON.stringify(currentContent, null, 2)}

Instruksi Perbaikan Guru:
${instruction}

Berikan respon hasil perbaikan yang mendalam, profesional, dan relevan. Jika konten sebelumnya berupa list teks atau paragraf, berikan teks pengganti yang rapi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, refinedContent: response.text?.trim() });
  } catch (err: any) {
    console.error('Error refining RPP section:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Gagal memperbarui bagian RPP.',
    });
  }
});

// Endpoint: Smart Suggestion System (Saran Cerdas: Materi, Metode, dan Ide Aktivitas Siswa)
app.post('/api/rpp/suggest', async (req: Request, res: Response) => {
  try {
    const {
      mataPelajaran = 'Informatika',
      topikMateri = 'Pemrograman Web',
      jenjang = 'SMK',
      kelas = 'XI',
      kurikulum = 'merdeka_smk',
      programKeahlian = '',
    } = req.body;

    if (!topikMateri || !topikMateri.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Mata pelajaran dan topik materi wajib diisi untuk mendapatkan saran cerdas.',
      });
    }

    try {
      const ai = getGeminiClient();

      const systemPrompt = `Anda adalah Pakar Desain Instruksional & Kurikulum Indonesia (Kurikulum Merdeka & K13).
Tugas Anda adalah memberikan saran cerdas komprehensif bagi guru yang mencakup:
1. Materi Ajar: Sub-topik esensial, cakupan konsep mendalam, dan poin-poin materi praktis.
2. Metode Pengajaran: Rekomendasi metode yang variatif dan pedagogis (misalnya: Diskusi Kolaboratif/Debat, Simulasi Praktik/Laboratorium, Project-Based Learning (PjBL), Problem-Based Learning (PBL), Discovery/Inquiry, Teaching Factory), disertai alasan kuat dan sintaks inti.
3. Ide Aktivitas Siswa: Aktivitas interaktif, berpusat pada siswa (student-centered), menantang nalar kritis & kreativitas (Profil Pelajar Pancasila), dengan estimasi durasi, peran siswa, peran fasilitasi guru, dan hasil karya/output yang terukur.
4. Pertanyaan Pemantik kontekstual pemantik rasa ingin tahu siswa.
5. Rekomendasi Media & Alat Ajar modern.

Berikan output dalam JSON terstruktur sesuai skema. Pastikan konten berbahasa Indonesia yang formal, inspiratif, dan aplikatif di kelas.`;

      const userPrompt = `Berikan saran materi ajar, metode pengajaran (seperti diskusi, simulasi, PjBL, dsb), serta ide aktivitas siswa untuk:
- Mata Pelajaran: ${mataPelajaran}
- Topik / Materi Pokok: ${topikMateri}
- Jenjang: ${jenjang} (Kelas ${kelas})
- Kurikulum: ${kurikulum}
${programKeahlian ? `- Program / Bidang Keahlian: ${programKeahlian}` : ''}

Pastikan menyertakan minimal 3 variasi materi ajar mendalam, minimal 3 alternatif metode pengajaran (termasuk diskusi, simulasi, project-based learning), dan minimal 4 ide aktivitas siswa yang menarik dan aktif.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ringkasanPedagogis: { type: Type.STRING },
              rekomendasiMateri: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    judulMateri: { type: Type.STRING },
                    deskripsi: { type: Type.STRING },
                    subTopik: { type: Type.ARRAY, items: { type: Type.STRING } },
                    poinKunci: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['judulMateri', 'deskripsi', 'subTopik', 'poinKunci'],
                },
              },
              rekomendasiMetode: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    namaMetode: { type: Type.STRING },
                    modelTerkait: { type: Type.STRING },
                    kategori: { type: Type.STRING },
                    deskripsi: { type: Type.STRING },
                    alasanKesesuaian: { type: Type.STRING },
                    sintaksLangkah: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['namaMetode', 'modelTerkait', 'kategori', 'deskripsi', 'alasanKesesuaian', 'sintaksLangkah'],
                },
              },
              rekomendasiAktivitas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    judulAktivitas: { type: Type.STRING },
                    kategori: { type: Type.STRING },
                    deskripsiKegiatan: { type: Type.STRING },
                    peranSiswa: { type: Type.STRING },
                    peranGuru: { type: Type.STRING },
                    estimasiMenit: { type: Type.INTEGER },
                    outputSiswa: { type: Type.STRING },
                  },
                  required: ['id', 'judulAktivitas', 'kategori', 'deskripsiKegiatan', 'peranSiswa', 'peranGuru', 'estimasiMenit', 'outputSiswa'],
                },
              },
              pertanyaanPemantik: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              ideMediaAjar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'ringkasanPedagogis',
              'rekomendasiMateri',
              'rekomendasiMetode',
              'rekomendasiAktivitas',
              'pertanyaanPemantik',
              'ideMediaAjar',
            ],
          },
        },
      });

      const raw = response.text?.trim() || '{}';
      const parsed = JSON.parse(raw);

      return res.json({
        success: true,
        data: {
          topik: topikMateri,
          mataPelajaran,
          jenjang,
          ...parsed,
        },
      });
    } catch (aiErr: any) {
      console.warn('Gemini API call failed, generating fallback pedagogy suggestions:', aiErr.message);

      // Fallback robust pedagogical response for offline/keyless preview
      const fallbackSuggestions = generateFallbackSuggestions(mataPelajaran, topikMateri, jenjang, kelas);
      return res.json({
        success: true,
        data: fallbackSuggestions,
        isFallback: true,
      });
    }
  } catch (err: any) {
    console.error('Error generating smart suggestions:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Gagal memproses saran cerdas.',
    });
  }
});

// Helper for fallback pedagogical suggestions
function generateFallbackSuggestions(mapel: string, topik: string, jenjang: string, kelas: string) {
  return {
    topik,
    mataPelajaran: mapel,
    jenjang,
    ringkasanPedagogis: `Pendekatan berbasis kompetensi untuk ${mapel} pada topik "${topik}" menekankan pembelajaran bermakna (meaningful learning), kontekstual, dan penguatan Profil Pelajar Pancasila nalar kritis serta kolaborasi aktif.`,
    rekomendasiMateri: [
      {
        judulMateri: `Konsep Fundamental & Teori Dasar: ${topik}`,
        deskripsi: `Mempelajari definisi, prinsip kerja, dan landasan teoretis topik secara terstruktur.`,
        subTopik: [
          `Pengantar dan ruang lingkup ${topik}`,
          `Karakteristik dan komponen utama`,
          `Standar dan aturan yang berlaku dalam bidang ${mapel}`,
        ],
        poinKunci: [
          `Memahami istilah kunci dan konseptual`,
          `Mengenali relasi sebab-akibat fenomena atau sistem`,
          `Mampu membedakan prosedur benar dan keliru`,
        ],
      },
      {
        judulMateri: `Aplikasi Praktis & Implementasi Terapan`,
        deskripsi: `Menghubungkan teori ke dalam contoh kasus nyata di industri, kehidupan sehari-hari, atau laboratorium.`,
        subTopik: [
          `Langkah kerja operasional dan simulasi kasus`,
          `Analisis studi kasus empiris di lingkungan siswa`,
          `Troubleshooting atau pemecahan masalah lazim`,
        ],
        poinKunci: [
          `Keterampilan prosedural yang sistematis`,
          `Kepatuhan terhadap standar keselamatan / best practices`,
          `Efisiensi dan efektivitas hasil kerja`,
        ],
      },
      {
        judulMateri: `Pengembangan Kreatif, Evaluasi, & Refleksi Kritis`,
        deskripsi: `Mendorong eksplorasi solusi alternatif, penilaian kualitas hasil kerja, dan inovasi karya.`,
        subTopik: [
          `Optimasi dan inovasi solusi`,
          `Refleksi dampak sosial, etika, dan keberlanjutan`,
          `Penyusunan laporan dan dokumentasi portofolio`,
        ],
        poinKunci: [
          `Kemampuan berpikir kritis tingkat tinggi (HOTS)`,
          `Kemandirian dalam mengambil keputusan`,
          `Komunikasi hasil temuan secara ilmiah`,
        ],
      },
    ],
    rekomendasiMetode: [
      {
        namaMetode: 'Project-Based Learning (PjBL) Terpadu',
        modelTerkait: 'Project Based Learning (PjBL)',
        kategori: 'Project-Based Learning',
        deskripsi: 'Peserta didik bekerja dalam tim kecil untuk menghasilkan produk/karya nyata bernilai guna yang menjawab permasalahan nyata terkait topik.',
        alasanKesesuaian: `Sangat tepat untuk topik "${topik}" karena mendorong keterlibatan langsung peserta didik dalam menghasilkan artefak atau solusi terukur.`,
        sintaksLangkah: [
          'Penentuan Pertanyaan Mendasar (Start with essential question)',
          'Mendesain Perencanaan Proyek & Alur Kerja',
          'Menyusun Jadwal Pembuatan (Timeline & Milestone)',
          'Memonitor Keaktifan dan Perkembangan Proyek',
          'Menguji Hasil dan Melakukan Quality Check',
          'Mengevaluasi Pengalaman Belajar (Reflection)',
        ],
      },
      {
        namaMetode: 'Simulasi Praktik & Eksperimen Terbimbing',
        modelTerkait: 'Discovery Learning',
        kategori: 'Simulasi & Praktik',
        deskripsi: 'Peserta didik melakukan simulasi interaktif, uji coba langsung, atau eksperimen laboratorium untuk membuktikan hipotesis dan memahami cara kerja sistem.',
        alasanKesesuaian: `Memberikan pengalaman konkrit (hands-on experience) bagi siswa pada konsep "${topik}" sehingga materi tidak bersifat abstrak.`,
        sintaksLangkah: [
          'Orientasi Masalah & Demonstrasi Singkat oleh Guru',
          'Pemberian Lembar Kerja Prosedur Simulasi/Eksperimen',
          'Pelaksanaan Simulasi Mandiri/Kelompok',
          'Pencatatan Data & Verifikasi Hasil Percobaan',
          'Generalisasi Konsep & Penarikan Kesimpulan Bersama',
        ],
      },
      {
        namaMetode: 'Diskusi Kolaboratif & Debat Kasus Kontekstual',
        modelTerkait: 'Problem Based Learning (PBL)',
        kategori: 'Diskusi & Kolaborasi',
        deskripsi: 'Peserta didik berdiskusi intensif menganalisis skenario studi kasus nyata, saling bertukar argumen ilmiah, dan merumuskan konsensus pemecahan masalah.',
        alasanKesesuaian: `Membangun kemampuan bernalar kritis, komunikasi asertif, dan keterbukaan terhadap berbagai perspektif dalam membedah isu terkait ${topik}.`,
        sintaksLangkah: [
          'Pemaparan Kasus Nyata / Dilema Kontekstual',
          'Pembagian Kelompok dan Penugasan Sudut Pandang',
          'Diskusi Meja Bundar / Socratic Dialogue',
          'Silang Pendapat & Uji Argumen Antar-Kelompok',
          'Sintesis Solusi Terbaik dan Umpan Balik Guru',
        ],
      },
    ],
    rekomendasiAktivitas: [
      {
        id: 'act-1',
        judulAktivitas: `Proyek Mini Pembuatan Karya: Prototipe / Solusi ${topik}`,
        kategori: 'proyek',
        deskripsiKegiatan: `Siswa berkelompok merancang, mengeksekusi, dan mendokumentasikan sebuah karya nyata atau prototipe fungsional yang merefleksikan penguasaan materi.`,
        peranSiswa: `Bekerja kolaboratif merencanakan tugas, membagi peran, merakit karya, dan menguji fungsi produk.`,
        peranGuru: `Sebagai fasilitator, memantau kemajuan tiap kelompok, dan memberikan scaffolding saat siswa menghadapi kendala teknis.`,
        estimasiMenit: 80,
        outputSiswa: `Produk/prototipe nyata, lembar jobsheet terisi, dan video demo singkat 1 menit.`,
      },
      {
        id: 'act-2',
        judulAktivitas: `Simulasi Laboratorium & Uji Coba Parameter Kritis`,
        kategori: 'simulasi',
        deskripsiKegiatan: `Siswa memanipulasi variabel dalam simulasi digital atau alat praktik nyata untuk melihat dampak perubahan parameter terhadap hasil sistem.`,
        peranSiswa: `Mengikuti panduan LKPD, mencatat perubahan data log, dan menyimpulkan aturan kerja dari hasil simulasi.`,
        peranGuru: `Memberikan pengantar pengoperasian alat/software, memverifikasi kepatuhan K3/prosedur, dan memandu diskusi pemaknaan data.`,
        estimasiMenit: 45,
        outputSiswa: `Tabel perbandingan data hasil uji coba dan analisis grafik/kesimpulan.`,
      },
      {
        id: 'act-3',
        judulAktivitas: `Diskusi Analisis Kasus "Troubleshooting & Analisa Masalah"`,
        kategori: 'diskusi',
        deskripsiKegiatan: `Diberikan skenario kasus kegagalan sistem/kesalahan umum dalam materi ${topik}, siswa mendiagnosis akar penyebab dan menawarkan 3 opsi solusi bertingkat.`,
        peranSiswa: `Melakukan brainstorming dengan teknik diagram sebab-akibat (Fishbone), beradu argumen, dan menyepakati solusi prioritas.`,
        peranGuru: `Menyajikan studi kasus menantang, menjadi moderator diskusi, dan meluruskan miskonsepsi.`,
        estimasiMenit: 35,
        outputSiswa: `Lembar analisis akar masalah dan rekomendasi tindakan perbaikan (Action Plan).`,
      },
      {
        id: 'act-4',
        judulAktivitas: `Gallery Walk & Presentasi Peer-Review Siswa`,
        kategori: 'presentasi',
        deskripsiKegiatan: `Tiap kelompok memamerkan hasil kerja di meja masing-masing; separuh anggota tinggal sebagai presenter dan separuh lainnya berkeliling memberikan umpan balik (feedback sticky note).`,
        peranSiswa: `Mempresentasikan ide dengan percaya diri, mendengarkan masukan teman, dan mencatat saran perbaikan.`,
        peranGuru: `Mengamati dinamika interaksi, menilai rubrik komunikasi siswa, dan memimpin refleksi kelas.`,
        estimasiMenit: 30,
        outputSiswa: `Catatan umpan balik konstruktif dan revisi akhir produk.`,
      },
    ],
    pertanyaanPemantik: [
      `Bagaimana konsep "${topik}" memengaruhi kehidupan kita sehari-hari atau industri modern tanpa kita sadari?`,
      `Apa konsekuensi terburuk jika suatu sistem atau prosedur dalam "${topik}" tidak dijalankan sesuai standar?`,
      `Jika Anda seorang ahli di bidang ini, inovasi apa yang paling mendesak untuk diciptakan dalam materi ini?`,
    ],
    ideMediaAjar: [
      `Slide presentasi interaktif dengan animasi diagram visual`,
      `Simulator digital (PhET / Tinkercad / Figma / Canva interaktif)`,
      `Lembar Kerja Peserta Didik (LKPD) berbasis studi kasus bergambar`,
      `Video eksplorasi industri nyata (durasi 3-5 menit)`,
    ],
  };
}


// Start server with Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RPP Generator Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
});
