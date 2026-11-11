import { useCallback, useState } from 'react';

/** The compression chosen for uploads, remembered on this device. */
const KEY = 'saifi_admin_quality';
export const getQuality = () => {
  try { return localStorage.getItem(KEY) || 'balanced'; } catch { return 'balanced'; }
};
export const setQuality = (q) => {
  try { localStorage.setItem(KEY, q); } catch { /* private window */ }
};
import { uploadFiles } from '../api';
import { checkFile, shrinkForUpload } from '../images';
import { useFeedback } from '../ui';

const BATCH = 4;

/**
 * Upload photos in small batches with one overall progress bar.
 * Problems with single photos are reported, the rest still upload.
 */
export function useUploader() {
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();

  const upload = useCallback(async (fileList, { quality = getQuality() } = {}) => {
    const files = [...fileList];
    const problems = files.map((f) => checkFile(f)).filter(Boolean);
    const good = files.filter((f) => !checkFile(f));
    problems.forEach((p) => toast(p, 'error'));
    if (!good.length) return { items: [], failed: [] };

    setBusy(true);
    setProgress(0);
    const items = [];
    const failed = [];
    try {
      const ready = [];
      for (const f of good) ready.push(await shrinkForUpload(f));
      const total = ready.reduce((n, f) => n + f.size, 0) || 1;
      let done = 0;
      for (let i = 0; i < ready.length; i += BATCH) {
        const batch = ready.slice(i, i + BATCH);
        const size = batch.reduce((n, f) => n + f.size, 0);
        try {
          const res = await uploadFiles(batch, { quality, onProgress: (p) => setProgress((done + p * size) / total) });
          items.push(...(res.items || []));
          failed.push(...(res.failed || []));
        } catch (err) {
          batch.forEach((f) => failed.push({ name: f.name, error: err.message }));
        }
        done += size;
        setProgress(done / total);
      }
    } finally {
      setBusy(false);
    }
    failed.forEach((x) => toast(`${x.name}: ${x.error}`, 'error'));
    return { items, failed };
  }, [toast]);

  return { upload, progress, busy };
}
