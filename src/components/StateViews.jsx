import React from 'react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex justify-center items-center py-32" role="status" aria-label={label}>
      <div className="w-10 h-10 border-4 border-[#eaa235] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Soft placeholder cards shown while messages load.
export function CardSkeletons({ count = 6 }) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} aria-hidden="true">
          <div className="aspect-video rounded-[10px] bg-[#e8e7e3] animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-[#e8e7e3] animate-pulse mt-4" />
          <div className="h-5 w-4/5 rounded bg-[#e8e7e3] animate-pulse mt-3" />
        </li>
      ))}
    </ul>
  );
}

// Setup problems are for the people who run the site, so visitors get a plain message and the detail goes to the console.
export function ErrorState({ message, onRetry }) {
  if (/VITE_SUPABASE|not configured/i.test(message || '')) {
    console.warn(`[site] ${message}`);
    message = 'This page is not available right now. Please try again later, or call us at 330.482.9058.';
  }
  return (
    <div role="alert" className="text-center py-24 rounded-3xl px-6 neu">
      <div className="text-5xl mb-6" aria-hidden="true">⚠️</div>
      <h2 className="text-3xl font-bold mb-3">We couldn't load this</h2>
      <p className="text-[0.95rem] mb-8">{message || 'Please check your connection and try again.'}</p>
      {onRetry && <button onClick={onRetry} className="btn btn-solid">Try Again</button>}
    </div>
  );
}

export function NotFound({ what = 'page' }) {
  return (
    <div className="min-h-[60vh] pt-40 px-6 text-center">
      <div className="max-w-xl mx-auto p-12 rounded-3xl neu">
        <h2 className="text-3xl font-bold mb-4">Not Found</h2>
        <p className="text-lg">That {what} does not exist or is no longer available.</p>
      </div>
    </div>
  );
}
