import { useState } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Shield, CheckCircle, XCircle, Key, Briefcase, UserCheck } from 'lucide-react';
import { Staff, Role } from '../../types/database';
import { mockStaff, mockRoles } from '../../data/mockData';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [roles] = useState<Role[]>(mockRoles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    role_id: '',
    password: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      full_name: '',
      username: '',
      email: '',
      phone: '',
      role_id: '',
      password: '',
      is_active: true,
    });
    setEditingStaff(null);
    setShowPassword(false);
  };

  const handleOpenModal = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        full_name: staffMember.full_name,
        username: staffMember.username,
        email: staffMember.email,
        phone: staffMember.phone || '',
        role_id: staffMember.role_id.toString(),
        password: '', // Don't show password when editing
        is_active: staffMember.is_active,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStaff) {
      // Update existing staff
      setStaff(staff.map(s =>
        s.id === editingStaff.id
          ? {
              ...s,
              full_name: formData.full_name,
              username: formData.username,
              email: formData.email,
              phone: formData.phone || null,
              role_id: parseInt(formData.role_id),
              password_hash: formData.password || s.password_hash, // Only update if new password provided
              is_active: formData.is_active,
              updated_at: new Date(),
              role: roles.find(r => r.id === parseInt(formData.role_id)),
            }
          : s
      ));
    } else {
      // Add new staff
      const newStaff: Staff = {
        id: Math.max(...staff.map(s => s.id), 0) + 1,
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone || null,
        role_id: parseInt(formData.role_id),
        password_hash: formData.password,
        is_active: formData.is_active,
        created_at: new Date(),
        updated_at: new Date(),
        role: roles.find(r => r.id === parseInt(formData.role_id)),
      };
      setStaff([...staff, newStaff]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteStaff = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete staff "${name}"?`)) {
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  const toggleStaffStatus = (id: number) => {
    setStaff(staff.map(s =>
      s.id === id ? { ...s, is_active: !s.is_active, updated_at: new Date() } : s
    ));
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-rose-200 text-rose-900 border border-rose-300';
      case 'manager':
        return 'bg-sky-200 text-sky-900 border border-sky-300';
      case 'cashier':
        return 'bg-emerald-200 text-emerald-900 border border-emerald-300';
      case 'waiter':
        return 'bg-amber-200 text-amber-900 border border-amber-300';
      default:
        return 'bg-slate-200 text-slate-900 border border-slate-300';
    }
  };

  const activeStaff = staff.filter(s => s.is_active);
  const inactiveStaff = staff.filter(s => !s.is_active);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-950 text-[20px] sm:text-[24px] font-bold">Staff Management</h1>
            <p className="text-slate-500 text-[12px] sm:text-[14px] mt-1">Kelola akun staff dan role</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[12px] sm:text-[14px] font-medium">Add Staff</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {/* Staff Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Total Staff</p>
                <p className="text-slate-950 text-[28px] font-bold">{staff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Active</p>
                <p className="text-slate-950 text-[28px] font-bold">{activeStaff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Inactive</p>
                <p className="text-slate-950 text-[28px] font-bold">{inactiveStaff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-[12px]">Roles</p>
                <p className="text-slate-950 text-[28px] font-bold">{roles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-center text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member, index) => (
                  <tr 
                    key={member.id} 
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-4 text-[14px] text-slate-600">
                      #{member.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-[14px]">
                            {member.full_name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-slate-950 text-[14px] font-medium">{member.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[14px] text-slate-600 break-all">
                      @{member.username}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[14px] text-slate-600 break-all">
                      {member.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-3 py-1 text-[12px] rounded-full capitalize border ${getRoleBadgeColor(member.role?.name || '')}`}>
                        {member.role?.name}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {member.is_active ? (
                        <span className="px-3 py-1 text-[12px] rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[12px] rounded-full bg-rose-200 text-rose-900 border border-rose-300 inline-flex items-center gap-1.5">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(member)}
                          className="w-10 h-10 flex items-center justify-center text-sky-600 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStaffStatus(member.id)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                            member.is_active 
                              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={member.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {member.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.full_name)}
                          className="w-10 h-10 flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-2xl w-full border border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-slate-950 text-[20px] sm:text-[24px] font-bold">
                {editingStaff ? 'Edit Staff' : 'Add New Staff'}
              </h2>
              {editingStaff && (
                <div className={`px-4 py-2 rounded-lg ${
                  editingStaff.is_active 
                    ? 'bg-emerald-200 text-emerald-900 border border-emerald-300' 
                    : 'bg-rose-200 text-rose-900 border border-rose-300'
                }`}>
                  <span className="text-[12px] font-bold uppercase">
                    {editingStaff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}
            </div>

            {/* Staff Details (only show when editing) */}
            {editingStaff && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-[24px]">
                      {editingStaff.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-slate-950 text-[18px] font-bold">{editingStaff.full_name}</h3>
                    <p className="text-slate-500 text-[14px]">Staff ID: #{editingStaff.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <p className="text-slate-500">Created</p>
                    <p className="text-slate-950">{editingStaff.created_at.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Updated</p>
                    <p className="text-slate-950">{editingStaff.updated_at.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    placeholder="e.g., johndoe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    placeholder="john@bimaresto.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    placeholder="+62 812-3456-7890"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Role
                    </span>
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Password {editingStaff ? '(Leave blank to keep current)' : '*'}
                    </span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    placeholder={editingStaff ? 'Enter new password' : 'Create password'}
                    required={!editingStaff}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-slate-500 text-[12px]">Show password</span>
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-orange-500"
                    />
                    <div>
                      <span className="text-slate-900 text-[14px] font-medium">Active Account</span>
                      <p className="text-slate-500 text-[12px]">Staff dapat login dan mengakses sistem</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-white text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
