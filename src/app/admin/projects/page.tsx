'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProjects, type Project } from '@/lib/projects'

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects } = useProjects()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success'
      case 'in-progress': return 'bg-warning'
      case 'pending': return 'bg-info'
      case 'cancelled': return 'bg-danger'
      case 'draft': return 'bg-secondary'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('-', ' ')
  }

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter
    const matchesSearch = project.project_name.toLowerCase().includes(search.toLowerCase()) || 
                         (project.client && project.client.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleFilterChange = async (newFilter: string) => {
    setFilter(newFilter)
    setShowFilterDropdown(false)
    await fetchProjects({ 
      status: newFilter === 'all' ? undefined : newFilter,
      search: search || undefined
    })
  }

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    await fetchProjects({ 
      status: filter === 'all' ? undefined : filter,
      search: newSearch || undefined
    })
  }

  if (loading && projects.length === 0) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Projects</h1>
          <Link href="/admin/projects/new" className="btn btn-primary">
            New Project
          </Link>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading projects...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Projects</h1>
          <Link href="/admin/projects/new" className="btn btn-primary">
            New Project
          </Link>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger mb-0">
              Error loading projects: {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Projects</h1>
        <Link href="/admin/projects/new" className="btn btn-primary">
          New Project
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <input
                type="text"
                className="form-control"
                placeholder="Search projects..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="col-md-6">
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  Filter: {filter === 'all' ? 'All Status' : getStatusText(filter)}
                </button>
                {showFilterDropdown && (
                  <div className="dropdown-menu show">
                    <button className="dropdown-item" onClick={() => handleFilterChange('all')}>
                      All Status
                    </button>
                    <button className="dropdown-item" onClick={() => handleFilterChange('draft')}>
                      Draft
                    </button>
                    <button className="dropdown-item" onClick={() => handleFilterChange('pending')}>
                      Pending
                    </button>
                    <button className="dropdown-item" onClick={() => handleFilterChange('in-progress')}>
                      In Progress
                    </button>
                    <button className="dropdown-item" onClick={() => handleFilterChange('completed')}>
                      Completed
                    </button>
                    <button className="dropdown-item" onClick={() => handleFilterChange('cancelled')}>
                      Cancelled
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-5">
              <h5>No projects found</h5>
              <p className="text-muted">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Create your first project to get started'}
              </p>
              {!search && filter === 'all' && (
                <Link href="/admin/projects/new" className="btn btn-primary">
                  Create New Project
                </Link>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Total Value</th>
                    <th>Date</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <Link href={`/admin/projects/${project.id}`} className="text-decoration-none">
                          {project.project_name}
                        </Link>
                      </td>
                      <td>{project.client || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getStatusVariant(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </td>
                      <td>
                        {project.calculated_values?.grossProfit 
                          ? formatCurrency(project.calculated_values.grossProfit)
                          : 'N/A'}
                      </td>
                      <td>{new Date(project.created_at).toLocaleDateString()}</td>
                      <td>{project.user_profiles?.full_name || 'Unknown'}</td>
                      <td>
                        <Link 
                          href={`/admin/projects/${project.id}`} 
                          className="btn btn-outline-primary btn-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
