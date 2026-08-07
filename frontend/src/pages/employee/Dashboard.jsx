import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="My Visitors"
        title="Employee Dashboard"
        description="Requests waiting on you, and who's scheduled to stop by."
      />
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Pending Requests" value={stats.pendingRequests} accent="brass" />
          <StatCard label="Decided Today" value={stats.approvedToday} accent="blue" />
          <StatCard label="Scheduled Visitors" value={stats.scheduledVisitors} accent="green" />
          <StatCard label="Total Visits Hosted" value={stats.totalVisitsHosted} />
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
