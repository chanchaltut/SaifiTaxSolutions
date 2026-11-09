import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { ArrowRight, Plus, Search, X } from 'lucide-react';
import { WhatsAppIcon } from './brand';
import { CardImage, ext } from './ui';
import { IMG } from '../content/cardImages';
import { categories, categoryEnquiry, itemEnquiry, notFoundEnquiry, priceParts } from '../content/services';
import { wa } from '../content/site';

export function ServiceRow({ item }) {
  const { prefix, value } = priceParts(item.price);
  return (
    <tr>
      <th scope="row">{item.name}</th>
      <td className="fees__price">
        {prefix && <span className="fees__prefix">{prefix} </span>}
        <span className="fees__value">{value}</span>
      </td>
      <td className="fees__action">
        <a href={wa(itemEnquiry(item.name))} aria-label={`Enquire on WhatsApp about ${item.name}`} {...ext}>
          <WhatsAppIcon size={15} />
          <span>Enquire</span>
        </a>
      </td>
    </tr>
  );
}

export function FeeTable({ items, caption }) {
  return (
    <div className="fees__scroll">
      <table className="fees">
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead className="visually-hidden">
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Fee</th>
            <th scope="col">Enquire</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ServiceRow key={item.name} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Searchable, filterable index of all 12 categories and every listed service. */
export default function ServiceCatalog() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [opened, setOpened] = useState({ gst: true });

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQ(initial);
  }, []);

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
    <div className="catalog">
      <div className="catalog__controls">
        <div className="searchbar">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          <input
            id="svc-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search — GST, ITR, Trademark, MSME, PF..."
            aria-label="Search services"
            autoComplete="off"
          />
          {q && (
            <button type="button" aria-label="Clear search" onClick={() => setQ('')}>
              <X size={18} strokeWidth={1.75} />
            </button>
          )}
        </div>
        <div className="chips" role="group" aria-label="Service categories">
          <button type="button" className={`chip${cat === 'all' ? ' is-active' : ''}`} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>All</button>
          {categories.map((c) => (
            <button key={c.cat} type="button" className={`chip${cat === c.cat ? ' is-active' : ''}`} aria-pressed={cat === c.cat} onClick={() => setCat(c.cat)}>
              {c.tab}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog__list">
        {visible.map((c) => {
          const isOpen = Boolean(query) || Boolean(opened[c.cat]);
          return (
            <details
              key={c.cat}
              className="ccat has-photo"
              open={isOpen}
              onToggle={(e) => {
                if (query) return;
                const next = e.currentTarget.open;
                setOpened((o) => (Boolean(o[c.cat]) === next ? o : { ...o, [c.cat]: next }));
              }}
            >
              <summary>
                <CardImage name={IMG.category[c.cat]} />
                <span className="ccat__code">{c.code}</span>
                <span className="ccat__name">{c.name}</span>
                <span className="ccat__from">{c.from}</span>
                <span className="ccat__sign" aria-hidden="true"><Plus size={20} strokeWidth={1.5} /></span>
              </summary>
              <div className="ccat__body">
                <div className="ccat__aside">
                  <p className="ccat__desc">{c.desc}</p>
                  <Link to={c.path} className="tlink">
                    <span>{c.name}</span>
                    <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                  <a className="ccat__enq" href={wa(categoryEnquiry(c.name))} {...ext}>
                    <WhatsAppIcon size={15} /> Enquire about {c.name}
                  </a>
                </div>
                <div>
                  <p className="ccat__all">All services — fees as listed</p>
                  <FeeTable items={c.shownItems} caption={`${c.name} fees`} />
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="catalog__empty" role="status">
          No service found for your search.{' '}
          <a href={wa(notFoundEnquiry)} {...ext}>Message us on WhatsApp</a> and we will help you.
        </p>
      )}
    </div>
  );
}
