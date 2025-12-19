import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems, fetchSets } from '../../features/menu/menuSlice';
import { fetchDiscounts } from '../../features/discount/discountSlice';
import { ShoppingBag, Package, Percent, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items, sets } = useSelector(state => state.menu);
  const { discounts } = useSelector(state => state.discount);

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchSets());
    dispatch(fetchDiscounts());
  }, [dispatch]);

  const activeItems = items.filter(item => item.is_available).length;
  const activeSets = sets.filter(set => set.is_available).length;
  const activeDiscounts = discounts.filter(d => d.is_active).length;

  const stats = [
    {
      title: 'Aktiv Məhsullar',
      value: activeItems,
      total: items.length,
      icon: ShoppingBag,
      color: '#F5C051'
    },
    {
      title: 'Aktiv Setlər',
      value: activeSets,
      total: sets.length,
      icon: Package,
      color: '#4CAF50'
    },
    {
      title: 'Aktiv Endirimlər',
      value: activeDiscounts,
      total: discounts.length,
      icon: Percent,
      color: '#ff9800'
    },
    {
      title: 'Toplam Məhsul',
      value: items.length + sets.length,
      total: items.length + sets.length,
      icon: TrendingUp,
      color: '#2196F3'
    }
  ];

  return (
    <div>
      <h1 className="page-title">İdarəetmə Paneli</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <div className="stat-value">
                <span className="value">{stat.value}</span>
                <span className="total">/ {stat.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Son Məhsullar</h2>
          </div>
          <div className="card-body">
            {items.slice(0, 5).map(item => (
              <div key={item.id} className="list-item">
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.category}</p>
                </div>
                <span className="price">{item.price} AZN</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Son Setlər</h2>
          </div>
          <div className="card-body">
            {sets.slice(0, 5).map(set => (
              <div key={set.id} className="list-item">
                <div>
                  <h4>{set.name}</h4>
                  <p>{set.set_items?.length || 0} məhsul</p>
                </div>
                <span className="price">{set.total_price} AZN</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
