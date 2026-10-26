import React, { useMemo } from 'react';
import { renderMarkdown } from '../lib/markdown';

export default function RichText({ value, className = '' }) {
  const html = useMemo(() => renderMarkdown(value), [value]);
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
