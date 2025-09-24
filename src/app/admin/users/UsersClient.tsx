'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  projectsCount: number;
}

interface UsersClientProps {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'badge bg-danger',
      manager: 'badge bg-warning',
      user: 'badge bg-secondary'
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'badge bg-success'
      : 'badge bg-secondary';
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleStatusToggle = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  return (
    <div className="min-vh-100 p-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">👥 User Management</h1>
            <p className="text-muted mb-0">Manage user accounts and permissions</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => router.push('/admin')}
              className="btn btn-outline-secondary"
            >
              ← Back to Admin
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="btn btn-primary"
            >
              + Add User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select className="form-select">
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Users ({filteredUsers.length})</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Projects</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email || 'N/A'}</td>
                      <td>
                        <select
                          className={`form-select form-select-sm ${getRoleBadge(user.role)}`}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                          style={{ width: 'auto', display: 'inline-block' }}
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={getStatusBadge(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">{user.projectsCount}</span>
                      </td>
                      <td>
                        <small className="text-muted">{user.lastLogin}</small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleStatusToggle(user.id)}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-outline-secondary">
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add User Modal would go here */}
        {showAddUser && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New User</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddUser(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Note:</strong> In a real implementation, this would integrate with Supabase Auth to create user accounts.
                  </div>
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" placeholder="Full name" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" placeholder="email@example.com" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select className="form-select">
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddUser(false)}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary">
                    Add User
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
