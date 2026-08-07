import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import VisitorFilters from '../../components/VisitorFilters';
import VisitorTable from '../../components/VisitorTable';
import Button from '../../components/Button';
import InlineNotice from '../../components/InlineNotice';

const EMPTY_FILTERS = { visitorName: '', employeeName: '', visitDate: '', status: '' };

const VisitorDesk = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async (f = filters) => {
    const params = { excludeCancelled: 'true' };
    if (f.visitorName) params.visitorName = f.visitorName;
    if (f.employeeName) params.employeeName = f.employeeName;
    if (f.visitDate) params.visitDate = f.visitDate;
    if (f.status) params.status = f.status;
    const { data } = await api.get('/visitors', { params });
    setVisits(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (id, action) => {
    setError('');
    setBusyId(id);
    try {
      await api.patch(`/visitors/${id}/${action}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action.replace('checkin', 'check in').replace('checkout', 'check out')}`);
    } finally {
      setBusyId(null);
    }
  };

  const renderActions = (v) => (
    <div className="flex justify-end gap-2">
      {v.status === 'approved' && (
        <Button variant="brass" disabled={busyId === v._id} onClick={() => act(v._id, 'checkin')}>Check In</Button>
      )}
      {v.status === 'checked_in' && (
        <Button variant="primary" disabled={busyId === v._id} onClick={() => act(v._id, 'checkout')}>Check Out</Button>
      )}
      {['pending', 'approved'].includes(v.status) && (
        <Button variant="danger" disabled={busyId === v._id} onClick={() => act(v._id, 'cancel')}>Cancel</Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Front Desk"
        title="Visitor Desk"
        description="Check visitors in and out, or cancel a request that's no longer needed."
      />
      {error && <div className="mb-4"><InlineNotice tone="error" onDismiss={() => setError('')}>{error}</InlineNotice></div>}
      <VisitorFilters filters={filters} onChange={setFilters} onSubmit={(e) => { e.preventDefault(); load(); }} />
      <VisitorTable visits={visits} renderActions={renderActions} />
    </div>
  );
};

export default VisitorDesk;
