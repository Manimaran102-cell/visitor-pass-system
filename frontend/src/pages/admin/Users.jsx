import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InlineNotice from '../../components/InlineNotice';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'receptionist', employeeProfile: '' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [{ data: userData }, { data: empData }] = await Promise.all([
      api.get('/users'),
      api.get('/employees', { params: { isActive: true } }),
    ]);
    setUsers(userData);
    setEmployees(empData);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.role !== 'employee') delete payload.employeeProfile;
      await api.post('/users', payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (u) => {
    await api.patch(`/users/${u.id}`, { isActive: !u.isActive });
    await load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Access Control"
        title="User Accounts"
        description="Login accounts and role assignments for admins, receptionists, and employees."
        actions={<Button variant="brass" onClick={openCreate}>+ Add Account</Button>}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist-100 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink-700">Name</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Email</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Role</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-mist-200">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink-600">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={u.isActive ? 'text-signal-green' : 'text-ink-600'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" onClick={() => toggleActive(u)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add User Account">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <InlineNotice tone="error">{error}</InlineNotice>}
          <div>
            <label className="label-eyebrow block mb-1.5">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
          </div>
          <div>
            <label className="label-eyebrow block mb-1.5">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
          </div>
          <div>
            <label className="label-eyebrow block mb-1.5">Temporary Password</label>
            <input required type="text" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
          </div>
          <div>
            <label className="label-eyebrow block mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700">
              <option value="admin">Administrator</option>
              <option value="receptionist">Receptionist</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          {form.role === 'employee' && (
            <div>
              <label className="label-eyebrow block mb-1.5">Linked Employee Profile</label>
              <select required value={form.employeeProfile} onChange={(e) => setForm({ ...form, employeeProfile: e.target.value })}
                className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700">
                <option value="">Select an employee…</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brass" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
