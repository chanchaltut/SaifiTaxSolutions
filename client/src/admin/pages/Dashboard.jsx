import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { useSchema } from '../schema';
import { fmtBytes, fmtDateTime, greeting, timeAgo } from '../format';
import { Button, Icon, Loading, Notice, useFeedback } from '../ui';
import { usePublish } from '../publish';

const QUICK = [
  { to: '/c/articles/new', icon: 'newspaper', title: 'Write an article', text: 'Tax guide or blog post' },
  { to: '/c/services', icon: 'briefcase', title: 'Change a fee or service', text: 'All 12 service categories' },
  { to: '/c/certificates', icon: 'award', title: 'Add a certificate preview', text: 'Photo, scan or PDF' },
  { to: '/c/reviews/new', icon: 'star', title: 'Add a client review', text: 'Shown on the home page' },
  { to: '/s/deadlines', icon: 'calendar', title: 'Update deadlines', text: 'Radar and due dates' },
  { to: '/s/settings', icon: 'settings', title: 'Phone, address & hours', text: 'Business details' },
];

export function ActivityLine({ a }) {
  return (
    <li className="a-activity__item">
      <span className="a-avatar a-avatar--sm">{(a.userName || '?').slice(0, 1).toUpperCase()}</span>
      <span>
        <strong>{a.userName || 'Someone'}</strong> {a.action}
        {a.areaLabel && a.area !== 'account' && <> in <em>{a.areaLabel}</em></>}
        {a.itemTitle && <>: “{a.itemTitle.length > 80 ? `${a.itemTitle.slice(0, 80)}…` : a.itemTitle}”</>}
        <span className="a-muted a-small" title={fmtDateTime(a.at)}> · {timeAgo(a.at)}</span>
      </span>
    </li>
  );
}

function WebsiteCard() {
  const { status, busy, publishNow } = usePublish();
  if (!status) return null;
  if (!status.configured) {
    return (
      <section className="a-card">
        <h2 className="a-card__title"><Icon name="globe" size={20} /> Website</h2>
        <p>Your changes are saved. Automatic publishing is not switched on yet, so they reach the website at the next manual deploy.</p>
        <p className="a-muted a-small">Your developer can turn it on with the Vercel deploy hook (DEPLOY_HOOK_URL).</p>
      </section>
    );
  }
  return (
    <section className="a-card">
      <h2 className="a-card__title"><Icon name="globe" size={20} /> Website</h2>
      <p>Saved changes are published by themselves about two minutes after you stop editing. The website is rebuilt so that Google, WhatsApp previews and AI assistants see the same as your visitors, which takes about two more minutes.</p>
      {status.pending
        ? <Notice kind="info">Publishing at about {fmtDateTime(status.dueAt)}.</Notice>
        : status.lastRunAt && <p className="a-muted a-small">Last published {timeAgo(status.lastRunAt)}{status.lastOk === false ? '. It failed and will try again by itself.' : '.'}</p>}
      <Button icon="refresh" busy={busy} onClick={publishNow}>Publish now</Button>
    </section>
  );
}

function StorageCard() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/storage').then(setData).catch(() => setData({ usage: null })); }, []);
  if (!data?.usage) return null;
  const u = data.usage;
  return (
    <section className="a-card">
      <h2 className="a-card__title"><Icon name="images" size={20} /> Photo storage (Cloudinary)</h2>
      {u.percent != null && (
        <div className="a-meter" role="meter" aria-valuenow={u.percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${Math.min(100, u.percent)}%` }} className={u.percent > 80 ? 'is-high' : ''} />
        </div>
      )}
      <p className="a-small">{u.percent != null ? `${Math.round(u.percent)}% of this month’s free allowance used` : 'Usage information'}{u.storageBytes != null && ` · ${fmtBytes(u.storageBytes)} stored`}</p>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const schema = useSchema();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = () => api('/admin/dashboard').then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <div className="a-page"><Notice kind="error" action={<Button onClick={() => { setError(null); load(); }}>Try again</Button>}>{error}</Notice></div>;
  if (!data) return <Loading />;

  const saved = data.media.originalBytes - data.media.bytes;
  const stats = [
    ['articles', 'Articles'], ['services', 'Service categories'], ['certificates', 'Certificates'], ['reviews', 'Reviews'], ['faqs', 'Questions'], ['plans', 'Plans'],
  ];

  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1>{greeting()}, {user.name.split(' ')[0]}</h1>
          <p className="a-page__desc">What would you like to change on the website today?</p>
        </div>
      </header>

      {data.drafts.length > 0 && (
        <Notice kind="info" title={`${data.drafts.length === 1 ? 'An article is' : `${data.drafts.length} articles are`} still a draft`}>
          <ul className="a-plainlist">
            {data.drafts.map((d) => <li key={d.id}><Link to={`/c/articles/${d.id}`}>{d.title}</Link> <span className="a-muted a-small">· last changed {timeAgo(d.updatedAt)}</span></li>)}
          </ul>
        </Notice>
      )}
      {data.certificatesWithout > 0 && (
        <Notice kind="warn" title={`${data.certificatesWithout} certificate${data.certificatesWithout === 1 ? ' has' : 's have'} no preview yet`}>
          Visitors are offered a sample on WhatsApp instead. <Link to="/c/certificates">Add a real certificate</Link> (with the client’s details hidden) when you have one.
        </Notice>
      )}

      <ul className="a-quick">
        {QUICK.map((q) => (
          <li key={q.to}>
            <Link to={q.to} className="a-quick__card">
              <span className="a-quick__icon"><Icon name={q.icon} size={24} /></span>
              <span><strong>{q.title}</strong><span className="a-muted">{q.text}</span></span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="a-dash">
        <div className="a-dash__main">
          <section className="a-card">
            <h2 className="a-card__title"><Icon name="activity" size={20} /> Recent changes</h2>
            {data.recent.length ? (
              <ul className="a-activity">{data.recent.map((a) => <ActivityLine key={a._id} a={a} />)}</ul>
            ) : <p className="a-muted">Nothing yet — your changes will be listed here.</p>}
            <Link to="/activity" className="a-link">See all activity</Link>
          </section>
        </div>
        <div className="a-dash__side">
          <section className="a-card">
            <h2 className="a-card__title"><Icon name="sparkle" size={20} /> On the website</h2>
            <ul className="a-stats">
              {stats.map(([k, label]) => (
                <li key={k}><Link to={`/c/${k}`}><strong>{data.counts[k] ?? 0}</strong><span>{label}</span></Link></li>
              ))}
            </ul>
            {data.latest.length > 0 && (
              <p className="a-small">Newest article: <Link to={`/c/articles/${data.latest[0].id}`}>{data.latest[0].title}</Link></p>
            )}
            {data.media.count > 0 && saved > 0 && (
              <p className="a-small a-muted">{data.media.count} photos uploaded. WebP compression saved {fmtBytes(saved)} ({Math.round((saved / data.media.originalBytes) * 100)}% smaller), so pages load faster on mobile data.</p>
            )}
          </section>
          <WebsiteCard />
          <StorageCard />
          {!schema.storage || schema.storage === 'local' ? <Notice kind="warn">Photos are being saved on the server’s own disk. This is only for testing: your developer should connect Cloudinary.</Notice> : null}
        </div>
      </div>
    </div>
  );
}
