import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { DashboardTopBar } from './DashboardTopBar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <DashboardTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
