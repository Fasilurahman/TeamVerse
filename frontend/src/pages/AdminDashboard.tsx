import  { useEffect, useState } from 'react';
import { BarChart2, Users } from 'lucide-react';
import Sidebar from '../components/Design/Sidebar';
import Header from '../components/Design/Header';
import { StatCard } from '../components/Design/StatCard';
import { Charts } from '../components/Design/Charts';
import { fetchAdminStats } from '../services/ChartService';

function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    conversionRate: 0,
    conversionRateconversionRate: 0,
  });

  const fetchStats = async () => {
    try {
      const result = await fetchAdminStats();
      console.log(result, ' result from stat card');
      setStats(result);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#111827]">
      <Sidebar />

      <div className="flex-1 p-8">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers.toString()} trend="+12.3%" icon={Users} />
          <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} trend="+8.7%" icon={BarChart2} />
          <StatCard title="Active Subscriptions" value={stats.activeSubscriptions.toString()} trend="+2.1%" icon={Users} />
          <StatCard title="Conversion Rate" value={stats.conversionRate.toString()} trend="-0.5%" icon={BarChart2} />
        </div>

        <Charts />
      </div>
    </div>
  );
}

export default Dashboard;
