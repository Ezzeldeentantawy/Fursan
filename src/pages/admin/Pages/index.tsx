import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pagesApi } from '../../../api/pagesApi';

/**
 * PagesList Component
 * Admin page for managing all pages - listing, creating, editing, and deleting
 */
const PagesList: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await pagesApi.getAll();
      // Unwrap: Axios response -> JsonResource wrapper -> actual data
      const data = res.data.data || res.data;
      setPages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await pagesApi.delete(id);
      // Refresh the list after deletion
      await fetchPages();
    } catch (err: any) {
      console.error('Error deleting page:', err);
      alert(`Failed to delete page: ${err.message || 'Unknown error'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/pages/${id}/edit`);
  };

  const handlePreview = (page: any) => {
    const origin = window.location.origin;
    const base = import.meta.env.BASE_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : base + '/';
    
    const siteDomain = page.site?.domain || 'default';
    const isDefaultSite = page.site?.is_default || false;
    const slug = page.slug || page.id;
    
    let previewUrl;
    if (isDefaultSite) {
      previewUrl = `${origin}${normalizedBase}${slug}`;
    } else {
      previewUrl = `${origin}${normalizedBase}${siteDomain}/${slug}`;
    }
    
    window.open(previewUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-slate-400">Loading pages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Pages Management</h1>
          <button
            onClick={() => navigate('/admin/pages/new')}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Page
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading pages</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchPages}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Pages Table */}
        {!error && (
          <div className="bg-slate-900 shadow rounded-lg overflow-hidden">
            {pages.length === 0 ? (
              // Empty state
              <div className="text-center py-12 px-4">
                <svg 
                  className="mx-auto h-12 w-12 text-slate-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No pages yet</h3>
                <p className="mt-1 text-sm text-slate-400">Get started by creating a new page.</p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/admin/pages/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Page
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-700">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {page.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(page.id)}
                            className="text-sm font-medium text-blue-400 hover:text-blue-400 hover:underline text-left"
                          >
                            {page.title || 'Untitled'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {page.slug || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {page.site?.name || page.site_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {formatDate(page.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(page.id)}
                              className="text-blue-400 hover:text-blue-400 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handlePreview(page)}
                              className="text-green-400 hover:text-green-400 transition-colors"
                              title="Preview"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(page.id, page.title || 'Untitled')}
                              disabled={deleteLoading === page.id}
                              className="text-red-400 hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteLoading === page.id ? (
                                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-red-400 border-r-transparent"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesList;
