// Tiny localStorage wrapper for the prototype's demo auth, saved builds and leads.
// Every access is guarded: storage can be blocked or empty (private mode, previews).
const KEY = 'rv-store-v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export const store = {
  get(key, fallback = null) { return read()[key] ?? fallback; },
  set(key, value) { const d = read(); d[key] = value; write(d); },
  push(key, value) { const d = read(); (d[key] ||= []).unshift(value); write(d); },
  remove(key) { const d = read(); delete d[key]; write(d); },
};
