import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { fetchAdminChartData } from '../../services/ChartService';

interface ChartPoint {
  name: string;
  value: number;
}

export const Charts: React.FC = () => {
  const [revenueData, setRevenueData] = useState<ChartPoint[]>([]);
  const [userActivity, setUserActivity] = useState<ChartPoint[]>([]);

  const fetchChartData = async () => {
    try {
      const result = await fetchAdminChartData();
      setRevenueData(result.revenueData);     // monthly revenue
      setUserActivity(result.userActivity);   // monthly users
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Overview */}
      <div className="bg-[#1A1F37] p-6 rounded-xl">
        <h3 className="text-white text-lg font-semibold mb-6">Revenue Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="name" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1F37',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Activity */}
      <div className="bg-[#1A1F37] p-6 rounded-xl">
        <h3 className="text-white text-lg font-semibold mb-6">User Activity</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="name" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1F37',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
