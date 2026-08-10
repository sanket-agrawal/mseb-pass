'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Loader from '@/components/ui/Loader';
import { userAPI, officeAPI } from '@/lib/api';
import { getAuthUser, canManageUsers } from '@/lib/auth';
import { Users, UserPlus, Shield, CheckSquare, Square, Search, Edit3, UserX, Upload, Download, FileSpreadsheet, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    email: '',
    cpf_number: '',
    designation: '',
    password: '',
    office_id: '',
    roles: ['gate_pass_viewer'],
  });

  useEffect(() => {
    const authUser = getAuthUser();
    setCurrentUser(authUser);
    if (authUser && !canManageUsers(authUser)) {
      toast.error('Access restricted to Super Admin role');
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const [userRes, officeRes, rolesRes] = await Promise.all([
        userAPI.list({ limit: 100 }),
        officeAPI.list({ limit: 100 }).catch(() => null),
        userAPI.getRoles().catch(() => null),
      ]);

      const userList = userRes?.data?.users || userRes?.data || [];
      setUsers(userList);

      const officeList = officeRes?.data?.offices || officeRes?.data || [];
      setOffices(officeList);

      if (rolesRes && rolesRes.data) {
        setRoleOptions(rolesRes.data);
      } else {
        // Dynamic fallback from backend constants
        setRoleOptions([
          { id: 'super_admin', name: 'Super Admin', description: 'Full system control', permissions: ['manage_users', 'manage_contractors', 'manage_stations', 'manage_assets', 'create_gatepass', 'edit_gatepass', 'view_gatepass'] },
          { id: 'admin', name: 'Admin', description: 'Master Data Manager', permissions: ['manage_users', 'manage_contractors', 'manage_stations', 'manage_assets', 'create_gatepass', 'edit_gatepass', 'view_gatepass'] },
          { id: 'gate_pass_creator', name: 'Gate Pass Creator', description: 'Field Officer: Create & view gate passes', permissions: ['create_gatepass', 'view_gatepass'] },
          { id: 'gate_pass_viewer', name: 'Gate Pass Viewer', description: 'Read-Only access', permissions: ['view_gatepass'] },
          { id: 'vendor', name: 'Vendor / Transporter', description: 'Transport Contractor portal access', permissions: ['vendor_portal'] },
        ]);
      }
    } catch (err) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      const userRoles = Array.isArray(userToEdit.roles) && userToEdit.roles.length > 0
        ? userToEdit.roles
        : [userToEdit.role || 'gate_pass_viewer'];

      setFormData({
        first_name: userToEdit.first_name || '',
        last_name: userToEdit.last_name || '',
        mobile: userToEdit.mobile || '',
        email: userToEdit.email || '',
        cpf_number: userToEdit.cpf_number || '',
        designation: userToEdit.designation || '',
        password: '',
        office_id: userToEdit.office_id || userToEdit.office?.id || '',
        roles: userRoles,
      });
    } else {
      setEditingUser(null);
      setFormData({
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        cpf_number: '',
        designation: '',
        password: '',
        office_id: '',
        roles: ['gate_pass_viewer'],
      });
    }
    setModalOpen(true);
  };

  const handleToggleRole = (roleId) => {
    setFormData((prev) => {
      const currentRoles = prev.roles || [];
      if (currentRoles.includes(roleId)) {
        if (currentRoles.length === 1) {
          toast.error('At least one role must be assigned to the user');
          return prev;
        }
        return { ...prev, roles: currentRoles.filter((r) => r !== roleId) };
      } else {
        return { ...prev, roles: [...currentRoles, roleId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.mobile || !formData.cpf_number) {
      toast.error('Please fill in all required fields (First Name, Last Name, Mobile, CPF Number)');
      return;
    }
    if (formData.roles.length === 0) {
      toast.error('Please assign at least one feature role to the user');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        role: formData.roles[0],
        office_id: formData.office_id || null,
      };

      if (editingUser) {
        if (!payload.password) delete payload.password;
        await userAPI.update(editingUser.id, payload);
        toast.success('User details & roles updated successfully');
      } else {
        await userAPI.create(payload);
        toast.success('User account created & roles assigned');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (userToDeactivate) => {
    if (!confirm(`Are you sure you want to deactivate ${userToDeactivate.full_name || userToDeactivate.first_name}?`)) {
      return;
    }
    try {
      await userAPI.deactivate(userToDeactivate.id);
      toast.success('User account deactivated');
      loadData();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  // ─── Bulk Excel Upload ──────────────────────────
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        CPF_Number: '3341920',
        First_Name: 'Ramesh',
        Last_Name: 'Patil',
        Mobile: '9881122334',
        Email: 'ramesh.patil@mseb.gov.in',
        Designation: 'Junior Engineer',
        Role: 'gate_pass_creator',
        Initial_Password: 'Password@123',
      },
      {
        CPF_Number: '9764433',
        First_Name: 'Suresh',
        Last_Name: 'Joshi',
        Mobile: '9764433221',
        Email: 'suresh.joshi@mseb.gov.in',
        Designation: 'Line Inspector',
        Role: 'gate_pass_viewer',
        Initial_Password: 'Password@123',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'mseb_user_bulk_template.xlsx');
    toast.success('Downloaded User Bulk Upload Template');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          toast.error('No data found in uploaded Excel file');
          setImporting(false);
          return;
        }

        const formattedUsers = json.map((row) => ({
          cpf_number: String(row.CPF_Number || row.cpf_number || row.CPF || ''),
          first_name: row.First_Name || row.first_name || row.FirstName || '',
          last_name: row.Last_Name || row.last_name || row.LastName || '',
          mobile: String(row.Mobile || row.mobile || row.Phone || ''),
          email: row.Email || row.email || null,
          designation: row.Designation || row.designation || null,
          role: (row.Role || row.role || 'gate_pass_viewer').toLowerCase().replace(/\s+/g, '_'),
          roles: [(row.Role || row.role || 'gate_pass_viewer').toLowerCase().replace(/\s+/g, '_')],
          password: row.Initial_Password || row.password || 'Mseb@123',
        }));

        toast.loading(`Importing ${formattedUsers.length} users...`, { id: 'bulk-import-toast' });
        const res = await userAPI.bulkImport(formattedUsers);

        if (res && res.data) {
          toast.success(`Successfully imported ${res.data.imported_count || formattedUsers.length} users!`, { id: 'bulk-import-toast' });
          if (res.data.errors && res.data.errors.length > 0) {
            console.warn('Import warnings:', res.data.errors);
          }
        }
        setBulkModalOpen(false);
        loadData();
      } catch (err) {
        toast.error(err?.message || 'Failed to process Excel file', { id: 'bulk-import-toast' });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const cpf = (u.cpf_number || '').toLowerCase();
    const mob = (u.mobile || '').toLowerCase();
    return name.includes(q) || cpf.includes(q) || mob.includes(q);
  });

  const officeOptions = offices.map((o) => ({
    value: o.id,
    label: o.name,
    subtext: `${o.type} • ${o.division || ''}`,
  }));

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', border: '1px solid #fca5a5', label: 'Super Admin' };
      case 'admin':
        return { bg: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', border: '1px solid #c7d2fe', label: 'Admin' };
      case 'gate_pass_creator':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid #a7f3d0', label: 'Gate Pass Creator' };
      case 'gate_pass_viewer':
        return { bg: 'rgba(14, 165, 233, 0.15)', color: '#0284c7', border: '1px solid #bae6fd', label: 'Gate Pass Viewer' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', color: '#4b5563', border: '1px solid #e5e7eb', label: role };
    }
  };

  return (
    <PageWrapper
      title="Employee Management & Role Permissions"
      subtitle="Master List Management to create employee accounts, assign or revoke feature roles, and bulk import employees via Excel."
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={Upload} onClick={() => setBulkModalOpen(true)}>
            Bulk Excel Import
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={() => handleOpenModal(null)}>
            + Add New Employee
          </Button>
        </div>
      }
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--gray-400)' }} />
          <Input
            placeholder="Search users by Name, CPF, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      <Card header={`System Users & Master Directory (${filteredUsers.length})`}>
        {loading ? (
          <Loader text="Loading user directory..." />
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
            No users found matching filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Official Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>CPF Number</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Mobile / Email</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Assigned Feature Roles</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)' }}>Station / Office</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--gray-700)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const roles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || 'gate_pass_viewer'];
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-200)', opacity: u.is_active ? 1 : 0.6 }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                          {u.full_name || `${u.first_name} ${u.last_name}`}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{u.designation || 'MSEB Official'}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {u.cpf_number}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--gray-700)' }}>
                        <div>{u.mobile}</div>
                        {u.email && <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{u.email}</div>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {roles.map((r) => {
                            const badge = getRoleBadgeStyle(r);
                            return (
                              <span
                                key={r}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm, 4px)',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: badge.bg,
                                  color: badge.color,
                                  border: badge.border,
                                }}
                              >
                                {badge.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--gray-700)' }}>
                        {u.office?.name || 'Sub Division Dondaicha'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button size="sm" variant="outline" icon={Edit3} onClick={() => handleOpenModal(u)}>
                            Edit Roles
                          </Button>
                          {u.is_active && (
                            <Button size="sm" variant="danger" icon={UserX} onClick={() => handleDeactivate(u)}>
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit User & Roles: ${editingUser.cpf_number}` : 'Create New User & Assign Roles'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Input
              label="First Name (पहिले नाव)"
              required
              value={formData.first_name}
              onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
            />
            <Input
              label="Last Name (आडनाव)"
              required
              value={formData.last_name}
              onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Input
              label="CPF / CPR Number"
              required
              placeholder="e.g. 3341920"
              value={formData.cpf_number}
              onChange={(e) => setFormData((p) => ({ ...p, cpf_number: e.target.value }))}
            />
            <Input
              label="Mobile Number"
              required
              placeholder="e.g. 9881122334"
              value={formData.mobile}
              onChange={(e) => setFormData((p) => ({ ...p, mobile: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Input
              label="Designation (पद)"
              placeholder="e.g. Junior Engineer"
              value={formData.designation}
              onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
            />
            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g. official@mseb.gov.in"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Input
              label={editingUser ? 'Password (Leave blank to keep unchanged)' : 'Initial Password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters..."
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
            </button>
          </div>

          <SearchableSelect
            label="Assigned Station / Office"
            value={formData.office_id}
            onChange={(val) => setFormData((p) => ({ ...p, office_id: val }))}
            options={officeOptions}
            placeholder="Search or select office..."
            allowCustom={false}
          />

          {/* Dynamic Role & Permission Checkboxes from Backend */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--gray-800)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              ⚙️ Add or Revoke Feature Roles & Permissions:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roleOptions.map((r) => {
                const isSelected = formData.roles.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => handleToggleRole(r.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--gray-300)',
                      backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {isSelected ? (
                        <CheckSquare style={{ width: 20, height: 20, color: 'var(--primary-600)' }} />
                      ) : (
                        <Square style={{ width: 20, height: 20, color: 'var(--gray-400)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--primary-900)' : 'var(--gray-900)' }}>
                        {r.name || r.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: 2 }}>
                        {r.description || r.desc}
                      </div>
                      {r.permissions && r.permissions.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 4 }}>
                          {r.permissions.map((p) => (
                            <span key={p} style={{ fontSize: '10px', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, color: 'var(--gray-600)' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingUser ? 'Save Role Changes' : 'Create User & Assign Roles'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Excel Upload Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Excel Bulk Import Employees / Users"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
            Upload an Excel (.xlsx / .csv) file containing employee records to create or update multiple users at once.
          </p>

          <div style={{ padding: '1rem', border: '1px dashed var(--primary-300)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-50)' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-900)', marginBottom: '4px' }}>
              📥 Download Sample Excel Template
            </div>
            <div style={{ fontSize: '12px', color: 'var(--primary-700)', marginBottom: '12px' }}>
              Includes required columns: CPF_Number, First_Name, Last_Name, Mobile, Email, Designation, Role.
            </div>
            <Button size="sm" variant="outline" icon={Download} onClick={handleDownloadTemplate}>
              Download Excel Template
            </Button>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--gray-800)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              📁 Select Excel File to Upload:
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              disabled={importing}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
              }}
            />
          </div>

          {importing && <Loader text="Processing Excel records & creating users..." />}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => setBulkModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
