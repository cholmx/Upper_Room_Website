import React from 'react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex justify-center items-center py-32" role="status" aria-label={label}>
      <div className="w-10 h-10 border-4 border-[#eaa235] border-t-transparent rounded-full animate-spin"></div>
    </div>
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
      <p className="opacity-60 text-lg mb-8">{message || 'Please check your connection and try again.'}</p>
      {onRetry && <button onClick={onRetry} className="btn btn-solid">Try Again</button>}
    </div>
  );
}

export function NotFound({ what = 'page' }) {
  return (
    <div className="min-h-[60vh] pt-40 px-6 text-center">
      <div className="max-w-xl mx-auto p-12 rounded-3xl neu">
        <h2 className="text-3xl font-bold mb-4">Not Found</h2>
        <p className="opacity-60 text-lg">That {what} does not exist or is no longer available.</p>
      </div>
    </div>
  );
}
