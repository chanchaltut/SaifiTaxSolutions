// ─────────────────────────────────────────────────────────────
// Crop & focus point. Nothing is cut from the stored photo, so it
// can always be changed again later.
//
// 1. Crop: cut away what shouldn't be seen at all. "Auto crop" fits the
//    chosen shape around the most interesting part of the photo, found
//    when it was uploaded. "Keep the whole photo" is fine for most.
// 2. Focus point: the most important spot (usually a face or the
//    document's title). The website fills frames of different shapes
//    on phones and computers, and the focus point always stays in view.
//    "Auto" uses the spot found on upload.
// ─────────────────────────────────────────────────────────────

import { useMemo, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useSchema } from '../schema';
import { mediaUrl } from '../images';
import { Button, Icon, Modal } from '../ui';

const SHAPES = ['banner', 'wide', 'card', 'photo', 'square', 'portrait', 'document'];

const PRESETS = [
  ['Top left', 0, 0], ['Top', 50, 0], ['Top right', 100, 0],
  ['Left', 0, 50], ['Centre', 50, 50], ['Right', 100, 50],
  ['Bottom left', 0, 100], ['Bottom', 50, 100], ['Bottom right', 100, 100],
];

const PREVIEWS = [
  ['Wide (computer)', 16 / 9],
  ['Card', 16 / 10],
  ['Square', 1],
  ['Tall (phone)', 3 / 4],
];

const round = (n) => Math.round(n * 1000) / 1000;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function initialShape(value, media, aspects, recommended) {
  if (!value?.crop || !media) return 'whole';
  const r = (value.crop.w * media.width) / (value.crop.h * media.height);
  const hit = SHAPES.find((k) => Math.abs(aspects[k].ratio - r) / r < 0.02);
  return hit || 'free';
}

/** The biggest crop of this shape that fits the photo, centred on the photo's most interesting spot. */
function autoCrop(media, ratio) {
  const W = media.width; const H = media.height;
  const f = media.auto || { x: 50, y: 50 };
  let cw = W; let ch = W / ratio;
  if (ch > H) { ch = H; cw = H * ratio; }
  const x = clamp((f.x / 100) * W - cw / 2, 0, W - cw);
  const y = clamp((f.y / 100) * H - ch / 2, 0, H - ch);
  return { x: round((x / W) * 100), y: round((y / H) * 100), w: round((cw / W) * 100), h: round((ch / H) * 100) };
}

/** Where the photo's interesting spot lands inside a crop (for the focus point after cropping). */
function focalInside(media, crop) {
  const f = media?.auto;
  if (!f) return { x: 50, y: 50 };
  if (!crop) return { x: f.x, y: f.y };
  return { x: Math.round(clamp(((f.x - crop.x) / crop.w) * 100, 0, 100)), y: Math.round(clamp(((f.y - crop.y) / crop.h) * 100, 0, 100)) };
}

