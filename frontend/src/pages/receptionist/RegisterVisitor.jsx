import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import InlineNotice from '../../components/InlineNotice';

const todayISO = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  visitorName: '',
  visitorPhone: '',
  visitorEmail: '',
  visitorCompany: '',
  idProofType: '',
  idProofNumber: '',
  employeeToVisit: '',
  purpose: '',
  visitDate: todayISO(),
  expectedArrivalTime: '',
};

const RegisterVisitor = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/employees', { params: { isActive: true } }).then((res) => setEmployees(res.data));
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/visitors', form);
      setSuccess('Visitor registered. The request is now awaiting employee approval.');
      setForm(EMPTY_FORM);
      setTimeout(() => navigate('/visitors'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Front Desk"
        title="Register Visitor"
        description="Capture visitor details and route the request to the employee for approval."
      />

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-2xl">
        {error && <InlineNotice tone="error">{error}</InlineNotice>}
        {success && <InlineNotice tone="success">{success}</InlineNotice>}

        <div>
          <p className="label-eyebrow mb-3">Visitor Details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Full name" value={form.visitorName} onChange={update('visitorName')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            <input required placeholder="Phone number" value={form.visitorPhone} onChange={update('visitorPhone')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            <input type="email" placeholder="Email (optional)" value={form.visitorEmail} onChange={update('visitorEmail')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            <input placeholder="Company (optional)" value={form.visitorCompany} onChange={update('visitorCompany')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            <input placeholder="ID proof type (e.g. Aadhaar)" value={form.idProofType} onChange={update('idProofType')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            <input placeholder="ID proof number" value={form.idProofNumber} onChange={update('idProofNumber')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
          </div>
        </div>

        <div>
          <p className="label-eyebrow mb-3">Visit Details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <select required value={form.employeeToVisit} onChange={update('employeeToVisit')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700">
              <option value="">Employee to visit…</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
              ))}
            </select>
            <input required placeholder="Purpose of visit" value={form.purpose} onChange={update('purpose')}
              className="rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            <div>
              <label className="text-xs text-ink-600 block mb-1">Visit date</label>
              <input required type="date" min={todayISO()} value={form.visitDate} onChange={update('visitDate')}
                className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            </div>
            <div>
              <label className="text-xs text-ink-600 block mb-1">Expected arrival time</label>
              <input required type="time" value={form.expectedArrivalTime} onChange={update('expectedArrivalTime')}
                className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)}>Clear</Button>
          <Button type="submit" variant="brass" disabled={loading}>{loading ? 'Registering…' : 'Register Visitor'}</Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterVisitor;
