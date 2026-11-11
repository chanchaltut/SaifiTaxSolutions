// ─────────────────────────────────────────────────────────────
// "Hide details": draw boxes over a client's name, address, PAN,
// GSTIN, registration numbers, QR codes or signature. The server
// makes a NEW copy of the photo with those parts covered for good
// (nothing underneath can be recovered from it). The original stays
// in the photo library, untouched, until you delete it there.
// ─────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { api } from '../api';
import { mediaUrl } from '../images';
import { Button, Icon, Modal, useFeedback } from '../ui';

const clamp = (n) => Math.min(100, Math.max(0, n));

export default function RedactEditor({ media, onCancel, onDone }) {
  const [boxes, setBoxes] = useState([]);
  const [draft, setDraft] = useState(null);
  const [style, setStyle] = useState('solid');
  const [busy, setBusy] = useState(false);
  const stage = useRef(null);
  const start = useRef(null);
  const { toast } = useFeedback();

  const point = (e) => {
    const r = stage.current.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  const down = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    stage.current.setPointerCapture?.(e.pointerId);
    start.current = point(e);
    setDraft({ ...start.current, w: 0, h: 0 });
  };
  const move = (e) => {
    if (!start.current) return;
    const p = point(e);
    const s = start.current;
    setDraft({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const up = () => {
    if (draft && draft.w > 0.8 && draft.h > 0.8) setBoxes((b) => [...b, draft]);
    start.current = null;
    setDraft(null);
  };

  const save = async () => {
    if (!boxes.length) return;
    setBusy(true);
    try {
      const r = await api(`/admin/media/${media.id}/redact`, { method: 'POST', body: { boxes, style } });
      toast('Details hidden. A covered copy was saved and is now used here.');
      onDone(r.item);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Hide details"
      size="xl"
      onClose={onCancel}
      closeOnBackdrop={false}
      footer={(
        <>
          <Button variant="ghost" icon="undo" onClick={() => setBoxes((b) => b.slice(0, -1))} disabled={!boxes.length}>Undo last box</Button>
          <span className="a-spacer" />
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon="shield" busy={busy} onClick={save} disabled={!boxes.length}>Save a covered copy</Button>
        </>
      )}
    >
      <p className="a-help-line">
        Drag across each part that must not be seen: the client’s name, address, PAN, GSTIN, registration number, QR code and signature.
        A new copy is saved with these parts covered for good. The original stays in the photo library until you delete it there.
      </p>
      <div className="a-redact__bar">
        <div className="a-seg" role="group" aria-label="How to cover">
          <button type="button" className={style === 'solid' ? 'is-on' : ''} onClick={() => setStyle('solid')}>Solid block</button>
          <button type="button" className={style === 'blur' ? 'is-on' : ''} onClick={() => setStyle('blur')}>Heavy blur</button>
        </div>
        <span className="a-muted a-small">{boxes.length ? `${boxes.length} part${boxes.length === 1 ? '' : 's'} covered` : 'No parts covered yet'}</span>
      </div>
      <div className="a-redact">
        <div
          className="a-redact__stage"
          ref={stage}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="application"
          aria-label="Drag over the details to hide"
        >
          <img src={mediaUrl(media, { width: 1600 })} alt="" draggable={false} />
          {[...boxes, ...(draft ? [draft] : [])].map((b, i) => (
            <span
              key={i}
              className={`a-redact__box a-redact__box--${style} ${i === boxes.length ? 'is-draft' : ''}`}
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            >
              {i < boxes.length && (
                <button type="button" aria-label="Remove this box" onPointerDown={(e) => e.stopPropagation()} onClick={() => setBoxes((all) => all.filter((_, k) => k !== i))}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </Modal>
  );
}
