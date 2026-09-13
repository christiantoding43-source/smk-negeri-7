import { RPPData } from '../types';
import { sampleRPPList } from '../data/defaultTemplates';

const STORAGE_KEY = 'sirpp_saved_documents_v1';

export function getSavedRPPs(): RPPData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization with standard templates
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleRPPList));
      return sampleRPPList;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return sampleRPPList;
  } catch (err) {
    console.error('Error reading from localStorage:', err);
    return sampleRPPList;
  }
}

export function saveRPP(rpp: RPPData): RPPData[] {
  try {
    const current = getSavedRPPs();
    const existingIndex = current.findIndex((item) => item.id === rpp.id);
    const updated = [...current];

    const rppToSave = {
      ...rpp,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      updated[existingIndex] = rppToSave;
    } else {
      updated.unshift(rppToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving RPP:', err);
    return getSavedRPPs();
  }
}

export function deleteRPP(id: string): RPPData[] {
  try {
    const current = getSavedRPPs();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting RPP:', err);
    return getSavedRPPs();
  }
}

export function duplicateRPP(original: RPPData): RPPData {
  const newRPP: RPPData = {
    ...original,
    id: `rpp-${Date.now()}`,
    judul: `${original.judul} (Salinan)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveRPP(newRPP);
  return newRPP;
}

export function setAllLocalRPPs(rpps: RPPData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rpps));
  } catch (err) {
    console.error('Error writing all RPPs to localStorage:', err);
  }
}

