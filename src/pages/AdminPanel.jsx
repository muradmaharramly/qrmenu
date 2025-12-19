import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import MenuItems from '../components/admin/MenuItems';
import Sets from '../components/admin/Sets';
import Discounts from '../components/admin/Discounts';
import QRManager from '../components/admin/QRManager';

const AdminPanel = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="sets" element={<Sets />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="qr" element={<QRManager />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPanel;