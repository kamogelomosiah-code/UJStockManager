// Keeps the stock the same on every phone and computer, through this app's server and MasterAPI.
//
// The saved state is one document: stock, audit log, movements and currency, stamped with the time of the last
// real change. Newer wins. A device that has never made a change counts as "nothing yet" (stamp 0), so a
// brand-new phone always takes the saved stock and can never overwrite it with its sample data.
import { inventoryEngine } from '../inventoryEngine';
import { authFetch } from './api';

const AT_KEY = 'uj_state_at';
const KEYS = { items: 'functionhead_inventory', logs: 'functionhead_audit_logs', movements: 'uj_movements', currency: 'uj_currency' } as const;

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'offline';
let status: SyncStatus = 'off';
const listeners = new Set<(s: SyncStatus) => void>();
const setStatus = (s: SyncStatus) => { status = s; listeners.forEach((l) => l(s)); };
export const getSyncStatus = () => status;
export function onSyncStatus(fn: (s: SyncStatus) => void) { listeners.add(fn); fn(status); return () => { listeners.delete(fn); }; }

let applying = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let pushing = false;
let pushAgain = false;
let shared = true; // false once the server says shared storage is not connected

const localAt = () => Number(localStorage.getItem(AT_KEY) || 0) || 0;
const read = (k: string) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };

function readState() {
  return { items: read(KEYS.items) || [], logs: read(KEYS.logs) || [], movements: read(KEYS.movements) || [], currency: localStorage.getItem(KEYS.currency) || 'ZAR' };
}

async function push() {
  if (!shared) return;
  if (pushing) { pushAgain = true; return; }
  pushing = true;
  setStatus('syncing');
  try {
    const res = await authFetch('/api/state', { method: 'PUT', body: JSON.stringify({ state: readState(), at: localAt() }) });
    if (res.status === 503) { shared = false; setStatus('off'); }
    else setStatus(res.ok ? 'synced' : 'offline');
  } catch {
    setStatus('offline');
    setTimeout(() => { if (localAt() > 0) push(); }, 8000);
  }
  pushing = false;
  if (pushAgain) { pushAgain = false; push(); }
}

/** Call when something really changed on this device. */
export function markChanged() {
  if (applying || !shared) return;
  localStorage.setItem(AT_KEY, String(Date.now()));
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 800);
}

function applyRemote(remote: { state: any; at: number }) {
  applying = true;
  try {
    const st = remote.state;
    localStorage.setItem(KEYS.items, JSON.stringify(st.items));
    if (Array.isArray(st.logs)) localStorage.setItem(KEYS.logs, JSON.stringify(st.logs));
    if (Array.isArray(st.movements)) localStorage.setItem(KEYS.movements, JSON.stringify(st.movements));
    if (typeof st.currency === 'string') localStorage.setItem(KEYS.currency, st.currency);
    localStorage.setItem(AT_KEY, String(remote.at));
    inventoryEngine.reload();
    window.dispatchEvent(new Event('uj_stock_db_synced'));
    window.dispatchEvent(new Event('uj_state_pulled'));
  } finally {
    applying = false;
  }
}

export async function pull() {
  if (!shared) return;
  try {
    const res = await authFetch('/api/state');
    if (res.status === 503) { shared = false; setStatus('off'); return; }
    if (!res.ok) { setStatus('offline'); return; }
    const remote = await res.json();
    const mine = localAt();
    if (remote.state && Array.isArray(remote.state.items) && (remote.at || 0) > mine) { applyRemote(remote); setStatus('synced'); }
    else if (mine > (remote.at || 0)) { await push(); }
    else setStatus('synced');
  } catch {
    setStatus('offline');
  }
}

/** Starts syncing for the signed-in person. Returns a function that stops it. */
export function startCloudSync() {
  shared = true;
  setStatus('syncing');
  const onChanged = () => markChanged();
  const onWake = () => { if (!document.hidden) pull(); };
  window.addEventListener('uj_state_changed', onChanged);
  window.addEventListener('focus', onWake);
  document.addEventListener('visibilitychange', onWake);
  window.addEventListener('online', onWake);
  const poll = setInterval(() => { if (!document.hidden) pull(); }, 30_000);
  pull();
  return () => {
    window.removeEventListener('uj_state_changed', onChanged);
    window.removeEventListener('focus', onWake);
    document.removeEventListener('visibilitychange', onWake);
    window.removeEventListener('online', onWake);
    clearInterval(poll);
    clearTimeout(pushTimer);
    setStatus('off');
  };
}
