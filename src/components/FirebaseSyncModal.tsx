import React, { useState } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Database,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { FirebaseUser, SyncState } from '../types';
import { loginWithGoogle, logoutUser, testConnection } from '../services/firebase';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  syncState: SyncState;
  lastSyncedAt: Date | null;
  cloudRPPCount: number;
  localRPPCount: number;
  onManualSync: () => Promise<void>;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  syncState,
  lastSyncedAt,
  cloudRPPCount,
  localRPPCount,
  onManualSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      await onManualSync();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyinkronkan data ke Firestore.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      // After login, sync automatically
      await onManualSync();
    } catch (err: any) {
      // Don't show error if user closed the popup
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Gagal masuk dengan Akun Google.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal keluar.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Memeriksa koneksi Firestore...');
    const ok = await testConnection();
    if (ok) {
      setTestResult('Koneksi ke Firestore aktif dan terhubung (Online).');
    } else {
      setTestResult('Koneksi Firestore menggunakan cache lokal (Offline).');
    }
    setTimeout(() => setTestResult(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Sinkronisasi Cloud Firebase</h2>
              <p className="text-xs text-emerald-200">
                Penyimpanan Firestore aman untuk RPP & Modul Ajar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Status Alert Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border bg-slate-50 border-slate-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  syncState === 'synced'
                    ? 'bg-emerald-500 ring-4 ring-emerald-100'
                    : syncState === 'syncing'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-slate-400'
                }`}
              />
              <div>
                <span className="font-bold text-slate-800">
                  {syncState === 'synced' && 'Status: Tersinkronisasi ke Cloud'}
                  {syncState === 'syncing' && 'Status: Sedang Menyinkronkan Data...'}
                  {syncState === 'offline' && 'Status: Mode Offline (Tersimpan Lokal)'}
                  {syncState === 'error' && 'Status: Terjadi Gangguan Sinkronisasi'}
                </span>
                {lastSyncedAt && (
                  <p className="text-2xs text-slate-500">
                    Pembaruan terakhir: {lastSyncedAt.toLocaleTimeString('id-ID')}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkron...' : 'Sinkron Sekarang'}</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Test connection result toast */}
          {testResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Account Profile Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              Profil Akun Pengguna
            </span>

            {currentUser && !currentUser.isAnonymous ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {currentUser.displayName || 'Guru Indonesia'}
                    </h4>
                    <p className="text-2xs sm:text-xs text-slate-500">
                      {currentUser.email || 'Email tidak tersedia'}
                    </p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Akun Google Terhubung (Cloud Sync Aktif)
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={authLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : currentUser?.isAnonymous ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Sesi Tamu Anonim (ID: {currentUser.uid.substring(0, 8)}...)
                    </h4>
                    <p className="text-2xs text-slate-500 leading-relaxed mt-0.5">
                      RPP Anda tersimpan di cloud untuk sesi ini. Masuk dengan akun Google (misal: <strong>@guru.smk.belajar.id</strong>) agar data tertaut permanen.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>{authLoading ? 'Menghubungkan Akun...' : 'Tautkan Akun Google (@guru.smk.belajar.id)'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Mode Penyimpanan Lokal (Belum Masuk Akun)
                    </h4>
                    <p className="text-2xs text-slate-500 leading-relaxed mt-0.5">
                      Dokumen RPP tersimpan di cache lokal browser Anda. Masuk dengan akun Google (seperti akun <strong>@guru.smk.belajar.id</strong>) untuk mengaktifkan sinkronisasi cloud Firestore permanen di semua perangkat.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{authLoading ? 'Membuka Login Google...' : 'Masuk dengan Google (Akun Belajar.id / Pribadi)'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-semibold text-slate-500 uppercase">Dokumen di Cloud</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">{cloudRPPCount}</p>
              <p className="text-[11px] text-slate-500">Tersimpan di Firestore</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-semibold text-slate-500 uppercase">Dokumen Lokal</span>
                <Laptop className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">{localRPPCount}</p>
              <p className="text-[11px] text-slate-500">Cache offline browser</p>
            </div>
          </div>

          {/* Security & Feature Highlights */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-2 text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Keamanan & Privasi Data Terjamin</span>
            </div>
            <p className="text-2xs text-emerald-900/80 leading-relaxed">
              Aturan keamanan Firestore (Security Rules) menerapkan prinsip isolasi data: hanya Anda yang dapat membaca, mengubah, dan menghapus dokumen RPP milik Anda sendiri. Data terenkripsi saat transit dan penyimpanan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            Tes Koneksi Firestore
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
