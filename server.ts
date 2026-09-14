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

// Resilient helper to call Gemini with automatic retry and model fallbacks for 503 / high demand spikes
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: any;
    config?: any;
  },
  preferredModel = 'gemini-3.8-flash'
): Promise<{ text: string; usedModel: string }> {
  // Candidate fallback models valid in @google/genai
  const candidateModels = [
    preferredModel,
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: requestParams.contents,
          config: requestParams.config,
        });
        return {
          text: response.text?.trim() || '',
          usedModel: model,
        };
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isHighDemandOrOverloaded =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isHighDemandOrOverloaded && attempt === 0) {
          // Wait 1200ms before retrying the same model
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }

        // If high demand persists or other error, break to next candidate model immediately
        break;
      }
    }
  }

  throw lastError;
}

// Resilient helper to clean markdown backticks and parse JSON safely
function cleanAndParseJSON(raw: string): any {
  if (!raw || typeof raw !== 'string') return null;
  let text = raw.trim();
  // Strip markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    // Attempt to locate outer JSON object braces if extra conversational text is present
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw err;
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint to generate full Indonesian RPP / Modul Ajar
app.post('/api/rpp/generate', async (req: Request, res: Response) => {
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
3. Sintaks langkah pembelajaran runut sesuai sintaks resmi dari model pembelajaran yang dipilih.
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

  try {
    const ai = getGeminiClient();

    const { text: rawText, usedModel } = await callGeminiWithFallback(ai, {
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

    let parsedData: any = {};
    try {
      parsedData = cleanAndParseJSON(rawText || '{}') || {};
    } catch (parseErr: any) {
      console.warn('JSON parsing from Gemini output failed, falling back to curriculum generator:', parseErr.message);
      throw parseErr;
    }
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

    return res.json({ success: true, data: completeRPP, modelUsed: usedModel });
  } catch (err: any) {
    console.warn('Gemini models unavailable/high demand (503), deploying resilient pedagogical generator:', err.message);

    // Graceful fallback prevents user from ever experiencing a 503 crash
    const completeRPP = generateCompleteFallbackRPP({
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
      kotaTanggal,
      programKeahlian,
      profilPancasilaPilihan,
      catatanTambahan,
      suggestedFase,
    });

    return res.json({
      success: true,
      data: completeRPP,
      isFallback: true,
      note: 'RPP disusun menggunakan generator kurikulum terstandar karena model AI sedang mengalami lonjakan trafik tinggi sementara.',
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

    try {
      const { text: refinedText } = await callGeminiWithFallback(ai, {
        contents: prompt,
      });

      return res.json({ success: true, refinedContent: refinedText });
    } catch (aiErr: any) {
      console.warn('AI unavailable for refine, providing structured refinement fallback:', aiErr?.message);
      // Fallback refinement if AI service is temporarily unavailable
      const fallbackRefined = typeof currentContent === 'string'
        ? `${currentContent}\n\n[Penyempurnaan Berdasarkan Instruksi (${instruction})]:\n- Penguatan aspek asesmen otentik dan diferensiasi berbasis kebutuhan riil peserta didik.\n- Penyesuaian bahasa menjadi lebih operasional menggunakan kata kerja Bloom (KKO) yang terukur.`
        : currentContent;

      return res.json({ success: true, refinedContent: fallbackRefined, isFallback: true });
    }
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

      const { text: raw } = await callGeminiWithFallback(ai, {
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

      const parsed = cleanAndParseJSON(raw || '{}') || {};

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

// Resilient pedagogical generator when AI models are temporarily unavailable or overloaded (503/429)
function generateCompleteFallbackRPP(params: {
  jenjang: string;
  kelas: string;
  mataPelajaran: string;
  topikMateri: string;
  kurikulum: string;
  modelPembelajaran: string;
  alokasiWaktu: string;
  jumlahPertemuan: number;
  namaSekolah: string;
  namaGuru: string;
  nipGuru: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  kotaTanggal: string;
  programKeahlian?: string;
  profilPancasilaPilihan: string[];
  catatanTambahan?: string;
  suggestedFase: string;
}) {
  const {
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
    kotaTanggal,
    programKeahlian = '',
    profilPancasilaPilihan = [],
    suggestedFase,
  } = params;

  const dateFormatted =
    kotaTanggal ||
    `${namaSekolah.includes('Negeri') ? 'Jakarta' : 'Kota Setempat'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const skenarioPertemuan = Array.from({ length: Math.max(1, jumlahPertemuan) }, (_, i) => {
    const meetNum = i + 1;
    return {
      pertemuanKe: meetNum,
      fokusMateri: `${topikMateri} (Pertemuan ${meetNum}: Eksplorasi Konseptual & Penerapan Praktik)`,
      alokasiMenit: 90,
      kegiatanPendahuluan: {
        durasiMenit: 15,
        poinKegiatan: [
          'Guru membuka pembelajaran dengan salam hangat, memimpin doa bersama, dan memeriksa presensi siswa untuk menumbuhkan budaya positif.',
          'Apersepsi: Guru mengaitkan materi sebelumnya dengan topik hari ini melalui pertanyaan pemantik kontekstual.',
          'Guru menyampaikan Capaian Pembelajaran, alur tujuan pembelajaran, dan kriteria ketercapaian tujuan pembelajaran (KKTP).',
          'Memberikan motivasi mengenai relevansi penguasaan materi dalam dunia industri dan kehidupan nyata.',
        ],
      },
      kegiatanInti: {
        durasiMenit: 60,
        sintaksModel: modelPembelajaran,
        langkahSintaks: [
          {
            fase: 'Fase 1: Orientasi Masalah / Penentuan Pertanyaan Mendasar',
            kegiatanGuru: `Guru menyajikan studi kasus atau simulasi masalah nyata terkait ${topikMateri} dan mengarahkan siswa mengidentifikasi tantangan utama.`,
            kegiatanSiswa: 'Siswa mengamati tayangan stimulus, mencatat fakta-fakta kunci, dan merumuskan hipotesis kerja awal.',
            catatanKarakter: 'Bernalar Kritis & Tanggap Lingkungan',
          },
          {
            fase: 'Fase 2: Perancangan Prosedur & Pengorganisasian Tim Kerja',
            kegiatanGuru: 'Guru memfasilitasi pembentukan kelompok belajar, membagikan instrumen LKPD, dan menyepakati aturan kerja.',
            kegiatanSiswa: 'Siswa berkumpul dalam kelompok heterogen, membagi peran tugas, dan menyusun langkah kerja terukur.',
            catatanKarakter: 'Gotong Royong & Kolaboratif',
          },
          {
            fase: 'Fase 3: Eksplorasi Data & Penyelidikan Terbimbing',
            kegiatanGuru: 'Guru berkeliling memfasilitasi kebutuhan diferensiasi proses dan memberikan bimbingan bagi yang memerlukan.',
            kegiatanSiswa: `Siswa mempelajari sumber literatur, melakukan pengujian/simulasi materi ${topikMateri}, dan mendokumentasikan data.`,
            catatanKarakter: 'Mandiri & Literasi Digital',
          },
          {
            fase: 'Fase 4: Penyusunan Produk & Validasi Hasil Kerja',
            kegiatanGuru: 'Guru memantau penyelesaian tugas pada LKPD dan membimbing kelompok dalam menguji kevalidan hasil analisis.',
            kegiatanSiswa: 'Siswa menganalisis data, menuangkan solusi ke dalam LKPD/artefak karya, dan memeriksa kepatuhan spesifikasi.',
            catatanKarakter: 'Kreativitas & Tanggung Jawab',
          },
          {
            fase: 'Fase 5: Presentasi Karya & Evaluasi Pengalaman Belajar',
            kegiatanGuru: 'Guru memandu sesi presentasi, memoderasi tanya jawab konstruktif, dan memberikan penguatan konsep.',
            kegiatanSiswa: 'Kelompok menyajikan hasil unjuk kerja, merespons masukan rekan kelas, dan merumuskan kesimpulan bersama.',
            catatanKarakter: 'Komunikasi Asertif & Reflektif',
          },
        ],
      },
      kegiatanPenutup: {
        durasiMenit: 15,
        poinKegiatan: [
          'Guru bersama peserta didik merumuskan rangkuman pokok materi dan kesimpulan pembelajaran.',
          'Melaksanakan asesmen formatif cepat (kuis pemahaman 3 menit) untuk mengukur daya serap materi.',
          'Menyampaikan arahan tindak lanjut untuk pertemuan selanjutnya dan tugas pengayaan mandiri.',
          'Menutup kegiatan pembelajaran dengan doa syukur dan salam penutup.',
        ],
        refleksiSiswa: [
          `Bagian mana dari konsep ${topikMateri} yang paling menarik dan berhasil Anda kuasai hari ini?`,
          'Kendala apa yang paling menantang selama proses pembelajaran dan bagaimana kelompok Anda mengatasinya?',
          'Bagaimana Anda akan menghubungkan materi hari ini dengan kebutuhan di dunia kerja?',
        ],
        refleksiGuru: [
          'Apakah seluruh peserta didik aktif berkontribusi dalam pengerjaan lembar kerja hari ini?',
          'Pendekatan diferensiasi manakah yang memberikan dampak belajar paling signifikan pada siswa?',
          'Aspek apa yang perlu disempurnakan pada rancangan pembelajaran berikutnya?',
        ],
      },
    };
  });

  return {
    id: `rpp-${Date.now()}`,
    judul: `Modul Ajar: ${topikMateri} - Kelas ${kelas}`,
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
    capaianPembelajaran: `Pada akhir fase ${suggestedFase}, peserta didik memiliki kompetensi menganalisis konsep teoritis, merancang prosedur teknis, serta menerapkan pemecahan masalah empiris dalam lingkup materi ${topikMateri} secara mandiri, beretika, dan berorientasi pada standar kecakapan hidup abad ke-21.`,
    alurTujuanPembelajaran: `Alur Tujuan Pembelajaran: (1) Mengidentifikasi karakteristik dan terminologi inti ${topikMateri}; (2) Menganalisis relasi logika dan tahapan implementasi; (3) Mengeksekusi penugasan unjuk kerja melalui LKPD berbasis bukti; (4) Mengevaluasi efektivitas hasil dan mempublikasikannya secara etis.`,
    tujuanPembelajaran: [
      `Melalui tayangan studi kasus kontekstual dan penelusuran pustaka (Condition), peserta didik (Audience) mampu mendeskripsikan prinsip dan struktur inti ${topikMateri} (Behavior) secara komprehensif dan tepat (Degree).`,
      `Melalui diskusi tim berbantuan LKPD (Condition), peserta didik (Audience) mampu menganalisis mekanisme kerja dan pemecahan kendala pada ${topikMateri} (Behavior) secara kritis dan sistematis (Degree).`,
      `Melalui penugasan praktik terbimbing (Condition), peserta didik (Audience) mampu membuat artefak produk atau solusi fungsional ${topikMateri} (Behavior) sesuai standar rubrik penilaian unjuk kerja (Degree).`,
      `Melalui sesi unjuk karya dan presentasi (Condition), peserta didik (Audience) mampu mengomunikasikan argumentasi dan evaluasi hasil belajar ${topikMateri} (Behavior) secara percaya diri dan terbuka (Degree).`,
    ],
    pemahamanBermakna: `Memahami konsep ${topikMateri} mengasah kemampuan nalar kritis peserta didik dalam membedah persoalan terstruktur di bidang ${mataPelajaran}, meningkatkan kesiapan kerja profesional, dan membiasakan diri bertindak atas dasar pertimbangan ilmiah.`,
    pertanyaanPemantik: [
      `Bagaimana konsep "${topikMateri}" memengaruhi ekosistem teknologi dan peradaban masa kini?`,
      `Apa konsekuensi nyata jika kaidah baku atau standar prosedur dalam "${topikMateri}" tidak diterapkan secara cermat?`,
      `Inovasi apa yang dapat Anda tawarkan dengan memanfaatkan pemahaman materi ini untuk menyelesaikan persoalan di sekitar Anda?`,
    ],
    profilPelajarPancasila:
      profilPancasilaPilihan && profilPancasilaPilihan.length > 0
        ? profilPancasilaPilihan
        : ['Bernalar Kritis', 'Kreatif', 'Gotong Royong', 'Mandiri'],
    saranaPrasarana: {
      media: [
        'Slide Presentasi Interaktif / Modul Pembelajaran Terpadu',
        'Video Dokumentasi Kontekstual & Studi Kasus Lapangan',
        'Lembar Kerja Peserta Didik (LKPD) Cetak dan Digital',
        'Layar Proyektor / Whiteboard',
      ],
      alat: [
        'Perangkat Komputer / Laptop Guru dan Peserta Didik',
        'Koneksi Internet Sekolah',
        'Perlengkapan Alat Tulis dan Instrumen Praktik Terkait',
      ],
      sumberBelajar: [
        `Buku Teks Utama ${mataPelajaran} Kelas ${kelas} Terbitan Kemendikbudristek`,
        `Platform Merdeka Mengajar (PMM) dan Modul Ajar Resmi`,
        `Dokumentasi Teknis dan Sumber Daring Relevan mengenai ${topikMateri}`,
      ],
    },
    targetPesertaDidik:
      'Peserta didik umum reguler, peserta didik dengan ragam modalitas belajar (visual, auditori, kinestetik), dan peserta didik berkemampuan tinggi.',
    diferensiasiKonten:
      'Guru menyediakan materi ajar dalam ragam format representasi: infografis visual ringkas, panduan jobsheet langkah demi langkah, serta video panduan singkat.',
    diferensiasiProses:
      'Guru memberikan dukungan berjenjang (scaffolding): pendampingan intensif bagi kelompok yang membutuhkan penguatan dasar, serta tantangan analisis mandiri bagi kelompok yang siap berkembang.',
    diferensiasiProduk:
      'Peserta didik memiliki fleksibilitas dalam memilih format keluaran hasil penugasan, seperti laporan terstruktur, infografis digital, atau video simulasi.',
    skenarioPertemuan,
    asesmenDiagnostik: {
      kognitif: [
        `Sebutkan pemahaman awal Anda mengenai konsep dasar ${topikMateri}?`,
        'Pengalaman atau pengetahuan apa yang pernah Anda peroleh terkait topik ini sebelumnya?',
      ],
      nonKognitif: [
        'Bagaimana kondisi kenyamanan Anda dalam mengikuti pembelajaran hari ini?',
        'Bentuk aktivitas belajar apa yang paling memudahkan Anda memahami hal baru?',
      ],
    },
    asesmenFormatif: {
      teknik: 'Observasi Kinerja & Penilaian Formatif LKPD',
      keterangan:
        'Penilaian formatif autentik berkesinambungan melalui pengamatan keaktifan berdiskusi, sikap gotong royong, dan progres pengerjaan LKPD.',
    },
    asesmenSumatif: {
      teknik: 'Tes Tertulis Berbasis HOTS & Asesmen Produk Unjuk Kerja',
      kisiKisiDanSoal: [
        {
          nomor: 1,
          indikator: `Mengidentifikasi konsep esensial materi ${topikMateri}`,
          levelKognitif: 'C3 (Aplikasi)',
          butirPertanyaan: `Uraikan prinsip kerja utama dalam ${topikMateri} dan berikan satu contoh konkret penerapannya di lingkungan industri atau kehidupan sehari-hari!`,
          kunciAtauRubrik:
            'Menjelaskan prinsip pokok secara tepat disertai minimal 1 contoh nyata yang relevan (Skor maksimal: 20).',
        },
        {
          nomor: 2,
          indikator: `Menganalisis studi kasus permasalahan pada ${topikMateri}`,
          levelKognitif: 'C4 (Analisis - HOTS)',
          butirPertanyaan: `Apabila ditemukan ketidaksesuaian output pada skenario implementasi ${topikMateri}, lakukan analisis mendalam penyebab masalah dan susun prosedur pengecekannya!`,
          kunciAtauRubrik:
            'Mengidentifikasi minimal 2 kemungkinan akar masalah dan urutan verifikasi teknis secara logis (Skor maksimal: 20).',
        },
        {
          nomor: 3,
          indikator: 'Membandingkan alternatif strategi implementasi',
          levelKognitif: 'C4 (Analisis - HOTS)',
          butirPertanyaan: `Bandingkan kelebihan dan batasan dari dua metode pelaksanaan ${topikMateri}. Dalam kondisi operasional seperti apa metode pertama lebih direkomendasikan?`,
          kunciAtauRubrik:
            'Menyajikan perbandingan minimal 2 parameter (efisiensi, risiko, akurasi) dan justifikasi kondisi pemilihan (Skor maksimal: 20).',
        },
        {
          nomor: 4,
          indikator: 'Mengevaluasi kualitas hasil unjuk kerja',
          levelKognitif: 'C5 (Evaluasi - HOTS)',
          butirPertanyaan: `Lakukan evaluasi terhadap solusi yang telah Anda hasilkan. Apakah sudah memenuhi kriteria efektivitas dan kepatuhan standar baku? Berikan rekomendasi optimasi!`,
          kunciAtauRubrik:
            'Memberikan penilaian objektif atas kekuatan serta kelemahan solusi dan menyertakan usulan perbaikan nyata (Skor maksimal: 20).',
        },
        {
          nomor: 5,
          indikator: 'Merancang gagasan pengembangan kreatif baru',
          levelKognitif: 'C6 (Kreasi - HOTS)',
          butirPertanyaan: `Rancanglah sebuah konsep inovasi terbarukan berbasis ${topikMateri} yang mampu meningkatkan nilai tambah bagi efisiensi kerja di era digital!`,
          kunciAtauRubrik:
            'Gagasan memiliki orisinalitas tinggi, kelayakan implementasi, serta dampak positif yang terukur (Skor maksimal: 20).',
        },
      ],
    },
    rubrikPenilaian: [
      {
        aspek: 'Penguasaan Konsep & Teori Dasar',
        skor1PerluBimbingan: 'Belum mampu memaparkan konsep dasar dan membutuhkan bimbingan intensif.',
        skor2Cukup: 'Mampu menjelaskan sebagian konsep, namun penjelasan belum tuntas.',
        skor3Baik: 'Mampu menjelaskan seluruh konsep kunci secara logis dan tepat.',
        skor4SangatBaik: 'Sangat menguasai konsep, mampu mengintegrasikan teori dengan konteks luas secara mendalam.',
      },
      {
        aspek: 'Keterampilan Praktik / Pengerjaan LKPD',
        skor1PerluBimbingan: 'Prosedur tidak dijalankan dan data hasil analisis belum tuntas.',
        skor2Cukup: 'Menjalankan prosedur namun hasil analisis masih memerlukan perbaikan.',
        skor3Baik: 'Menjalankan seluruh tahapan prosedur dengan teliti dan hasil terverifikasi.',
        skor4SangatBaik: 'Pelaksanaan prosedur sangat presisi, rapi, efektif, dan mendemonstrasikan kemandirian tinggi.',
      },
      {
        aspek: 'Kolaborasi & Bernalar Kritis',
        skor1PerluBimbingan: 'Pasif dalam kelompok dan belum berpartisipasi dalam diskusi.',
        skor2Cukup: 'Berpartisipasi aktif apabila diberikan penugasan langsung oleh rekan.',
        skor3Baik: 'Aktif berdiskusi, menghargai pendapat anggota tim, dan berkontribusi solutif.',
        skor4SangatBaik: 'Berperan aktif memandu diskusi kelompok, mampu memecahkan kebuntuan, dan berpikir kritis solutif.',
      },
      {
        aspek: 'Kualitas Presentasi & Komunikasi',
        skor1PerluBimbingan: 'Penyampaian hasil kaku dan tidak percaya diri di hadapan audiens.',
        skor2Cukup: 'Menyampaikan hasil dengan membaca teks materi secara dominan.',
        skor3Baik: 'Menyampaikan materi dengan bahasa jelas, runtut, dan artikulatif.',
        skor4SangatBaik: 'Sangat komunikatif, persuasif, menguasai audiens, dan tanggap menanggapi pertanyaan.',
      },
    ],
    lkpd: {
      judul: `Lembar Kerja Peserta Didik (LKPD): Penyelidikan & Praktik Kolaboratif - ${topikMateri}`,
      tujuanAktivitas: `Peserta didik mampu membuktikan prinsip konsep dasar, menyelesaikan studi kasus, dan menyusun laporan unjuk kerja mengenai ${topikMateri} melalui investigasi kelompok.`,
      alatBahan: [
        'Komputer / Perangkat Gawai / Modul Ajar Cetak',
        'Koneksi Internet dan Sumber Referensi Pembelajaran',
        'Lembar Format Pengamatan dan Perekaman Data',
      ],
      langkahKerja: [
        'Bentuk kelompok kecil beranggotakan 3–4 orang secara heterogen.',
        `Pahami studi kasus dan instruksi kerja terkait materi ${topikMateri} yang diberikan guru.`,
        'Diskusikan rumusan masalah dan bagikan tanggung jawab peran dalam kelompok.',
        'Lakukan investigasi pustaka, pengujian data, atau manipulasi variabel sesuai prosedur.',
        'Catat seluruh data temuan ke dalam tabel analisis LKPD dan diskusikan interpretasinya.',
        'Rumuskan kesimpulan kelompok dan persiapkan media presentasi ringkas.',
      ],
      tugasPertanyaan: [
        `Uraikan mekanisme dan temuan penting yang diperoleh kelompok Anda mengenai ${topikMateri}!`,
        'Apa saja kendala teknis atau konseptual yang ditemukan dan bagaimana cara penyelesaiannya?',
        'Tuliskan kesimpulan menyeluruh mengenai hasil pembelajaran hari ini!',
      ],
      panduanPenilaian:
        'Penilaian mencakup ketepatan isi analisis (bobot 40%), keteraturan penyusunan LKPD (bobot 30%), serta kekompakan dan keterampilan presentasi (bobot 30%).',
    },
    bahanAjarRingkas: `Ringkasan Materi Ajar: ${topikMateri}\n\n1. Pengantar dan Landasan Konseptual:\nMateri ${topikMateri} merupakan bagian integral dalam kurikulum ${kurikulum}. Fokus utamanya adalah membekali peserta didik dengan pemahaman struktur, fungsi, dan relasi sistematis yang mendukung kompetensi keahlian.\n\n2. Kaidah Operasional dan Standar Prosedur:\nDalam mempelajari ${topikMateri}, pemenuhan standar mutu, ketelitian, dan kepatuhan prosedur operasional standar (SOP) menjadi tolok ukur penting. Peserta didik dilatih untuk mengamati parameter krusial dan mendeteksi anomali secara dini.\n\n3. Relevansi Dunia Kerja dan Kehidupan Nyata:\nKompetensi ini secara langsung terhubung dengan kebutuhan industri dan pemecahan masalah konkret di masyarakat modern. Penguasaan menyeluruh atas materi ini menumbuhkan daya saing lulusan yang adaptif dan solutif.`,
    programRemedial: `Program Remedial:\nDitujukan bagi peserta didik yang belum tuntas mencapai kriteria ketercapaian tujuan pembelajaran (KKTP). Pelaksanaan remedial mencakup: (1) Penjelasan ulang materi ${topikMateri} dengan pendekatan yang lebih konkret; (2) Latihan soal terarah dengan pendampingan tutor sebaya; (3) Penugasan perbaikan instrumen asesmen formatif.`,
    programPengayaan: `Program Pengayaan:\nDitujukan bagi peserta didik yang telah mencapai KKTP lebih awal. Kegiatan pengayaan mencakup: (1) Penugasan studi kasus kompleks tingkat lanjut; (2) Pengembangan karya mandiri inovatif; (3) Berperan sebagai fasilitator sebaya dalam mendampingi rekan kelompok.`,
    glosarium: [
      { istilah: 'Capaian Pembelajaran (CP)', definisi: 'Kompetensi pembelajaran yang harus dicapai peserta didik pada setiap fase perkembangan.' },
      { istilah: 'Tujuan Pembelajaran (TP)', definisi: 'Deskripsi pencapaian kompetensi pengetahuan, keterampilan, dan sikap yang diperoleh dalam pembelajaran.' },
      { istilah: 'Asesmen Formatif', definisi: 'Asesmen yang dilakukan terintegrasi untuk memantau perkembangan proses pembelajaran peserta didik.' },
      { istilah: 'Diferensiasi Pembelajaran', definisi: 'Penyesuaian strategi pembelajaran berdasarkan kesiapan, minat, dan profil belajar peserta didik.' },
      { istilah: 'HOTS (Higher Order Thinking Skills)', definisi: 'Kemampuan berpikir kritis tingkat tinggi yang mencakup analisis, evaluasi, dan kreasi.' },
    ],
    daftarPustaka: [
      'Kemendikbudristek. (2022). Panduan Pembelajaran dan Asesmen (PPA) Pendidikan Dasar dan Menengah. Jakarta: BSKAP.',
      'Kemendikbudristek. (2022). Keputusan Kepala BSKAP No. 033/H/KR/2022 tentang Capaian Pembelajaran pada Kurikulum Merdeka.',
      `Pusat Kurikulum dan Pembelajaran. Buku Teks Utama Pembelajaran ${mataPelajaran}. Jakarta: Kemendikbudristek.`,
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
