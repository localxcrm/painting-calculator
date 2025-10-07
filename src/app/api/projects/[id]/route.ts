import { getServerSupabase } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import { ProjectData, CalculatedValues } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Fetch the specific project
    const { data, error } = await supabase
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
      .eq('id', params.id)
      .eq('company_id', profile.company_id)
      // Non-admin users can only see their own projects
      .eq(profile.role !== 'admin' ? 'user_id' : 'company_id', profile.role !== 'admin' ? userId : profile.company_id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/projects/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { project_name, project_data, calculated_values, status, client } = await request.json()

    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update({
        project_name,
        project_data,
        calculated_values,
        status,
        client,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('company_id', profile.company_id)
      // Non-admin users can only update their own projects
      .eq(profile.role !== 'admin' ? 'user_id' : 'company_id', profile.role !== 'admin' ? userId : profile.company_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/projects/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('company_id', profile.company_id)
      // Non-admin users can only delete their own projects
      .eq(profile.role !== 'admin' ? 'user_id' : 'company_id', profile.role !== 'admin' ? userId : profile.company_id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
