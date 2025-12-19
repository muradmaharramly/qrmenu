import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DiscountModal = ({ discount, menuItems, sets, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'item', // 'item' or 'set'
    menu_item_id: '',
    set_id: '',
    discount_percentage: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        type: discount.menu_item_id ? 'item' : 'set',
        menu_item_id: discount.menu_item_id || '',
        set_id: discount.set_id || '',
        discount_percentage: discount.discount_percentage,
        start_time: discount.start_time,
        end_time: discount.end_time,
        is_active: discount.is_active
      });
    }
  }, [discount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      menu_item_id: formData.type === 'item' ? formData.menu_item_id : null,
      set_id: formData.type === 'set' ? formData.set_id : null,
      discount_percentage: parseFloat(formData.discount_percentage),
      start_time: formData.start_time,
      end_time: formData.end_time,
      is_active: formData.is_active
    };
    onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{discount ? 'Endirimi Redaktə Et' : 'Yeni Endirim'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Növ</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="item">Məhsul</option>
              <option value="set">Set</option>
            </select>
          </div>

          {formData.type === 'item' ? (
            <div className="form-group">
              <label>Məhsul Seçin *</label>
              <select 
                name="menu_item_id" 
                value={formData.menu_item_id} 
                onChange={handleChange}
                required
              >
                <option value="">Seçin</option>
                {menuItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.price} AZN)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Set Seçin *</label>
              <select 
                name="set_id" 
                value={formData.set_id} 
                onChange={handleChange}
                required
              >
                <option value="">Seçin</option>
                {sets.map(set => (
                  <option key={set.id} value={set.id}>
                    {set.name} ({set.total_price} AZN)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Endirim Faizi (%) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Başlama Saatı *</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Bitmə Saatı *</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              {' '}Aktiv
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Ləğv et
            </button>
            <button type="submit" className="btn btn-primary">
              Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;