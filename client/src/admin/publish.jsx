// "Is the website up to date?" Saved changes reach the public website when it
// is rebuilt (so Google, WhatsApp previews and AI assistants see them too). The
// server asks for a rebuild a couple of minutes after the last change; the
// owner can also press "Publish now".

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { timeAgo } from './format';
import { Button, Icon, useFeedback } from './ui';

const Ctx = createContext(null);
const BUILD_MINUTES = 2;

export function PublishProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();

  const refresh = useCallback(() => {
    api('/admin/website').then(setStatus).catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  // While a change is waiting, check now and then so the bar counts down.
  useEffect(() => {
    if (!status?.pending) return undefined;
    const t = setInterval(refresh, 20_000);
    return () => clearInterval(t);
  }, [status?.pending, refresh]);

  const publishNow = useCallback(async () => {
    setBusy(true);
    try {
      setStatus(await api('/admin/website/rebuild', { method: 'POST', body: {} }));
      toast(`Publishing. The website shows your changes in about ${BUILD_MINUTES} minutes.`);
    } catch (err) {
      toast(err.message, 'error');
      refresh();
    } finally {
      setBusy(false);
    }
  }, [toast, refresh]);

  const value = useMemo(() => ({
    status,
    busy,
    refresh,
    publishNow,
    afterSaveNote: () => (status && !status.configured
      ? 'It appears on the website after the next publish.'
      : `It goes live on the website in about ${BUILD_MINUTES + 2} minutes.`),
  }), [status, busy, refresh, publishNow]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePublish = () => useContext(Ctx);

const minutesUntil = (iso) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 60_000));

/** The small status line in the top bar. */
export function PublishStatus() {
  const { status, busy, publishNow } = usePublish();
  if (!status) return null;
  if (!status.configured) {
    return <span className="a-pub a-pub--off" title="Ask your website developer to add the Vercel deploy hook (DEPLOY_HOOK_URL)."><Icon name="info" size={16} /> Automatic publishing is not set up</span>;
  }
  if (status.pending) {
    const m = status.dueAt ? minutesUntil(status.dueAt) : BUILD_MINUTES;
    return (
      <span className="a-pub a-pub--pending">
        <span className="a-dot" />
        <span className="a-pub__text">Changes go live {m <= 1 ? 'in a minute' : `in about ${m + BUILD_MINUTES} min`}</span>
        <Button size="sm" variant="primary" busy={busy} onClick={publishNow}>Publish now</Button>
      </span>
    );
  }
  if (status.lastOk === false) {
    return (
      <span className="a-pub a-pub--error" title={status.lastError || ''}>
        <Icon name="alert" size={16} /> <span className="a-pub__text">Publishing failed, trying again soon</span>
        <Button size="sm" busy={busy} onClick={publishNow}>Try now</Button>
      </span>
    );
  }
  const recent = status.lastRunAt && Date.now() - new Date(status.lastRunAt).getTime() < (BUILD_MINUTES + 1) * 60_000;
  return (
    <span className="a-pub a-pub--ok">
      <Icon name="check" size={16} />
      <span className="a-pub__text">{recent ? 'Publishing… live in a minute or two' : status.lastRunAt ? `Website up to date · published ${timeAgo(status.lastRunAt)}` : 'Website up to date'}</span>
    </span>
  );
}
