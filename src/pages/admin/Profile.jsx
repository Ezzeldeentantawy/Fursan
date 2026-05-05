import React, { useState } from 'react';
import { useAuth } from '../../components/isLoggedIn';
import { usersApi } from '../../api/usersApi';
import { User, Mail, Lock, Save, AlertTriangle, Check } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!newEmail || !user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await usersApi.update(user.id, { email: newEmail });
      setSuccess('Email updated successfully!');
      setShowEmailForm(false);
      setNewEmail('');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword || !user) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await usersApi.changePassword(user.id, {
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <Check size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'super_admin' ? 'Super Admin' : 'Site Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Email Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Change Email</h3>
            </div>
            <button
              onClick={() => {
                setShowEmailForm(!showEmailForm);
                setError(null);
                setSuccess(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showEmailForm ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
        {showEmailForm && (
          <div className="p-6">
            <form onSubmit={handleEmailChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Email'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            <button
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setError(null);
                setSuccess(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </button>
          </div>
        </div>
        {showPasswordForm && (
          <div className="p-6">
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
