import React from 'react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex justify-center items-center py-32" role="status" aria-label={label}>
      <div className="w-10 h-10 border-4 border-gold-dark border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="text-center py-24 bg-white rounded-3xl border border-black/5 px-6">
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
      <div className="max-w-xl mx-auto bg-white p-12 rounded-3xl border border-black/5 shadow-sm">
        <h2 className="text-3xl font-bold mb-4">Not Found</h2>
        <p className="opacity-60 text-lg">That {what} does not exist or is no longer available.</p>
      </div>
    </div>
  );
}
