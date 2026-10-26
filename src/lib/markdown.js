import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { stripHtml } from '../utils';

marked.setOptions({ gfm: true, breaks: true });

// Open links in a new tab safely; DOMPurify strips everything unsafe.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function renderMarkdown(src) {
  return DOMPurify.sanitize(marked.parse(src || ''));
}

export function plainText(src) {
  return stripHtml(marked.parse(src || '')).replace(/\s+/g, ' ').trim();
}
