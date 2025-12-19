import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSets,
  fetchMenuItems,
  addSet,
  updateSet,
  deleteSet
} from '../../features/menu/menuSlice';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import SetModal from './SetModal';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { IoSearch } from 'react-icons/io5';

const Sets = () => {
  const dispatch = useDispatch();
  const { sets, items, loading } = useSelector(state => state.menu);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [setsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

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

const handleSave = async (data) => {
  try {
    if (editingSet) {
      await dispatch(
        updateSet({
          id: editingSet.id,
          updates: data.set,
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
  // PAGINATION
  const indexOfLastSet = currentPage * setsPerPage;
  const indexOfFirstSet = indexOfLastSet - setsPerPage;
  const currentSets = filteredSets.slice(
    indexOfFirstSet,
    indexOfLastSet
  );

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredSets.length / setsPerPage); i++) {
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
          Setlər <span className="count">({sets.length})</span>
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
                  <th>Ad</th>
                  <th>Məhsullar</th>
                  <th>Qiymət</th>
                  <th>Status</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {currentSets.map(set => (
                  <tr key={set.id}>
                    <td>{set.name}</td>
                    <td>{set.set_items?.length || 0} məhsul</td>
                    <td>{set.total_price} AZN</td>
                    <td>
                      <span className={`badge ${set.is_available ? 'badge-success' : 'badge-danger'}`}>
                        {set.is_available ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-sm btn-secondary btn-icon"
                        onClick={() => handleEdit(set)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger btn-icon"
                        onClick={() => handleDelete(set.id)}
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
