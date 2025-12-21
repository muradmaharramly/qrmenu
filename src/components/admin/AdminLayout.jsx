import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { Home, ShoppingBag, Package, Percent, QrCode } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { IoMdLogOut } from 'react-icons/io';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CiUser } from 'react-icons/ci';
import qrLogo from '../../images/qrmenu-logo.png';

const AdminLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { authLoading } = useSelector(state => state.auth);
    const [userEmail, setUserEmail] = useState('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [pageTitle, setPageTitle] = useState('Dashboard');

    const MySwal = withReactContent(Swal);

    // Get user email
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUserEmail(data.user.email);
            }
        };

        getUser();
    }, []);

    // Update page title based on route
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('menu-items')) setPageTitle('Məhsullar');
        else if (path.includes('sets')) setPageTitle('Setlər');
        else if (path.includes('discounts')) setPageTitle('Endirimlər');
        else if (path.includes('qr')) setPageTitle('QR Kod');
        else setPageTitle('Ana Səhifə');
    }, [location]);

    // Check screen size
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            
            // Close sidebar when switching to desktop
            if (!mobile) {
                setIsMobileOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobile && isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, isMobileOpen]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Don't close if clicking the toggle button
            if (e.target.closest('.mobile-toggle-btn')) {
                return;
            }
            
            if (
                isMobileOpen && 
                !e.target.closest('.sidebar')
            ) {
                setIsMobileOpen(false);
            }
        };

        if (isMobile && isMobileOpen) {
            // Use mousedown instead of click for better UX
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside);
            };
        }
    }, [isMobileOpen, isMobile]);

    const toggleMobileMenu = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        setIsMobileOpen(!isMobileOpen);
    };

    const handleLinkClick = () => {
        if (isMobile) {
            setIsMobileOpen(false);
        }
    };

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
            {/* Mobile Top Bar - OPTION 1 */}
            {isMobile && (
                <div className="mobile-top-bar">
                    <button 
                        className="mobile-toggle-btn" 
                        onClick={toggleMobileMenu}
                        aria-label={isMobileOpen ? 'Menyunu bağla' : 'Menyunu aç'}
                        aria-expanded={isMobileOpen}
                    >
                        {isMobileOpen ? <HiX /> : <HiMenuAlt3 />}
                    </button>
                    <span className="page-title-mobile">{pageTitle}</span>
                </div>
            )}

            {/* Mobile Overlay */}
            {isMobile && isMobileOpen && (
                <div 
                    className="mobile-overlay active" 
                    onClick={() => setIsMobileOpen(false)} 
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobile && isMobileOpen ? 'mobile-open' : ''}`}>
                <div>
                    <div className="logo">
                        <img src={qrLogo} alt="QR Menu Logo" />
                        QR Menyu
                    </div>
                    
                    <ul className="nav-menu">
                        <li>
                            <NavLink 
                                to="/admin/home" 
                                onClick={handleLinkClick}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <Home size={20} />
                                <span>Ana Səhifə</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/admin/menu-items" 
                                onClick={handleLinkClick}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <ShoppingBag size={20} />
                                <span>Məhsullar</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/admin/sets" 
                                onClick={handleLinkClick}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <Package size={20} />
                                <span>Setlər</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/admin/discounts" 
                                onClick={handleLinkClick}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <Percent size={20} />
                                <span>Endirimlər</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/admin/qr" 
                                onClick={handleLinkClick}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <QrCode size={20} />
                                <span>QR Kod</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <div className="admin-info">
                        <div className="user-icon">
                            <CiUser />
                            <span className="active-dot"></span>
                        </div>
                        <span className="admin-role" title={userEmail}>
                            {userEmail}
                        </span>
                    </div>

                    <button onClick={handleLogout} className="logout-btn" disabled={authLoading}>
                        {authLoading ? 'Çıxış edilir...' : 'Çıxış et'}
                        <IoMdLogOut />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;