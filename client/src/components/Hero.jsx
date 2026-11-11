import { Calculator, ShieldCheck } from 'lucide-react';
import { Btn } from './ui';
import { hero, ticker, stats } from '../content/home';

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

const STAT_TONES = ['sky', 'emerald', 'amber', 'indigo'];

export function Stats() {
  return (
    <dl className="stats">
      {stats.map((s, i) => (
        <div key={s.label} className={`stats__cell stats__cell--${STAT_TONES[i % STAT_TONES.length]}`}>
          <dt className="stats__label">{s.label}</dt>
          <dd className="stats__value">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatBand() {
  return (
    <section className="statband" aria-label="Saifi Tax Solutions in numbers">
      <div className="wrap" data-reveal>
        <Stats />
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="wrap hero__inner">
        <p className="hero__eyebrow">
          <ShieldCheck size={14} strokeWidth={2.25} aria-hidden="true" />
          {hero.eyebrow}
        </p>
        <h1 id="hero-title" className="hero__title">
          <span>{hero.titleA}</span>{' '}
          <span className="hero__titleb">{hero.titleB}</span>
        </h1>
        <p className="hero__body">{hero.body}</p>
        <div className="hero__actions">
          <Btn href={hero.primary.href} tone="white">{hero.primary.label}</Btn>
          <Btn to={hero.secondary.to} tone="ghost" icon={<Calculator size={17} strokeWidth={2} />}>
            {hero.secondary.label}
          </Btn>
        </div>
      </div>
    </section>
  );
}
