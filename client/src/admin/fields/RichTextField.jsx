// ─────────────────────────────────────────────────────────────
// The article editor. Works like a simple word processor:
// headings, bold, lists, links, tables, note boxes and photos.
//
// Photos come from the photo library (so they are WebP, sized for
// every screen and cropped without losing the original). Pictures
// pasted from other websites are left out: they break when that
// site moves them. The server cleans everything again on save.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { mediaUrl } from '../images';
import { Button, Icon, Modal, useFeedback } from '../ui';
import ImageEditor from './ImageEditor';
import MediaPicker from './MediaPicker';

const attr = (name, fallback = null) => ({
  default: fallback,
  parseHTML: (el) => el.getAttribute(name) ?? fallback,
  renderHTML: (a) => (a[name] ? { [name]: a[name] } : {}),
});

/** A library photo inside an article: remembers which photo, its crop and its size. */
const LibraryImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-media': attr('data-media'),
      'data-crop': attr('data-crop'),
      'data-size': attr('data-size', 'full'),
    };
  },
}).configure({ inline: false, allowBase64: false });

const isEmptyHtml = (html) => !html || /^(<p>\s*<\/p>)*$/.test(html.trim());

/** Turn the crop "x,y,w,h" string into the object the crop tool uses, and back. */
const cropFrom = (s) => {
  const p = String(s || '').split(',').map(Number);
  return p.length === 4 && p.every(Number.isFinite) ? { x: p[0], y: p[1], w: p[2], h: p[3] } : null;
};
const cropTo = (c) => (c ? [c.x, c.y, c.w, c.h].map((n) => Math.round(n * 1000) / 1000).join(',') : null);

