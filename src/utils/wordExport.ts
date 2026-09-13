import { RPPData } from '../types';

export function exportRPPToWord(rpp: RPPData): void {
  const kurikulumLabel = 
    rpp.kurikulum === 'merdeka_smk' ? 'MODUL AJAR KURIKULUM MERDEKA (SMK)' :
    rpp.kurikulum === 'merdeka_lengkap' ? 'MODUL AJAR KURIKULUM MERDEKA' :
    rpp.kurikulum === 'rpp_berdiferensiasi' ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) BERDIFERENSIASI' :
    rpp.kurikulum === 'rpp_1_lembar' ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) 1 LEMBAR' :
    'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) K-13 REVISI';

  const htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${rpp.judul}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: 21.0cm 29.7cm;
        margin: 2.0cm 2.0cm 2.0cm 2.0cm;
        mso-page-orientation: portrait;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 11pt;
        line-height: 1.35;
        color: #000;
      }
      .kop {
        text-align: center;
        border-bottom: 3px double #000;
        padding-bottom: 8px;
        margin-bottom: 18px;
      }
      .kop h2 {
        margin: 0;
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
      }
      .kop h3 {
        margin: 4px 0 0 0;
        font-size: 12pt;
        font-weight: bold;
      }
      .kop p {
        margin: 2px 0 0 0;
        font-size: 10pt;
        font-style: italic;
      }
      .doc-title {
        text-align: center;
        margin: 15px 0 20px 0;
      }
      .doc-title h1 {
        font-size: 13pt;
        font-weight: bold;
        text-transform: uppercase;
        margin: 0;
        text-decoration: underline;
      }
      .doc-title p {
        margin: 4px 0 0 0;
        font-size: 11pt;
        font-weight: bold;
      }
      h2.section-header {
        font-size: 12pt;
        font-weight: bold;
        background-color: #f0f0f0;
        padding: 4px 8px;
        margin-top: 18px;
        margin-bottom: 8px;
        border-left: 4px solid #333;
      }
      h3.sub-header {
        font-size: 11pt;
        font-weight: bold;
        margin-top: 12px;
        margin-bottom: 4px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 12px;
      }
      table.table-bordered th, table.table-bordered td {
        border: 1px solid #000;
        padding: 5px 8px;
        vertical-align: top;
      }
      table.table-bordered th {
        background-color: #f4f4f4;
        font-weight: bold;
        text-align: center;
      }
      table.table-plain td {
        padding: 3px 6px;
        vertical-align: top;
        border: none;
      }
      ul, ol {
        margin-top: 4px;
        margin-bottom: 6px;
        padding-left: 24px;
      }
      li {
        margin-bottom: 3px;
      }
      .box {
        border: 1px solid #999;
        padding: 8px;
        background-color: #fafafa;
        margin-bottom: 10px;
      }
      .ttd-table {
        width: 100%;
        margin-top: 30px;
        border: none;
      }
      .ttd-table td {
        border: none;
        padding: 0;
        vertical-align: top;
      }
      .page-break {
        page-break-before: always;
      }
    </style>
  </head>
  <body>
    <!-- KOP SATUAN PENDIDIKAN -->
    <div class="kop">
      <h2>${rpp.namaSekolah.toUpperCase()}</h2>
      <h3>PEMERINTAH DAERAH DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
      <p>Alamat: Jl. Pendidikan No. 1 • Tahun Pelajaran ${rpp.tahunPelajaran}</p>
    </div>

    <div class="doc-title">
      <h1>${kurikulumLabel}</h1>
      <p>${rpp.judul.toUpperCase()}</p>
    </div>

    <!-- I. INFORMASI UMUM -->
    <h2 class="section-header">A. INFORMASI UMUM</h2>
    <table class="table-plain" style="width: 100%;">
      <tr>
        <td style="width: 25%; font-weight: bold;">Nama Penyusun / Guru</td>
        <td style="width: 3%;">:</td>
        <td style="width: 72%;">${rpp.namaGuru} (NIP: ${rpp.nipGuru || '-'})</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Satuan Pendidikan</td>
        <td>:</td>
        <td>${rpp.namaSekolah}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Jenjang / Fase / Kelas</td>
        <td>:</td>
        <td>${rpp.jenjang} / ${rpp.fase} / Kelas ${rpp.kelas} (${rpp.semester})</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Mata Pelajaran</td>
        <td>:</td>
        <td>${rpp.mataPelajaran} ${rpp.programKeahlian ? `(${rpp.programKeahlian})` : ''}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Topik / Materi Pokok</td>
        <td>:</td>
        <td><strong>${rpp.topikMateri}</strong></td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Alokasi Waktu</td>
        <td>:</td>
        <td>${rpp.alokasiWaktu} (${rpp.jumlahPertemuan} Pertemuan)</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Model Pembelajaran</td>
        <td>:</td>
        <td>${rpp.modelPembelajaran}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Metode & Pendekatan</td>
        <td>:</td>
        <td>${rpp.metodePembelajaran.join(', ')} • ${rpp.pendekatan}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Target Peserta Didik</td>
        <td>:</td>
        <td>${rpp.targetPesertaDidik}</td>
      </tr>
    </table>

    <h3 class="sub-header">Sarana dan Prasarana</h3>
    <ul>
      <li><strong>Media Pembelajaran:</strong> ${rpp.saranaPrasarana.media.join(', ')}</li>
      <li><strong>Alat dan Bahan:</strong> ${rpp.saranaPrasarana.alat.join(', ')}</li>
      <li><strong>Sumber Belajar:</strong> ${rpp.saranaPrasarana.sumberBelajar.join(', ')}</li>
    </ul>

    <h3 class="sub-header">Dimensi Profil Pelajar Pancasila</h3>
    <p>${rpp.profilPelajarPancasila.map(p => `• <strong>${p}</strong>`).join(' &nbsp;&nbsp; ')}</p>

    <!-- II. KOMPONEN INTI -->
    <h2 class="section-header">B. KOMPONEN INTI</h2>

    <h3 class="sub-header">1. Capaian Pembelajaran (CP)</h3>
    <div class="box"><p style="margin: 0;">${rpp.capaianPembelajaran}</p></div>

    <h3 class="sub-header">2. Alur Tujuan Pembelajaran (ATP)</h3>
    <p>${rpp.alurTujuanPembelajaran}</p>

    <h3 class="sub-header">3. Tujuan Pembelajaran (Kaidah ABCD)</h3>
    <ol>
      ${rpp.tujuanPembelajaran.map(tp => `<li>${tp}</li>`).join('')}
    </ol>

    <h3 class="sub-header">4. Pemahaman Bermakna (Essential Meaning)</h3>
    <p><em>"${rpp.pemahamanBermakna}"</em></p>

    <h3 class="sub-header">5. Pertanyaan Pemantik (Trigger Questions)</h3>
    <ul>
      ${rpp.pertanyaanPemantik.map(q => `<li>${q}</li>`).join('')}
    </ul>

    <h3 class="sub-header">6. Strategi Pembelajaran Berdiferensiasi</h3>
    <table class="table-bordered">
      <tr>
        <th style="width: 30%;">Diferensiasi Konten</th>
        <th style="width: 35%;">Diferensiasi Proses</th>
        <th style="width: 35%;">Diferensiasi Produk</th>
      </tr>
      <tr>
        <td>${rpp.diferensiasiKonten}</td>
        <td>${rpp.diferensiasiProses}</td>
        <td>${rpp.diferensiasiProduk}</td>
      </tr>
    </table>

    <!-- III. SKENARIO PEMBELAJARAN -->
    <h2 class="section-header">C. SKENARIO / LANGKAH-LANGKAH PEMBELAJARAN</h2>

    ${rpp.skenarioPertemuan.map(pertemuan => `
      <div style="margin-bottom: 16px;">
        <h3 style="background-color: #e2e8f0; padding: 4px 6px; font-size: 11pt; margin-top: 10px;">
          Pertemuan Ke-${pertemuan.pertemuanKe}: ${pertemuan.fokusMateri} (${pertemuan.alokasiMenit} Menit)
        </h3>

        <!-- Pendahuluan -->
        <table class="table-bordered">
          <tr style="background-color: #edf2f7;">
            <th colspan="2" style="text-align: left;">1. Kegiatan Pendahuluan (${pertemuan.kegiatanPendahuluan.durasiMenit} Menit)</th>
          </tr>
          <tr>
            <td colspan="2">
              <ul>
                ${pertemuan.kegiatanPendahuluan.poinKegiatan.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- Inti -->
          <tr style="background-color: #edf2f7;">
            <th colspan="2" style="text-align: left;">2. Kegiatan Inti (${pertemuan.kegiatanInti.durasiMenit} Menit) - ${pertemuan.kegiatanInti.sintaksModel}</th>
          </tr>
        </table>

        <table class="table-bordered" style="margin-top: -6px;">
          <tr>
            <th style="width: 25%;">Fase / Tahap Sintaks</th>
            <th style="width: 40%;">Aktivitas Guru</th>
            <th style="width: 35%;">Aktivitas Siswa & Nilai Karakter</th>
          </tr>
          ${pertemuan.kegiatanInti.langkahSintaks.map(s => `
            <tr>
              <td><strong>${s.fase}</strong></td>
              <td>${s.kegiatanGuru}</td>
              <td>
                <p style="margin: 0 0 4px 0;">${s.kegiatanSiswa}</p>
                <small style="color: #4a5568;"><em>(Karakter: ${s.catatanKarakter})</em></small>
              </td>
            </tr>
          `).join('')}
        </table>

        <!-- Penutup -->
        <table class="table-bordered" style="margin-top: 6px;">
          <tr style="background-color: #edf2f7;">
            <th style="text-align: left;">3. Kegiatan Penutup (${pertemuan.kegiatanPenutup.durasiMenit} Menit)</th>
          </tr>
          <tr>
            <td>
              <ul>
                ${pertemuan.kegiatanPenutup.poinKegiatan.map(p => `<li>${p}</li>`).join('')}
              </ul>
              <p style="margin: 6px 0 2px 0;"><strong>Refleksi Siswa:</strong></p>
              <ul>
                ${pertemuan.kegiatanPenutup.refleksiSiswa.map(r => `<li>${r}</li>`).join('')}
              </ul>
              <p style="margin: 6px 0 2px 0;"><strong>Refleksi Guru:</strong></p>
              <ul>
                ${pertemuan.kegiatanPenutup.refleksiGuru.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </table>
      </div>
    `).join('')}

    <!-- IV. ASESMEN DAN PENILAIAN -->
    <h2 class="section-header">D. ASESMEN DAN PENILAIAN PEMBELAJARAN</h2>

    <h3 class="sub-header">1. Asesmen Diagnostik</h3>
    <table class="table-bordered">
      <tr>
        <th style="width: 50%;">Diagnostik Kognitif</th>
        <th style="width: 50%;">Diagnostik Non-Kognitif</th>
      </tr>
      <tr>
        <td><ul>${rpp.asesmenDiagnostik.kognitif.map(k => `<li>${k}</li>`).join('')}</ul></td>
        <td><ul>${rpp.asesmenDiagnostik.nonKognitif.map(k => `<li>${k}</li>`).join('')}</ul></td>
      </tr>
    </table>

    <h3 class="sub-header">2. Asesmen Formatif</h3>
    <p><strong>Teknik:</strong> ${rpp.asesmenFormatif.teknik}</p>
    <p><strong>Keterangan Pelaksanaan:</strong> ${rpp.asesmenFormatif.keterangan}</p>

    <h3 class="sub-header">3. Asesmen Sumatif & Kisi-Kisi Soal</h3>
    <p><strong>Teknik:</strong> ${rpp.asesmenSumatif.teknik}</p>
    <table class="table-bordered">
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 25%;">Indikator Soal</th>
        <th style="width: 10%;">Level</th>
        <th style="width: 35%;">Butir Pertanyaan</th>
        <th style="width: 25%;">Kunci Jawaban / Rubrik</th>
      </tr>
      ${rpp.asesmenSumatif.kisiKisiDanSoal.map(soal => `
        <tr>
          <td style="text-align: center;">${soal.nomor}</td>
          <td>${soal.indikator}</td>
          <td style="text-align: center;"><strong>${soal.levelKognitif}</strong></td>
          <td>${soal.butirPertanyaan}</td>
          <td>${soal.kunciAtauRubrik}</td>
        </tr>
      `).join('')}
    </table>

    <h3 class="sub-header">4. Rubrik Ketercapaian Tujuan Pembelajaran (KKTP)</h3>
    <table class="table-bordered">
      <tr>
        <th style="width: 20%;">Aspek Penilaian</th>
        <th style="width: 20%;">Perlu Bimbingan (Skor 1)</th>
        <th style="width: 20%;">Cukup (Skor 2)</th>
        <th style="width: 20%;">Baik (Skor 3)</th>
        <th style="width: 20%;">Sangat Baik (Skor 4)</th>
      </tr>
      ${rpp.rubrikPenilaian.map(rubrik => `
        <tr>
          <td><strong>${rubrik.aspek}</strong></td>
          <td>${rubrik.skor1PerluBimbingan}</td>
          <td>${rubrik.skor2Cukup}</td>
          <td>${rubrik.skor3Baik}</td>
          <td>${rubrik.skor4SangatBaik}</td>
        </tr>
      `).join('')}
    </table>

    <!-- V. LAMPIRAN -->
    <div class="page-break"></div>
    <h2 class="section-header">E. LAMPIRAN DOKUMEN</h2>

    <h3 class="sub-header">1. Lembar Kerja Peserta Didik (LKPD / Jobsheet)</h3>
    <div style="border: 2px solid #000; padding: 12px; margin-bottom: 15px;">
      <h4 style="text-align: center; margin: 0 0 10px 0; text-transform: uppercase;">${rpp.lkpd.judul}</h4>
      <p><strong>Tujuan Aktivitas:</strong> ${rpp.lkpd.tujuanAktivitas}</p>
      <p><strong>Alat dan Bahan:</strong> ${rpp.lkpd.alatBahan.join(', ')}</p>
      
      <p><strong>Langkah Kerja:</strong></p>
      <ol>
        ${rpp.lkpd.langkahKerja.map(l => `<li>${l}</li>`).join('')}
      </ol>

      <p><strong>Tugas dan Pertanyaan Diskusi:</strong></p>
      <ol>
        ${rpp.lkpd.tugasPertanyaan.map(t => `<li>${t}</li>`).join('')}
      </ol>

      <p><em>Pedoman Penilaian: ${rpp.lkpd.panduanPenilaian}</em></p>
    </div>

    <h3 class="sub-header">2. Bahan Bacaan Ringkas Guru & Peserta Didik</h3>
    <div class="box" style="white-space: pre-wrap; font-family: monospace, serif; font-size: 10pt;">
