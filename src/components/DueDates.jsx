import { Eyebrow, ext } from './ui';
import { ArrowRight } from 'lucide-react';
import { dueDates, radar } from '../content/home';
import { useToday, monthMarks, monthName } from '../hooks/useStatutory';

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** A live month sheet with statutory dates marked. Appears after mount so it is never stale. */
function MonthSheet({ today }) {
  const year = today ? today.getFullYear() : 0;
  const month = today ? today.getMonth() : 0;
  const first = today ? new Date(year, month, 1) : null;
  const offset = first ? (first.getDay() + 6) % 7 : 0;
  const days = today ? new Date(year, month + 1, 0).getDate() : 0;
  const marks = today ? monthMarks(year, month) : {};

  const cells = [];
  for (let i = 0; i < offset; i += 1) cells.push(<span key={`pad-${i}`} className="cal__cell cal__cell--pad" />);
  for (let d = 1; d <= days; d += 1) {
    const mark = marks[d];
    const isToday = today && d === today.getDate();
    cells.push(
      <span
        key={d}
        className={`cal__cell${mark ? ' is-due' : ''}${isToday ? ' is-today' : ''}${isToday || (today && d > today.getDate()) ? '' : ' is-past'}`}
        title={mark ? mark.map((m) => m.title).join(', ') : undefined}
      >
        <span className="cal__num">{d}</span>
        {mark && <span className="cal__mark">{mark[0].title.split(' ')[0]}</span>}
      </span>,
    );
  }

  const tail = (7 - ((offset + days) % 7)) % 7;
  for (let i = 0; i < tail; i += 1) cells.push(<span key={`tail-${i}`} className="cal__cell cal__cell--pad" />);

  return (
    <div className="cal" aria-hidden={today ? undefined : 'true'}>
      <div className="cal__head">
        <p className="cal__month">{today ? today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ' '}</p>
        <p className="cal__by">{radar.by}</p>
      </div>
      <div className="cal__week" aria-hidden="true">
        {WEEK.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="cal__grid">{today ? cells : null}</div>
    </div>
  );
}

export default function DueDatesSection({ headingTag: Tag = 'h2' }) {
  const today = useToday();
  return (
    <section id="due-dates" className="section dues" aria-labelledby="due-title">
      <div className="wrap">
        <div className="dues__grid">
          <div className="dues__left" data-reveal>
            <Eyebrow>{dueDates.eyebrow}</Eyebrow>
            <Tag id="due-title" className="h h--3xl">
              {dueDates.titleA}{' '}
              <span className="h__accent h__accent--grad">{today ? monthName(today) : dueDates.fallbackMonth}</span>{' '}
              {dueDates.titleB}
            </Tag>
            <p className="lede">{dueDates.body}</p>
            <MonthSheet today={today} />
          </div>

          <ul className="dues__list" data-reveal>
            {dueDates.items.map((d) => (
              <li key={d.id} className="dueitem">
                <div className="dueitem__date">
                  <span className="dueitem__tag">{d.tag}</span>
                  <span className={`dueitem__num${d.date.length > 5 ? ' dueitem__num--text' : ''}`}>{d.date}</span>
                </div>
                <div className="dueitem__main">
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                  <a href={d.href} {...ext}>
                    {d.cta.replace(' →', '')}
                    <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The original four-card Compliance Radar, used where the hero panel is not present. */
export function RadarStrip() {
  return (
    <section className="radarstrip" aria-labelledby="radarstrip-title">
      <div className="wrap">
        <div className="radarstrip__head">
          <h2 id="radarstrip-title" className="h h--xl">{radar.title}</h2>
          <p>{radar.sub}</p>
          <p className="radarstrip__by">{radar.by}</p>
        </div>
        <ul className="radarstrip__grid">
          {radar.items.map((r) => (
            <li key={r.id}>
              <p className="radarstrip__kicker">{r.kicker}</p>
              <h3>{r.title}</h3>
              <p className="radarstrip__when">{r.when}</p>
              <p className="radarstrip__status">{r.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