export default function ImageEditor({ value, media, aspectKey, onCancel, onSave, cropOnly = false, saveLabel = 'Use this' }) {
  const { aspects } = useSchema();
  const canCrop = Boolean(media);
  const [tab, setTab] = useState(canCrop ? 'crop' : 'focus');
  const [shape, setShape] = useState(() => initialShape(value, media, aspects, aspectKey));
  const [crop, setCrop] = useState(value?.crop || null);
  const [initial, setInitial] = useState(value?.crop || null);
  const [stamp, setStamp] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [focal, setFocal] = useState(value?.focal || focalInside(media, value?.crop));
  const focusBox = useRef(null);

  const shapes = useMemo(() => {
    const list = SHAPES.filter((k) => k !== aspectKey && aspects[k]);
    return aspectKey !== 'any' && aspects[aspectKey]?.ratio ? [aspectKey, ...list] : list;
  }, [aspectKey, aspects]);

  const full = media ? mediaUrl(media, { width: 1600 }) : value?.src;
  const cropped = media ? mediaUrl(media, { crop: shape === 'whole' ? null : crop, width: 1200 }) : value?.src;
  const ratioOf = (k) => (k === 'free' ? (crop ? (crop.w * media.width) / (crop.h * media.height) : 4 / 3) : aspects[k]?.ratio);

  const pickShape = (k, { auto = false } = {}) => {
    setShape(k);
    setZoom(1);
    setPos({ x: 0, y: 0 });
    if (k === 'whole') { setCrop(null); setInitial(null); return; }
    // A new shape starts as the auto crop, so it is never a blind guess.
    const c = auto || !crop ? autoCrop(media, ratioOf(k)) : null;
    setInitial(c);
    if (c) setCrop(c);
    setStamp((n) => n + 1);
  };

  const runAutoCrop = () => {
    const k = shape === 'whole' || shape === 'free' ? (aspectKey !== 'any' && aspects[aspectKey]?.ratio ? aspectKey : 'card') : shape;
    setShape(k);
    const c = autoCrop(media, aspects[k].ratio);
    setInitial(c);
    setCrop(c);
    setZoom(1);
    setStamp((n) => n + 1);
  };

  const setFocalFromEvent = (e) => {
    const rect = focusBox.current.getBoundingClientRect();
    const pt = e.touches?.[0] || e;
    const x = clamp(((pt.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((pt.clientY - rect.top) / rect.height) * 100, 0, 100);
    setFocal({ x: Math.round(x), y: Math.round(y) });
  };

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setFocal((f) => ({ x: clamp(f.x + d[0], 0, 100), y: clamp(f.y + d[1], 0, 100) }));
  };

  const finalCrop = shape === 'whole' ? null : crop;
  const save = () => onSave({ crop: finalCrop, focal });
  const goFocus = () => {
    // After cropping, start the focus point on the interesting spot inside the crop.
    if (!value?.focal) setFocal(focalInside(media, finalCrop));
    setTab('focus');
  };

  const autoFocal = media?.auto ? focalInside(media, finalCrop) : null;
  const showCrop = tab === 'crop' && canCrop;

  return (
    <Modal
      title={cropOnly ? 'Crop photo' : 'Adjust photo'}
      size="xl"
      onClose={onCancel}
      closeOnBackdrop={false}
      footer={(
        <>
          <Button variant="ghost" onClick={() => { pickShape('whole'); setFocal({ x: 50, y: 50 }); }}>Reset</Button>
          <span className="a-spacer" />
          <Button onClick={onCancel}>Cancel</Button>
          {showCrop && !cropOnly
            ? <Button variant="primary" icon="target" onClick={goFocus}>Next: focus point</Button>
            : <Button variant="primary" icon="check" onClick={save}>{saveLabel}</Button>}
        </>
      )}
    >
      {!cropOnly && (
        <div className="a-tabs" role="tablist">
          {canCrop && (
            <button type="button" role="tab" aria-selected={tab === 'crop'} className={tab === 'crop' ? 'is-active' : ''} onClick={() => setTab('crop')}>
              <Icon name="crop" size={18} /> 1. Crop <span className="a-muted">(optional)</span>
            </button>
          )}
          <button type="button" role="tab" aria-selected={tab === 'focus'} className={tab === 'focus' ? 'is-active' : ''} onClick={goFocus}>
            <Icon name="target" size={18} /> {canCrop ? '2. ' : ''}Focus point
          </button>
        </div>
      )}

      {(showCrop || (cropOnly && canCrop)) && (
        <div className="a-crop">
          <p className="a-help-line">
            {cropOnly
              ? 'Cut away anything that should not be seen. Keep the whole photo if it is fine as it is.'
              : 'Cut away anything that should never be seen. If the whole photo is fine, keep it whole: the website fits it to every screen by itself.'}
          </p>
          <div className="a-chips">
            <button type="button" className={`a-chip ${shape === 'whole' ? 'is-active' : ''}`} onClick={() => pickShape('whole')}>Keep the whole photo</button>
            {shapes.map((k) => (
              <button type="button" key={k} className={`a-chip ${shape === k ? 'is-active' : ''}`} onClick={() => pickShape(k)}>
                {aspects[k].label}{k === aspectKey && <span className="a-chip__tag">Recommended</span>}
              </button>
            ))}
            {media && (
              <button type="button" className="a-chip a-chip--auto" onClick={runAutoCrop} title="Fit the shape around the most interesting part of the photo">
                <Icon name="sparkle" size={15} /> Auto crop
              </button>
            )}
          </div>
          <div className="a-crop__stage">
            {shape === 'whole' ? (
              <img src={full} alt="" className="a-crop__whole" />
            ) : (
              <Cropper
                key={`${shape}-${stamp}`}
                image={full}
                crop={pos}
                zoom={zoom}
                aspect={ratioOf(shape)}
                maxZoom={5}
                onCropChange={setPos}
                onZoomChange={setZoom}
                onCropComplete={(area) => setCrop({ x: round(area.x), y: round(area.y), w: round(area.width), h: round(area.height) })}
                initialCroppedAreaPercentages={initial ? { x: initial.x, y: initial.y, width: initial.w, height: initial.h } : undefined}
                showGrid
                objectFit="contain"
              />
            )}
          </div>
          {shape !== 'whole' && (
            <label className="a-zoom">
              <Icon name="search" size={18} />
              <span>Zoom</span>
              <input type="range" min={1} max={5} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </label>
          )}
          {shape !== 'whole' && <p className="a-muted a-small">Drag the photo to move it inside the frame. Pinch or use the slider to zoom.</p>}
        </div>
      )}

      {tab === 'focus' && !cropOnly && (
        <div className="a-focus">
          <div className="a-focus__left">
            <p className="a-help-line">Tap the most important part of the photo. It stays visible on every screen.</p>
            <div
              className="a-focus__box"
              ref={focusBox}
              role="slider"
              tabIndex={0}
              aria-label="Focus point. Use the arrow keys to move it."
              aria-valuetext={`${focal.x}% across, ${focal.y}% down`}
              onClick={setFocalFromEvent}
              onKeyDown={onKey}
            >
              <img src={cropped} alt="" draggable={false} />
              <span className="a-focal-dot a-focal-dot--lg" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
            </div>
            <div className="a-presets" role="group" aria-label="Quick positions">
              {PRESETS.map(([label, x, y]) => (
                <button type="button" key={label} className={focal.x === x && focal.y === y ? 'is-active' : ''} onClick={() => setFocal({ x, y })} title={label} aria-label={label}>
                  <span />
                </button>
              ))}
              <p className="a-muted a-small">Quick positions</p>
            </div>
            {autoFocal && (
              <Button size="sm" icon="sparkle" onClick={() => setFocal(autoFocal)} className={focal.x === autoFocal.x && focal.y === autoFocal.y ? 'is-active' : ''}>
                Auto focus (most interesting spot)
              </Button>
            )}
          </div>
          <div className="a-focus__right">
            <p className="a-focus__title">How it will look</p>
            <div className="a-previews">
              {PREVIEWS.map(([label, r]) => (
                <figure key={label}>
                  <div style={{ aspectRatio: String(r) }}><img src={cropped} alt="" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} /></div>
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
