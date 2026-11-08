import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { stripHtml } from '../utils';

marked.setOptions({ gfm: true, breaks: true });

// Open links in a new tab safely; DOMPurify strips everything unsafe.
// DOMPurify needs a browser. When the site is drawn on a server to make the static copies for crawlers, there is no
// browser, so any HTML typed into the text is shown as plain text instead.
const canSanitize = typeof DOMPurify.addHook === 'function' && DOMPurify.isSupported !== false;
if (canSanitize) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

export function renderMarkdown(src) {
  if (canSanitize) return DOMPurify.sanitize(marked.parse(src || ''));
  return marked.parse(String(src || '').replace(/</g, '&lt;'));
}

export function plainText(src) {
  return stripHtml(marked.parse(src || '')).replace(/\s+/g, ' ').trim();
}
