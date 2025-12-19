import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SetModal = ({ set, menuItems, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_price: '',
    image_url: '',
    is_available: true
  });
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (set) {
      setFormData({
        name: set.name,
        description: set.description,
        total_price: set.total_price,
        image_url: set.image_url,
        is_available: set.is_available
      });
      setSelectedItems(set.set_items?.map(si => si.menu_item_id) || []);
    }
  }, [set]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      set: formData,
      items: selectedItems
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{set ? 'Seti Redaktə Et' : 'Yeni Set'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Set Adı *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Təsvir</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Toplam Qiymət (AZN) *</label>
            <input
              type="number"
              step="0.01"
              name="total_price"
              value={formData.total_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Şəkil URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Məhsulları Seçin *</label>
            <div className="checkbox-list">
              {menuItems.map(item => (
                <label key={item.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                  />
                  {item.name} ({item.price} AZN)
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
              />
              {' '}Aktiv
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Ləğv et
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={selectedItems.length === 0}
            >
              Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetModal;