import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Front Desk"
        title="Receptionist Dashboard"
        description="Everything happening at the front desk today."
      />
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Today's Visitors" value={stats.todaysVisitors} accent="brass" />
          <StatCard label="Currently Inside" value={stats.currentlyInside} accent="green" />
          <StatCard label="Pending Approval" value={stats.pendingApproval} accent="blue" />
          <StatCard label="Checked Out Today" value={stats.checkedOutToday} />
          <StatCard label="Scheduled Upcoming" value={stats.scheduledUpcoming} />
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
