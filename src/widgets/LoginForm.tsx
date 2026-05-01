import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useAuth } from '../components/isLoggedIn';

const LoginForm = ({ lang = 'en', ...props }) => {
  const { user, loading, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // If user is logged in, show user data instead of form
  if (user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow" id="login-form">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {lang === 'ar' ? 'مرحباً بك' : 'Welcome Back!'}
        </h2>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-blue-600">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {user.role}
            </span>
          )}
        </div>
        <div className="border-t pt-4">
          <button
            onClick={async () => {
              await logout();
              window.location.reload();
            }}
            className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition"
          >
            {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  // Not logged in - show login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    
    try {
      const userData = await authApi.login(email, password);
      // Handle successful login
      window.location.reload();
    } catch (err) {
      setError(lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow" id="login-form">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
      </h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loginLoading ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : (lang === 'ar' ? 'تسجيل الدخول' : 'Login')}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
