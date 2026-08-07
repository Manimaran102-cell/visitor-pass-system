import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import VisitorFilters from '../../components/VisitorFilters';
import VisitorTable from '../../components/VisitorTable';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InlineNotice from '../../components/InlineNotice';

const EMPTY_FILTERS = { visitorName: '', employeeName: '', visitDate: '', status: '' };

const VisitorRequests = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState('');
  const [decisionModal, setDecisionModal] = useState(null); // { visit, action }
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (f = filters) => {
    const params = {};
    if (f.visitorName) params.visitorName = f.visitorName;
    if (f.visitDate) params.visitDate = f.visitDate;
    if (f.status) params.status = f.status;
    const { data } = await api.get('/visitors', { params });
    setVisits(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDecision = (visit, action) => {
    setDecisionModal({ visit, action });
    setRemarks('');
    setError('');
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch(`/visitors/${decisionModal.visit._id}/${decisionModal.action}`, { remarks });
      setDecisionModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record decision');
    } finally {
      setLoading(false);
    }
  };

  const renderActions = (v) =>
    v.status === 'pending' ? (
      <div className="flex justify-end gap-2">
        <Button variant="brass" onClick={() => openDecision(v, 'approve')}>Approve</Button>
        <Button variant="danger" onClick={() => openDecision(v, 'reject')}>Reject</Button>
      </div>
    ) : null;

  return (
    <div>
      <PageHeader
        eyebrow="Approvals"
        title="Visitor Requests"
        description="Review who's asking to see you, and approve or decline with a note."
      />
      <VisitorFilters
        filters={filters}
        onChange={setFilters}
        onSubmit={(e) => { e.preventDefault(); load(); }}
        showStatus
      />
      <VisitorTable visits={visits} renderActions={renderActions} />

      <Modal
        open={!!decisionModal}
        onClose={() => setDecisionModal(null)}
        title={decisionModal?.action === 'approve' ? 'Approve Visitor Request' : 'Reject Visitor Request'}
      >
        {decisionModal && (
          <form onSubmit={submitDecision} className="space-y-3">
            {error && <InlineNotice tone="error">{error}</InlineNotice>}
            <p className="text-sm text-ink-700">
              <span className="font-semibold">{decisionModal.visit.visitorName}</span> — {decisionModal.visit.purpose}
            </p>
            <div>
              <label className="label-eyebrow block mb-1.5">Remarks (optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm outline-none focus:border-ink-700"
                placeholder="Add a note for the front desk…"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDecisionModal(null)}>Cancel</Button>
              <Button
                type="submit"
                variant={decisionModal.action === 'approve' ? 'brass' : 'danger'}
                disabled={loading}
              >
                {loading ? 'Saving…' : decisionModal.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default VisitorRequests;
