import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShieldCheck, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-9 h-9 text-primary" />
            <span className="ml-2 text-2xl font-bold">FinCore</span>
          </div>
          <div className="space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-md bg-primary text-white hover:bg-indigo-600"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Finance Data Processing and Access Control Platform
            </h1>
            <p className="mt-4 text-gray-300 text-lg">
              Manage records, view analytics, and enforce role-based access with a clean and secure workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="px-5 py-3 rounded-md bg-primary text-white font-medium hover:bg-indigo-600"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Login to Continue'}
              </Link>
              <Link
                to="/register"
                className="px-5 py-3 rounded-md border border-gray-700 text-gray-200 font-medium hover:bg-gray-800"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg border border-gray-800 bg-card">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h3 className="mt-3 font-semibold">Dashboard Insights</h3>
              <p className="mt-2 text-sm text-gray-400">Income, expenses, trends, and category breakdowns.</p>
            </div>
            <div className="p-5 rounded-lg border border-gray-800 bg-card">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="mt-3 font-semibold">Secure Access</h3>
              <p className="mt-2 text-sm text-gray-400">Role-based permissions for viewer, analyst, and admin.</p>
            </div>
            <div className="p-5 rounded-lg border border-gray-800 bg-card sm:col-span-2">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="mt-3 font-semibold">How Admin Login Works</h3>
              <p className="mt-2 text-sm text-gray-400">
                New registrations are created as <span className="text-gray-200">VIEWER</span>. An existing admin must
                promote users to <span className="text-gray-200">ADMIN</span> from the Users module.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                If seed data is loaded, you can login as admin with:
                <span className="text-gray-200"> admin@finance.com / Admin@123</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
