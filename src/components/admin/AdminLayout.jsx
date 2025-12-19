import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { Home, ShoppingBag, Package, Percent, QrCode } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { IoMdLogOut } from 'react-icons/io';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CiUser } from 'react-icons/ci';
import qrLogo from '../../images/qrmenu-logo.png';

const AdminLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { authLoading } = useSelector(state => state.auth);
    const [userEmail, setUserEmail] = useState('');

    const MySwal = withReactContent(Swal);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUserEmail(data.user.email);
            }
        };

        getUser();
    }, []);


    const handleLogout = async () => {
        const result = await MySwal.fire({
            title: 'Çıxış etmək istədiyinizə əminsiniz?',
            text: 'Hesabınızdan çıxacaqsınız',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Bəli, çıxış et',
            cancelButtonText: 'İmtina et',
            reverseButtons: true,
            customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                content: 'swal-text',
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            }
        });

        if (!result.isConfirmed) return;

        await supabase.auth.signOut();
        dispatch(logoutUser());
        navigate('/login', { replace: true });

        MySwal.fire({
            title: 'Çıxış edildi!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1600,
            timerProgressBar: true,
            customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                content: 'swal-text'
            }
        });
    };



    return (
        <div className="admin-panel">
            <aside className="sidebar">
                <div><div className="logo"><img src={qrLogo}></img>QR Menyu</div>
                    <ul className="nav-menu">
                        <li>
                            <NavLink to="/admin/home">
                                <Home size={20} /> Ana Səhifə
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/menu-items">
                                <ShoppingBag size={20} /> Məhsullar
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/sets">
                                <Package size={20} /> Setlər
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/discounts">
                                <Percent size={20} /> Endirimlər
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/qr">
                                <QrCode size={20} /> QR Kod
                            </NavLink>
                        </li>
                    </ul></div>

                <div><div className="admin-info">
                    <div className="user-icon">
                        <CiUser />

                            <span className="active-dot"></span>
                    </div>

                    <span className="admin-role">{userEmail}</span>
                </div>



                    <button onClick={handleLogout} className="logout-btn">
                        {authLoading ? 'Çıxış edilir...' : 'Çıxış et'}<IoMdLogOut />
                    </button></div>
            </aside>
            <main className="main-content">{children}</main>
        </div>
    );
};

export default AdminLayout;
