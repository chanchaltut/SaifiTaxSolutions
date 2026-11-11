import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { Button, Loading, Notice } from './ui';

const SchemaCtx = createContext(null);

/** Loads the description of every editable section once, after signing in. */
export function SchemaProvider({ children }) {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const load = () => {
    setError(null);
    api('/admin/schema').then((s) => {
      s.collectionMap = Object.fromEntries(s.collections.map((c) => [c.key, c]));
      s.singleMap = Object.fromEntries(s.singles.map((x) => [x.key, x]));
      setSchema(s);
    }).catch(setError);
  };
  useEffect(load, []);
  if (error) {
    return (
      <div className="a-center">
        <Notice kind="error" title="The admin panel could not start" action={<Button onClick={load}>Try again</Button>}>{error.message}</Notice>
      </div>
    );
  }
  if (!schema) return <div className="a-center"><Loading label="Opening the admin panel…" /></div>;
  return <SchemaCtx.Provider value={schema}>{children}</SchemaCtx.Provider>;
}

export const useSchema = () => useContext(SchemaCtx);

/*
 * Choices that come from the content itself: every service name (with its fee)
 * and the article categories. Fetched when a form needs them, kept for 20 seconds.
 */
let sourcesCache = { at: 0, data: null, pending: null };
export function loadSources() {
  if (sourcesCache.data && Date.now() - sourcesCache.at < 20_000) return Promise.resolve(sourcesCache.data);
  if (!sourcesCache.pending) {
    sourcesCache.pending = api('/admin/sources')
      .then((data) => { sourcesCache = { at: Date.now(), data, pending: null }; return data; })
      .catch((err) => { sourcesCache.pending = null; throw err; });
  }
  return sourcesCache.pending;
}

export function useSource(name) {
  const [options, setOptions] = useState(sourcesCache.data?.[name] || null);
  useEffect(() => {
    if (!name) return undefined;
    let live = true;
    loadSources().then((d) => live && setOptions(d[name] || [])).catch(() => live && setOptions([]));
    return () => { live = false; };
  }, [name]);
  return options;
}
