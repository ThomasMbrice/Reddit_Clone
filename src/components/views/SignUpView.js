import React, { useState } from 'react';
import * as api from '../../api';

export default function SignUp({ onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const lowerPasswd = formData.password.toLowerCase(); // password
    const lowerName = formData.displayName.toLowerCase();
    const lowerEmail = formData.email.toLowerCase();
    const lowerFirst = formData.firstName.toLowerCase();
    const lowerLast = formData.lastName.toLowerCase();

    if (
      lowerPasswd.includes(lowerName) || // this is wrong i think
      lowerPasswd.includes(lowerEmail) ||
      lowerPasswd.includes(lowerFirst) ||
      lowerPasswd.includes(lowerLast)
    ) {
      setError('Password cannot contain your name, display name, or email');
      return;
    }

    // emel verifcation 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await api.signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        displayName: formData.displayName,
        password: formData.password
      });
      onCancel(); // Return to welcome page on success
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account');
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
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">First Name: *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div>
            <label className="block">Last Name: *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div>
            <label className="block">Email: *</label>
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
            <label className="block">Display Name: *</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div>
            <label className="block">Password: *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div>
            <label className="block">Confirm Password: *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="home_sidebar w-full"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full home_sidebar"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
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