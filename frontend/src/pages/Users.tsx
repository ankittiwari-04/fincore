import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const status = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/users/${id}/status`, { status });
      toast.success('Status updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user completely?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Manage Users</h1>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Email</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Joined</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Role</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-card">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{u.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{u.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-dark border border-gray-700 text-white text-xs rounded focus:ring-primary focus:border-primary block p-1"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <button 
                    onClick={() => handleStatusToggle(u.id, u.status)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {u.status}
                  </button>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
