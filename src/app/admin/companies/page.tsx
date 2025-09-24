import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import CompaniesClient from './CompaniesClient'

interface Company {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'pending';
  usersCount: number;
  projectsCount: number;
  createdAt: string;
  settings: {
    defaultPricePerSq: number;
    defaultHourlyRate: number;
    defaultCommissionSales: number;
    defaultCommissionPM: number;
  };
}

export default async function CompaniesPage() {
  const supabase = await getServerSupabase()

  // Check admin access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: user } = await supabase.auth.getUser()
  const userId = user.user?.id
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch companies with user and project counts
  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      domain,
      status,
      created_at,
      settings,
      user_profiles(count),
      projects(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching companies:', error)
  }

  // Transform data to match interface
  const transformedCompanies: Company[] = (companies || []).map(company => ({
    id: company.id,
    name: company.name,
    domain: company.domain,
    status: company.status,
    usersCount: company.user_profiles?.[0]?.count || 0,
    projectsCount: company.projects?.[0]?.count || 0,
    createdAt: new Date(company.created_at).toISOString().split('T')[0],
    settings: company.settings || {
      defaultPricePerSq: 4.00,
      defaultHourlyRate: 65,
      defaultCommissionSales: 10,
      defaultCommissionPM: 5
    }
  }))

  return <CompaniesClient initialCompanies={transformedCompanies} />
}
