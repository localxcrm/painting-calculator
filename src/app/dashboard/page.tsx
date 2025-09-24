import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Dashboard from '@/components/Dashboard'

export default async function DashboardPage() {
  const supabase = await getServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <Dashboard />
}
