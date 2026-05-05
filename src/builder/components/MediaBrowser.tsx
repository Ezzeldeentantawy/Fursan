import React, { useState, useEffect, useCallback } from 'react';
import { X, Image, FileText, File, Search, Loader2 } from 'lucide-react';
import { mediaApi } from '../../api/media';

interface MediaItem {
  id: number;
  file_name: string;
  file_type: string;
  url: string;
  created_at: string;
}

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const MediaBrowser: React.FC<MediaBrowserProps> = ({ isOpen, onClose, onSelect }) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (isOpen) {
      loadMedia(1);
    }
  }, [isOpen, loadMedia]);

  const handleSelect = (item: MediaItem) => {
    onSelect(item.url);
    onClose();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return File;
  };

  const filteredMedia = searchQuery
    ? media.filter((item) => item.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : media;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Select Image from Media Library</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media files..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="text-slate-400 animate-spin" />
              <span className="ml-2 text-slate-400">Loading media...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {searchQuery ? 'No media files match your search.' : 'No media files uploaded yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredMedia.map((item) => {
                const FileIcon = getFileIcon(item.file_type);
                const isImage = item.file_type?.startsWith('image/');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    {/* Preview */}
                    <div className="aspect-square flex items-center justify-center bg-slate-900 p-2">
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.file_name}
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <FileIcon size={32} className="text-slate-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-[10px] text-slate-400 truncate group-hover:text-white transition-colors" title={item.file_name}>
                        {item.file_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700">
            <button
              onClick={() => loadMedia(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => loadMedia(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
