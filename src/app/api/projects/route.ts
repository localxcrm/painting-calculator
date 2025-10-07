import { getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { ProjectData, CalculatedValues } from '@/types'

// Helper interface for project metadata
interface ProjectMetadata {
  id: string
  name: string
  status: string
  client?: string
  created_at: string
  updated_at: string
  user_id: string
  company_id: string
}

// Helper interface for complete project data
interface CompleteProjectData extends ProjectMetadata {
  project_data: ProjectData
  calculated_values: CalculatedValues
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Get user profile to get company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { project_name, project_data, calculated_values, status = 'draft', client } = await request.json()

    // Create project in database
    const { data, error } = await supabase
      .from('projects')
      .insert({
        company_id: profile.company_id,
        user_id: userId,
        project_name,
        project_data,
        calculated_values,
        status,
        client
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getServerSupabase()
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        id,
        project_name,
        project_data,
        calculated_values,
        status,
        client,
        created_at,
        updated_at,
        user_id,
        user_profiles!inner(full_name)
      `)
      .eq('company_id', profile.company_id)

    // Non-admin users can only see their own projects
    if (profile.role !== 'admin') {
      query = query.eq('user_id', userId)
    }

    // Apply filters from query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.ilike('project_name', `%${search}%`)
    }

    // Add ordering
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
