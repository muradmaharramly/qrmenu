import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  title, 
  message, 
  confirmText = 'Təsdiq et', 
  cancelText = 'Ləğv et',
  onConfirm, 
  onCancel,
  type = 'danger' 
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <AlertTriangle size={48} color={type === 'danger' ? '#f44336' : '#ff9800'} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;