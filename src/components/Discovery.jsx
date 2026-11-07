import { useState } from 'react';
import { Btn, Eyebrow } from './ui';
import { discovery } from '../content/home';
import { wa } from '../content/site';

/** Setup Engine: choose a business model, get its statutory requirements. */
export default function Discovery() {
  const [active, setActive] = useState(0);

  return (
    <section id="wizard" className="section discovery" aria-labelledby="wizard-title">
      <div className="wrap">
        <div className="split">
          <div className="split__head" data-reveal>
            <Eyebrow>{discovery.eyebrow}</Eyebrow>
            <h2 id="wizard-title" className="h h--3xl">{discovery.title}</h2>
            <p className="lede">{discovery.body}</p>
          </div>

          <div className="discovery__sheet" data-reveal>
            <div className="discovery__tabs" role="tablist" aria-label="Enterprise model">
              {discovery.profiles.map((p, i) => (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  id={`disc-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls={`disc-panel-${i}`}
                  className={`discovery__tab${i === active ? ' is-active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <span className="discovery__label">{p.label}</span>
                  <span className="discovery__sub">{p.sub}</span>
                </button>
              ))}
            </div>

            {discovery.profiles.map((p, i) => (
              <div
                key={p.key}
                id={`disc-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`disc-tab-${i}`}
                className="discovery__panel"
                hidden={i !== active}
              >
                <div className="discovery__panelhead">
                  <h3>Checklist for: {p.key}</h3>
                  <p>{p.count}</p>
                </div>
                <ol className="discovery__list">
                  {p.items.map((item, k) => (
                    <li key={item.title}>
                      <span className="discovery__n">{String(k + 1).padStart(2, '0')}</span>
                      <span className="discovery__item">
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </span>
                      <span className="discovery__tag">{item.tag}</span>
                    </li>
                  ))}
                </ol>
                <div className="discovery__foot">
                  <p>{discovery.footer}</p>
                  <Btn href={wa(`Hi, I checked your compliance engine for ${p.key}.`)}>{discovery.cta}</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
