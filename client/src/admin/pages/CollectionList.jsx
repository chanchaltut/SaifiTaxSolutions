import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSchema } from '../schema';
import { fmtDate } from '../format';
import { optionList } from '../fields';
import { Badge, Button, Empty, Icon, IconButton, Loading, Notice, useFeedback } from '../ui';
import NotFound from './NotFound';

const LIMIT = 100;

/** Short description line under each item's title. */
function subtitle(def, item, refs) {
  return (def.subtitle || []).map((name) => {
    const f = def.fields.find((x) => x.name === name);
    const v = item[name];
    if (v === undefined || v === null || v === '') return null;
    if (!f) return String(v);
    if (f.type === 'datetime') return fmtDate(v);
    if (f.type === 'select') return optionList(f).find((o) => o.value === v)?.label || v;
    if (f.type === 'ref') return refs?.[f.to]?.[v] || '';
    return String(v);
  }).filter(Boolean).join(' · ');
}


export default function CollectionList() {
  const { type } = useParams();
  const schema = useSchema();
  const def = schema.collectionMap[type];
  const navigate = useNavigate();
  const { toast, confirm } = useFeedback();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await api(`/admin/c/${type}?page=${page}&limit=${LIMIT}&q=${encodeURIComponent(q)}`));
    } catch (err) {
      setError(err.message);
    }
  }, [type, page, q]);

  useEffect(() => { setData(null); setQ(''); setPage(1); }, [type]);
  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  if (!def) return <NotFound />;

  const togglePublished = async (item) => {
    setBusyId(item._id);
    try {
      await api(`/admin/c/${type}/${item._id}`, { method: 'PATCH', body: { published: item.published === false } });
      toast(item.published === false ? 'Now showing on the website' : 'Hidden from the website');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const move = async (item, to) => {
    setBusyId(item._id);
    try {
      await api(`/admin/c/${type}/${item._id}/move`, { method: 'POST', body: { to } });
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: `Delete this ${def.singular}?`,
      message: `“${item._title}” will be removed from the website and from this list. This can’t be undone.${def.publishable ? ' If you might want it back later, use “Hide” instead.' : ''}`,
      ok: 'Delete',
      danger: true,
    });
    if (!ok) return;
    setBusyId(item._id);
    try {
      await api(`/admin/c/${type}/${item._id}`, { method: 'DELETE' });
      toast('Deleted');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const items = data?.items || [];
  const canMove = def.orderable && !q;

  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1><Icon name={def.icon} size={26} /> {def.label}</h1>
          <p className="a-page__desc">{def.description}</p>
        </div>
        <div className="a-page__actions">
          <Button variant="primary" icon="plus" onClick={() => navigate(`/c/${type}/new`)}>Add {def.singular}</Button>
        </div>
      </header>

      {def.searchable && (data?.total > 8 || q) && (
        <div className="a-search a-search--page">
          <Icon name="search" size={18} />
          <input className="a-input" placeholder={`Search ${def.label.toLowerCase()}`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
      )}

      {error && <Notice kind="error" action={<Button size="sm" onClick={load}>Try again</Button>}>{error}</Notice>}
      {!data && !error && <Loading />}

      {data && !items.length && (
        <Empty icon={def.icon} title={q ? 'Nothing matches your search' : `No ${def.label.toLowerCase()} yet`} action={!q && <Button variant="primary" icon="plus" onClick={() => navigate(`/c/${type}/new`)}>Add the first {def.singular}</Button>}>
          {!q && def.description}
        </Empty>
      )}

      {items.length > 0 && (
        <ul className="a-list">
          {items.map((item, i) => (
            <li key={item._id} className={`a-row ${item.published === false ? 'is-hidden' : ''} ${busyId === item._id ? 'is-busy' : ''}`}>
              <Link to={`/c/${type}/${item._id}`} className="a-row__main">
                {def.imageField && (
                  <span className="a-row__thumb">
                    {item._thumb ? <img src={item._thumb} alt="" loading="lazy" /> : <Icon name={def.icon} size={22} />}
                  </span>
                )}
                <span className="a-row__text">
                  <span className="a-row__title">{item._title}</span>
                  <span className="a-row__sub">{subtitle(def, item, data.refs)}</span>
                  <span className="a-row__badges">
                    {item.published === false && <Badge kind="muted">{def.key === 'articles' ? 'Draft (not on the website)' : 'Hidden'}</Badge>}
                    {item.featured && def.key === 'plans' && <Badge kind="gold">{item.featured}</Badge>}
                    {item.builtin && <Badge>Original guide</Badge>}
                    {def.key === 'certificates' && (item.preview === 'none' ? <Badge kind="warn">No preview yet</Badge> : <Badge kind="ok">{item.preview === 'pdf' ? 'PDF preview' : 'Photo preview'}</Badge>)}
                    {def.key === 'services' && <Badge>{(item.items || []).length} services</Badge>}
                  </span>
                </span>
              </Link>
              <span className="a-row__tools">
                {canMove && (
                  <>
                    <IconButton icon="up" label="Move up" onClick={() => move(item, 'up')} disabled={i === 0 && page === 1} />
                    <IconButton icon="down" label="Move down" onClick={() => move(item, 'down')} disabled={i === items.length - 1 && page === data.pages} />
                  </>
                )}
                {def.publishable && (
                  <IconButton icon={item.published === false ? 'eye-off' : 'eye'} label={item.published === false ? 'Hidden — click to show on the website' : 'Showing — click to hide from the website'} onClick={() => togglePublished(item)} />
                )}
                <IconButton icon="edit" label="Edit" onClick={() => navigate(`/c/${type}/${item._id}`)} />
                {!item.locked && <IconButton icon="trash" label="Delete" variant="danger" onClick={() => remove(item)} />}
              </span>
            </li>
          ))}
        </ul>
      )}

      {data?.pages > 1 && (
        <nav className="a-pager" aria-label="Pages">
          <Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page} of {data.pages}</span>
          <Button size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </nav>
      )}
      {canMove && items.length > 1 && <p className="a-muted a-small"><Icon name="info" size={14} /> The website shows them in this order. Use the arrows to change it.</p>}
    </div>
  );
}
