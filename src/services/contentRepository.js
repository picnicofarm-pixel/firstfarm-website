const KEY = 'firstfarm-content-v2';
export const contentRepository = {
  read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } },
  write(data) { localStorage.setItem(KEY, JSON.stringify(data)); },
  reset() { localStorage.removeItem(KEY); }
};
