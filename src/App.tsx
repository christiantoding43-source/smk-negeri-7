import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentViewer } from './components/DocumentViewer';
import { DocumentEditor } from './components/DocumentEditor';
import { GeneratorModal } from './components/GeneratorModal';
import { SavedRPPList } from './components/SavedRPPList';
import { TemplatesModal } from './components/TemplatesModal';
import { AIRefineModal } from './components/AIRefineModal';
import { SmartSuggestionsModal } from './components/SmartSuggestionsModal';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';
import { AuthModal } from './components/AuthModal';
import { AdminAkreditasiModal } from './components/AdminAkreditasiModal';
import { LembarPengesahanModal } from './components/LembarPengesahanModal';
import { RPPData, JenjangPendidikan, SyncState, FirebaseUser, AppUser } from './types';
import { getCurrentAppUser, setCurrentAppUser } from './services/authService';
import { getSavedRPPs, saveRPP, deleteRPP, duplicateRPP, setAllLocalRPPs } from './utils/storage';
import { exportRPPToWord } from './utils/wordExport';
import {
  ensureAnonymousAuth,
  subscribeToAuthState,
  subscribeToUserRPPs,
  saveRPPToFirestore,
  deleteRPPFromFirestore,
  syncLocalRPPsToFirestore,
  testConnection,
} from './services/firebase';
import { Sparkles, FileText, CheckCircle2, BookOpen, Layers, ShieldCheck, Download, Printer, Lightbulb, Cloud, CloudCheck, RefreshCw, Award } from 'lucide-react';

