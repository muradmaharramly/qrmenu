import React, { useState, useEffect } from 'react';
import { X, Upload, ImageIcon, Plus, Minus } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const SetModal = ({ set, menuItems, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_price: '',
    image_url: '',
    is_available: true
  });
  // selectedItems artıq { id, quantity } obyektləri array-idir
  const [selectedItems, setSelectedItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (set) {
      setFormData({
        name: set.name,
        description: set.description,
        total_price: set.total_price,
        image_url: set.image_url,
        is_available: set.is_available
      });
      
      // Set items-dən quantity məlumatını alırıq
      const items = set.set_items?.map(si => ({
        id: si.menu_item_id,
        quantity: si.quantity || 1
      })) || [];
      setSelectedItems(items);
      
      if (set.image_url) {
        setImagePreview(set.image_url);
      }
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
    setSelectedItems(prev => {
      const exists = prev.find(item => item.id === itemId);
      if (exists) {
        // Məhsulu sil
        return prev.filter(item => item.id !== itemId);
      } else {
        // Məhsulu əlavə et (default quantity: 1)
        return [...prev, { id: itemId, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (itemId, change) => {
    setSelectedItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleQuantityInput = (itemId, value) => {
    const quantity = parseInt(value) || 1;
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const isItemSelected = (itemId) => {
    return selectedItems.some(item => item.id === itemId);
  };

  const getItemQuantity = (itemId) => {
    const item = selectedItems.find(item => item.id === itemId);
    return item ? item.quantity : 1;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Fayl ölçüsü 5MB-dan çox ola bilməz');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Yalnız şəkil faylları yükləyə bilərsiniz');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url;

    try {
      setUploading(true);

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sets/${fileName}`;

      if (set?.image_url) {
        const oldPath = set.image_url.split('/').pop();
        if (oldPath && oldPath !== fileName) {
          await supabase.storage
            .from('menu-images')
            .remove([`sets/${oldPath}`]);
        }
      }

      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Şəkil yükləmə xətası:', error);
      alert('Şəkil yükləmədə xəta baş verdi');
      return formData.image_url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const imageUrl = await uploadImage();
    
    onSave({
      set: {
        ...formData,
        image_url: imageUrl
      },
      items: selectedItems // { id, quantity } formatında
    });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
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

        <div>
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
            <label>Şəkil</label>
            <div className="image-upload-container">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <ImageIcon size={48} />
                    <p>Şəkil seçin</p>
                    <span>PNG, JPG, WEBP (Max 5MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Məhsulları Seçin *</label>
            <div className="checkbox-list">
              {menuItems.map(item => {
                const isSelected = isItemSelected(item.id);
                const quantity = getItemQuantity(item.id);
                
                return (
                  <div key={item.id} className="checkbox-item-container">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="custom-checkbox" 
                        checked={isSelected}
                        onChange={() => handleItemToggle(item.id)}
                      />
                      <span className="item-name">
                        {item.name} ({item.price} AZN)
                      </span>
                    </label>
                    
                    {isSelected && (
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          className="quantity-input"
                          value={quantity}
                          onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                          min="1"
                        />
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_available"
                className="custom-checkbox" 
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
              type="button" 
              className="btn btn-primary"
              disabled={selectedItems.length === 0 || uploading}
              onClick={handleSubmit}
            >
              {uploading ? 'Yüklənir...' : 'Yadda saxla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetModal;