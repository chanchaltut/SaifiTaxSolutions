import { Btn, Eyebrow, TextLink } from './ui';
import { hero, radar, dueDates, ticker, stats } from '../content/home';
import { itemEnquiry } from '../content/services';
import { wa } from '../content/site';
import { useToday, upcoming, relativeDays, ordinal } from '../hooks/useStatutory';

const ctaFor = (id) => {
  const due = dueDates.items.find((d) => d.id === id);
  if (due) return { label: due.cta.replace(' →', ''), href: due.href };
  return { label: 'Advance Tax Computation', href: wa(itemEnquiry('Advance Tax Computation')) };
};

/** The live statutory panel: next deadline first, then the full radar. */
function RadarPanel() {
  const today = useToday();
  const list = today ? upcoming(today) : null;
  const next = list ? list[0] : null;
  const cta = next ? ctaFor(next.item.id) : null;

  return (
    <aside className="radar" aria-labelledby="radar-title">
      <div className="radar__head">
        <h2 id="radar-title" className="radar__title">{radar.title}</h2>
        <p className="radar__sub">{radar.sub}</p>
      </div>

      <div className={`radar__next${next ? ' is-live' : ''}`}>
        {next && (
          <>
            <p className="radar__due">{relativeDays(next.days)}</p>
            <p className="radar__date">{ordinal(next.date.getDate())}</p>
            <div className="radar__nextrow">
              <div>
                <p className="radar__nexttitle">{next.item.title}</p>
                <p className="radar__nextstatus">{next.item.status}</p>
              </div>
              <a className="radar__cta" href={cta.href} target="_blank" rel="noopener">{cta.label} →</a>
            </div>
          </>
        )}
      </div>

      <ul className="radar__list">
        {radar.items.map((item) => (
          <li key={item.id} className={next && next.item.id === item.id ? 'is-next' : ''}>
            <span className="radar__day">{String(item.day).padStart(2, '0')}</span>
            <span className="radar__rowmain">
              <span className="radar__kicker">{item.kicker}</span>
              <span className="radar__rowtitle">{item.title}</span>
            </span>
            <span className="radar__when">{item.when}</span>
          </li>
        ))}
      </ul>

      <p className="radar__by">
        <span className="livedot" aria-hidden="true" />
        {radar.by}
      </p>
    </aside>
  );
}

export function Ticker() {
  const set = (hidden) => (
    <div className="ticker__set" aria-hidden={hidden || undefined}>
      {ticker.map((t) => (
        <span key={t} className="ticker__item">{t}</span>
      ))}
    </div>
  );
  return (
    <div className="ticker" tabIndex={0} role="region" aria-label="Our services">
      <div className="ticker__track">
        {set(false)}
        {set(true)}
      </div>
    </div>
  );
}

export function Stats({ tone }) {
  return (
    <dl className={`stats${tone ? ` stats--${tone}` : ''}`}>
      {stats.map((s) => (
        <div key={s.label} className="stats__cell">
          <dt className="stats__label">{s.label}</dt>
          <dd className="stats__value">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__main">
        <div className="hero__copy">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-title" className="hero__title">
            <span>{hero.titleA}</span>{' '}
            <span className="hero__titleb">{hero.titleB}</span>
          </h1>
          <p className="hero__body">{hero.body}</p>
          <div className="hero__actions">
            <Btn href={hero.primary.href}>{hero.primary.label}</Btn>
            <TextLink to={hero.secondary.to}>{hero.secondary.label}</TextLink>
          </div>
        </div>
      </div>
      <RadarPanel />
    </section>
  );
}
