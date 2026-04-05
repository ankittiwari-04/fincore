import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import RecordTable, { type RecordItem } from '../components/RecordTable';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
}

interface CategoryData {
  category: string;
  type: string;
  total: number;
  count: number;
}

interface TrendData {
  label: string;
  month?: string;
  weekOf?: string;
  income: number;
  expenses: number;
  net: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, catRes, trendRes, recentRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/by-category'),
          api.get('/dashboard/trends'),
          api.get('/dashboard/recent')
        ]);
        
        setSummary(sumRes.data.data);
        setCategoryData(sumRes.data.data.totalRecords > 0 ? catRes.data.data : []);
        setTrendData(trendRes.data.data.trends);
        setRecentActivity(recentRes.data.data);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Income" value={`$${summary.totalIncome.toFixed(2)}`} icon={<TrendingUp className="text-green-500 w-6 h-6" />} color="border-l-green-500" />
          <StatCard title="Total Expenses" value={`$${summary.totalExpenses.toFixed(2)}`} icon={<TrendingDown className="text-red-500 w-6 h-6" />} color="border-l-red-500" />
          <StatCard title="Net Balance" value={`$${summary.netBalance.toFixed(2)}`} icon={<DollarSign className="text-primary w-6 h-6" />} color="border-l-primary" />
          <StatCard title="Total Records" value={summary.totalRecords} icon={<Activity className="text-purple-500 w-6 h-6" />} color="border-l-purple-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow border border-gray-800">
          <h3 className="text-lg font-medium text-white mb-4">Cash Flow (Last 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border border-gray-800">
          <h3 className="text-lg font-medium text-white mb-4">Expenses by Category</h3>
          <div className="h-72 flex justify-center">
            {categoryData.filter(d => d.type === 'EXPENSE').length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.filter(d => d.type === 'EXPENSE')}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                    label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                    labelLine={false}
                  >
                    {categoryData.filter(d => d.type === 'EXPENSE').map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center text-gray-400">No expense data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-dark rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        <RecordTable records={recentActivity} userRole={user!.role} />
      </div>
    </div>
  );
};

export default Dashboard;
