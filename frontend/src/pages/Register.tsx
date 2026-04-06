import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { DollarSign } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setPasswordError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.status === 'success') {
        const { user } = response.data.data;
        const loginResponse = await api.post('/auth/login', { email, password });
        const token = loginResponse?.data?.data?.token;
        if (!token) {
          throw new Error('Registration succeeded, but auto-login failed. Please sign in manually.');
        }
        login(token, user);
        toast.success(`Welcome to FinCore, ${user.name}!`);
        navigate('/');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed.';
      const fieldErrors = err.response?.data?.errors;
      let hasPasswordIssue = false;
      if (Array.isArray(fieldErrors)) {
        const passwordIssue = fieldErrors.find((issue: any) => issue?.path?.[0] === 'password');
        if (passwordIssue?.message) {
          setPasswordError(passwordIssue.message);
          hasPasswordIssue = true;
        }
      }
      if (!hasPasswordIssue) {
        const lower = String(message).toLowerCase();
        if (lower.includes('password')) {
          setPasswordError(message);
        } else {
          setFormError(message);
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary mb-4">
          <DollarSign className="w-16 h-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link to="/login" className="font-medium text-primary hover:text-indigo-400">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-dark text-white rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-dark text-white rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setFormError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-dark text-white rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters, with uppercase, lowercase, number, and special character.</p>
              {passwordError && (
                <p className="mt-2 text-xs text-red-400">{passwordError}</p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-red-400">{formError}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
