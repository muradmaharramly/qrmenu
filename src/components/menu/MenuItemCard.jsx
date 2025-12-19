import React from 'react';
import { Clock } from 'lucide-react';

const MenuItemCard = ({ item, discount }) => {
  return (
    <div className="menu-item-card">
      {item.image_url && (
        <img 
          src={item.image_url} 
          alt={item.name} 
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
        <h3>{item.name}</h3>
        {item.description && <p>{item.description}</p>}
        
        {item.category && (
          <span className="item-category">{item.category}</span>
        )}
      </div>

      <div className="item-footer">
        <div className="price-container">
          {discount ? (
            <>
              <span className="price original-price">{item.price} AZN</span>
              <span className="price">{discount.discountedPrice} AZN</span>
            </>
          ) : (
            <span className="price">{item.price} AZN</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
