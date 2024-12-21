import React, { useState } from 'react';
import * as api from '../../api';

export default function Login({ onCancel, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(formData);
      onLoginSuccess({ type: 'user', user: response.data.user });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div>
            <label className="block">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div className="flex gap-4">

            <button
              type="submit"
              className="w-full home_sidebar"
              disabled={loading} // creates loading effect for api call
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full home_sidebar"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}