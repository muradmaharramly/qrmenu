import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './services/supabase'
import { setUser } from './features/auth/authSlice'

// Pages
import Login from './pages/Login'
import Menu from './pages/Menu'

// Admin
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import MenuItems from './components/admin/MenuItems'
import Sets from './components/admin/Sets'
import Discounts from './components/admin/Discounts'
import QRManager from './components/admin/QRManager'

// Styles
import './styles/main.scss'

/* =======================
   ROUTE GUARDS
======================= */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector(state => state.auth)

  if (loading) return null 

  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useSelector(state => state.auth)

  if (loading) return null

  return user ? <Navigate to="/admin/home" replace /> : children
}

/* =======================
   APP
======================= */

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null))
    })

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route path="/menu" element={<Menu />} />

        {/* ADMIN */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/menu-items"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MenuItems />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sets"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Sets />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/discounts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Discounts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/qr"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <QRManager />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
