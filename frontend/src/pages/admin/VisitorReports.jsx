import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import VisitorFilters from '../../components/VisitorFilters';
import VisitorTable from '../../components/VisitorTable';

const EMPTY_FILTERS = { visitorName: '', employeeName: '', visitDate: '', status: '' };

const VisitorReports = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [visits, setVisits] = useState([]);

  const load = async (f = filters) => {
    const params = {};
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

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Visitor Reports"
        description="Search and filter every visitor request across the building."
      />
      <VisitorFilters filters={filters} onChange={setFilters} onSubmit={(e) => { e.preventDefault(); load(); }} />
      <VisitorTable visits={visits} />
    </div>
  );
};

export default VisitorReports;