export default function App() {
  const [savedRPPs, setSavedRPPs] = useState<RPPData[]>([]);
  const [currentRPP, setCurrentRPP] = useState<RPPData | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  // App User & Role (Guru / Admin Akreditasi)
  const [appUser, setAppUser] = useState<AppUser>(() => getCurrentAppUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLembarPengesahanOpen, setIsLembarPengesahanOpen] = useState(false);
  const [pengesahanTargetRPP, setPengesahanTargetRPP] = useState<RPPData | null>(null);

  // Firebase Sync & User States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [cloudRPPs, setCloudRPPs] = useState<RPPData[]>([]);

  // Modal States
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSmartSuggestionsOpen, setIsSmartSuggestionsOpen] = useState(false);
  const [generatorInitialData, setGeneratorInitialData] = useState<{
    mataPelajaran?: string;
    topikMateri?: string;
    modelPembelajaran?: string;
    catatanTambahan?: string;
    jenjang?: JenjangPendidikan;
  } | null>(null);


  const [refineData, setRefineData] = useState<{
    isOpen: boolean;
    sectionName: string;
    content: any;
  }>({
    isOpen: false,
    sectionName: '',
    content: null,
  });

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplySmartSuggestions = (data: {
    mataPelajaran: string;
    topikMateri: string;
    modelPembelajaran: string;
    selectedAktivitas: string[];
    catatanTambahan: string;
    jenjang: JenjangPendidikan;
  }) => {
    setGeneratorInitialData({
      mataPelajaran: data.mataPelajaran,
      topikMateri: data.topikMateri,
      modelPembelajaran: data.modelPembelajaran,
      catatanTambahan: data.catatanTambahan,
      jenjang: data.jenjang,
    });
    setIsGeneratorOpen(true);
    showToast('Saran materi, metode, & aktivitas berhasil diterapkan ke form RPP!');
  };


  // Initial local load
  useEffect(() => {
    const list = getSavedRPPs();
    setSavedRPPs(list);
    if (list.length > 0) {
      setCurrentRPP(list[0]);
    }
  }, []);

  // Initialize Firebase Auth & test connection
  useEffect(() => {
    testConnection().catch(() => {});
    ensureAnonymousAuth().catch(() => {});
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setCurrentUser(user);
      if (!user) {
        setSyncState('offline');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Sync for currentUser
  useEffect(() => {
    if (!currentUser?.uid) {
      setSyncState('offline');
      return;
    }

    setSyncState('syncing');
    const unsubscribeRPPs = subscribeToUserRPPs(
      currentUser.uid,
      async (remoteRPPs) => {
        setCloudRPPs(remoteRPPs);
        setLastSyncedAt(new Date());
        setSyncState('synced');

        if (remoteRPPs.length > 0) {
          // Merge remote and local (remote is master)
          setSavedRPPs((prevLocal) => {
            const mergedMap = new Map<string, RPPData>();
            prevLocal.forEach((item) => mergedMap.set(item.id, item));
            remoteRPPs.forEach((item) => mergedMap.set(item.id, item));
            const mergedList = Array.from(mergedMap.values()).sort(
              (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            setAllLocalRPPs(mergedList);
            return mergedList;
          });
        } else {
          // If remote is empty, seed local RPPs to Firestore
          const localList = getSavedRPPs();
          if (localList.length > 0) {
            await syncLocalRPPsToFirestore(localList, currentUser.uid, currentUser.email || '');
          }
        }
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setSyncState('error');
      }
    );

    return () => unsubscribeRPPs();
  }, [currentUser?.uid]);

  const handleManualSync = async () => {
    if (!currentUser?.uid) {
      // Prompt user to log in with Google for cloud sync
      setIsSyncModalOpen(true);
      return;
    }
    const currentUid = currentUser.uid;
    setSyncState('syncing');
    try {
      const local = getSavedRPPs();
      await syncLocalRPPsToFirestore(local, currentUid, currentUser?.email || '');
      setSyncState('synced');
      setLastSyncedAt(new Date());
      showToast('Sinkronisasi ke Firebase Firestore berhasil!');
    } catch (e: any) {
      console.error('Manual sync failed:', e);
      setSyncState('error');
      showToast('Gagal menyinkronkan ke Firebase Firestore.');
    }
  };

  const handleGeneratedSuccess = async (newRPP: RPPData) => {
    // Enrich with active appUser profile
    const enrichedRPP: RPPData = {
      ...newRPP,
      authorName: appUser.namaLengkap,
      authorNip: appUser.nip,
      authorUsername: appUser.username,
      namaGuru: appUser.namaLengkap,
      nipGuru: appUser.nip || newRPP.nipGuru || '-',
      namaSekolah: appUser.namaSekolah || newRPP.namaSekolah,
      statusPersetujuan: 'draft',
    };

    const updatedList = saveRPP(enrichedRPP);
    setSavedRPPs(updatedList);
    setCurrentRPP(enrichedRPP);
    setViewMode('view');
    showToast('RPP & Modul Ajar lengkap berhasil disusun oleh AI!');

    if (currentUser?.uid) {
      setSyncState('syncing');
      try {
        await saveRPPToFirestore(enrichedRPP, currentUser.uid, currentUser.email || '');
        setSyncState('synced');
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Error saving to Firestore:', e);
        setSyncState('error');
      }
    }
  };

  const handleSaveEdited = async (updated: RPPData) => {
    const updatedList = saveRPP(updated);
    setSavedRPPs(updatedList);
    setCurrentRPP(updated);
    showToast('Perubahan RPP berhasil disimpan.');

    if (currentUser?.uid) {
      setSyncState('syncing');
      try {
        await saveRPPToFirestore(updated, currentUser.uid, currentUser.email || '');
        setSyncState('synced');
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Error saving to Firestore:', e);
        setSyncState('error');
      }
    }
  };

  // ACCREDITATION & APPROVAL WORKFLOW HANDLERS
  const handleSubmitForApproval = async (targetRPPId?: string) => {
    const targetId = targetRPPId || currentRPP?.id;
    if (!targetId) return;

    const rpp = savedRPPs.find((r) => r.id === targetId) || currentRPP;
    if (!rpp) return;

    const updated: RPPData = {
      ...rpp,
      statusPersetujuan: 'diajukan',
      authorName: rpp.authorName || appUser.namaLengkap,
      authorNip: rpp.authorNip || appUser.nip,
      authorUsername: rpp.authorUsername || appUser.username,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveEdited(updated);
    showToast('Dokumen RPP berhasil diajukan ke Tim Asesor Akreditasi Satuan Pendidikan!');
  };

  const handleApproveRPP = async (rppId: string, evaluasiData: any) => {
    const rpp = savedRPPs.find((r) => r.id === rppId) || currentRPP;
    if (!rpp) return;

    const updated: RPPData = {
      ...rpp,
      statusPersetujuan: 'disetujui',
      evaluasiAkreditasi: evaluasiData,
      disetujuiOleh: evaluasiData.peninjauNama,
      nipPenyetuju: evaluasiData.peninjauNip,
      tanggalPersetujuan: evaluasiData.tanggalReview,
      catatanPersetujuan: evaluasiData.catatanSupervisi,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveEdited(updated);
    showToast('⭐ RPP Disetujui & Disahkan untuk Dokumen Akreditasi Sekolah!');
  };

  const handleRequestRevisionRPP = async (rppId: string, catatan: string) => {
    const rpp = savedRPPs.find((r) => r.id === rppId) || currentRPP;
    if (!rpp) return;

    const updated: RPPData = {
      ...rpp,
      statusPersetujuan: 'revisi',
      catatanPersetujuan: catatan,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveEdited(updated);
    showToast('Catatan perbaikan / supervisi berhasil dikirimkan ke guru.');
  };

  const handleOpenLembarPengesahan = (rpp: RPPData) => {
    setPengesahanTargetRPP(rpp);
    setIsLembarPengesahanOpen(true);
  };

  const handleDelete = async (id: string) => {
    const updatedList = deleteRPP(id);
    setSavedRPPs(updatedList);
    if (currentRPP?.id === id) {
      setCurrentRPP(updatedList.length > 0 ? updatedList[0] : null);
    }
    showToast('Dokumen RPP dihapus.');

    if (currentUser?.uid) {
      try {
        await deleteRPPFromFirestore(id, currentUser.uid);
      } catch (e) {
        console.error('Error deleting from Firestore:', e);
      }
    }
  };

  const handleDuplicate = async (rpp: RPPData) => {
    const dup = duplicateRPP(rpp);
    const updatedList = getSavedRPPs();
    setSavedRPPs(updatedList);
    setCurrentRPP(dup);
    showToast('Dokumen berhasil diduplikasi.');

    if (currentUser?.uid) {
      setSyncState('syncing');
      try {
        await saveRPPToFirestore(dup, currentUser.uid, currentUser.email || '');
        setSyncState('synced');
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Error saving duplicate to Firestore:', e);
      }
    }
  };


  const handleDownloadWord = (targetRPP?: RPPData) => {
    const rppToExport = targetRPP || currentRPP;
    if (rppToExport) {
      exportRPPToWord(rppToExport);
      showToast(`Mengunduh file Word: "${rppToExport.judul}"...`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenRefine = (sectionName: string, content: any) => {
    setRefineData({
      isOpen: true,
      sectionName,
      content,
    });
  };

  const handleApplyRefine = (refinedText: string) => {
    if (!currentRPP) return;

    let updated = { ...currentRPP };

    // Apply intelligently based on section
    if (refineData.sectionName.includes('Tujuan')) {
      const items = refinedText
        .split(/\n(?:\d+\.|\*|-)\s*/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      updated.tujuanPembelajaran = items.length > 0 ? items : [refinedText];
    } else if (refineData.sectionName.includes('LKPD')) {
      updated.lkpd = {
        ...updated.lkpd,
        panduanPenilaian: refinedText,
      };
    } else if (refineData.sectionName.includes('Asesmen')) {
      updated.asesmenFormatif = {
        ...updated.asesmenFormatif,
        keterangan: refinedText,
      };
    } else if (refineData.sectionName.includes('Skenario')) {
      // update note
      showToast('Saran penyempurnaan AI dapat Anda salin ke langkah pembelajaran.');
    }

    handleSaveEdited(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header Bar */}
      <Header
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenSavedList={() => setIsSavedListOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSmartSuggestions={() => setIsSmartSuggestionsOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        syncState={syncState}
        currentUser={currentUser}
        appUser={appUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        pendingApprovalCount={savedRPPs.filter((r) => r.statusPersetujuan === 'diajukan').length}
        currentRPP={currentRPP}
        onDownloadWord={() => handleDownloadWord()}
        onPrint={handlePrint}
        savedCount={savedRPPs.length}
      />


      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs sm:text-sm animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Feature Banner (Hidden in Print) */}
        <div className="mb-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-sm border border-emerald-700/30 print:hidden relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Standar Nasional Indonesia
                </span>
                <span className="text-xs text-emerald-200/80">
                  Kepmendikbudristek No. 262/M/2022
                </span>
                {/* Active Teacher Badge */}
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
                  title="Klik untuk mengelola akun atau berganti ke akun guru lain / admin"
                >
                  <span>
                    Akun Aktif: <strong>{appUser.namaLengkap}</strong> ({appUser.role === 'admin' ? '🛡️ Admin Akreditasi' : '👨‍🏫 Guru'})
                  </span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Penyusun RPP & Modul Ajar Terstruktur Lengkap
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Buat modul ajar Kurikulum Merdeka (SD, SMP, SMA, SMK) atau RPP K13 dalam hitungan detik.
                Lengkap dengan Capaian Pembelajaran, Sintaks Sintetik, Asesmen Diagnostik/Formatif/Sumatif HOTS, Rubrik KKTP, LKPD, dan siap diekspor ke Microsoft Word (.doc), diaudit untuk akreditasi sekolah, atau dicetak PDF.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Susun RPP Baru</span>
              </button>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer"
                title="Buka instrumen 6 butir akreditasi sekolah BAN-S/M dan verifikasi dokumen RPP"
              >
                <ShieldCheck className="w-4 h-4 text-amber-900" />
                <span>Verifikasi Akreditasi</span>
              </button>
              <button
                onClick={() => setIsSmartSuggestionsOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-100 bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-500/40 rounded-xl transition-all"
                title="Buka Sistem Saran Cerdas untuk materi ajar, metode (diskusi, simulasi, PjBL), dan aktivitas siswa"
              >
                <Lightbulb className="w-4 h-4 text-emerald-300" />
                <span>Saran Cerdas AI</span>
              </button>
            </div>
          </div>
        </div>


        {/* Active Document Viewer or Editor */}
        {currentRPP ? (
          viewMode === 'view' ? (
            <DocumentViewer
              rpp={currentRPP}
              onEditClick={() => setViewMode('edit')}
              onDownloadWord={() => handleDownloadWord()}
              onPrint={handlePrint}
              onRefineSection={handleOpenRefine}
              onOpenSmartSuggestions={() => setIsSmartSuggestionsOpen(true)}
              currentUser={appUser}
              onSubmitForApproval={() => handleSubmitForApproval(currentRPP.id)}
              onOpenAdminAudit={() => setIsAdminModalOpen(true)}
              onViewLembarPengesahan={() => handleOpenLembarPengesahan(currentRPP)}
            />

          ) : (
            <DocumentEditor
              rpp={currentRPP}
              onSave={handleSaveEdited}
              onBackToView={() => setViewMode('view')}
              onRefineSection={handleOpenRefine}
            />
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Dokumen yang Dipilih</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Mulai dengan menyusun RPP baru menggunakan bantuan kecerdasan buatan (Gemini AI) atau pilih template siap pakai yang sudah tersedia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Susun RPP Baru (AI)</span>
              </button>
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <FileText className="w-4 h-4" />
                <span>Buka Pustaka Contoh</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer (Hidden in Print) */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            SiRPP Digital • Aplikasi Penyusun Perangkat Ajar Guru Indonesia
          </p>
          <p>
            Sesuai Standar Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), Profil Pelajar Pancasila, dan Asesmen Kurikulum Merdeka & K13.
          </p>
        </div>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={appUser}
        onUserChanged={(newUser) => {
          setAppUser(newUser);
          setCurrentAppUser(newUser);
        }}
        onShowToast={showToast}
      />

      <AdminAkreditasiModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        rpps={savedRPPs}
        currentUser={appUser}
        onApproveRPP={handleApproveRPP}
        onRequestRevisionRPP={handleRequestRevisionRPP}
        onViewLembarPengesahan={handleOpenLembarPengesahan}
        onOpenRPP={(rpp) => {
          setCurrentRPP(rpp);
          setViewMode('view');
          setIsAdminModalOpen(false);
        }}
      />

      <LembarPengesahanModal
        isOpen={isLembarPengesahanOpen}
        onClose={() => setIsLembarPengesahanOpen(false)}
        rpp={pengesahanTargetRPP || currentRPP}
      />

      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setGeneratorInitialData(null);
        }}
        onSuccess={handleGeneratedSuccess}
        initialData={generatorInitialData}
      />

      <SmartSuggestionsModal
        isOpen={isSmartSuggestionsOpen}
        onClose={() => setIsSmartSuggestionsOpen(false)}
        onApplyToNewRPP={handleApplySmartSuggestions}
        initialMataPelajaran={currentRPP?.mataPelajaran || 'Informatika'}
        initialTopik={currentRPP?.topikMateri || 'Desain Antarmuka Pengguna (UI/UX) dan Pembuatan Prototipe Figma'}
        initialJenjang={currentRPP?.jenjang || 'SMK'}
      />

      <FirebaseSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        syncState={syncState}
        lastSyncedAt={lastSyncedAt}
        cloudRPPCount={cloudRPPs.length}
        localRPPCount={savedRPPs.length}
        onManualSync={handleManualSync}
      />

      <SavedRPPList
        isOpen={isSavedListOpen}
        onClose={() => setIsSavedListOpen(false)}
        savedRPPs={savedRPPs}
        onSelectRPP={(rpp) => {
          setCurrentRPP(rpp);
          setViewMode('view');
        }}
        onDuplicateRPP={handleDuplicate}
        onDeleteRPP={handleDelete}
        onDownloadWord={handleDownloadWord}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(template) => {
          // Clone and set as active with author
          const cloned: RPPData = {
            ...template,
            id: `rpp-${Date.now()}`,
            authorName: appUser.namaLengkap,
            authorNip: appUser.nip,
            authorUsername: appUser.username,
            namaGuru: appUser.namaLengkap,
            nipGuru: appUser.nip || template.nipGuru || '-',
            namaSekolah: appUser.namaSekolah || template.namaSekolah,
            statusPersetujuan: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          handleGeneratedSuccess(cloned);
        }}
      />

      {currentRPP && (
        <AIRefineModal
          isOpen={refineData.isOpen}
          onClose={() => setRefineData({ isOpen: false, sectionName: '', content: null })}
          sectionName={refineData.sectionName}
          currentContent={refineData.content}
          rppContext={currentRPP}
          onApply={handleApplyRefine}
        />
      )}
    </div>
  );
}
