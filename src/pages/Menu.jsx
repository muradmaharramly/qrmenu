import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { QrCode as QrIcon } from 'lucide-react';
import { IoLocationSharp, IoCall } from 'react-icons/io5';
import NardiLogo from '../images/logo-nardi.jpg';

const Menu = () => {
  const { qrCode } = useParams();

  const [menuItems, setMenuItems] = useState([]);
  const [sets, setSets] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
    const interval = setInterval(fetchMenuData, 60000);
    return () => clearInterval(interval);
  }, [qrCode]);

  const fetchMenuData = async () => {
    try {
      const { error: qrError } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('code', qrCode)
        .single();

      if (qrError) {
        setLoading(false);
        return;
      }

      const { data: itemsData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      const { data: setsData } = await supabase
        .from('sets')
        .select(`
          *,
          set_items (
            id,
            menu_items (*)
          )
        `)
        .eq('is_available', true);

      const { data: discountsData } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true);

      setMenuItems(itemsData || []);
      setSets(setsData || []);
      setDiscounts(discountsData || []);

      const uniqueCategories = [
        ...new Set(itemsData?.map(i => i.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);

      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const getDiscountedPrice = (itemId, price) => {
    const time = new Date().toTimeString().slice(0, 5);
    const d = discounts.find(
      x =>
        x.menu_item_id === itemId &&
        x.start_time <= time &&
        x.end_time >= time
    );

    if (!d) return { hasDiscount: false, price };

    return {
      hasDiscount: true,
      oldPrice: price,
      price: (price * (1 - d.discount_percentage / 100)).toFixed(2),
      percent: d.discount_percentage,
    };
  };

  const getSetDiscountedPrice = (setId, price) => {
    const time = new Date().toTimeString().slice(0, 5);
    const d = discounts.find(
      x =>
        x.set_id === setId &&
        x.start_time <= time &&
        x.end_time >= time
    );

    if (!d) return { hasDiscount: false, price };

    return {
      hasDiscount: true,
      oldPrice: price,
      price: (price * (1 - d.discount_percentage / 100)).toFixed(2),
      percent: d.discount_percentage,
    };
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="menu-container">
      <div className="menu-header">
        {/* TOP ICONS */}
        <div className="menu-top-actions">
          <a
            href="https://www.google.com/maps?q=40.377163,49.846409"
            target="_blank"
            rel="noopener noreferrer"
            className="top-icon"
          >
            <IoLocationSharp />
          </a>


          {/*
<a href="tel:+994501234567" className="top-icon" target="_blank">
  <IoCall />
</a>
*/}

        </div>

        {/* LOGO */}
        <div className="menu-logo">
          <img src={NardiLogo} alt="Nardi Çay Evi" />
        </div>

        {/* TITLE */}
        <h1>NARDİ Çay Evi</h1>
      </div>

      {/* FILTER BUTTONS */}
      <div className="category-filters">
        <button
          className={activeCategory === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveCategory('all')}
        >
          Hamısı
        </button>

        {sets.length > 0 && (
          <button
            className={activeCategory === 'sets' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setActiveCategory('sets')}
          >
            Setlər
          </button>
        )}

        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SETS */}
      {(activeCategory === 'all' || activeCategory === 'sets') && sets.length > 0 && (
        <div className="category-section">
          <h2 className="category-title">Setlər</h2>
          <div className="menu-grid">
            {sets.map(set => {
              const price = getSetDiscountedPrice(set.id, set.total_price);
              return (
                <div key={set.id} className="menu-item-card">
                  {set.image_url && <div className='item-image'><img src={set.image_url} alt={set.name} /></div>}
                  {price.hasDiscount && (
                    <span className="item-badge">-{price.percent}%</span>
                  )}
                  <div className="item-info">
                    <h3>{set.name}</h3>
                    <p>{set.description}</p>
                    <ul>
                      {set.set_items?.map(si => (
                        <li key={si.id}>{si.menu_items.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="item-footer">
                    {price.hasDiscount ? (
                      <>
                        <span className="price original">{price.oldPrice} AZN</span>
                        <span className="price">{price.price} AZN</span>
                      </>
                    ) : (
                      <span className="price">{set.total_price} AZN</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORY ITEMS */}
      {categories
        .filter(cat => activeCategory === 'all' || activeCategory === cat)
        .map(cat => {
          const items = menuItems.filter(i => i.category === cat);
          if (!items.length) return null;

          return (
            <div key={cat} className="category-section">
              <h2 className="category-title">{cat}</h2>
              <div className="menu-grid">
                {items.map(item => {
                  const price = getDiscountedPrice(item.id, item.price);
                  return (
                    <div key={item.id} className="menu-item-card">
                      {item.image_url && <div className='item-image'><img src={item.image_url} alt={item.name} /></div>}
                      {price.hasDiscount && (
                        <span className="item-badge">-{price.percent}%</span>
                      )}
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="item-footer">
                        {price.hasDiscount ? (
                          <>
                            <span className="price original">{price.oldPrice} AZN</span>
                            <span className="price">{price.price} AZN</span>
                          </>
                        ) : (
                          <span className="price">{item.price} AZN</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* NO CATEGORY */}
      {activeCategory === 'all' &&
        menuItems.filter(i => !i.category).length > 0 && (
          <div className="category-section">
            <h2 className="category-title">Digər Məhsullar</h2>
            <div className="menu-grid">
              {menuItems.filter(i => !i.category).map(item => {
                const price = getDiscountedPrice(item.id, item.price);
                return (
                  <div key={item.id} className="menu-item-card">
                    {item.image_url && <div className='item-image'><img src={item.image_url} alt={item.name} /></div>}
                    {price.hasDiscount && (
                      <span className="item-badge">-{price.percent}%</span>
                    )}
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>
                    <div className="item-footer">
                      {price.hasDiscount ? (
                        <>
                          <span className="price original">{price.oldPrice} AZN</span>
                          <span className="price">{price.price} AZN</span>
                        </>
                      ) : (
                        <span className="price">{item.price} AZN</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {!menuItems.length && !sets.length && (
        <div className="empty-state">
          <QrIcon size={48} />
          <p>Menyu mövcud deyil</p>
        </div>
      )}
    </div>
  );
};

export default Menu;
