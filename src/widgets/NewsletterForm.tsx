import React, { useState } from 'react';
import { authApi } from '../api/auth';

const NewsletterForm = ({ lang = 'en', ...props }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      await authApi.subscribeNewsletter(email);
      setStatus('success');
      setMessage(
        lang === 'ar' 
          ? 'شكراً لك! تم الإشتراك بنجاح.' 
          : 'Thank you! You have been successfully subscribed.'
      );
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(
        lang === 'ar'
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'An error occurred. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow" id="newsletter-form">
      <h3 className="text-xl font-bold mb-4 text-center">
        {lang === 'ar' ? 'النشرة الإخبارية' : 'Newsletter'}
      </h3>
      <p className="text-sm text-gray-600 mb-6 text-center">
        {lang === 'ar' 
          ? 'اشترك في نشرتنا الإخبارية للحصول على آخر التحديثات.'
          : 'Subscribe to our newsletter for the latest updates.'}
      </p>
      
      {status === 'success' ? (
        <div className="p-4 bg-green-100 text-green-700 rounded text-center">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Your email'}
              className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {status === 'loading' 
                ? (lang === 'ar' ? 'جاري الإرسال...' : 'Subscribing...')
                : (lang === 'ar' ? 'اشتراك' : 'Subscribe')}
            </button>
          </div>
          {status === 'error' && (
            <div className="mt-3 p-3 bg-red-100 text-red-700 rounded text-sm">
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default NewsletterForm;
