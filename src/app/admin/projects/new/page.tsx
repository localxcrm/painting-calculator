'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProjectData } from '@/types'

export default function NewProjectPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [client, setClient] = useState('')
  const [status, setStatus] = useState('draft')
  const [projectData, setProjectData] = useState<ProjectData>({
    squareFootage: 0,
    pricePerSq: 0,
    numberOfCoats: 2,
    paintCoverage: 350,
    paintCostPerGallon: 45,
    hourlyRateWithMaterials: 65,
    numPainters: 2,
    hoursPerDay: 8,
    subcontractPercentage: 0,
    subHourlyRate: 0,
    subNumPainters: 0,
    subHoursPerDay: 0,
    salesCommissionPercentage: 5,
    pmCommissionPercentage: 3,
    targetMarginPercentage: 30,
    targetMaterialPercentage: 20,
    paintBudgetPercentage: 15,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectName,
          client,
          status,
          project_data: projectData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const result = await response.json()
      router.push(`/admin/projects/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating project:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectDataChange = (field: keyof ProjectData, value: string | number) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">New Project</h1>
        <Link href="/admin/projects" className="btn btn-outline-secondary">
          ← Back to Projects
        </Link>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h5>Project Information</h5>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label htmlFor="projectName" className="form-label">Project Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="projectName"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="status" className="form-label">Status</label>
                        <select
                          className="form-select"
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="client" className="form-label">Client</label>
                    <input
                      type="text"
                      className="form-control"
                      id="client"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h5>Project Specifications</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="squareFootage" className="form-label">Square Footage (SF) *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="squareFootage"
                          value={projectData.squareFootage}
                          onChange={(e) => handleProjectDataChange('squareFootage', Number(e.target.value))}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="pricePerSq" className="form-label">Price per Sq Ft ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="pricePerSq"
                          value={projectData.pricePerSq}
                          onChange={(e) => handleProjectDataChange('pricePerSq', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="numberOfCoats" className="form-label">Number of Coats</label>
                        <input
                          type="number"
                          className="form-control"
                          id="numberOfCoats"
                          value={projectData.numberOfCoats}
                          onChange={(e) => handleProjectDataChange('numberOfCoats', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="paintCoverage" className="form-label">Paint Coverage (SF/gallon)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="paintCoverage"
                          value={projectData.paintCoverage}
                          onChange={(e) => handleProjectDataChange('paintCoverage', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5>Labor Details</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="hourlyRateWithMaterials" className="form-label">Hourly Rate (with materials) ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="hourlyRateWithMaterials"
                          value={projectData.hourlyRateWithMaterials}
                          onChange={(e) => handleProjectDataChange('hourlyRateWithMaterials', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label htmlFor="numPainters" className="form-label">Number of Painters</label>
                        <input
                          type="number"
                          className="form-control"
                          id="numPainters"
                          value={projectData.numPainters}
                          onChange={(e) => handleProjectDataChange('numPainters', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label htmlFor="hoursPerDay" className="form-label">Hours per Day</label>
                        <input
                          type="number"
                          className="form-control"
                          id="hoursPerDay"
                          value={projectData.hoursPerDay}
                          onChange={(e) => handleProjectDataChange('hoursPerDay', Number(e.target.value))}
                          min="1"
                          max="24"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5>Subcontracting</h5>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="subcontractPercentage" className="form-label">Subcontract Percentage (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="subcontractPercentage"
                          value={projectData.subcontractPercentage}
                          onChange={(e) => handleProjectDataChange('subcontractPercentage', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="subHourlyRate" className="form-label">Sub Hourly Rate ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="subHourlyRate"
                          value={projectData.subHourlyRate}
                          onChange={(e) => handleProjectDataChange('subHourlyRate', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="subNumPainters" className="form-label">Sub Painters</label>
                        <input
                          type="number"
                          className="form-control"
                          id="subNumPainters"
                          value={projectData.subNumPainters}
                          onChange={(e) => handleProjectDataChange('subNumPainters', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5>Financial Targets</h5>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="targetMarginPercentage" className="form-label">Target Margin (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="targetMarginPercentage"
                          value={projectData.targetMarginPercentage}
                          onChange={(e) => handleProjectDataChange('targetMarginPercentage', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="targetMaterialPercentage" className="form-label">Target Material (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="targetMaterialPercentage"
                          value={projectData.targetMaterialPercentage}
                          onChange={(e) => handleProjectDataChange('targetMaterialPercentage', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="paintBudgetPercentage" className="form-label">Paint Budget (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="paintBudgetPercentage"
                          value={projectData.paintBudgetPercentage}
                          onChange={(e) => handleProjectDataChange('paintBudgetPercentage', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5>Commissions</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="salesCommissionPercentage" className="form-label">Sales Commission (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="salesCommissionPercentage"
                          value={projectData.salesCommissionPercentage}
                          onChange={(e) => handleProjectDataChange('salesCommissionPercentage', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="pmCommissionPercentage" className="form-label">PM Commission (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="pmCommissionPercentage"
                          value={projectData.pmCommissionPercentage}
                          onChange={(e) => handleProjectDataChange('pmCommissionPercentage', Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link href="/admin/projects" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !projectName}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Help</h5>
            </div>
            <div className="card-body">
              <p className="mb-2"><strong>Required Fields:</strong></p>
              <ul className="mb-3">
                <li>Project Name</li>
                <li>Square Footage</li>
              </ul>
              <p className="mb-2"><strong>Default Values:</strong></p>
              <ul className="small">
                <li>Number of Coats: 2</li>
                <li>Paint Coverage: 350 SF/gallon</li>
                <li>Paint Cost: $45/gallon</li>
                <li>Hourly Rate: $65/hour</li>
                <li>Target Margin: 30%</li>
              </ul>
              <p className="mb-0"><strong>Tip:</strong> You can edit these values later in the project details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
