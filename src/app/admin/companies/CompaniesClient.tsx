'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
    defaultMaterialPercentage: number;
    defaultMarginPercentage: number;
  };
}

interface CompaniesClientProps {
  initialCompanies: Company[];
}

export default function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    defaultPricePerSq: 4.00,
    defaultHourlyRate: 65,
    defaultCommissionSales: 10,
    defaultCommissionPM: 5,
    defaultMaterialPercentage: 12,
    defaultMarginPercentage: 25
  });

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'badge bg-success',
      inactive: 'badge bg-secondary',
      pending: 'badge bg-warning'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.domain) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          domain: newCompany.domain.toLowerCase().replace(/\s+/g, '-'),
          status: 'active',
          settings: {
            defaultPricePerSq: newCompany.defaultPricePerSq,
            defaultHourlyRate: newCompany.defaultHourlyRate,
            defaultCommissionSales: newCompany.defaultCommissionSales,
            defaultCommissionPM: newCompany.defaultCommissionPM,
            defaultMaterialPercentage: newCompany.defaultMaterialPercentage,
            defaultMarginPercentage: newCompany.defaultMarginPercentage
          }
        })
        .select()
        .single();

      if (error) throw error;

      const newCompanyData: Company = {
        id: data.id,
        name: data.name,
        domain: data.domain,
        status: data.status,
        usersCount: 0,
        projectsCount: 0,
        createdAt: new Date(data.created_at).toLocaleDateString(),
        settings: data.settings
      };

      setCompanies([newCompanyData, ...companies]);
      setNewCompany({
        name: '',
        domain: '',
        defaultPricePerSq: 4.00,
        defaultHourlyRate: 65,
        defaultCommissionSales: 10,
        defaultCommissionPM: 5,
        defaultMaterialPercentage: 12,
        defaultMarginPercentage: 25
      });
      setShowAddCompany(false);
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company. Please try again.');
    }
  };

  const handleStatusChange = async (companyId: string, newStatus: Company['status']) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(companies.map(company =>
        company.id === companyId ? { ...company, status: newStatus } : company
      ));
    } catch (error) {
      console.error('Error updating company status:', error);
      alert('Failed to update company status. Please try again.');
    }
  };

  return (
    <div className="min-vh-100 p-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">🏢 Company Management</h1>
            <p className="text-muted mb-0">Manage painting companies and their settings</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => router.push('/admin')}
              className="btn btn-outline-secondary"
            >
              ← Back to Admin
            </button>
            <button
              onClick={() => setShowAddCompany(true)}
              className="btn btn-primary"
            >
              + Add Company
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search companies by name or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select className="form-select">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Companies ({filteredCompanies.length})</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th>Users</th>
                    <th>Projects</th>
                    <th>Price/SF</th>
                    <th>Hourly Rate</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map(company => (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.name}</strong>
                      </td>
                      <td>
                        <code>{company.domain}</code>
                      </td>
                      <td>
                        <span className={getStatusBadge(company.status)}>
                          {company.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">{company.usersCount}</span>
                      </td>
                      <td>
                        <span className="badge bg-primary">{company.projectsCount}</span>
                      </td>
                      <td>${company.settings.defaultPricePerSq}</td>
                      <td>${company.settings.defaultHourlyRate}</td>
                      <td>
                        <small className="text-muted">{company.createdAt}</small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <select
                            className="form-select form-select-sm"
                            value={company.status}
                            onChange={(e) => handleStatusChange(company.id, e.target.value as Company['status'])}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Company Modal */}
        {showAddCompany && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Painting Company</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddCompany(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-success">
                    <strong>Setup New Painting Business:</strong> Configure default calculator settings for this company.
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Company Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Elite Painting Services"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Domain Identifier *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., elite-painting"
                        value={newCompany.domain}
                        onChange={(e) => setNewCompany({...newCompany, domain: e.target.value})}
                        required
                      />
                      <small className="text-muted">Used for company identification (lowercase, no spaces)</small>
                    </div>

                    <div className="col-12">
                      <hr />
                      <h6 className="text-primary">Default Calculator Settings</h6>
                      <p className="text-muted small mb-3">These will be the default values for all users in this company</p>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Price per SF ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.25"
                        min="0"
                        value={newCompany.defaultPricePerSq}
                        onChange={(e) => setNewCompany({...newCompany, defaultPricePerSq: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Hourly Rate ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={newCompany.defaultHourlyRate}
                        onChange={(e) => setNewCompany({...newCompany, defaultHourlyRate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Material % Target</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.5"
                        min="0"
                        max="100"
                        value={newCompany.defaultMaterialPercentage}
                        onChange={(e) => setNewCompany({...newCompany, defaultMaterialPercentage: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Margin % Target</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.5"
                        min="0"
                        max="100"
                        value={newCompany.defaultMarginPercentage}
                        onChange={(e) => setNewCompany({...newCompany, defaultMarginPercentage: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sales Commission (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.5"
                        min="0"
                        max="100"
                        value={newCompany.defaultCommissionSales}
                        onChange={(e) => setNewCompany({...newCompany, defaultCommissionSales: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">PM Commission (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.5"
                        min="0"
                        max="100"
                        value={newCompany.defaultCommissionPM}
                        onChange={(e) => setNewCompany({...newCompany, defaultCommissionPM: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddCompany(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddCompany}
                    disabled={!newCompany.name || !newCompany.domain}
                  >
                    Create Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
