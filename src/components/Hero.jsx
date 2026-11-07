import { ShieldCheck } from 'lucide-react';
import { Btn } from './ui';
import { hero, radar, dueDates, ticker, stats } from '../content/home';
import { itemEnquiry } from '../content/services';
import { wa } from '../content/site';
import { useToday, upcoming, relativeDays, ordinal, monthMarks } from '../hooks/useStatutory';

const ctaFor = (id) => {
  const due = dueDates.items.find((d) => d.id === id);
  if (due) return { label: due.cta.replace(' →', ''), href: due.href };
  return { label: 'Advance Tax Computation', href: wa(itemEnquiry('Advance Tax Computation')) };
};

/** Every day of the month on one strip, with statutory dates lit. */
function MonthRibbon({ today }) {
  if (!today) return <div className="ribbon" aria-hidden="true" />;
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const marks = monthMarks(year, month);
  return (
    <div className="ribbon" style={{ '--days': days }} aria-hidden="true">
      {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
        const past = d < today.getDate();
        const cls = `ribbon__day${marks[d] ? ' is-due' : ''}${past ? ' is-past' : ''}${d === today.getDate() ? ' is-today' : ''}`;
        return (
          <span key={d} className={cls} title={marks[d] ? marks[d].map((m) => m.title).join(', ') : undefined}>
            {d}
          </span>
        );
      })}
    </div>
  );
}

/** The live compliance console: next deadline first, then the full radar. */
function RadarPanel() {
  const today = useToday();
  const list = today ? upcoming(today) : null;
  const next = list ? list[0] : null;
  const cta = next ? ctaFor(next.item.id) : null;

  return (
    <div className="radarwrap">
      <aside className="radar" aria-labelledby="radar-title">
        <div className="radar__in">
          <div className="radar__head">
            <h2 id="radar-title" className="radar__title">{radar.title}</h2>
            <p className="radar__sub">{radar.sub}</p>
            <p className="radar__by">
              <span className="livedot" aria-hidden="true" />
              {radar.by}
            </p>
          </div>

          <div className="radar__body">
            <div className={`radar__next${next ? ' is-live' : ''}`}>
              {next && (
                <div className="radar__nextin">
                  <p className="radar__due">{relativeDays(next.days)}</p>
                  <p className="radar__date">{ordinal(next.date.getDate())}</p>
                  <div className="radar__nextrow">
                    <div>
                      <p className="radar__nexttitle">{next.item.title}</p>
                      <p className="radar__nextstatus">{next.item.status}</p>
                    </div>
                    <a className="radar__cta" href={cta.href} target="_blank" rel="noopener">{cta.label} →</a>
                  </div>
                </div>
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
          </div>

          <MonthRibbon today={today} />
        </div>
      </aside>
    </div>
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
      <div className="hero__glow" aria-hidden="true" />
      <div className="wrap hero__inner">
        <p className="hero__eyebrow">
          <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
          {hero.eyebrow}
        </p>
        <h1 id="hero-title" className="hero__title">
          <span>{hero.titleA}</span>{' '}
          <span className="hero__titleb">{hero.titleB}</span>
        </h1>
        <p className="hero__body">{hero.body}</p>
        <div className="hero__actions">
          <Btn href={hero.primary.href} tone="white">{hero.primary.label}</Btn>
          <Btn to={hero.secondary.to} tone="ghost" icon="arrow">{hero.secondary.label}</Btn>
        </div>
      </div>
      <div className="wrap">
        <RadarPanel />
      </div>
    </section>
  );
}
