import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from '../lib/router';
import { ArrowRight, Search, ShieldCheck, X, Clock } from 'lucide-react';
import { AnswerBox, Btn, Crumbs, PageHead, ext } from '../components/ui';
import { FinalCta, GuideCard } from '../components/Sections';
import { GUIDE_BODIES } from './guideBodies';
import { guideBySlug, guides, hub, reviewedBy } from '../content/guides';
import { SITE, wa } from '../content/site';

export function KnowledgeHubPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const query = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      guides.filter((g) => {
        const hay = `${g.tag} ${g.readTime} ${g.cardTitle} ${g.cardBody} ${g.cardCta} ${g.slug} ${g.answer} ${g.filter}`.toLowerCase();
        return (!query || hay.includes(query)) && (filter === 'all' || g.filter === filter);
      }),
    [query, filter],
  );

  return (
    <>
      <PageHead crumbs={[['Home', '/'], [hub.label]]} eyebrow={hub.eyebrow} title={hub.title} body={hub.body} />
      <section className="section section--tight">
        <div className="wrap">
          <div className="catalog__controls">
            <div className="searchbar">
              <Search size={18} strokeWidth={1.75} aria-hidden="true" />
              <input
                id="saifi-blog-search"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={hub.searchPlaceholder}
                aria-label="Search tax guides"
              />
              {q && (
                <button type="button" aria-label="Clear search" onClick={() => setQ('')}>
                  <X size={18} strokeWidth={1.75} />
                </button>
              )}
            </div>
            <div className="chips" role="group" aria-label="Guide categories">
              {hub.filters.map((f) => (
                <button key={f.id} type="button" className={`chip${filter === f.id ? ' is-active' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {shown.length > 0 && (
            <ul className="hubgrid">
              {shown.map((g) => <li key={g.slug}><GuideCard g={g} /></li>)}
            </ul>
          )}

          {shown.length === 0 && query && (
            <div className="hubempty" role="status">
              <h2 className="h h--xl">{hub.empty.title}{q}"?</h2>
              <p className="lede">{hub.empty.body}</p>
              <Btn href={wa(hub.empty.message(q))}>{hub.empty.cta}</Btn>
            </div>
          )}
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function ReviewedBy() {
  return (
    <aside className="reviewed" aria-label="Editorial review">
      <span className="reviewed__mark" aria-hidden="true">{reviewedBy.initials}</span>
      <div>
        <p className="reviewed__title">
          {reviewedBy.title}
          <span className="reviewed__badge"><ShieldCheck size={14} strokeWidth={1.75} aria-hidden="true" />{reviewedBy.badge}</span>
        </p>
        <p className="reviewed__body">
          {reviewedBy.bodyA}<strong>{reviewedBy.bodyStrong}</strong>{reviewedBy.bodyB}
        </p>
      </div>
    </aside>
  );
}

function RelatedGuides({ current }) {
  return (
    <section className="related" aria-labelledby="related-title">
      <p className="related__eyebrow">Continue Reading</p>
      <h2 id="related-title" className="h h--xl">Related Income Tax Guides</h2>
      <ul className="related__grid">
        {guides.filter((g) => g.slug !== current).map((g) => (
          <li key={g.slug}>
            <Link to={g.path} className="relcard">
              <span className="relcard__tag">{g.relatedTag}</span>
              <span className="relcard__title">{g.relatedTitle}</span>
              <span className="relcard__cta">Read Guide <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GuidePage() {
  const { slug } = useParams();
  const g = guideBySlug(slug);
  if (!g) return <Navigate to="/knowledge-hub/" replace />;
  const Body = GUIDE_BODIES[slug];

  return (
    <article className="guide" itemScope itemType="https://schema.org/Article">
      <header className="guide__head">
        <div className="wrap">
          <Crumbs items={[['Home', '/'], [hub.label, '/knowledge-hub/'], [g.relatedTag]]} />
          <p className="guide__badge">{g.badge}</p>
          <h1 className="guide__title" itemProp="headline">
            <span>{g.titleA}</span>{' '}
            <span className="h__accent h__accent--cobalt">{g.titleB}</span>
          </h1>
          <div className="guide__intro">
            <p className="lede" itemProp="description">{g.intro}</p>
            <ul className="guide__meta">
              <li><Clock size={14} strokeWidth={1.75} aria-hidden="true" />{g.readTime}</li>
              <li>Updated <time dateTime={SITE.lastUpdated} itemProp="dateModified">{SITE.lastUpdatedLabel}</time></li>
              <li>{reviewedBy.title}</li>
            </ul>
          </div>
        </div>
      </header>

      <div className="wrap guide__layout">
        <aside className="guide__toc">
          <nav aria-label="On this page">
            <p className="guide__tochead">On this page</p>
            <ol>
              {g.toc.map(([id, label]) => (
                <li key={id}><a href={`#${id}`}>{label}</a></li>
              ))}
            </ol>
          </nav>
          <a href={g.cta.href} className="guide__tocwa" {...ext}>{g.cta.label}</a>
        </aside>

        <div className="guide__body">
          <AnswerBox>{g.answer}</AnswerBox>
          <Body />

          <ReviewedBy />

          <section className="guidecta" aria-labelledby="guidecta-title">
            <p className="guidecta__kicker">{g.cta.kicker}</p>
            <h2 id="guidecta-title">{g.cta.title}</h2>
            <p>{g.cta.body}</p>
            <Btn href={g.cta.href} tone="white">{g.cta.label}</Btn>
          </section>

          {g.disclaimer && (
            <p className="guide__disclaimer"><strong>Disclaimer:</strong> {g.disclaimer}</p>
          )}

          <RelatedGuides current={g.slug} />
        </div>
      </div>
    </article>
  );
}
