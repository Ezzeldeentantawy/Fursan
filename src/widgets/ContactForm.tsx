import React, { useState } from 'react';
import { authApi } from '../api/auth';

const ContactForm = ({ lang = 'en', ...props }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authApi.submitContact({ name, email, message });
      setSuccess(lang === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(lang === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow" id="contact-form">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
      </h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">{lang === 'ar' ? 'الرسالة' : 'Message'}</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 border border-gray-300 rounded h-32" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
          {loading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال' : 'Send')}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
