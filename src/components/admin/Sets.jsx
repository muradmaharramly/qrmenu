import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSets,
  fetchMenuItems,
  addSet,
  updateSet,
  deleteSet
} from '../../features/menu/menuSlice';
import { Plus, Edit2, Trash2, Package, Eye, X } from 'lucide-react';
import SetModal from './SetModal';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { IoSearch } from 'react-icons/io5';
import { LuImageOff } from 'react-icons/lu';
import ReactDOMServer from 'react-dom/server';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const Sets = () => {
  const dispatch = useDispatch();
  const { sets, items, loading } = useSelector(state => state.menu);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [setsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSet, setViewingSet] = useState(null);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    dispatch(fetchSets());
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingSet(null);
    setIsModalOpen(true);
  };

  const handleEdit = (set) => {
    setEditingSet(set);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Seti silmək istədiyinizə əminsiniz?',
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
      await dispatch(deleteSet(id));
    }
  };

  const handleViewDetailsWithIcon = (set) => {
  const itemsHtml = set.set_items?.length > 0 
    ? set.set_items.map(si => {
        const item = items.find(i => i.id === si.menu_item_id);
        return `
          <div class="set-item">
            <span class="item-name">
              ${item?.name || 'Məhsul tapılmadı'}
            </span>
            <span class="item-quantity">
              ${si.quantity || 1}x
            </span>
          </div>
        `;
      }).join('')
    : '<p class="items-empty">Məhsul yoxdur</p>';

  MySwal.fire({
    title: set.name,
    html: `
      <div class="set-details-content">
        ${set.image_url ? `
          <img 
            src="${set.image_url}" 
            alt="${set.name}" 
            class="set-image"
          />
        ` : ''}
        
        ${set.description ? `
          <p class="set-description">
            ${set.description}
          </p>
        ` : ''}
        
        <div class="set-items-container">
          <h4 class="items-title">Məhsullar</h4>
          <div class="items-list">
            ${itemsHtml}
          </div>
        </div>
        
        <div class="set-total-price">
          <span class="price-label">Toplam Qiymət:</span>
          <span class="price-value">${set.total_price} AZN</span>
        </div>
      </div>
    `,
    confirmButtonText: `
      <div style="display: flex; align-items: center; gap: 8px;">
        ${ReactDOMServer.renderToString(<X size={18} />)}
      </div>
    `,
    customClass: {
      popup: 'swal-set-details',
      confirmButton: 'swal-confirm-btn',
    },
    width: '600px',
  });
};


  const handleSave = async (data) => {
    try {
      if (editingSet) {
        await dispatch(
          updateSet({
            id: editingSet.id,
            updates: data.set,
            items: data.items, // quantity ilə
          })
        );

        MySwal.fire({
          icon: 'success',
          title: 'Set yeniləndi',
          text: 'Set məlumatları dəyişdirildi',
          timer: 1800,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup',
          },
        });
      } else {
        await dispatch(addSet(data));

        MySwal.fire({
          icon: 'success',
          title: 'Set yaradıldı',
          text: 'Yeni set əlavə olundu',
          timer: 1800,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup',
          },
        });
      }

      setIsModalOpen(false);
    } catch {
      MySwal.fire({
        icon: 'error',
        title: 'Xəta',
        text: 'Set əməliyyatı baş tutmadı',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-popup error',
        },
      });
    }
  };

  // -------------------------
  // SEARCH
  const filteredSets = sets.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredSets.length / setsPerPage);
  const indexOfLastSet = currentPage * setsPerPage;
  const indexOfFirstSet = indexOfLastSet - setsPerPage;
  const currentSets = filteredSets.slice(indexOfFirstSet, indexOfLastSet);

  const maxVisiblePages = 5;

  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2)
  );
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  // Toplam məhsul sayını hesabla (quantity ilə)
  const getTotalItemsCount = (set) => {
    return set.set_items?.reduce((total, si) => total + (si.quantity || 1), 0) || 0;
  };

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
          Setlər <span className="count">({sets.length})</span>
        </h2>

        <div className="header-actions">
          <div className="search-bar">
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
            Yeni Set
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="card-body">
        {filteredSets.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>Set tapılmadı</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Şəkil</th>
                  <th>Ad</th>
                  <th>Məhsullar</th>
                  <th>Toplam Say</th>
                  <th>Qiymət</th>
                  <th>Status</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {currentSets.map(set => (
                  <tr key={set.id}>
                    <td>
                      <div className="item-image">
                        {set.image_url ? (
                          <img src={set.image_url} alt={set.name} />
                        ) : (
                          <LuImageOff size={32} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="item-name-cell">
                        {set.name}
                        {set.description && (
                          <small className="item-description">
                            {set.description.substring(0, 50)}
                            {set.description.length > 50 ? '...' : ''}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="item-count">
                        {set.set_items?.length || 0} növ
                      </span>
                    </td>
                    <td>
                      <span className="total-quantity">
                        {getTotalItemsCount(set)} ədəd
                      </span>
                    </td>
                    <td>
                      <span className="price">{set.total_price} AZN</span>
                    </td>
                    <td>
                      <span className={`badge ${set.is_available ? 'badge-success' : 'badge-danger'}`}>
                        {set.is_available ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-sm btn-info btn-icon"
                        onClick={() => handleViewDetailsWithIcon(set)}
                        title="Təfərrüatlar"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-edit btn-icon"
                        onClick={() => handleEdit(set)}
                        title="Redaktə et"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger btn-icon"
                        onClick={() => handleDelete(set.id)}
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn arrow"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <IoIosArrowBack />
                </button>

                {startPage > 1 && (
                  <>
                    <button className="page-btn" onClick={() => setCurrentPage(1)}>
                      1
                    </button>
                    <span className="dots">...</span>
                  </>
                )}

                {visiblePages.map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    <span className="dots">...</span>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="page-btn arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <IoIosArrowForward />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <SetModal
          set={editingSet}
          menuItems={items}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Sets;