import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Search, Film, Music, FileText, Upload, Plus, Trash2, Eye, Play, Lock, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  status: 'RAW' | 'TRANSCODING' | 'ENCRYPTING' | 'ENCRYPTED' | 'FAILED';
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize: number;
  createdAt: string;
  metadata?: {
    previewUrl?: string;
    thumbnailUrl?: string;
    [key: string]: any;
  };
}

export const ContentPage: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadType, setUploadType] = useState<'VIDEO' | 'AUDIO' | 'DOCUMENT'>('VIDEO');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const [docPage, setDocPage] = useState(1);
  const [isBlurred, setIsBlurred] = useState(false);

  // Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [previewConfig, setPreviewConfig] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/content', {
        params: {
          search: search || undefined,
          contentType: typeFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      const items = res.data?.data || res.data;
      setContent(Array.isArray(items) ? items : items?.items || []);
    } catch (err: any) {
      console.error('Failed to load content catalog:', err);
      showToast('Backend connection error. Loading demo assets.', 'error');
      setContent(getFallbackContent());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContent();
  };

  // Upload Logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
      if (!uploadTitle) {
        // Auto-fill title from filename
        const name = e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, '');
        setUploadTitle(name);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      if (!uploadTitle) {
        const name = e.target.files[0].name.replace(/\.[^/.]+$/, '');
        setUploadTitle(name);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a file to upload.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('description', uploadDesc);
    formData.append('contentType', uploadType.toLowerCase());
    formData.append('file', uploadFile);

    try {
      setUploading(true);
      setUploadProgress(10);
      
      await apiClient.post('/content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(Math.max(10, percentCompleted));
        },
      });

      showToast('Asset uploaded successfully! Transcoding job added to queue.');
      setIsUploadOpen(false);
      resetUploadForm();
      fetchContent();
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast(err.response?.data?.message || 'Error uploading file. Using simulator mode.', 'error');
      
      // Simulator Upload Add
      const newSimItem: ContentItem = {
        id: `sim-${Date.now()}`,
        title: uploadTitle,
        description: uploadDesc,
        contentType: uploadType,
        status: 'TRANSCODING',
        fileSize: uploadFile.size,
        createdAt: new Date().toISOString(),
      };
      setContent(prev => [newSimItem, ...prev]);
      setIsUploadOpen(false);
      resetUploadForm();
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadDesc('');
    setUploadType('VIDEO');
    setUploadFile(null);
    setUploadProgress(0);
  };

  // Actions
  const publishAsset = async (id: string) => {
    try {
      await apiClient.post(`/content/${id}/publish`);
      showToast('Content published successfully!');
      fetchContent();
    } catch (err: any) {
      console.error('Publish error:', err);
      showToast('Error publishing asset. Updating UI in simulator mode.', 'error');
      setContent(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'ENCRYPTED' } : item)
      );
    }
  };

  const archiveAsset = async (id: string) => {
    try {
      await apiClient.post(`/content/${id}/archive`);
      showToast('Content archived successfully!');
      fetchContent();
    } catch (err: any) {
      console.error('Archive error:', err);
      showToast('Error archiving asset. Updating UI in simulator mode.', 'error');
      setContent(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'RAW' } : item)
      );
    }
  };

  const deleteAsset = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive/delete this asset?')) return;
    try {
      await apiClient.delete(`/content/${id}`);
      showToast('Asset removed successfully.');
      fetchContent();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast('Error deleting asset. Removing from local list in simulator mode.', 'error');
      setContent(prev => prev.filter(item => item.id !== id));
    }
  };

  // Playback Config Preview
  const openPreview = async (item: ContentItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
    setDocPage(1);
    setIsBlurred(false);
    setPreviewLoading(true);
    setPreviewConfig(null);

    try {
      const type = item.contentType.toLowerCase();
      const res = await apiClient.get(`/stream/${type}/${item.id}`);
      setPreviewConfig(res.data?.data || res.data);
    } catch (err: any) {
      console.error('Preview config error:', err);
      // Fallback preview details
      setPreviewConfig({
        streamUrl: `http://localhost:3000/api/v1/stream/video/${item.id}/manifest?token=sig_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`,
        drmType: 'NexusDRM-AES',
        masterKeyId: '9845d4ba-75e1-45bd-85b4-d536109fc840',
        authorizedSession: {
          ip: '127.0.0.1',
          ttlSeconds: 3600,
        }
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!isPreviewOpen) {
      setIsBlurred(false);
      return;
    }

    const type = previewItem?.contentType?.toLowerCase();
    if (type !== 'document' && type !== 'video') {
      setIsBlurred(false);
      return;
    }

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print (Ctrl+P, Cmd+P)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert('SCREEN PROTECTION ACTIVE: Printing is disabled for secure content.');
      }
      // Prevent Save (Ctrl+S, Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        alert('SCREEN PROTECTION ACTIVE: Downloading/saving is disabled.');
      }
      // Detect PrintScreen key
      if (e.key === 'PrintScreen') {
        setIsBlurred(true);
        alert('SCREEN PROTECTION ACTIVE: Screenshot attempt detected.');
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewOpen, previewItem]);

  // Helper
  const getAssetIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'VIDEO':
        return <Film className="text-emerald-400" size={20} />;
      case 'AUDIO':
        return <Music className="text-teal-400" size={20} />;
      default:
        return <FileText className="text-sky-400" size={20} />;
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 border animate-pulse-subtle ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}
        >
          {toast.type === 'error' && <AlertCircle size={18} />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-sans text-dark-50 tracking-tight">Content Vault</h1>
          <p className="text-dark-400 text-sm font-medium">Manage raw media feeds, monitor Cloudinary transcoders, and inspect HLS streams.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchContent}
            className="p-2.5 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-dark-100 transition-all cursor-pointer"
            title="Reload Content"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 rounded-lg text-sm font-bold bg-brand-500 hover:bg-brand-400 text-dark-950 transition-all flex items-center space-x-2 border border-brand-400 cursor-pointer shadow-lg shadow-brand-500/10"
          >
            <Plus size={16} />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-dark-800/60 flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content title..."
            className="w-full pl-9 pr-4 py-2 glass-input text-xs text-dark-100 placeholder:text-dark-600 font-medium"
          />
        </form>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full md:w-36 px-3 py-2 glass-input text-xs text-dark-300 font-semibold cursor-pointer"
        >
          <option value="">All Formats</option>
          <option value="VIDEO">Videos</option>
          <option value="AUDIO">Audio Files</option>
          <option value="DOCUMENT">Documents</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-40 px-3 py-2 glass-input text-xs text-dark-300 font-semibold cursor-pointer"
        >
          <option value="">All Lifecycle States</option>
          <option value="RAW">Raw Stubs</option>
          <option value="TRANSCODING">Transcoding</option>
          <option value="ENCRYPTING">Encrypting</option>
          <option value="ENCRYPTED">DRM Active (Encrypted)</option>
          <option value="FAILED">Processing Failures</option>
        </select>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-card p-5 rounded-xl border border-dark-850 animate-pulse space-y-4">
              <div className="h-44 bg-dark-850 rounded-lg w-full"></div>
              <div className="h-4 bg-dark-850 rounded w-3/4"></div>
              <div className="h-3 bg-dark-850 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl border border-dark-800/60 text-dark-400 font-medium">
          No content found matching filter criteria in organization vaults.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-xl border border-dark-850 overflow-hidden hover:border-brand-500/30 transition-all duration-300 relative group flex flex-col justify-between"
            >
              {/* Thumbnail Area */}
              <div className="h-44 bg-dark-950/80 border-b border-dark-850 relative flex items-center justify-center overflow-hidden">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center text-dark-500 group-hover:text-dark-350 transition-colors">
                    {getAssetIcon(item.contentType)}
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-2.5">
                      {item.contentType?.toUpperCase()} Format
                    </span>
                  </div>
                )}

                {/* Overlaid badges */}
                <div className="absolute top-3 right-3">
                  <Badge status={item.status} />
                </div>
              </div>

              {/* Card Meta details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-dark-100 truncate text-base" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-dark-450 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided for this digital asset.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-dark-850/40 flex items-center justify-between text-xs font-semibold text-dark-400">
                  <span>Size: {formatSize(item.fileSize)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3 bg-dark-900/40 border-t border-dark-850 flex items-center justify-between">
                <div>
                  {['raw', 'draft'].includes(item.status?.toLowerCase() || '') && (
                    <button
                      onClick={() => publishAsset(item.id)}
                      className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Play size={13} className="fill-current" />
                      <span>Start DRM Job</span>
                    </button>
                  )}
                  {['encrypted', 'published'].includes(item.status?.toLowerCase() || '') && (
                    <button
                      onClick={() => openPreview(item)}
                      className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>{item.contentType?.toLowerCase() === 'document' ? 'Secure Preview' : 'Inspect Manifest'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {['encrypted', 'published'].includes(item.status?.toLowerCase() || '') && (
                    <button
                      onClick={() => archiveAsset(item.id)}
                      className="text-[10px] font-bold text-dark-400 hover:text-dark-100 transition-colors cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => deleteAsset(item.id)}
                    className="p-1 rounded bg-dark-850 border border-dark-800 text-dark-400 hover:text-rose-400 hover:border-rose-500/25 transition-all cursor-pointer"
                    title="Delete Content"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Media Stub">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-400 tracking-wider mb-1.5">
              Asset Title
            </label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Speech Video"
              className="w-full px-3 py-2 glass-input text-xs text-dark-100 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-400 tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              rows={3}
              placeholder="Add key metadata details..."
              className="w-full px-3 py-2 glass-input text-xs text-dark-100 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-dark-400 tracking-wider mb-1.5">
                Format Type
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as any)}
                className="w-full px-3 py-2 glass-input text-xs text-dark-300 font-semibold cursor-pointer"
              >
                <option value="VIDEO">Video Playlist</option>
                <option value="AUDIO">Audio track</option>
                <option value="DOCUMENT">PDF Document</option>
              </select>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-400 tracking-wider mb-1.5">
              Select Binary File
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-dark-800 hover:border-brand-500/40 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-dark-900/20 hover:bg-dark-900/40 group flex flex-col items-center justify-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept={uploadType === 'VIDEO' ? 'video/*' : uploadType === 'AUDIO' ? 'audio/*' : '.pdf'}
              />
              <Upload className="text-dark-500 group-hover:text-brand-400 group-hover:scale-110 transition-all duration-300 mb-2" size={28} />
              
              {uploadFile ? (
                <div className="text-xs">
                  <p className="font-bold text-dark-100 truncate max-w-[280px]">{uploadFile.name}</p>
                  <p className="text-dark-500 mt-0.5">{formatSize(uploadFile.size)}</p>
                </div>
              ) : (
                <div className="text-xs text-dark-400 font-semibold">
                  <p>Drag file here or <span className="text-brand-400">click to browse</span></p>
                  <p className="text-dark-500 text-[10px] font-normal mt-1">
                    {uploadType === 'VIDEO' ? 'MP4, MOV, MKV up to 500MB' : uploadType === 'AUDIO' ? 'MP3, WAV, AAC' : 'PDF up to 50MB'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Uploading progress indicator */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-dark-400">
                <span>Pushing file to Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-dark-850">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-dark-850 hover:bg-dark-800 text-dark-300 border border-dark-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-brand-500 hover:bg-brand-400 text-dark-950 disabled:opacity-50 transition-all border border-brand-400 cursor-pointer flex items-center space-x-1.5"
            >
              <Upload size={14} />
              <span>Submit Upload</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Inspect HLS Manifest DRM Config Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`DRM Control Panel - ${previewItem?.title || 'Inspect Manifest'}`}
      >
        {previewLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-dark-400 text-xs">
            <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></span>
            <span>Fetching playback profile keys...</span>
          </div>
        ) : previewItem?.contentType?.toLowerCase() === 'document' ? (
          <div className="space-y-5">
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body { display: none !important; }
              }
            `}} />

            {/* Premium Security Banner */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3 text-rose-400">
              <Lock size={16} className="shrink-0 mt-0.5 animate-pulse text-rose-500" />
              <div>
                <p className="font-bold text-xs tracking-tight">Active Screen & Asset Protection</p>
                <p className="text-[10px] text-dark-400 mt-0.5 leading-relaxed">
                  Right-click, printing, and file save shortcuts are blocked. Your credentials are watermarked. 
                  Viewer will instantly blank if focus is lost (switching tabs, DevTools, or system capture).
                </p>
              </div>
            </div>

            {/* Document Frame Container */}
            <div className="relative border border-dark-800/80 rounded-xl bg-dark-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center min-h-[480px] max-h-[600px] overflow-hidden select-none shadow-2xl"
                 onContextMenu={(e) => e.preventDefault()}
                 onDragStart={(e) => e.preventDefault()}>
              
              {/* Document Header Metadata Bar */}
              <div className="absolute top-0 left-0 right-0 bg-dark-950/80 backdrop-blur-md border-b border-dark-850 px-4 py-2 z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-dark-200 truncate max-w-[200px]">
                  {previewItem.title}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded flex items-center space-x-1">
                  <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping"></span>
                  <span>DRM Shield</span>
                </span>
              </div>

              {/* Blur Shield Protection */}
              {isBlurred && (
                <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-2xl z-25 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300"
                     onClick={() => setIsBlurred(false)}>
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-3 text-rose-500 shadow-lg shadow-rose-500/10 animate-bounce-subtle">
                    <EyeOff size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-dark-100 tracking-tight">READER SHIELD ENGAGED</h4>
                  <p className="text-[10px] text-dark-450 mt-1.5 max-w-[280px] leading-relaxed">
                    Document view was hidden for security. Click anywhere inside this frame to verify workspace and resume reading.
                  </p>
                </div>
              )}

              {/* Dynamic Slanted Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-wrap justify-around items-center opacity-[0.035] rotate-[-25deg] scale-110">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="text-dark-50 font-mono text-[9px] font-bold p-8 whitespace-nowrap">
                    {user?.email || 'admin@drms.com'} (IP: 127.0.0.1)
                  </span>
                ))}
              </div>

              {/* Page View Image */}
              <div className="pt-10 pb-4 px-4 w-full flex justify-center items-center overflow-y-auto">
                <img
                  src={previewConfig?.pages && previewConfig.pages[docPage - 1]
                    ? previewConfig.pages[docPage - 1]
                    : (previewItem.metadata?.thumbnailUrl || previewItem.metadata?.previewUrl || '')}
                  alt={`Secure Page ${docPage}`}
                  className="max-w-full max-h-[440px] object-contain pointer-events-none select-none rounded border border-dark-850 shadow-lg bg-white"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between border-t border-dark-850 pt-4 mt-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={docPage <= 1}
                  onClick={() => setDocPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-100 hover:border-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                
                <span className="px-3 py-1.5 rounded bg-dark-900 border border-dark-800/80 text-[11px] font-bold text-dark-200">
                  Page {docPage} / {previewConfig?.pages?.length || 1}
                </span>
                
                <button
                  type="button"
                  disabled={docPage >= (previewConfig?.pages?.length || 1)}
                  onClick={() => setDocPage(prev => prev + 1)}
                  className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-100 hover:border-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-dark-850 hover:bg-dark-800 hover:text-dark-100 text-dark-300 border border-dark-800 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg"
              >
                Close Secure Viewer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-medium">
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body { display: none !important; }
              }
            `}} />

            {/* Video or Audio Secure Player */}
            {previewItem?.contentType?.toLowerCase() === 'video' && (
              <div className="relative border border-dark-800/80 rounded-xl bg-dark-950 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[260px] max-h-[380px] select-none"
                   onContextMenu={(e) => e.preventDefault()}>
                
                {/* Blur Shield Protection */}
                {isBlurred && (
                  <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-2xl z-25 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300"
                       onClick={() => setIsBlurred(false)}>
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-3 text-rose-500 shadow-lg shadow-rose-500/10 animate-bounce-subtle">
                      <EyeOff size={22} />
                    </div>
                    <h4 className="text-sm font-bold text-dark-100 tracking-tight">VIDEO SHIELD ENGAGED</h4>
                    <p className="text-[10px] text-dark-450 mt-1.5 max-w-[280px] leading-relaxed">
                      Playback paused for security. Click anywhere inside this frame to resume.
                    </p>
                  </div>
                )}

                {/* Slanted Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-wrap justify-around items-center opacity-[0.035] rotate-[-25deg] scale-110">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="text-dark-50 font-mono text-[9px] font-bold p-8 whitespace-nowrap">
                      {user?.email || 'admin@drms.com'} (IP: 127.0.0.1)
                    </span>
                  ))}
                </div>

                <video
                  src={previewConfig?.streamUrl || previewConfig?.manifestUrl || ''}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full max-h-[380px] bg-black pointer-events-auto"
                  onContextMenu={(e) => e.preventDefault()}
                  onPlay={() => { if (isBlurred) setIsBlurred(false); }}
                />
              </div>
            )}

            {previewItem?.contentType?.toLowerCase() === 'audio' && (
              <div className="relative border border-dark-800/80 rounded-xl bg-dark-950/80 p-6 shadow-2xl flex flex-col items-center justify-center space-y-4 select-none"
                   onContextMenu={(e) => e.preventDefault()}>
                
                {/* Slanted Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-wrap justify-around items-center opacity-[0.02] rotate-[-25deg] scale-110">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="text-dark-50 font-mono text-[9px] font-bold p-8 whitespace-nowrap">
                      {user?.email || 'admin@drms.com'} (IP: 127.0.0.1)
                    </span>
                  ))}
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <Music className="text-teal-400 animate-pulse" size={36} />
                  <p className="font-bold text-sm text-dark-100">{previewItem.title}</p>
                  <p className="text-[10px] text-dark-450">Secure Audio Player</p>
                </div>

                <audio
                  src={previewConfig?.streamUrl || previewConfig?.manifestUrl || ''}
                  controls
                  controlsList="nodownload"
                  className="w-full max-w-md pointer-events-auto"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            )}

            {/* Technical Metadata Panel */}
            <div className="p-3.5 bg-dark-950 rounded-lg border border-dark-850 flex items-start space-x-3 text-brand-400 border-glow-brand mt-4">
              <Lock size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-dark-100">Dynamic DRM Active</p>
                <p className="text-[10px] text-dark-400 mt-0.5">Stream segments are dynamically signed and AES encrypted under master envelopes.</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Playback Resource URL</span>
              <div className="p-2.5 bg-dark-900 rounded-lg border border-dark-800 break-all select-all font-mono text-[10px] text-dark-300">
                {previewConfig?.streamUrl || previewConfig?.manifestUrl || 'http://localhost:3000/api/v1/stream/...'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Encryption Standard</span>
                <div className="p-2 bg-dark-900 rounded border border-dark-800 font-bold text-dark-200 mt-1">
                  {previewConfig?.drmType || 'AES-256 Envelope'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Key Authority ID</span>
                <div className="p-2 bg-dark-900 rounded border border-dark-800 font-mono text-dark-350 truncate mt-1">
                  {previewConfig?.masterKeyId || '9845d4ba-75e1-45bd-85b4-d536109fc840'}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-dark-900/60 rounded-lg border border-dark-850 space-y-2">
              <p className="font-bold text-dark-200">Device Leasing Restrictions</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-dark-400">
                <span>Access TTL: <b className="text-dark-200">{previewConfig?.authorizedSession?.ttlSeconds || 3600}s</b></span>
                <span>Authorized IP: <b className="text-dark-200">{previewConfig?.authorizedSession?.ip || '127.0.0.1'}</b></span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-850">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-dark-300 border border-dark-800 rounded-lg cursor-pointer"
              >
                Close Secure Viewer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Fallback catalog list
const getFallbackContent = (): ContentItem[] => [
  {
    id: 'c1d2e3f4-a1b2-3c4d-5e6f-7a8b9c0d1e2f',
    title: 'Executive Keynote Speech Q4',
    description: 'Corporate executive speech detailing business vision and financial milestones.',
    contentType: 'VIDEO',
    status: 'ENCRYPTED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop',
    fileSize: 45601249,
    createdAt: '2026-06-05T10:15:00Z',
  },
  {
    id: 'e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b',
    title: 'Confidential Strategy Audio Track',
    description: 'Private board meeting summaries and Q4 planning discussions.',
    contentType: 'AUDIO',
    status: 'RAW',
    fileSize: 12549204,
    createdAt: '2026-06-07T14:20:00Z',
  },
  {
    id: '8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
    title: 'NexusDRM Security Whitepaper',
    description: 'Technical outline of content protection methods and dynamic key exchanges.',
    contentType: 'DOCUMENT',
    status: 'ENCRYPTED',
    fileSize: 2405912,
    createdAt: '2026-06-08T09:00:00Z',
  },
  {
    id: '9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e',
    title: 'Product Walkthrough Demo Video',
    description: 'Comprehensive walk-through detailing admin dashboard controls and usage logging.',
    contentType: 'VIDEO',
    status: 'TRANSCODING',
    fileSize: 154920512,
    createdAt: '2026-06-08T18:30:00Z',
  },
];
