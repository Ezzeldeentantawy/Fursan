import { useState } from "react";
import axios from "axios";

const CreateJob = () => {
  const [lang, setLang] = useState('en');
  const [jobData, setJobData] = useState({
    type: 'remotely',
    location: '',
    title: { en: '', ar: '' },
    details: { en: '', ar: '' },
    job_description: { en: '', ar: '' },
    requirements: { en: '', ar: '' },
    benefits: { en: '', ar: '' },
    overview: { en: '', ar: '' },
    image: null
  });

  // Hardcoded values for testing
  const fillTestData = () => {
    setJobData({
      type: 'onsite',
      location: {
        en: 'Riyadh, KSA',
        ar: 'الرياض، السعودية'
      },
      title: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
      details: { en: 'Full-time position', ar: 'دوام كامل' },
      job_description: { en: 'Build amazing web apps', ar: 'بناء تطبيقات ويب رائعة' },
      requirements: { en: 'React, Node.js', ar: 'React, Node.js' },
      benefits: { en: 'Health insurance, Remote days', ar: 'تأمين صحي، أيام عمل عن بعد' },
      overview: { en: 'Great company culture', ar: 'بيئة عمل ممتازة' },
      image: null
    });
  };
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });


  const handleInputChange = (field, value, isLocalized = true) => {
    if (isLocalized) {
      setJobData(prev => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value }
      }));
    } else {
      setJobData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/employer/jobs`, jobData);

    } catch (error: any) {
      console.error("failed:", error.response?.data || error.message);
    }
  };

  // Helper to render label based on language
  const getLabel = (en, ar) => (lang === 'en' ? en : ar);

  return (
    <div style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{getLabel('Create New Job', 'إنشاء وظيفة جديدة')}</h2>
        <button type="button" onClick={fillTestData} style={{ padding: '5px 10px', cursor: 'pointer' }}>
          ⚡ Fill Test Data
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block' }}>{getLabel('Job Type', 'نوع الوظيفة')}:</label>
            <select
              style={{ width: '100%', padding: '8px' }}
              value={jobData.type}
              onChange={(e) => handleInputChange('type', e.target.value, false)}
            >
              <option value="remote">Remotely</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          {jobData.type === 'onsite' && (
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block' }}>{getLabel('Location', 'الموقع')}:</label>
              <input
                style={{ width: '100%', padding: '8px' }}
                type="text"
                placeholder="e.g. Riyadh, KSA"
                value={jobData.location}
                onChange={(e) => handleInputChange('location', e.target.value, false)}
              />
            </div>
          )}
        </div>

        <hr style={{ width: '100%', margin: '10px 0' }} />

        {/* Dynamic Inputs for Localized Fields */}
        {[
          { id: 'title', label: ['Title', 'المسمى الوظيفي'], type: 'input' },
          { id: 'details', label: ['Details', 'التفاصيل'], type: 'input' },
          { id: 'overview', label: ['Overview', 'نظرة عامة'], type: 'textarea' },
          { id: 'job_description', label: ['Job Description', 'الوصف الوظيفي'], type: 'textarea' },
          { id: 'requirements', label: ['Requirements', 'المتطلبات'], type: 'textarea' },
          { id: 'benefits', label: ['Benefits', 'المميزات'], type: 'textarea' },
        ].map((field) => (
          <div key={field.id}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>
              {getLabel(field.label[0], field.label[1])} ({lang.toUpperCase()}):
            </label>
            {field.type === 'input' ? (
              <input
                style={{ width: '100%', padding: '8px' }}
                type="text"
                value={jobData[field.id][lang]}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            ) : (
              <textarea
                style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                value={jobData[field.id][lang]}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <div>
          <label style={{ display: 'block' }}>{getLabel('Image (Optional)', 'الصورة (اختياري)')}:</label>
          <input
            type="file"
            onChange={(e) => handleInputChange('image', e.target.files[0], false)}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          {lang === 'en' ? (
            <button
              type="button"
              onClick={() => setLang('ar')}
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none' }}
            >
              Next: Fill Arabic Version
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{ padding: '10px 20px', cursor: 'pointer' }}
              >
                Back to English
              </button>
              <button
                type="submit"
                style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: 'green', color: 'white', border: 'none' }}
              >
                Save Job Object
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateJob;