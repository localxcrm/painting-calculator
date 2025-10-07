'use client'

import { useState, useEffect } from 'react'
import { ProjectData, CalculatedValues } from '@/types'
import { supabase } from '@/lib/supabase'

export interface Project {
  id: string
  project_name: string
  project_data: ProjectData
  calculated_values: CalculatedValues
  status: string
  client?: string
  created_at: string
  updated_at: string
  user_id: string
  user_profiles: {
    full_name: string
  }
}

export interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: (filters?: { status?: string; search?: string }) => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'user_profiles'>) => Promise<Project | null>
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>
  deleteProject: (id: string) => Promise<boolean>
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async (filters?: { status?: string; search?: string }) => {
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/projects'
      const queryParams = new URLSearchParams()
      
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.search) queryParams.append('search', filters.search)
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'user_profiles'>) => {
    try {
      setError(null)
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create project')
      }
      
      const newProject = await response.json()
      setProjects(prev => [newProject, ...prev])
      return newProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating project:', err)
      return null
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      
      const updatedProject = await response.json()
      
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? { ...project, ...updatedProject } : project
        )
      )
      
      return updatedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating project:', err)
      return null
    }
  }

  const deleteProject = async (id: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      
      setProjects(prev => prev.filter(project => project.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting project:', err)
      return false
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
