import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  School,
  LogOut,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import {
  PRESET_ACCOUNTS,
  loginWithUsernamePassword,
  registerNewTeacher,
  setCurrentAppUser,
} from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUserChanged: (user: AppUser) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMapel, setRegMapel] = useState('Informatika');
  const [regSekolah, setRegSekolah] = useState('SMK Negeri 1 Makassar');
  const [regRole, setRegRole] = useState<UserRole>('guru');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setLoginError('Mohon masukkan nama pengguna dan kata sandi.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    const res = await loginWithUsernamePassword(loginUsername, loginPassword);
    setLoginLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      onShowToast(res.message || 'Berhasil masuk ke akun.');
      onClose();
    } else {
      setLoginError(res.message || 'Gagal masuk.');
    }
  };

  const handleQuickLogin = async (acc: typeof PRESET_ACCOUNTS[0]) => {
    setLoginLoading(true);
    setLoginError(null);
    const res = await loginWithUsernamePassword(acc.username, acc.password || 'password123');
    setLoginLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      onShowToast(`Beralih ke akun: ${res.user.namaLengkap} (${res.user.role === 'admin' ? 'Admin Akreditasi' : 'Guru'})`);
      onClose();
    } else {
      setLoginError(res.message || 'Gagal login cepat.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama || !regUsername || !regPassword) {
      setRegError('Nama lengkap, username, dan password wajib diisi.');
      return;
    }

    setRegLoading(true);
    setRegError(null);

    const res = await registerNewTeacher({
      namaLengkap: regNama,
      nip: regNip,
      username: regUsername,
      password: regPassword,
      mataPelajaran: regMapel,
      namaSekolah: regSekolah,
      role: regRole,
    });

    setRegLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      onShowToast(res.message || 'Akun berhasil dibuat.');
      onClose();
    } else {
      setRegError(res.message || 'Gagal mendaftarkan akun.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              ) : (
                <GraduationCap className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Autentikasi Akun Guru & Admin</h2>
              <p className="text-xs text-emerald-200">
                Sistem Akun Penyusun RPP & Verifikasi Akreditasi Satuan Pendidikan
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2.5 rounded-t-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white text-emerald-800 border-t-2 border-x border-slate-200 border-t-emerald-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2.5 rounded-t-xl transition-all ${
              activeTab === 'register'
                ? 'bg-white text-emerald-800 border-t-2 border-x border-slate-200 border-t-emerald-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Akun Guru Baru
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-t-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-800 border-t-2 border-x border-slate-200 border-t-emerald-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Pengguna ({currentUser.username})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Pengguna (Username) atau NIP
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Contoh: guru.informatika atau 19850412..."
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
                </button>
              </form>

              {/* Quick Switch / Preset Accounts */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Akses Cepat Akun Uji Coba Sekolah:
                  </span>
                  <span className="text-2xs text-slate-500">Klik untuk langsung beralih</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_ACCOUNTS.map((acc) => {
                    const isSelected = currentUser.id === acc.id || currentUser.username === acc.username;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400/30'
                            : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-800 truncate">{acc.namaLengkap}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-2xs font-bold shrink-0 ${
                              acc.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {acc.role === 'admin' ? '🛡️ Admin' : '👨‍🏫 Guru'}
                          </span>
                        </div>
                        <div className="text-2xs text-slate-500 flex justify-between">
                          <span>User: <strong className="text-slate-700">{acc.username}</strong></span>
                          <span>Pass: <strong className="text-slate-700">{acc.passwordHint}</strong></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi, S.Pd."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Guru
                  </label>
                  <input
                    type="text"
                    value={regNip}
                    onChange={(e) => setRegNip(e.target.value)}
                    placeholder="Contoh: 198907122015021004"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengguna (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: guru.ahmad"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi (Password) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran Pengampu
                  </label>
                  <input
                    type="text"
                    value={regMapel}
                    onChange={(e) => setRegMapel(e.target.value)}
                    placeholder="Contoh: Informatika / Bahasa Inggris"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran Akun (Role)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
                  >
                    <option value="guru">👨‍🏫 Guru Pengampu (Penyusun RPP)</option>
                    <option value="admin">🛡️ Admin / Kepala Sekolah (Asesor Akreditasi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan / Sekolah
                </label>
                <input
                  type="text"
                  value={regSekolah}
                  onChange={(e) => setRegSekolah(e.target.value)}
                  placeholder="Contoh: SMK Negeri 1 Makassar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{regLoading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Baru'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                    currentUser.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}
                >
                  {currentUser.namaLengkap.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                      {currentUser.namaLengkap}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-2xs font-bold shrink-0 ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {currentUser.role === 'admin' ? '🛡️ Admin Akreditasi' : '👨‍🏫 Guru Pengampu'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">NIP: {currentUser.nip || '-'}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block text-2xs">Username</span>
                  <span className="font-semibold text-slate-800">{currentUser.username}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block text-2xs">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-800">{currentUser.mataPelajaran || '-'}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl col-span-2">
                  <span className="text-slate-500 block text-2xs">Satuan Pendidikan</span>
                  <span className="font-semibold text-slate-800">{currentUser.namaSekolah || '-'}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {currentUser.role === 'admin'
                    ? 'Akun Anda memiliki hak akses Administrator untuk menelaah, mengaudit butir akreditasi, dan menyetujui dokumen RPP/Modul Ajar.'
                    : 'Akun Anda dapat menyusun RPP, mengajukannya ke Admin Akreditasi, dan memperoleh Lembar Pengesahan Akreditasi Resmi.'}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ganti Akun Lain</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
