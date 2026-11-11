import { useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  ChevronDown,
  CircleCheck,
  FileText,
  Landmark,
  Percent,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  Ship,
  Store,
  Utensils,
  X,
} from 'lucide-react';
import { WhatsAppIcon } from './brand';
import { CardImage, SectionHead, ext } from './ui';
import { IMG } from '../content/cardImages';
import { categories, categoryEnquiry, itemEnquiry, notFoundEnquiry, SERVICE_META_LINE, SERVICE_NOTE } from '../content/services';
import { wa } from '../content/site';

const ICONS = {
  gst: Receipt,
  itr: FileText,
  tds: Percent,
  legal: Scale,
  pf: ShieldCheck,
  inc: Building2,
  mca: Landmark,
  ie: Ship,
  acc: BookOpen,
  msme: Store,
  fssai: Utensils,
};

export function CategoryIcon({ cat, size = 19 }) {
  const Icon = ICONS[cat];
  if (!Icon) return <span className="svc__tm">TM</span>;
  return <Icon size={size} strokeWidth={2} aria-hidden="true" />;
}

/** The original site's service directory: search, category pills, and an expandable card per category. */
export default function OurServices() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [opened, setOpened] = useState({});
  const query = q.trim().toLowerCase();

  const visible = useMemo(
    () =>
      categories
        .filter((c) => cat === 'all' || c.cat === cat)
        .map((c) => {
          const nameMatch = query && c.keywords.toLowerCase().includes(query);
          const items = !query || nameMatch ? c.items : c.items.filter((i) => i.name.toLowerCase().includes(query));
          return { ...c, shownItems: items };
        })
        .filter((c) => !query || c.shownItems.length > 0),
    [cat, query],
  );

  return (
    <section id="our-services" className="section svc" aria-labelledby="svc-title">
      <div className="wrap svc__wrap">
        <SectionHead badge="Our Services" id="svc-title" a="Complete Professional" b="Services">
          <p className="svc__meta">{SERVICE_META_LINE}</p>
          <p className="svc__note">{SERVICE_NOTE}</p>
        </SectionHead>

        <div className="svc__controls" data-reveal>
          <div className="searchbar svc__search">
            <Search size={17} strokeWidth={2} aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search — GST, ITR, Trademark, MSME, PF..."
              aria-label="Search services"
              autoComplete="off"
            />
            {q && (
              <button type="button" aria-label="Clear search" onClick={() => setQ('')}>
                <X size={17} strokeWidth={2} />
              </button>
            )}
          </div>
          <div className="chips svc__tabs" role="group" aria-label="Service categories">
            <button type="button" className={`chip${cat === 'all' ? ' is-active' : ''}`} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.cat}
                type="button"
                className={`chip${cat === c.cat ? ' is-active' : ''}`}
                aria-pressed={cat === c.cat}
                onClick={() => setCat(c.cat)}
              >
                {c.tab}
              </button>
            ))}
          </div>
        </div>

        <div className="svc__grid" data-reveal>
          {visible.map((c) => (
            <details
              key={c.cat}
              className="svccard has-photo"
              open={Boolean(query) || Boolean(opened[c.cat]) || cat === c.cat}
              onToggle={(e) => {
                if (query || cat === c.cat) return;
                const next = e.currentTarget.open;
                setOpened((o) => (Boolean(o[c.cat]) === next ? o : { ...o, [c.cat]: next }));
              }}
            >
              <summary>
                <CardImage name={c.photo || IMG.category[c.cat] || 'office'} />
                <span className="icotile svccard__icon"><CategoryIcon cat={c.cat} /></span>
                <span className="svccard__text">
                  <span className="svccard__name">{c.name}</span>
                  <span className="svccard__from">{c.from}</span>
                </span>
                <ChevronDown className="svccard__chev" size={18} strokeWidth={2} aria-hidden="true" />
              </summary>
              <div className="svccard__body">
                <p className="svccard__desc">{c.desc}</p>
                <p className="svccard__all">All services — fees as listed</p>
                <ul className="svccard__list">
                  {c.shownItems.map((item) => (
                    <li key={item.name} className="svcrow">
                      <span className="svcrow__name">
                        <CircleCheck size={15} strokeWidth={2.25} aria-hidden="true" />
                        <span>{item.name}</span>
                      </span>
                      <span className="svcrow__side">
                        <span className={`svcrow__price${/₹/.test(item.price) ? '' : ' is-consult'}`}>{item.price}</span>
                        <a
                          className="svcrow__enq"
                          href={wa(itemEnquiry(item.name))}
                          aria-label={`Enquire on WhatsApp about ${item.name}`}
                          {...ext}
                        >
                          <WhatsAppIcon size={13} /> Enquire
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
                <a className="svccard__big" href={wa(categoryEnquiry(c.name))} {...ext}>
                  <WhatsAppIcon size={16} /> Enquire about {c.name}
                </a>
              </div>
            </details>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="svc__empty" role="status">
            No service found for your search. <a href={wa(notFoundEnquiry)} {...ext}>Message us on WhatsApp</a> and we will help you.
          </p>
        )}
      </div>
    </section>
  );
}