function Tool({ icon, label, active, onClick, disabled, text }) {
  return (
    <button
      type="button"
      className={`a-rt__tool ${active ? 'is-active' : ''} ${text ? 'a-rt__tool--text' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={active ?? undefined}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon ? <Icon name={icon} size={18} /> : text}
    </button>
  );
}

function LinkDialog({ initial, onClose, onSave }) {
  const [href, setHref] = useState(initial || '');
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); }, []);
  const clean = href.trim();
  const valid = !clean || /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(clean) || /^[\w-]+(\.[\w-]+)+/.test(clean);
  const save = () => {
    if (!valid) return;
    onSave(!clean ? '' : /^[\w-]+(\.[\w-]+)+/.test(clean) && !/^(https?:|mailto:|tel:|\/|#)/i.test(clean) ? `https://${clean}` : clean);
  };
  return (
    <Modal
      title="Link"
      size="sm"
      onClose={onClose}
      footer={(
        <>
          {initial && <Button variant="ghost" icon="trash" onClick={() => onSave('')}>Remove link</Button>}
          <span className="a-spacer" />
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={save} disabled={!valid}>Use this link</Button>
        </>
      )}
    >
      <label className="a-field">
        <span className="a-field__label">Web address or page of this site</span>
        <input ref={input} className="a-input" value={href} placeholder="https://… or /services/gst/" onChange={(e) => setHref(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } }} />
        {!valid && <p className="a-field__error">Start with https://, or a page of this site starting with /</p>}
        <p className="a-field__help">Links to other websites open in a new tab.</p>
      </label>
    </Modal>
  );
}

function Preview({ html, onClose }) {
  return (
    <Modal title="Preview" size="xl" onClose={onClose}>
      <p className="a-muted a-small">Roughly how the article reads on the website. The website adds the headline, summary, “On this page” list and WhatsApp box around it.</p>
      <div className="a-preview">
        {/* The same HTML that will be saved; the server cleans it again. */}
        <div className="a-preview__prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Modal>
  );
}

export default function RichTextField({ f, value, onChange, error, media = {}, onMedia, required }) {
  const { toast } = useFeedback();
  const [picker, setPicker] = useState(false);
  const [cropping, setCropping] = useState(null);
  const [linking, setLinking] = useState(null);
  const [preview, setPreview] = useState(false);
  const last = useRef(value || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: null, target: null } },
      }),
      LibraryImage,
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: 'Start writing here. Use “Heading” for each main section.' }),
      CharacterCount,
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'a-rt__doc', 'aria-label': f.label, role: 'textbox', 'aria-multiline': 'true' },
      // Pictures copied from other websites or documents are not kept (they break later).
      transformPastedHTML: (html) => {
        if (/<img\b/i.test(html) && !/data-media=/.test(html)) {
          setTimeout(() => toast('Pictures pasted from other places are left out. Add photos with the Photo button.', 'info'), 0);
        }
        return html.replace(/<img\b(?![^>]*data-media=)[^>]*>/gi, '');
      },
      handleDrop: (view, event) => {
        if (event.dataTransfer?.files?.length) {
          event.preventDefault();
          toast('To add a photo, use the Photo button. It makes the photo web-ready first.', 'info');
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const out = isEmptyHtml(html) ? '' : html;
      last.current = out;
      onChange(out);
    },
  });

  // Loading a different saved version (e.g. after "Load their version").
  useEffect(() => {
    if (editor && (value || '') !== last.current) {
      last.current = value || '';
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => (ed ? {
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      underline: ed.isActive('underline'),
      strike: ed.isActive('strike'),
      h2: ed.isActive('heading', { level: 2 }),
      h3: ed.isActive('heading', { level: 3 }),
      h4: ed.isActive('heading', { level: 4 }),
      bullet: ed.isActive('bulletList'),
      ordered: ed.isActive('orderedList'),
      quote: ed.isActive('blockquote'),
      link: ed.isActive('link'),
      table: ed.isActive('table'),
      image: ed.isActive('image') ? ed.getAttributes('image') : null,
      canUndo: ed.can().undo(),
      canRedo: ed.can().redo(),
      words: ed.storage.characterCount?.words?.() || 0,
    } : null),
  });

  if (!editor || !state) return null;
  const chain = () => editor.chain().focus();
  const block = state.h2 ? 'h2' : state.h3 ? 'h3' : state.h4 ? 'h4' : 'p';
  const setBlock = (v) => {
    if (v === 'p') chain().setParagraph().run();
    else chain().toggleHeading({ level: Number(v.slice(1)) }).run();
  };

  const insertPhoto = (m, crop) => {
    onMedia?.({ [m.id]: m });
    chain().setImage({
      src: mediaUrl(m, { crop, width: 1200 }),
      alt: m.alt || '',
      'data-media': m.id,
      'data-crop': cropTo(crop),
      'data-size': 'full',
    }).run();
  };

  const img = state.image;
  const imgMedia = img?.['data-media'] ? media[img['data-media']] : null;
  const updateImage = (patch) => chain().updateAttributes('image', patch).run();
  const minutes = Math.max(1, Math.round(state.words / 200));

  return (
    <div className={`a-field a-rt ${error ? 'has-error' : ''}`}>
      <div className="a-field__top">
        <span className="a-field__label">{f.label}{required && <span className="a-req"> *</span>}</span>
        <span className="a-muted a-small">{state.words} words · about {minutes} min read</span>
      </div>

      <div className="a-rt__frame">
        <div className="a-rt__bar" role="toolbar" aria-label="Formatting">
          <select className="a-rt__block" value={block} onChange={(e) => setBlock(e.target.value)} aria-label="Text style" onMouseDown={(e) => e.stopPropagation()}>
            <option value="p">Normal text</option>
            <option value="h2">Heading</option>
            <option value="h3">Sub-heading</option>
            <option value="h4">Small heading</option>
          </select>
          <span className="a-rt__sep" />
          <Tool text={<b>B</b>} label="Bold (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()} />
          <Tool text={<i>I</i>} label="Italic (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()} />
          <Tool text={<u>U</u>} label="Underline (Ctrl+U)" active={state.underline} onClick={() => chain().toggleUnderline().run()} />
          <Tool text={<s>S</s>} label="Strike through" active={state.strike} onClick={() => chain().toggleStrike().run()} />
          <span className="a-rt__sep" />
          <Tool icon="list" label="Bullet list" active={state.bullet} onClick={() => chain().toggleBulletList().run()} />
          <Tool icon="list-ol" label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()} />
          <Tool icon="quote" label="Note box (for tips and warnings)" active={state.quote} onClick={() => chain().toggleBlockquote().run()} />
          <span className="a-rt__sep" />
          <Tool icon="link" label="Link" active={state.link} onClick={() => setLinking(editor.getAttributes('link').href || '')} />
          <Tool icon="image" label="Photo" onClick={() => setPicker(true)} />
          <Tool icon="table" label="Table" active={state.table} onClick={() => chain().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()} disabled={state.table} />
          <Tool icon="minus" label="Divider line" onClick={() => chain().setHorizontalRule().run()} />
          <span className="a-rt__sep" />
          <Tool icon="undo" label="Undo (Ctrl+Z)" onClick={() => chain().undo().run()} disabled={!state.canUndo} />
          <Tool icon="redo" label="Redo (Ctrl+Y)" onClick={() => chain().redo().run()} disabled={!state.canRedo} />
          <Tool icon="eraser" label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
          <span className="a-spacer" />
          <Button size="sm" icon="eye" onClick={() => setPreview(true)}>Preview</Button>
        </div>

        {state.table && (
          <div className="a-rt__ctx" role="toolbar" aria-label="Table">
            <span className="a-rt__ctxlabel"><Icon name="table" size={16} /> Table</span>
            <Button size="sm" onClick={() => chain().addRowAfter().run()}>+ Row</Button>
            <Button size="sm" onClick={() => chain().addColumnAfter().run()}>+ Column</Button>
            <Button size="sm" variant="ghost" onClick={() => chain().deleteRow().run()}>Remove row</Button>
            <Button size="sm" variant="ghost" onClick={() => chain().deleteColumn().run()}>Remove column</Button>
            <Button size="sm" variant="ghost" onClick={() => chain().toggleHeaderRow().run()}>Header row on/off</Button>
            <span className="a-spacer" />
            <Button size="sm" variant="ghost" icon="trash" onClick={() => chain().deleteTable().run()}>Delete table</Button>
          </div>
        )}

        {img && (
          <div className="a-rt__ctx" role="toolbar" aria-label="Photo">
            <span className="a-rt__ctxlabel"><Icon name="image" size={16} /> Photo</span>
            <div className="a-seg" role="group" aria-label="Photo size">
              {[['full', 'Full width'], ['medium', 'Medium'], ['small', 'Small']].map(([v, l]) => (
                <button key={v} type="button" className={(img['data-size'] || 'full') === v ? 'is-on' : ''} onClick={() => updateImage({ 'data-size': v })}>{l}</button>
              ))}
            </div>
            <input
              className="a-input a-input--sm a-rt__alt"
              value={img.alt || ''}
              maxLength={200}
              placeholder="Describe the photo (for blind visitors and Google)"
              onChange={(e) => editor.commands.updateAttributes('image', { alt: e.target.value })}
              aria-label="Photo description"
            />
            {imgMedia && <Button size="sm" icon="crop" onClick={() => setCropping({ media: imgMedia, crop: cropFrom(img['data-crop']) })}>Crop</Button>}
            <Button size="sm" variant="ghost" icon="trash" onClick={() => chain().deleteSelection().run()}>Remove</Button>
          </div>
        )}

        <EditorContent editor={editor} className="a-rt__body" />
      </div>

      {error ? <p className="a-field__error"><Icon name="alert" size={14} />{error}</p> : f.help && <p className="a-field__help">{f.help}</p>}

      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onPick={(m) => { setPicker(false); setCropping({ media: m, crop: null, insert: true }); }}
        />
      )}
      {cropping && (
        <ImageEditor
          value={{ media: cropping.media.id, crop: cropping.crop }}
          media={cropping.media}
          aspectKey="any"
          cropOnly
          saveLabel={cropping.insert ? 'Add to the article' : 'Use this'}
          onCancel={() => setCropping(null)}
          onSave={({ crop }) => {
            if (cropping.insert) insertPhoto(cropping.media, crop);
            else {
              onMedia?.({ [cropping.media.id]: cropping.media });
              updateImage({ 'data-crop': cropTo(crop), src: mediaUrl(cropping.media, { crop, width: 1200 }) });
            }
            setCropping(null);
          }}
        />
      )}
      {linking !== null && (
        <LinkDialog
          initial={linking}
          onClose={() => setLinking(null)}
          onSave={(href) => {
            setLinking(null);
            if (!href) chain().extendMarkRange('link').unsetLink().run();
            else if (editor.state.selection.empty && !state.link) chain().insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run();
            else chain().extendMarkRange('link').setLink({ href }).run();
          }}
        />
      )}
      {preview && <Preview html={editor.getHTML()} onClose={() => setPreview(false)} />}
    </div>
  );
}
