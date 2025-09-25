import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import CompaniesClient from './CompaniesClient'

export default async function CompaniesPage() {
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

  // Fetch all companies with user counts
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      domain,
      status,
      settings,
      created_at,
      user_profiles(count)
    `)
    .order('created_at', { ascending: false })

  if (companiesError) {
    console.error('Error fetching companies:', companiesError)
  }

  // Transform the data for the client component
  const transformedCompanies = (companies || []).map(company => ({
    id: company.id,
    name: company.name,
    domain: company.domain || '',
    status: company.status || 'active',
    usersCount: Array.isArray(company.user_profiles) ? company.user_profiles.length : 0,
    projectsCount: 0, // TODO: Add projects count when projects are implemented
    createdAt: new Date(company.created_at).toLocaleDateString(),
    settings: {
      defaultPricePerSq: company.settings?.defaultPricePerSq || 4.00,
      defaultHourlyRate: company.settings?.defaultHourlyRate || 65,
      defaultCommissionSales: company.settings?.defaultCommissionSales || 10,
      defaultCommissionPM: company.settings?.defaultCommissionPM || 5,
      defaultMaterialPercentage: company.settings?.defaultMaterialPercentage || 12,
      defaultMarginPercentage: company.settings?.defaultMarginPercentage || 25
    }
  }))

  return <CompaniesClient initialCompanies={transformedCompanies} />
}
