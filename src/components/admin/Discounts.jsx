import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDiscounts,
  addDiscount,
  updateDiscount,
  deleteDiscount
} from '../../features/discount/discountSlice';
import { fetchMenuItems, fetchSets } from '../../features/menu/menuSlice';
import { Plus, Edit2, Trash2, Percent } from 'lucide-react';
import DiscountModal from './DiscountModal';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { IoSearch } from 'react-icons/io5';

const Discounts = () => {
  const dispatch = useDispatch();

  const { discounts, loading } = useSelector(state => state.discount);
  const { items, sets } = useSelector(state => state.menu);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [discountsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    dispatch(fetchDiscounts());
    dispatch(fetchMenuItems());
    dispatch(fetchSets());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingDiscount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

 const handleDelete = async (id) => {
  const result = await MySwal.fire({
    title: 'Endirimi silmək istədiyinizə əminsiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Bəli, sil',
    cancelButtonText: 'İmtina et',
    customClass: {
      popup: 'swal-popup',
      title: 'swal-title',
      content: 'swal-text',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
    },
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    await dispatch(deleteDiscount(id));
  }
};

const handleSave = async (data) => {
  try {
    if (editingDiscount) {
      await dispatch(
        updateDiscount({
          id: editingDiscount.id,
          updates: data,
        })
      );

      await MySwal.fire({
        icon: 'success',
        title: 'Endirim yeniləndi',
        text: 'Endirim məlumatları dəyişdirildi',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-text',
          confirmButton: 'swal-confirm-btn',
        },
      });
    } else {
      await dispatch(addDiscount(data));

      await MySwal.fire({
        icon: 'success',
        title: 'Endirim yaradıldı',
        text: 'Yeni endirim uğurla əlavə olundu',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-text',
          confirmButton: 'swal-confirm-btn',
        },
      });
    }

    setIsModalOpen(false);
  } catch (error) {
    MySwal.fire({
      icon: 'error',
      title: 'Xəta',
      text: 'Endirim əməliyyatı baş tutmadı',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        content: 'swal-text',
        confirmButton: 'swal-confirm-btn',
      },
    });
  }
};


  const getItemName = (discount) => {
    if (discount.menu_item_id) {
      const item = items.find(i => i.id === discount.menu_item_id);
      return item?.name || 'Məhsul';
    } else {
      const set = sets.find(s => s.id === discount.set_id);
      return set?.name || 'Set';
    }
  };

  // -------------------------
  // SEARCH
  const filteredDiscounts = discounts.filter(discount =>
    getItemName(discount).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // PAGINATION
  const indexOfLastDiscount = currentPage * discountsPerPage;
  const indexOfFirstDiscount = indexOfLastDiscount - discountsPerPage;
  const currentDiscounts = filteredDiscounts.slice(
    indexOfFirstDiscount,
    indexOfLastDiscount
  );

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDiscounts.length / discountsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* HEADER */}
      <div className="card-header">
        <h2>
          Endirimlər <span className="count">({discounts.length})</span>
        </h2>

        <div className="header-actions">
          <div className='search-bar'>
            <input
            type="text"
            className="search-input"
            placeholder="Axtar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <IoSearch />
          </div>

          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={20} />
            Yeni Endirim
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="card-body">
        {filteredDiscounts.length === 0 ? (
          <div className="empty-state">
            <Percent size={48} />
            <p>Endirim tapılmadı</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Məhsul / Set</th>
                  <th>Endirim %</th>
                  <th>Başlama</th>
                  <th>Bitmə</th>
                  <th>Status</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {currentDiscounts.map(discount => (
                  <tr key={discount.id}>
                    <td>{getItemName(discount)}</td>
                    <td>{discount.discount_percentage}%</td>
                    <td>{discount.start_time}</td>
                    <td>{discount.end_time}</td>
                    <td>
                      <span className={`badge ${discount.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {discount.is_active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-sm btn-secondary btn-icon"
                        onClick={() => handleEdit(discount)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger btn-icon"
                        onClick={() => handleDelete(discount.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pageNumbers.length > 1 && (
              <div className="pagination">
                {pageNumbers.map(number => (
                  <button
                    key={number}
                    className={`page-btn ${currentPage === number ? 'active' : ''}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <DiscountModal
          discount={editingDiscount}
          menuItems={items}
          sets={sets}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Discounts;
