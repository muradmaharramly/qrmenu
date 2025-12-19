import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, autoClose = false }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">{icons[type]}</span>
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;