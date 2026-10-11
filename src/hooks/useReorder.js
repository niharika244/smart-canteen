import { useCallback, useState } from 'react';
import { useApp } from './useApp';

// Shared "reorder" behaviour for the Orders and Tracking pages.
export function useReorder() {
  const { reorder, openCart } = useApp();
  const [notice, setNotice] = useState('');

  const handleReorder = useCallback((orderId) => {
    const { added, skipped } = reorder(orderId);
    if (added === 0) {
      setNotice('None of the items from this order are available right now.');
      return;
    }
    setNotice(skipped.length ? `Not available right now, so not added: ${skipped.join(', ')}.` : '');
    openCart();
  }, [reorder, openCart]);

  return { notice, handleReorder };
}
