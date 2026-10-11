import { useEffect, useRef } from 'react';

// Accessible dialog: focus moves in, Escape closes, focus returns to the button that opened it.
export default function Modal({ title, onClose, children }) {
  const boxRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement;
    boxRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, []);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={boxRef}>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </>
  );
}
