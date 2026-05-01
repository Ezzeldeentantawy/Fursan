import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useAuth } from '../components/isLoggedIn';

const RegisterForm = ({ lang = 'en', ...props }) => {
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // If user is logged in, show user data instead of form
  if (user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow" id="register-form">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {lang === 'ar' ? 'أنت مسجل الدخول بالفعل' : 'Already Logged In'}
        </h2>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-green-600">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {user.role}
            </span>
          )}
        </div>
        <p className="text-center text-gray-600">
          {lang === 'ar' ? 'يمكنك تسجيل الخروج إذا أردت إنشاء حساب جديد.' : 'You can logout if you want to create a new account.'}
        </p>
      </div>
    );
  }

  // Not logged in - show register form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError(lang === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    
    setRegisterLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authApi.register({ name, email, password, passwordConfirmation });
      setSuccess(lang === 'ar' ? 'تم التسجيل بنجاح! يرجى تسجيل الدخول.' : 'Registration successful! Please login.');
    } catch (err) {
      setError(lang === 'ar' ? 'فشل التسجيل' : 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow" id="register-form">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {lang === 'ar' ? 'تسجيل جديد' : 'Register'}
      </h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
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
        <div className="mb-4">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={registerLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {registerLoading ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : (lang === 'ar' ? 'تسجيل' : 'Register')}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
