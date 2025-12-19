import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
} from '../../features/menu/menuSlice';
import { Plus, Edit2, Trash2, ShoppingBag } from 'lucide-react';
import MenuItemModal from './MenuItemModal';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { IoSearch } from 'react-icons/io5';

const MenuItems = () => {
    const dispatch = useDispatch();
    const { items, loading } = useSelector(state => state.menu);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const MySwal = withReactContent(Swal);

    useEffect(() => {
        dispatch(fetchMenuItems());
    }, [dispatch]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
  const result = await MySwal.fire({
    title: 'Məhsulu silmək istədiyinizə əminsiniz?',
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
    await dispatch(deleteMenuItem(id));
  }
};

const handleSave = async (data) => {
  try {
    if (editingItem) {
      await dispatch(
        updateMenuItem({
          id: editingItem.id,
          updates: data,
        })
      );

      MySwal.fire({
        icon: 'success',
        title: 'Yeniləndi',
        text: 'Məhsul məlumatları dəyişdirildi',
        timer: 1800,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-popup',
        },
      });
    } else {
      await dispatch(addMenuItem(data));

      MySwal.fire({
        icon: 'success',
        title: 'Əlavə edildi',
        text: 'Yeni məhsul əlavə olundu',
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
      text: 'Məhsul yadda saxlanılmadı',
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
    const filteredItems = items.filter(item =>
        `${item.name} ${item.category}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // -------------------------
    // PAGINATION
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredItems.length / itemsPerPage); i++) {
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
                    Məhsullar <span className="count">({items.length})</span>
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
                        Yeni Məhsul
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="card-body">
                {filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={48} />
                        <p>Məhsul tapılmadı</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ad</th>
                                    <th>Kateqoriya</th>
                                    <th>Qiymət</th>
                                    <th>Status</th>
                                    <th>Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td>{item.price} AZN</td>
                                        <td>
                                            <span className={`badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                                                {item.is_available ? 'Aktiv' : 'Deaktiv'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn btn-sm btn-secondary btn-icon"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger btn-icon"
                                                onClick={() => handleDelete(item.id)}
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
                <MenuItemModal
                    item={editingItem}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default MenuItems;
