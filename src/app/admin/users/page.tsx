import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import UsersClient from './UsersClient'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  projectsCount: number;
}

export default async function UsersPage() {
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

  // Fetch users with project counts
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      full_name,
      role,
      is_active,
      updated_at,
      projects(count)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  // Transform data to match interface
  const transformedUsers: User[] = (users || []).map(user => ({
    id: user.id,
    name: user.full_name || 'Unknown',
    email: '', // Email not in user_profiles, would need join with auth.users if needed
    role: user.role,
    status: user.is_active ? 'active' : 'inactive',
    lastLogin: new Date(user.updated_at).toISOString().split('T')[0],
    projectsCount: user.projects?.[0]?.count || 0
  }))

  // Fetch companies for user assignment
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, domain')
    .eq('status', 'active')
    .order('name');

  return <UsersClient initialUsers={transformedUsers} companies={companies || []} />
}
