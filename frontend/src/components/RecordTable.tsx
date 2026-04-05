import React from 'react';
import { Trash2 } from 'lucide-react';
import { type Role } from '../context/AuthContext';

export interface RecordItem {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string;
  user?: { name: string; email: string };
}

interface RecordTableProps {
  records: RecordItem[];
  onDelete?: (id: string) => void;
  userRole: Role;
}

const RecordTable: React.FC<RecordTableProps> = ({ records, onDelete, userRole }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Date</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Created By</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Type</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Category</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white text-right">Amount</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Notes</th>
            {userRole === 'ADMIN' && !!onDelete && (
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Delete</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-card">
          {records.length > 0 ? records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-800 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                {record.user?.name || 'Unknown'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  record.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.type}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{record.category}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                <span className={record.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}>
                  ${record.amount.toFixed(2)}
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-400 max-w-xs truncate">{record.notes}</td>
              {userRole === 'ADMIN' && !!onDelete && (
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button onClick={() => onDelete(record.id)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecordTable;
