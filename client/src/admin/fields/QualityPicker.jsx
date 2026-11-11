import { useState } from 'react';
import { useSchema } from '../schema';
import { getQuality, setQuality } from './Uploader';

/**
 * Compression for new uploads. Every photo is saved as WebP; this decides how
 * hard it is squeezed. Remembered on this device.
 */
export default function QualityPicker({ compact = false }) {
  const { quality: options } = useSchema();
  const [value, setValue] = useState(getQuality);
  if (!options) return null;
  return (
    <label className={`a-quality ${compact ? 'a-quality--compact' : ''}`} title="Every photo is converted to WebP. Choose how small to make it.">
      <span>WebP compression</span>
      <select className="a-input a-input--sm" value={value} onChange={(e) => { setValue(e.target.value); setQuality(e.target.value); }}>
        {Object.entries(options).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    </label>
  );
}
