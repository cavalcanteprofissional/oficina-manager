import Sidebar from '@/components/layout/Sidebar'
import BottomNavigation from '@/components/layout/BottomNavigation'
import AuthCheck from '@/components/layout/AuthCheck'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:ml-64 pb-20 lg:pb-0">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
        <BottomNavigation />
      </div>
    </AuthCheck>
  )
}
