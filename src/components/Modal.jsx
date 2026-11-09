import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Accessible pop-up used for the practice verticals and certificate previews.
 * Locks page scroll, keeps Tab inside, closes on Escape or a backdrop click,
 * and hands focus back to the card that opened it.
 */
export default function Modal({ open, onClose, labelledBy, size = 'md', tone, children }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previousFocus = document.activeElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const items = sheetRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]');
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      root.style.overflow = previousOverflow;
      if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        className={`modal__sheet modal__sheet--${size}${tone ? ` modal__sheet--${tone}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button ref={closeRef} type="button" className="modal__close" aria-label="Close" onClick={onClose}>
          <X size={20} strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
