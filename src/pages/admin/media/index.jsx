import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, Copy, Image, FileText, File } from 'lucide-react';
import { mediaApi } from '../../../api/media';

const MediaManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMedia = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await mediaApi.getAll({ page: pageNum });
      const data = res.data;
      setMedia(data.data || []);
      if (data.meta) {
        setTotalPages(data.meta.last_page);
        setPage(data.meta.current_page);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Allowed: JPG, PNG, WebP, PDF, ZIP');
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('File too large. Maximum 20MB.');
      return;
    }

    setUploading(true);
    try {
      await mediaApi.upload(file);
      loadMedia(1); // Reload from page 1
    } catch (error) {
      console.error('Failed to upload:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleUpload(file);
    e.target.value = ''; // Reset input
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await mediaApi.delete(id);
      loadMedia(page); // Reload current page
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL');
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return File;
  };

  if (loading && media.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading media...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Media Library</h2>
      </div>

      {/* Upload Area */}
      <div
        className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 hover:border-slate-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={48} className="mx-auto mb-4 text-slate-500" />
        <p className="text-slate-400 mb-2">Drag and drop files here, or click to upload</p>
        <p className="text-slate-500 text-sm mb-4">Supported: JPG, PNG, WebP, PDF, ZIP (max 20MB)</p>
        <label className="inline-block px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 cursor-pointer">
          Choose File
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".jpg,.jpeg,.png,.webp,.pdf,.zip"
          />
        </label>
        {uploading && (
          <div className="mt-4 text-slate-400">Uploading...</div>
        )}
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No media files uploaded yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => {
              const FileIcon = getFileIcon(item.file_type);
              const isImage = item.file_type?.startsWith('image/');
              
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
                >
                  {/* Preview */}
                  <div className="aspect-square flex items-center justify-center bg-slate-800 p-4">
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.file_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <FileIcon size={48} className="text-slate-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-slate-300 truncate" title={item.file_name}>
                      {item.file_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Copy URL"
                      >
                        <Copy size={12} />
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center py-1.5 px-2 text-xs bg-slate-800 text-red-400 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => loadMedia(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    pageNum === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaManager;
