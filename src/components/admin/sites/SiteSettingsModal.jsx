import { useState, useEffect, useRef } from 'react';
import { sitesApi } from '../../../api/sites';
import { pagesApi } from '../../../api/pagesApi';
import siteMenusApi from '../../../api/siteMenusApi';
import siteSocialMediaApi from '../../../api/siteSocialMediaApi';
import { mediaApi } from '../../../api/media';
import { Plus, Trash2, Settings, Upload, X } from 'lucide-react';

const SiteSettingsModal = ({ site, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [siteName, setSiteName] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [menus, setMenus] = useState([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState([]);
  const fileInputRef = useRef(null);

  const platformOptions = [
    'Facebook',
    'Twitter',
    'Instagram',
    'LinkedIn',
    'YouTube',
    'TikTok'
  ];

  // Initialize form when site changes
  useEffect(() => {
    if (site && isOpen) {
      setSiteName(site.name || '');
      setFaviconPreview(site.favicon_url || '');
      loadMenus();
      loadSocialMedia();
      loadPages();
    }
  }, [site, isOpen]);

  const loadMenus = async () => {
    if (!site?.id) return;
    try {
      setLoading(true);
      const data = await siteMenusApi.getMenus(site.id);
      setMenus(data.menus || []);
    } catch (error) {
      console.error('Failed to load menus:', error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialMedia = async () => {
    if (!site?.id) return;
    try {
      const data = await siteSocialMediaApi.getSocialMedia(site.id);
      setSocialLinks(data.social_links || []);
    } catch (error) {
      console.error('Failed to load social media:', error);
      setSocialLinks([]);
    }
  };

  const loadPages = async () => {
    if (!site?.id) return;
    try {
      const res = await pagesApi.getAll('en', site.id);
      const data = res.data.data || res.data || [];
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = async () => {
    if (!faviconFile || !site?.id) return;
    try {
      setSaving(true);
      const res = await mediaApi.upload(faviconFile);
      const mediaData = res.data.data || res.data;
      const mediaId = mediaData.id;

      await sitesApi.update(site.id, { favicon_media_id: mediaId });
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to upload favicon:', error);
      alert('Failed to upload favicon');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!site?.id) return;
    try {
      setSaving(true);
      
      // Only send name if it actually changed
      if (siteName !== site.name) {
        await sitesApi.update(site.id, { name: siteName });
      }
      
      // Handle favicon upload separately (doesn't require admin)
      if (faviconFile) {
        await handleFaviconUpload();
      }
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save general settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMenus = async () => {
    if (!site?.id) return;
    try {
      setSaving(true);
      await siteMenusApi.updateMenus(site.id, { menus });
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save menus:', error);
      alert('Failed to save menus');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialMedia = async () => {
    if (!site?.id) return;
    try {
      setSaving(true);
      await siteSocialMediaApi.updateSocialMedia(site.id, { social_links: socialLinks });
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save social media:', error);
      alert('Failed to save social media');
    } finally {
      setSaving(false);
    }
  };

  const addMenuGroup = () => {
    const newIndex = menus.length;
    setMenus([...menus, { name: '', links: [] }]);
    setActiveMenuIndex(newIndex);
  };

  const updateMenuGroup = (index, field, value) => {
    const updated = [...menus];
    updated[index][field] = value;
    setMenus(updated);
  };

  const removeMenuGroup = (index) => {
    const updated = menus.filter((_, i) => i !== index);
    setMenus(updated);
    // Adjust active tab after removal
    if (updated.length === 0) {
      setActiveMenuIndex(0);
    } else if (activeMenuIndex >= index) {
      setActiveMenuIndex(Math.max(0, activeMenuIndex - 1));
    }
  };

  const addLink = (menuIndex) => {
    const updated = [...menus];
    updated[menuIndex].links.push({
      label_en: '',
      label_ar: '',
      page_id: null,
      url: '',
      parent_id: null,
      order: updated[menuIndex].links.length
    });
    setMenus(updated);
  };

  const updateLink = (menuIndex, linkIndex, field, value) => {
    const updated = [...menus];
    updated[menuIndex].links[linkIndex][field] = value;
    setMenus(updated);
  };

  const handlePageSelect = (menuIndex, linkIndex, pageId) => {
    const selectedPageId = pageId ? parseInt(pageId) : null;
    const selectedPage = pages.find(p => p.id === selectedPageId);
    const updated = [...menus];
    updated[menuIndex].links[linkIndex].page_id = selectedPageId;
    if (selectedPage) {
      updated[menuIndex].links[linkIndex].url = `/${selectedPage.slug}`;
    }
    setMenus(updated);
  };

  const removeLink = (menuIndex, linkIndex) => {
    const updated = [...menus];
    updated[menuIndex].links.splice(linkIndex, 1);
    setMenus(updated);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            <Settings className="inline-block mr-2" size={20} />
            Site Settings: {site?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {['general', 'menus', 'social'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'social' ? 'Social Media' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Loading...</div>
          ) : (
            <>
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Favicon
                    </label>
                    {faviconPreview && (
                      <div className="mb-4">
                        <img
                          src={faviconPreview}
                          alt="Favicon preview"
                          className="w-16 h-16 object-contain bg-slate-800 rounded-lg border border-slate-700"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFaviconChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-700"
                      >
                        <Upload size={16} />
                        Choose File
                      </button>
                      {faviconFile && (
                        <span className="text-sm text-slate-400">
                          {faviconFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveGeneral}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Menus Tab */}
              {activeTab === 'menus' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Menu Groups</h3>
                    <button
                      onClick={addMenuGroup}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus size={16} />
                      Add Menu Group
                    </button>
                  </div>

                  {/* Tab bar */}
                  {menus.length > 0 && (
                    <div className="flex items-center gap-1 border-b border-slate-700 pb-1 overflow-x-auto">
                      {menus.map((menu, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveMenuIndex(index)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-t transition-colors whitespace-nowrap ${
                            activeMenuIndex === index
                              ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <span>{menu.name || `Menu ${index + 1}`}</span>
                          <X
                            size={12}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMenuGroup(index);
                            }}
                            className="text-slate-500 hover:text-red-400 flex-shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {menus.length === 0 && (
                    <div className="text-center text-slate-500 py-8 text-sm">
                      No menu groups yet. Click "Add Menu Group" to create one.
                    </div>
                  )}

                  {/* Active menu content */}
                  {menus.length > 0 && menus[activeMenuIndex] && (
                    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={menus[activeMenuIndex].name}
                          onChange={(e) => updateMenuGroup(activeMenuIndex, 'name', e.target.value)}
                          placeholder="Menu Group Name (e.g., Main Menu)"
                          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeMenuGroup(activeMenuIndex)}
                          className="ml-2 p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Links</span>
                          <button
                            onClick={() => addLink(activeMenuIndex)}
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <Plus size={14} />
                            Add Link
                          </button>
                        </div>

                        {menus[activeMenuIndex].links.map((link, linkIndex) => (
                          <div key={linkIndex} className="bg-slate-700 rounded-lg p-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={link.label_en}
                                onChange={(e) => updateLink(activeMenuIndex, linkIndex, 'label_en', e.target.value)}
                                placeholder="Label (English)"
                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 text-sm"
                              />
                              <input
                                type="text"
                                value={link.label_ar}
                                onChange={(e) => updateLink(activeMenuIndex, linkIndex, 'label_ar', e.target.value)}
                                placeholder="Label (Arabic)"
                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => updateLink(activeMenuIndex, linkIndex, 'url', e.target.value)}
                                placeholder="URL (optional if page selected)"
                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 text-sm"
                              />
                              <select
                                value={link.page_id || ''}
                                onChange={(e) => handlePageSelect(activeMenuIndex, linkIndex, e.target.value)}
                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                              >
                                <option value="">Select Page (optional)</option>
                                {pages.map((page) => (
                                  <option key={page.id} value={page.id}>
                                    {page.title || page.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <input
                                type="number"
                                value={link.order}
                                onChange={(e) => updateLink(activeMenuIndex, linkIndex, 'order', parseInt(e.target.value))}
                                placeholder="Order"
                                className="w-20 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                              />
                              <button
                                onClick={() => removeLink(activeMenuIndex, linkIndex)}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveMenus}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Menus'}
                    </button>
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Social Media Links</h3>
                    <button
                      onClick={addSocialLink}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus size={16} />
                      Add Social Link
                    </button>
                  </div>

                  {socialLinks.map((link, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg p-4 flex items-center gap-4">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                      >
                        <option value="">Select Platform</option>
                        {platformOptions.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                      />
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSocialMedia}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Social Media'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsModal;