${rpp.bahanAjarRingkas}
    </div>

    <h3 class="sub-header">3. Program Pembelajaran Remedial dan Pengayaan</h3>
    <table class="table-bordered">
      <tr>
        <th style="width: 50%;">Program Remedial</th>
        <th style="width: 50%;">Program Pengayaan</th>
      </tr>
      <tr>
        <td>${rpp.programRemedial}</td>
        <td>${rpp.programPengayaan}</td>
      </tr>
    </table>

    <h3 class="sub-header">4. Glosarium Istilah Penting</h3>
    <table class="table-bordered">
      <tr>
        <th style="width: 30%;">Istilah</th>
        <th style="width: 70%;">Definisi Operasional</th>
      </tr>
      ${rpp.glosarium.map(g => `
        <tr>
          <td><strong>${g.istilah}</strong></td>
          <td>${g.definisi}</td>
        </tr>
      `).join('')}
    </table>

    <h3 class="sub-header">5. Daftar Pustaka</h3>
    <ul>
      ${rpp.daftarPustaka.map(dp => `<li>${dp}</li>`).join('')}
    </ul>

    <!-- LEMBAR PENGESAHAN -->
    <table class="ttd-table" style="page-break-inside: avoid;">
      <tr>
        <td style="width: 50%; text-align: left;">
          <p>Mengetahui,</p>
          <p>Kepala ${rpp.namaSekolah}</p>
          <br><br><br><br>
          <p><strong>${rpp.namaKepalaSekolah}</strong></p>
          <p>NIP. ${rpp.nipKepalaSekolah || '...........................................'}</p>
        </td>
        <td style="width: 50%; text-align: right;">
          <p>${rpp.kotaTanggal || '........................, .................... 2024'}</p>
          <p>Guru Mata Pelajaran,</p>
          <br><br><br><br>
          <p><strong>${rpp.namaGuru}</strong></p>
          <p>NIP. ${rpp.nipGuru || '...........................................'}</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = (rpp.judul || 'Dokumen_RPP').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `${safeTitle}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
