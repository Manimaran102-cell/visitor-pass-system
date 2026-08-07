import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Administrator Dashboard"
        description="A live snapshot of everyone moving through the building today."
      />
      {error && <p className="text-signal-red text-sm">{error}</p>}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Today's Visitors" value={stats.todaysVisitors} accent="brass" />
          <StatCard label="Currently Inside" value={stats.currentlyInside} accent="green" />
          <StatCard label="Pending Requests" value={stats.pendingRequests} accent="blue" />
          <StatCard label="Active Employees" value={stats.totalEmployees} />
          <StatCard label="Active User Accounts" value={stats.totalActiveUsers} />
          <StatCard label="Total Visits Logged" value={stats.totalVisitorsAllTime} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
