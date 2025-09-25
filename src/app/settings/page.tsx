import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await getServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get current user
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) {
    redirect('/login')
  }

  // Load user profile settings and company id
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('settings, company_id')
    .eq('id', userRes.user.id)
    .single()

  // Load company defaults (if available and authorized by RLS)
  let companyDefaults: Record<string, number> | null = null
  if (profile?.company_id) {
    const { data: companyRow } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', profile.company_id)
      .single()
    if (companyRow?.settings && typeof companyRow.settings === 'object') {
      companyDefaults = companyRow.settings as Record<string, number>
    }
  }

  const initialUserSettings =
    profile?.settings && typeof profile.settings === 'object'
      ? (profile.settings as Record<string, number>)
      : null

  return (
    <div className="min-vh-100 p-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">Settings</h1>
            <p className="text-muted mb-0">Manage your calculator defaults and preferences</p>
          </div>
          <Link href="/dashboard" className="btn btn-outline-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="row">
          <div className="col-md-8">
            <SettingsForm
              initialUserSettings={initialUserSettings as any}
              companyDefaults={companyDefaults as any}
            />
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
                  <form action="/login" method="get">
                    <button className="btn btn-outline-danger" type="submit">
                      Sign Out (Go to Login)
                    </button>
                  </form>
                  <div className="alert alert-info mb-0">
                    <small>
                      Tip: Use "Apply to Calculator Now" after saving to immediately see your defaults in the Dashboard.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
