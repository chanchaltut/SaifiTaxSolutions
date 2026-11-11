import { ArrowRight, CalendarCheck, Check, CircleCheck, Clock, ShieldCheck } from 'lucide-react';
import { CardImage, SectionHead, ext } from './ui';
import { IMG } from '../content/cardImages';
import { dueDates, radar } from '../content/home';
import { useToday, monthMarks, monthName, upcoming, relativeDays } from '../hooks/useStatutory';

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
        <p className="cal__month">{today ? today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ' '}</p>
        <p className="cal__by">{radar.by}</p>
      </div>
      <div className="cal__week" aria-hidden="true">
        {WEEK.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="cal__grid">{today ? cells : null}</div>
    </div>
  );
}

const DUE_TONES = { tds: 'sky', gstr1: 'emerald', gstr3b: 'amber', itr: 'indigo' };

/** Upcoming due dates as four cards, as on the original site. The calendar page adds a live month sheet. */
export default function DueDatesSection({ headingTag = 'h2', calendar = false }) {
  const today = useToday();
  return (
    <section id="due-dates" className="section dues" aria-labelledby="due-title">
      <div className="wrap">
        <SectionHead
          as={headingTag}
          badge={dueDates.eyebrow}
          icon={CalendarCheck}
          tone="amber"
          id="due-title"
          a={dueDates.titleA}
          b={today ? monthName(today) : dueDates.fallbackMonth}
          after={dueDates.titleB}
          body={dueDates.body}
        />

        <ul className="dues__grid" data-reveal>
          {dueDates.items.map((d) => (
            <li key={d.id} className={`duecard card lift has-photo duecard--${DUE_TONES[d.id] || 'sky'}`}>
              <CardImage name={IMG.due[d.id] || 'calculator'} />
              <div className="duecard__top">
                <span className="duecard__tag">{d.tag}</span>
                <span className={`duecard__date${d.date.length > 5 ? ' duecard__date--text' : ''}`}>{d.date}</span>
              </div>
              <h3 className="duecard__title">{d.title}</h3>
              <p className="duecard__body">{d.body}</p>
              <a className="duecard__cta" href={d.href} {...ext}>
                {d.cta.replace(' →', '')}
                <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        {calendar && (
          <div className="dues__sheet" data-reveal>
            <MonthSheet today={today} />
          </div>
        )}
      </div>
    </section>
  );
}

/* The four radar cards in the original site's order and colours. */
const RADAR_ORDER = ['gstr1', 'gstr3b', 'tds', 'advance'];
const RADAR_STYLE = {
  gstr1: { tone: 'sky', Icon: CircleCheck },
  gstr3b: { tone: 'amber', Icon: Clock },
  tds: { tone: 'indigo', Icon: Check },
  advance: { tone: 'emerald', Icon: ShieldCheck },
};

/** Compliance Radar: key statutory deadlines, with the next one flagged live. */
export function ComplianceRadar({ headingTag: Tag = 'h2' }) {
  const today = useToday();
  const next = today ? upcoming(today)[0] : null;
  const items = RADAR_ORDER.map((id) => radar.items.find((r) => r.id === id)).filter(Boolean);

  return (
    <section id="compliance-radar" className="radar" aria-labelledby="radar-title">
      <div className="wrap">
        <div className="radar__head" data-reveal>
          <div>
            <Tag id="radar-title" className="radar__title">
              <CalendarCheck size={22} strokeWidth={2} aria-hidden="true" />
              {radar.title}
            </Tag>
            <p className="radar__sub">{radar.sub}</p>
          </div>
          <p className="radar__by">
            <span className="livedot" aria-hidden="true" />
            {radar.by}
          </p>
        </div>

        <ul className="radar__grid" data-reveal>
          {items.map((r) => {
            const { tone, Icon } = RADAR_STYLE[r.id];
            const isNext = next && next.item.id === r.id;
            return (
              <li key={r.id} className={`radarcard has-photo radarcard--${tone}${isNext ? ' is-next' : ''}`}>
                <CardImage name={IMG.radar[r.id] || 'calculator'} />
                <div className="radarcard__top">
                  <span className="radarcard__kicker">{r.kicker}</span>
                  {isNext && <span className="radarcard__next">{relativeDays(next.days)}</span>}
                </div>
                <h3 className="radarcard__title">{r.title}</h3>
                <p className="radarcard__when">{r.when}</p>
                <p className="radarcard__status">
                  <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
                  {r.status}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

