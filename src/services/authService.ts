import { AppUser, UserRole } from '../types';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const STORAGE_USERS_KEY = 'rpp_registered_users_v2';
const STORAGE_CURRENT_USER_KEY = 'rpp_current_session_user_v2';

export const PRESET_ACCOUNTS: (AppUser & { passwordHint: string })[] = [
  {
    id: 'user-guru-1',
    username: 'guru.informatika',
    password: 'password123',
    passwordHint: 'password123',
    namaLengkap: 'Christian Toding, S.Kom., M.Pd.',
    email: 'christiantoding43@guru.smk.belajar.id',
    nip: '198504122010011015',
    role: 'guru',
    mataPelajaran: 'Informatika & Pemrograman Web',
    namaSekolah: 'SMK Negeri 1 Makassar',
    jabatan: 'Guru Kejuruan Teknik Komputer & Informatika',
  },
  {
    id: 'user-guru-2',
    username: 'guru.bahasa',
    password: 'password123',
    passwordHint: 'password123',
    namaLengkap: 'Dra. Hj. Siti Aminah, M.Pd.',
    email: 'siti.aminah@guru.smk.belajar.id',
    nip: '197808142003122001',
    role: 'guru',
    mataPelajaran: 'Bahasa Indonesia',
    namaSekolah: 'SMK Negeri 1 Makassar',
    jabatan: 'Guru Mata Pelajaran Umum',
  },
  {
    id: 'user-guru-3',
    username: 'guru.matematika',
    password: 'password123',
    passwordHint: 'password123',
    namaLengkap: 'Budi Santoso, S.Pd.',
    email: 'budi.santoso@guru.smk.belajar.id',
    nip: '199003152015021003',
    role: 'guru',
    mataPelajaran: 'Matematika Terapan',
    namaSekolah: 'SMK Negeri 1 Makassar',
    jabatan: 'Guru Mata Pelajaran Umum',
  },
  {
    id: 'user-admin-1',
    username: 'admin.akreditasi',
    password: 'admin123',
    passwordHint: 'admin123',
    namaLengkap: 'Dr. Hendra Wijaya, M.Pd.',
    email: 'kepsek.hendra@smk.belajar.id',
    nip: '197203151998021002',
    role: 'admin',
    namaSekolah: 'SMK Negeri 1 Makassar',
    jabatan: 'Kepala Sekolah & Tim Asesor Penjaminan Mutu Akreditasi',
  },
];

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(PRESET_ACCOUNTS));
      return PRESET_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    // ensure presets exist
    const map = new Map<string, AppUser>();
    PRESET_ACCOUNTS.forEach((acc) => map.set(acc.username.toLowerCase(), acc));
    parsed.forEach((u: AppUser) => map.set(u.username.toLowerCase(), u));
    return Array.from(map.values());
  } catch (e) {
    return PRESET_ACCOUNTS;
  }
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage:', e);
  }
}

export function getCurrentAppUser(): AppUser {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  // Default to Guru 1 on initial entry
  const defaultUser = PRESET_ACCOUNTS[0];
  setCurrentAppUser(defaultUser);
  return defaultUser;
}

export function setCurrentAppUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting current user:', e);
  }
}

export async function loginWithUsernamePassword(
  usernameOrNip: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AppUser; message?: string }> {
  const cleanInput = usernameOrNip.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const users = getStoredUsers();
  const matched = users.find(
    (u) =>
      u.username.toLowerCase() === cleanInput ||
      (u.nip && u.nip.trim() === cleanInput) ||
      u.email.toLowerCase() === cleanInput
  );

  if (!matched) {
    return {
      success: false,
      message: 'Nama pengguna (username) atau NIP tidak ditemukan dalam sistem.',
    };
  }

  if (matched.password && matched.password !== cleanPass) {
    return {
      success: false,
      message: 'Kata sandi (password) salah. Silakan periksa kembali.',
    };
  }

  setCurrentAppUser(matched);

  // Sync profile to Firestore if reachable
  try {
    if (matched.id) {
      await setDoc(
        doc(db, 'users', matched.id),
        {
          uid: matched.id,
          username: matched.username,
          namaLengkap: matched.namaLengkap,
          email: matched.email,
          role: matched.role,
          nip: matched.nip || '',
          mataPelajaran: matched.mataPelajaran || '',
          namaSekolah: matched.namaSekolah || '',
          jabatan: matched.jabatan || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    // offline graceful
    console.warn('Firestore user doc sync skipped (offline mode):', err);
  }

  return {
    success: true,
    user: matched,
    message: `Selamat datang, ${matched.namaLengkap} (${matched.role === 'admin' ? 'Admin Akreditasi' : 'Guru Pengampu'})!`,
  };
}

export async function registerNewTeacher(data: {
  username: string;
  namaLengkap: string;
  nip: string;
  password: string;
  mataPelajaran: string;
  namaSekolah: string;
  email?: string;
  role?: UserRole;
}): Promise<{ success: boolean; user?: AppUser; message?: string }> {
  const cleanUsername = data.username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, message: 'Username minimal terdiri dari 3 karakter.' };
  }
  if (!data.password || data.password.length < 4) {
    return { success: false, message: 'Password minimal 4 karakter.' };
  }

  const users = getStoredUsers();
  const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    return { success: false, message: 'Username sudah digunakan oleh guru lain. Gunakan username lain.' };
  }

  const newId = `user-guru-${Date.now()}`;
  const newUser: AppUser = {
    id: newId,
    username: cleanUsername,
    password: data.password.trim(),
    namaLengkap: data.namaLengkap.trim(),
    nip: data.nip.trim() || '-',
    email: data.email?.trim() || `${cleanUsername}@guru.smk.belajar.id`,
    mataPelajaran: data.mataPelajaran.trim() || 'Mata Pelajaran Umum',
    namaSekolah: data.namaSekolah.trim() || 'SMK Negeri 1',
    role: data.role || 'guru',
    jabatan: data.role === 'admin' ? 'Tim Asesor Akreditasi' : 'Guru Pengampu Mata Pelajaran',
  };

  users.push(newUser);
  saveStoredUsers(users);
  setCurrentAppUser(newUser);

  // Firestore sync
  try {
    await setDoc(doc(db, 'users', newId), {
      uid: newId,
      username: newUser.username,
      namaLengkap: newUser.namaLengkap,
      email: newUser.email,
      role: newUser.role,
      nip: newUser.nip,
      mataPelajaran: newUser.mataPelajaran,
      namaSekolah: newUser.namaSekolah,
      jabatan: newUser.jabatan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Sync to firestore /users error:', e);
  }

  return {
    success: true,
    user: newUser,
    message: `Akun Guru ${newUser.namaLengkap} berhasil didaftarkan!`,
  };
}
