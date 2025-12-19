import React from 'react';
import { Package } from 'lucide-react';

const SetCard = ({ set, discount }) => {
  return (
    <div className="menu-item-card set-card">
      {set.image_url && (
        <img 
          src={set.image_url} 
          alt={set.name} 
          className="item-image"
          loading="lazy"
        />
      )}
      
      {discount && (
        <span className="item-badge">
          -{discount.percentage}%
        </span>
      )}

      <div className="item-info">
        <div className="set-header">
          <Package size={20} />
          <h3>{set.name}</h3>
        </div>
        {set.description && <p>{set.description}</p>}
        
        {set.set_items && set.set_items.length > 0 && (
          <div className="set-items-list">
            <small>Daxildir:</small>
            <ul>
              {set.set_items.map(si => (
                <li key={si.id}>{si.menu_items.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="item-footer">
        <div className="price-container">
          {discount ? (
            <>
              <span className="price original-price">{set.total_price} AZN</span>
              <span className="price">{discount.discountedPrice} AZN</span>
            </>
          ) : (
            <span className="price">{set.total_price} AZN</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetCard;