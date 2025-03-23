
import React from 'react';
import AdminMonitoringDashboard from './AdminMonitoringDashboard';
import AdminActionLogs from './AdminActionLogs';

const AdminMonitoringTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">User Monitoring</h2>
      <AdminMonitoringDashboard />
      
      <h2 className="text-xl font-bold mt-8">Action Logs</h2>
      <AdminActionLogs />
    </div>
  );
};

export default AdminMonitoringTab;
