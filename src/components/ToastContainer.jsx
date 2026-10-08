import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import './ToastContainer.css';

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast" onClick={() => onDismiss(toast.id)} style={{ cursor: 'pointer' }}>
          <CheckCircle2 size={16} color="var(--primary)" />
          <span>{toast.message}</span>
          <X size={14} style={{ marginLeft: '6px', opacity: 0.6 }} />
        </div>
      ))}
    </div>
  );
}
