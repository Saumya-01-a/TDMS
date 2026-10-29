import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: '#111827',
              color: '#f3f4f6',
              border: toast.type === 'success' 
                ? '1px solid rgba(34, 197, 94, 0.4)' 
                : toast.type === 'error' 
                ? '1px solid rgba(239, 68, 68, 0.4)' 
                : '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: toast.type === 'success'
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 197, 94, 0.15)'
                : toast.type === 'error'
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.15)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.15)',
              fontSize: '0.9rem',
              fontWeight: 500,
              backdropFilter: 'blur(12px)',
              animation: 'slideInToast 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />}
              {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />}
              {toast.type === 'info' && <Info size={18} color="#3b82f6" style={{ flexShrink: 0 }} />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {}
    };
  }
  return context;
}

