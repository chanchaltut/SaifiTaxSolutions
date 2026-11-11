import { useRef, useState } from 'react';
import { useSchema } from '../schema';
import { fmtBytes } from '../format';
import { focalCss, valueUrl } from '../images';
import { Button, Icon, useFeedback } from '../ui';
import ImageEditor from './ImageEditor';
import MediaPicker from './MediaPicker';
import QualityPicker from './QualityPicker';
import RedactEditor from './RedactEditor';
import { useUploader } from './Uploader';

/**
 * A photo slot in a form: upload or pick a photo, then crop it and choose its focus point.
 * Value: { media, crop?, focal?, alt? } — or { src } for photos shipped with the website.
 */
export default function ImageField({ f, value, onChange, error, media = {}, onMedia, half }) {
  const { aspects } = useSchema();
  const [picker, setPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [redacting, setRedacting] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const { toast } = useFeedback();
  const aspect = aspects[f.aspect || 'any'];
  const m = value?.media ? media[value.media] : null;
  const { upload, progress, busy } = useUploader();

  const choose = (item, { edit = true } = {}) => {
    onMedia?.({ [item.id]: item });
    // A new photo starts with its automatic focus point (the most interesting spot).
    onChange({ media: item.id, alt: value?.alt, ...(item.auto && { focal: { x: item.auto.x, y: item.auto.y } }) });
    if (edit) setEditing(true);
  };

  const uploadFiles = async (files) => {
    const list = [...files].slice(0, 1);
    if (!list.length) return;
    const res = await upload(list);
    if (res.items?.length) {
      choose(res.items[0]);
      const saved = res.items[0].originalBytes - res.items[0].bytes;
      if (saved > 50_000) toast(`Photo ready as WebP: ${fmtBytes(res.items[0].originalBytes)} → ${fmtBytes(res.items[0].bytes)}`);
    }
  };

  const url = valueUrl(value, media, 900);
  const ratio = aspect?.ratio || (m ? m.width / m.height : 4 / 3);

  return (
    <div className={`a-field a-imgfield ${half ? 'a-field--half' : ''} ${error ? 'has-error' : ''}`}>
      <div className="a-field__top">
        <span className="a-field__label">{f.label}{f.required && <span className="a-req"> *</span>}</span>
        {aspect?.ratio && <span className="a-muted a-small">Best shape: {aspect.label.toLowerCase()}</span>}
      </div>

      {value && (value.media || value.src) ? (
        <div className="a-imgfield__filled">
          <button type="button" className="a-imgfield__preview" style={{ aspectRatio: String(Math.max(0.6, Math.min(2.4, ratio))) }} onClick={() => setEditing(true)} title="Adjust crop and focus">
            {url ? <img src={url} alt="" style={{ objectPosition: focalCss(value) }} /> : <span className="a-muted">Photo missing — please choose again</span>}
            {value.focal && <span className="a-focal-dot" style={{ left: `${value.focal.x}%`, top: `${value.focal.y}%` }} />}
          </button>
          <div className="a-imgfield__side">
            {m && (
              <p className="a-muted a-small">
                {m.width} × {m.height} px · {fmtBytes(m.bytes)}
                {m.originalBytes > m.bytes && <> WebP (was {fmtBytes(m.originalBytes)})</>}
                {value.crop && <><br />Cropped</>}
                {m.redacted && <><br />Details hidden</>}
              </p>
            )}
            {value.src && <p className="a-muted a-small">A built-in website photo. Upload your own to replace it.</p>}
            <div className="a-imgfield__actions">
              <Button size="sm" icon="crop" onClick={() => setEditing(true)}>Adjust crop & focus</Button>
              {m && <Button size="sm" icon="shield" onClick={() => setRedacting(true)}>Hide details</Button>}
              <Button size="sm" icon="upload" onClick={() => input.current?.click()} busy={busy}>Upload new</Button>
              <Button size="sm" icon="images" onClick={() => setPicker(true)}>Choose from library</Button>
              {!f.required && <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange(null)}>Remove</Button>}
            </div>
            <label className="a-imgfield__alt">
              <span>Describe the photo <span className="a-muted">(for blind visitors and Google)</span></span>
              <input className="a-input" value={value.alt || ''} maxLength={200} placeholder={m?.alt || 'e.g. GST registration certificate with personal details hidden'} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
            </label>
          </div>
        </div>
      ) : (
        <div
          className={`a-dropzone ${drag ? 'is-drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); uploadFiles(e.dataTransfer.files); }}
        >
          {busy ? (
            <div className="a-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /><p>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Making it web-ready…'}</p></div>
          ) : (
            <>
              <Icon name="image" size={30} />
              <p>Drag a photo here, or</p>
              <div className="a-imgfield__actions">
                <Button variant="primary" size="sm" icon="upload" onClick={() => input.current?.click()}>Upload from this device</Button>
                <Button size="sm" icon="images" onClick={() => setPicker(true)}>Choose from library</Button>
              </div>
              <QualityPicker compact />
            </>
          )}
        </div>
      )}

      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }} />
      {error ? <p className="a-field__error"><Icon name="alert" size={14} />{error}</p> : f.help && <p className="a-field__help">{f.help}</p>}

      {picker && <MediaPicker onClose={() => setPicker(false)} onPick={(item) => { setPicker(false); choose(item); }} />}
      {redacting && m && (
        <RedactEditor
          media={m}
          onCancel={() => setRedacting(false)}
          onDone={(item) => {
            setRedacting(false);
            onMedia?.({ [item.id]: item });
            // Same crop and focus, on the covered copy.
            onChange({ ...value, media: item.id });
          }}
        />
      )}
      {editing && (
        <ImageEditor
          value={value}
          media={m}
          aspectKey={f.aspect || 'any'}
          onCancel={() => setEditing(false)}
          onSave={(v) => { onChange({ ...value, ...v }); setEditing(false); }}
        />
      )}
    </div>
  );
}
