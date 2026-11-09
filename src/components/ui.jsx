import { Link } from '../lib/router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { WhatsAppIcon } from './brand';
import { faqText } from '../content/home';

/** Opens an external chat in a new tab, with the attributes every WhatsApp link needs. */
export const ext = { target: '_blank', rel: 'noopener' };

export function Eyebrow({ children, tone, as: Tag = 'p' }) {
  return <Tag className={`eyebrow${tone ? ` eyebrow--${tone}` : ''}`}>{children}</Tag>;
}

/** Rounded label that sits above a centred section title. */
export function Badge({ children, icon: Icon, tone }) {
  return (
    <p className={`badge${tone ? ` badge--${tone}` : ''}`}>
      {Icon && <Icon size={13} strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </p>
  );
}

/** Centred section head, as on the original site: badge, title with an accented phrase, intro. */
export function SectionHead({ badge, icon, tone, id, a, b, after, body, as: Tag = 'h2', accent, children }) {
  return (
    <div className="shead" data-reveal>
      {badge && <Badge icon={icon} tone={tone}>{badge}</Badge>}
      <Tag id={id} className="shead__title">
        {a}
        {b && (
          <>
            {' '}
            <span className={`accent${accent ? ` accent--${accent}` : ''}`}>{b}</span>
          </>
        )}
        {after && <> {after}</>}
      </Tag>
      {body && <p className="shead__body">{body}</p>}
      {children}
    </div>
  );
}

/** Primary action: a rounded button with a leading icon (WhatsApp by default). */
export function Btn({ href, to, onClick, tone = 'blue', icon = 'wa', children, className = '', ...rest }) {
  const trailing = icon === 'arrow' || icon === 'up';
  const cls = `btn btn--${tone}${trailing ? ' btn--iconend' : ''} ${className}`;
  let glyph = icon;
  if (icon === 'wa') glyph = <WhatsAppIcon size={18} />;
  else if (icon === 'up') glyph = <ArrowUpRight size={18} strokeWidth={2} />;
  else if (icon === 'arrow') glyph = <ArrowRight size={18} strokeWidth={2} />;
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {glyph && <span className="btn__icon" aria-hidden="true">{glyph}</span>}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...ext} {...rest}>{inner}</a>;
  return <button type="button" onClick={onClick} className={cls} {...rest}>{inner}</button>;
}

export function TextLink({ href, to, children, tone, className = '' }) {
  const cls = `tlink${tone ? ` tlink--${tone}` : ''} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <a href={href} className={cls} {...ext}>{inner}</a>;
}

/** Section heading whose second phrase takes the accent colour. */
export function Heading({ a, b, as: Tag = 'h2', size = '3xl', id, accent = 'grad' }) {
  return (
    <Tag id={id} className={`h h--${size}`}>
      {a}
      {b && (
        <>
          {' '}
          <span className={`h__accent h__accent--${accent}`}>{b}</span>
        </>
      )}
    </Tag>
  );
}

export function FaqList({ items, tone }) {
  return (
    <div className={`faq${tone ? ` faq--${tone}` : ''}`}>
      {items.map((f, i) => (
        <details key={f.q} className="faq__item">
          <summary>
            <span className="faq__n">{String(i + 1).padStart(2, '0')}</span>
            <span className="faq__q">{f.q}</span>
            <span className="faq__sign" aria-hidden="true" />
          </summary>
          <div className="faq__a">
            <p>
              {Array.isArray(f.a)
                ? f.a.map(([t, bold], k) => (bold ? <strong key={k}>{t}</strong> : <span key={k}>{t}</span>))
                : faqText(f)}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}

/** Visible breadcrumb trail. Items are [label, path], the last without a path. */
export function Crumbs({ items, tone }) {
  return (
    <nav aria-label="Breadcrumb" className={`crumbs${tone ? ` crumbs--${tone}` : ''}`}>
      <ol>
        {items.map(([label, path], i) => (
          <li key={label}>
            {path && i < items.length - 1 ? <Link to={path}>{label}</Link> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Standard inner-page masthead. */
export function PageHead({ crumbs, eyebrow, title, titleB, body, children, tone = 'paper', meta }) {
  return (
    <header className={`phead phead--${tone}`}>
      <div className="wrap">
        <Crumbs items={crumbs} tone={tone === 'ink' ? 'inv' : undefined} />
        <div className="phead__grid">
          <div className="phead__main">
            {eyebrow && <Eyebrow tone={tone === 'ink' ? 'inv' : undefined}>{eyebrow}</Eyebrow>}
            <h1 className="h h--4xl">
              {title}
              {titleB && (
                <>
                  {' '}
                  <span className={`h__accent h__accent--${tone === 'ink' ? 'stamp' : 'grad'}`}>{titleB}</span>
                </>
              )}
            </h1>
          </div>
          {(body || children || meta) && (
            <div className="phead__side">
              {body && <p className="lede">{body}</p>}
              {meta && <p className="phead__meta">{meta}</p>}
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/** Direct, quotable summary placed above the fold on content pages. */
export function AnswerBox({ label = 'In short', children }) {
  return (
    <aside className="answer" aria-label={label}>
      <p className="answer__label">{label}</p>
      <p className="answer__text">{children}</p>
    </aside>
  );
}
