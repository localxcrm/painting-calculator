import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Dashboard from '@/components/Dashboard'
import type { ProjectData } from '@/types'

export default async function DashboardPage() {
  const supabase = await getServerSupabase()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Current user
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) {
    redirect('/login')
  }

  // Load user profile (personal settings) and company id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('settings, company_id')
    .eq('id', userRes.user.id)
    .single()

  // Load company defaults
  let companySettings: Record<string, number> | null = null
  if (profile?.company_id) {
    const { data: companyRow } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', profile.company_id)
      .single()
    if (companyRow?.settings && typeof companyRow.settings === 'object') {
      companySettings = companyRow.settings as Record<string, number>
    }
  }

  // Map company defaults (companies.settings) to user/Calculator keys
  const mapCompanyDefaultsToUser = (raw: Record<string, number> | null | undefined): Partial<ProjectData> => ({
    pricePerSq: raw?.defaultPricePerSq,
    hourlyRateWithMaterials: raw?.defaultHourlyRate,
    salesCommissionPercentage: raw?.defaultCommissionSales,
    pmCommissionPercentage: raw?.defaultCommissionPM,
    targetMaterialPercentage: raw?.defaultMaterialPercentage,
    targetMarginPercentage: raw?.defaultMarginPercentage,
  })

  const userSettings = (profile?.settings ?? {}) as Partial<ProjectData>
  const mappedDefaults: Partial<ProjectData> = mapCompanyDefaultsToUser(companySettings)

  // Helper to coalesce number from user settings, then company defaults, else 0
  const getNum = (key: keyof ProjectData): number => {
    const u = userSettings?.[key]
    if (typeof u === 'number') return u
    const m = mappedDefaults[key]
    if (typeof m === 'number') return m
    return 0
  }

  const initialData: ProjectData = {
    pricePerSq: getNum('pricePerSq') || 3.50,
    squareFootage: getNum('squareFootage') || 2000,
    hourlyRateWithMaterials: getNum('hourlyRateWithMaterials') || 65,
    numPainters: getNum('numPainters') || 2,
    hoursPerDay: getNum('hoursPerDay') || 8,
    paintCoverage: getNum('paintCoverage') || 350,
    numberOfCoats: getNum('numberOfCoats') || 2,
    paintCostPerGallon: getNum('paintCostPerGallon') || 45,
    targetMaterialPercentage: getNum('targetMaterialPercentage') || 15,
    targetMarginPercentage: getNum('targetMarginPercentage') || 25,
    subcontractPercentage: getNum('subcontractPercentage') || 0,
    subHourlyRate: getNum('subHourlyRate') || 0,
    subNumPainters: getNum('subNumPainters') || 0,
    subHoursPerDay: getNum('subHoursPerDay') || 0,
    salesCommissionPercentage: getNum('salesCommissionPercentage') || 5,
    pmCommissionPercentage: getNum('pmCommissionPercentage') || 3,
    paintBudgetPercentage: getNum('paintBudgetPercentage') || 20,
  }

  return <Dashboard initialData={initialData} />
}
