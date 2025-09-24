import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await getServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-vh-100 p-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">Settings</h1>
            <p className="text-muted mb-0">Manage your account and preferences</p>
          </div>
          <Link href="/dashboard" className="btn btn-outline-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <h3 className="text-muted mb-3">⚙️ Settings Coming Soon</h3>
                <p className="text-muted">
                  Account settings, preferences, and configuration options will be available here.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link href="/dashboard" className="btn btn-primary">
                    Back to Calculator
                  </Link>
                  <button className="btn btn-outline-danger" disabled>
                    Sign Out (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
