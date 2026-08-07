import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InlineNotice from '../../components/InlineNotice';

const EMPTY_FORM = { name: '', email: '', phone: '', department: '', designation: '' };

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get('/employees', { params: search ? { search } : {} });
    setEmployees(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await load();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditingId(emp._id);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await api.patch(`/employees/${editingId}`, form);
      } else {
        await api.post('/employees', form);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (emp) => {
    await api.patch(`/employees/${emp._id}`, { isActive: !emp.isActive });
    await load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Employees"
        description="Everyone who can be visited. Inactive employees can't be selected for new visits."
        actions={
          <Button variant="brass" onClick={openCreate}>
            + Add Employee
          </Button>
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or department…"
          className="flex-1 rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700"
        />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist-100 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink-700">Name</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Department</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Designation</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Contact</th>
              <th className="px-4 py-3 font-semibold text-ink-700">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-t border-mist-200">
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3">{emp.department}</td>
                <td className="px-4 py-3">{emp.designation}</td>
                <td className="px-4 py-3 text-ink-600">{emp.email}<br />{emp.phone}</td>
                <td className="px-4 py-3">
                  <span className={emp.isActive ? 'text-signal-green' : 'text-ink-600'}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <Button variant="ghost" onClick={() => openEdit(emp)}>Edit</Button>
                  <Button variant="ghost" onClick={() => toggleActive(emp)}>
                    {emp.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-600">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <InlineNotice tone="error">{error}</InlineNotice>}
          {['name', 'email', 'phone', 'department', 'designation'].map((field) => (
            <div key={field}>
              <label className="label-eyebrow block mb-1.5 capitalize">{field}</label>
              <input
                required
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brass" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
