import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="empty-state">
      {Icon && <Icon size={64} className="empty-icon" />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;