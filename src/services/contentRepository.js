import {defaultContent} from '../data/defaultContent';

const KEY = 'firstfarm-content-v3';
const CONTENT_URL = '/site-content.json';

export function mergeContent(saved = {}) {
  return {
    ...defaultContent,
    ...saved,
    theme: {...defaultContent.theme, ...saved.theme},
    seo: {...defaultContent.seo, ...saved.seo},
    pages: Object.fromEntries(
      Object.entries(defaultContent.pages).map(([key, value]) => [
        key,
        {...value, ...saved.pages?.[key]}
      ])
    )
  };
}

export const contentRepository = {
  readLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  },

  writeLocal(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  resetLocal() {
    localStorage.removeItem(KEY);
  },

  async readPublished() {
    try {
      const response = await fetch(`${CONTENT_URL}?v=${Date.now()}`, {cache: 'no-store'});
      if (!response.ok) return {};
      return await response.json();
    } catch {
      return {};
    }
  },

  async publish(data, password) {
    const response = await fetch('/api/publish-content', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content: data, password})
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || '게시 실패');
    return result;
  }
};
