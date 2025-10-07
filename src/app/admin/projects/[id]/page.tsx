'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProjects, type Project } from '@/lib/projects'
import { ProjectData, CalculatedValues } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, loading, error, fetchProjects } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLocalLoading(true)
        setLocalError(null)
        
        // Fetch the specific project
        const response = await fetch(`/api/projects/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch project')
        }
        
        const projectData = await response.json()
        setProject(projectData)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error loading project:', err)
      } finally {
        setLocalLoading(false)
      }
    }

    if (params.id) {
      loadProject()
    }
  }, [params.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadgeClass = (status: string) => {
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

  if (localLoading) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Project Details</h1>
          <Link href="/admin/projects" className="btn btn-outline-secondary">
            ← Back to Projects
          </Link>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading project details...</span>
        </div>
      </div>
    )
  }

  if (localError || !project) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Project Details</h1>
          <Link href="/admin/projects" className="btn btn-outline-secondary">
            ← Back to Projects
          </Link>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger mb-0">
              {localError || 'Project not found'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const projectData = project.project_data as ProjectData
  const calculatedValues = project.calculated_values as CalculatedValues

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">{project.project_name}</h1>
          <p className="text-muted mb-0">Project ID: {project.id}</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin/projects" className="btn btn-outline-secondary">
            ← Back to Projects
          </Link>
          <Link href={`/admin/projects/${params.id}/edit`} className="btn btn-primary">
            Edit Project
          </Link>
        </div>
      </div>

      {/* Project Overview */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Project Overview</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1"><strong>Client:</strong> {project.client || 'N/A'}</p>
                  <p className="mb-1"><strong>Created By:</strong> {project.user_profiles?.full_name || 'Unknown'}</p>
                  <p className="mb-1"><strong>Status:</strong> 
                    <span className={`badge ${getStatusBadgeClass(project.status)} ms-2`}>
                      {getStatusText(project.status)}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1"><strong>Created:</strong> {formatDate(project.created_at)}</p>
                  <p className="mb-1"><strong>Last Updated:</strong> {formatDate(project.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Financial Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Total Project Value:</span>
                <strong>{calculatedValues?.totalCostBySq ? formatCurrency(calculatedValues.totalCostBySq) : 'N/A'}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Gross Profit:</span>
                <strong className={calculatedValues?.grossProfit && calculatedValues.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                  {calculatedValues?.grossProfit ? formatCurrency(calculatedValues.grossProfit) : 'N/A'}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Margin:</span>
                <strong>{calculatedValues?.actualMarginPercentage ? `${calculatedValues.actualMarginPercentage.toFixed(1)}%` : 'N/A'}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Material Cost:</span>
                <strong>{calculatedValues?.totalPaintCost ? formatCurrency(calculatedValues.totalPaintCost) : 'N/A'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Project Specifications</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <p className="mb-2"><strong>Square Footage:</strong> {projectData?.squareFootage?.toLocaleString() || 'N/A'} SF</p>
                  <p className="mb-2"><strong>Price per Sq Ft:</strong> {projectData?.pricePerSq ? formatCurrency(projectData.pricePerSq) : 'N/A'}</p>
                  <p className="mb-2"><strong>Number of Coats:</strong> {projectData?.numberOfCoats || 'N/A'}</p>
                  <p className="mb-2"><strong>Paint Coverage:</strong> {projectData?.paintCoverage || 'N/A'} SF/gallon</p>
                </div>
                <div className="col-6">
                  <p className="mb-2"><strong>Paint Cost/Gallon:</strong> {projectData?.paintCostPerGallon ? formatCurrency(projectData.paintCostPerGallon) : 'N/A'}</p>
                  <p className="mb-2"><strong>Gallons Needed:</strong> {calculatedValues?.gallonsNeeded?.toFixed(1) || 'N/A'}</p>
                  <p className="mb-2"><strong>Target Margin:</strong> {projectData?.targetMarginPercentage || 'N/A'}%</p>
                  <p className="mb-2"><strong>Target Material:</strong> {projectData?.targetMaterialPercentage || 'N/A'}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Labor Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <p className="mb-2"><strong>Hourly Rate:</strong> {projectData?.hourlyRateWithMaterials ? formatCurrency(projectData.hourlyRateWithMaterials) : 'N/A'}</p>
                  <p className="mb-2"><strong>Number of Painters:</strong> {projectData?.numPainters || 'N/A'}</p>
                  <p className="mb-2"><strong>Hours per Day:</strong> {projectData?.hoursPerDay || 'N/A'}</p>
                  <p className="mb-2"><strong>Total Hours:</strong> {calculatedValues?.totalServiceHours?.toFixed(1) || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <p className="mb-2"><strong>Work Days:</strong> {calculatedValues?.workDaysToComplete?.toFixed(1) || 'N/A'}</p>
                  <p className="mb-2"><strong>Subcontract %:</strong> {projectData?.subcontractPercentage || 'N/A'}%</p>
                  <p className="mb-2"><strong>Subcontract Value:</strong> {calculatedValues?.subcontractValue ? formatCurrency(calculatedValues.subcontractValue) : 'N/A'}</p>
                  <p className="mb-2"><strong>Subcontract Days:</strong> {calculatedValues?.subcontractDays?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Commissions & Expenses</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <p className="mb-2"><strong>Sales Commission:</strong></p>
              <p className="mb-0">{projectData?.salesCommissionPercentage || 'N/A'}% 
                {calculatedValues?.totalCostBySq ? ` (${formatCurrency(calculatedValues.totalCostBySq * (projectData?.salesCommissionPercentage || 0) / 100)})` : ''}
              </p>
            </div>
            <div className="col-md-4">
              <p className="mb-2"><strong>PM Commission:</strong></p>
              <p className="mb-0">{projectData?.pmCommissionPercentage || 'N/A'}% 
                {calculatedValues?.totalCostBySq ? ` (${formatCurrency(calculatedValues.totalCostBySq * (projectData?.pmCommissionPercentage || 0) / 100)})` : ''}
              </p>
            </div>
            <div className="col-md-4">
              <p className="mb-2"><strong>Total Commissions:</strong></p>
              <p className="mb-0">
                {projectData && calculatedValues?.totalCostBySq ? 
                  `${(projectData.salesCommissionPercentage + projectData.pmCommissionPercentage).toFixed(1)}%` : 'N/A'}
                {calculatedValues?.totalCostBySq && projectData ? 
                  ` (${formatCurrency(calculatedValues.totalCostBySq * (projectData.salesCommissionPercentage + projectData.pmCommissionPercentage) / 100)})` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-outline-danger">
          Delete Project
        </button>
        <button className="btn btn-primary">
          Generate Work Order
        </button>
      </div>
    </div>
  )
}
