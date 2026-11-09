import React, { useEffect, useRef } from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1e2522]/50" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="bg-white rounded-2xl elev-2 max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-xl font-bold mb-2 normal-case tracking-normal">{title}</h2>
        <p id="confirm-message" className="text-black mb-8">{message}</p>
        <div className="flex justify-end gap-3">
          <button ref={cancelRef} onClick={onCancel} className="px-5 py-2.5 font-bold text-black hover:text-[#1e2522]">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg font-bold bg-[#c74f2f] text-white hover:bg-[#c74f2f]">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
