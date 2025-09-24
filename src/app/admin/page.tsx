import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await getServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user role from user_profiles table
  const { data: user } = await supabase.auth.getUser()
  const userId = user.user?.id

  if (!userId) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    redirect('/dashboard')
  }

  const userRole = profile?.role || 'user'

  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Mock data for demonstration
  const stats = {
    totalUsers: 25,
    activeUsers: 22,
    projectsThisMonth: 150,
    conversionRate: 85
  }

  return (
    <div className="min-vh-100 p-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">Admin Dashboard</h1>
            <p className="text-muted mb-0">Manage users, settings, and system analytics</p>
          </div>
          <div className="text-end">
            <small className="text-muted">Welcome back, Admin</small>
            <br />
            <small className="text-muted">{new Date().toLocaleDateString()}</small>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body text-center">
                <div className="h3 mb-1 text-primary">{stats.totalUsers}</div>
                <div className="small text-muted">Total Users</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body text-center">
                <div className="h3 mb-1 text-success">{stats.activeUsers}</div>
                <div className="small text-muted">Active Users</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-info">
              <div className="card-body text-center">
                <div className="h3 mb-1 text-info">{stats.projectsThisMonth}</div>
                <div className="small text-muted">Projects This Month</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-warning">
              <div className="card-body text-center">
                <div className="h3 mb-1 text-warning">{stats.conversionRate}%</div>
                <div className="small text-muted">Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">🏢 Company Management</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Add new painting companies and manage their default settings.
                </p>
                <Link href="/admin/companies" className="btn btn-primary">
                  Manage Companies
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">👥 User Management</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Manage user accounts, roles, and permissions across your organization.
                </p>
                <Link href="/admin/users" className="btn btn-primary">
                  Manage Users
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">⚙️ Global Settings</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Configure company-wide defaults for pricing, commissions, and policies.
                </p>
                <button className="btn btn-outline-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">📈 Analytics & Reports</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  View detailed analytics about system usage, project completion, and performance.
                </p>
                <button className="btn btn-outline-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">🔧 System Settings</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Configure system-wide settings, backups, and maintenance options.
                </p>
                <button className="btn btn-outline-primary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">📋 Recent Activity</h5>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>New user registered:</strong> john.doe@example.com
                  </div>
                  <small className="text-muted">2 hours ago</small>
                </div>
              </div>
              <div className="list-group-item px-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Project completed:</strong> Residential Paint Job - $12,500
                  </div>
                  <small className="text-muted">4 hours ago</small>
                </div>
              </div>
              <div className="list-group-item px-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Settings updated:</strong> Default commission rates changed
                  </div>
                  <small className="text-muted">1 day ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
