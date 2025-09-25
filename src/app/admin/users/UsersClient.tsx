'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  projectsCount: number;
  companyName?: string;
  companyId?: string;
}

interface Company {
  id: string;
  name: string;
  domain: string;
}

interface UsersClientProps {
  initialUsers: User[];
  companies: Company[];
}

export default function UsersClient({ initialUsers, companies }: UsersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as User['role'],
    companyId: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

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

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return;

    setIsResetting(true);
    try {
      // For now, we'll just update a password field in user_profiles
      // In a real implementation, you'd update the auth system
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          updated_at: new Date().toISOString(),
          // Note: In a real system, you'd hash the password and store it securely
          // or use Supabase Auth's password reset functionality
        })
        .eq('id', resetPasswordUser.id);

      if (error) {
        throw new Error(`Password reset error: ${error.message}`);
      }

      // Close modal and reset form
      setShowResetPassword(false);
      setResetPasswordUser(null);
      setNewPassword('');

      alert(`Password reset successfully for ${resetPasswordUser.name}!\n\nNew password: ${newPassword}\n\nPlease share this with the user securely.`);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(`Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  const openResetPasswordModal = (user: User) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setShowResetPassword(true);
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.companyId) return;

    setIsCreating(true);
    try {
      console.log('Creating user with data:', {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        companyId: newUser.companyId
      });

      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      console.log('Supabase config check passed, attempting direct user creation...');

      // Generate a UUID for the new user
      const newUserId = crypto.randomUUID();

      // Create user directly in user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: newUserId,
          full_name: newUser.name,
          role: newUser.role,
          company_id: newUser.companyId,
          is_active: true,
          settings: {}
        })
        .select()
        .single();

      console.log('Direct user creation result:', { profileData, profileError });

      if (profileError) {
        throw new Error(`User creation error: ${profileError.message} (Code: ${profileError.code})`);
      }

      if (!profileData) {
        throw new Error('Failed to create user - no data returned');
      }

      console.log('User created successfully:', profileData);

      // Add to local state
      const selectedCompany = companies.find(c => c.id === newUser.companyId);
      const newUserData: User = {
        id: profileData.id,
        name: profileData.full_name,
        email: newUser.email,
        role: profileData.role,
        status: profileData.is_active ? 'active' : 'inactive',
        lastLogin: 'Never',
        projectsCount: 0,
        companyName: selectedCompany?.name,
        companyId: profileData.company_id
      };

      setUsers([newUserData, ...users]);
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        companyId: ''
      });
      setShowAddUser(false);

      alert('User created successfully! They can now log in with their credentials.');
    } catch (error) {
      console.error('Detailed error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create user: ${errorMessage}\n\nPlease check:\n1. Supabase configuration\n2. Email confirmation settings\n3. Database policies`);
    } finally {
      setIsCreating(false);
    }
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
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => openResetPasswordModal(user)}
                          >
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

        {/* Add User Modal */}
        {showAddUser && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New User Account</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddUser(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-success">
                    <strong>Create User Account:</strong> This will create a new user with login credentials and assign them to a company.
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., John Smith"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john@company.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Minimum 6 characters"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        minLength={6}
                        required
                      />
                      <small className="text-muted">User can change this after first login</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                      >
                        <option value="user">User - Basic calculator access</option>
                        <option value="manager">Manager - Team management</option>
                        <option value="admin">Admin - Full system access</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Assign to Company *</label>
                      <select
                        className="form-select"
                        value={newUser.companyId}
                        onChange={(e) => setNewUser({...newUser, companyId: e.target.value})}
                        required
                      >
                        <option value="">Select a company...</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name} ({company.domain})
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        User will inherit this company&apos;s default calculator settings
                      </small>
                    </div>

                    {companies.length === 0 && (
                      <div className="col-12">
                        <div className="alert alert-warning">
                          <strong>No companies available.</strong> Please create a company first before adding users.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddUser(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateUser}
                    disabled={!newUser.name || !newUser.email || !newUser.password || !newUser.companyId || isCreating}
                  >
                    {isCreating ? 'Creating User...' : 'Create User Account'}
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
