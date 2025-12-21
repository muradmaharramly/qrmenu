import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; 

const MenuItemModal = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (item.image_url) {
        setImagePreview(item.image_url);
      }
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      const filePath = `menu-items/${fileName}`;

      if (item?.image_url) {
        const oldPath = item.image_url.split('/').pop();
        if (oldPath && oldPath !== fileName) {
          await supabase.storage
            .from('menu-images')
            .remove([`menu-items/${oldPath}`]);
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
      ...formData,
      image_url: imageUrl
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
          <h3>{item ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ad *</label>
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

          <div className="form-row">
            <div className="form-group">
              <label>Qiymət (AZN) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Kateqoriya</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
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
            <label>
              <input
                type="checkbox"
                className="custom-checkbox"
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
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Yüklənir...' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default MenuItemModal;