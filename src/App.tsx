import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Landing } from '@/pages/Landing'
import { LegalPage } from '@/pages/Legal'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { NewOperation } from '@/pages/NewOperation'
import { History } from '@/pages/History'
import { OperationDetail } from '@/pages/OperationDetail'
import { Security } from '@/pages/Security'
import { Wallets } from '@/pages/Wallets'
import { Networks } from '@/pages/Networks'
import { Liquidations } from '@/pages/Liquidations'
import { Verification } from '@/pages/Verification'
import { Settings } from '@/pages/Settings'
import { useAuth } from '@/store/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function MarketingPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MarketingPage>
              <Landing />
            </MarketingPage>
          }
        />
        <Route path="/terms" element={<MarketingPage><LegalPage type="terms" /></MarketingPage>} />
        <Route path="/privacy" element={<MarketingPage><LegalPage type="privacy" /></MarketingPage>} />
        <Route path="/compliance" element={<MarketingPage><LegalPage type="compliance" /></MarketingPage>} />
        <Route path="/security-info" element={<MarketingPage><LegalPage type="security" /></MarketingPage>} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-liquidation" element={<NewOperation />} />
          <Route path="liquidations" element={<Liquidations />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="networks" element={<Networks />} />
          <Route path="verification" element={<Verification />} />
          <Route path="history" element={<History />} />
          <Route path="operation/:id" element={<OperationDetail />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
