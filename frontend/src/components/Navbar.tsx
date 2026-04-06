import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, Users, DollarSign } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mb-1">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold ml-2">FinCore</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/records"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Records
                </NavLink>

                {user.role === 'ADMIN' && (
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </NavLink>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <div className="text-sm">
                <span className="text-gray-300">{user.name}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-800 text-primary border border-primary/30">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white flex items-center"
              >
                <LogOut className="w-5 h-5 mx-1" />
                <span className="text-sm mr-1">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
