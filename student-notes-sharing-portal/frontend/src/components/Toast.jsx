import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast — brief notification that appears at the bottom-right.
 * Automatically dismissed after 3.5 seconds.
 *
 * Props:
 *  - message (string): the text to display
 *  - type ('success' | 'error'): controls colour
 *  - onClose (function): called to remove the toast
 */
const Toast = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      {type === 'success'
        ? <CheckCircle size={18} style={{ flexShrink: 0 }} />
        : <XCircle size={18} style={{ flexShrink: 0 }} />
      }
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ marginLeft: 'auto', background: 'none', border: 'none',
                 cursor: 'pointer', color: 'inherit', padding: '2px' }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

