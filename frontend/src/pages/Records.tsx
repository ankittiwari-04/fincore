import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RecordTable, { type RecordItem } from '../components/RecordTable';
import toast from 'react-hot-toast';
import { Plus, X, Filter } from 'lucide-react';

const Records: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    setAccessError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (type) params.append('type', type);
      if (category) params.append('category', category);

      const response = await api.get(`/records?${params.toString()}`);
      const data = response.data.data;
      setRecords(data.records);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      if (error.response?.status === 403) {
        const role = user.role?.toUpperCase?.() || 'USER';
        const message = `Access denied: your role (${role}) cannot view records. Please ask an admin for ANALYST or ADMIN access.`;
        setAccessError(message);
        setRecords([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, type]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/records', {
        ...formData,
        amount: Number(formData.amount)
      });
      toast.success('Record created');
      setShowModal(false);
      setFormData({ amount: '', type: 'EXPENSE', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchRecords();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors.map((e: any) => e.message).join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to create record');
      }
    }
  };

  const canCreate = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-white">Financial Records</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm font-medium text-white hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          
          {canCreate && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <form onSubmit={handleFilterSubmit} className="bg-card p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <select 
              value={type} 
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
            >
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <input 
              type="text" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              placeholder="Search category..."
              className="w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Apply
          </button>
        </form>
      )}

      {accessError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {accessError}
        </div>
      )}

      {loading && !records.length ? (
        <div className="text-center py-10 text-gray-400">Loading records...</div>
      ) : (
        <>
          <RecordTable records={records} onDelete={handleDelete} userRole={user?.role ?? 'VIEWER'} />
          
          <div className="flex justify-between items-center bg-card px-4 py-3 border border-gray-800 rounded-lg">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium text-white">{records.length}</span> of <span className="font-medium text-white">{total}</span> results
            </div>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-white disabled:opacity-50"
              >
                Previous
              </button>
              <div className="px-3 py-1 text-gray-300">Page {page} of {totalPages}</div>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-700">
              <div className="bg-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">Add New Record</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Type</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="mt-1 w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="INCOME">Income</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Amount</label>
                    <input 
                      type="number" step="0.01" min="0.01" required
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="mt-1 w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Category</label>
                    <input 
                      type="text" required minLength={2} maxLength={50}
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="mt-1 w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input 
                      type="date" required
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="mt-1 w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Notes (Optional)</label>
                    <textarea 
                      maxLength={200}
                      value={formData.notes} 
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="mt-1 w-full bg-dark border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="mr-3 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-600">Save Record</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
