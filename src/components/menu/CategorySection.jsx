import React from 'react';
import MenuItemCard from './MenuItemCard';

const CategorySection = ({ category, items, getDiscount }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="category-section">
      <h2 className="category-title">{category || 'Digər Məhsullar'}</h2>
      <div className="menu-grid">
        {items.map(item => (
          <MenuItemCard 
            key={item.id} 
            item={item} 
            discount={getDiscount(item.id, item.price)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;