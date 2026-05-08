import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Music, CheckCircle, AlertCircle, Loader2, CloudUpload } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UploadManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<Array<{ name: string; status: 'uploading' | 'complete' | 'error'; type: string }>>([]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newUpload = { name: file.name, status: 'uploading' as const, type: file.type };
      setUploads(prev => [newUpload, ...prev]);
      
      const formData = new FormData();
      formData.append('file', file);
      
      fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })
      .then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then(data => {
        console.log('Upload successful:', data);
        setUploads(prev => prev.map(u => u.name === file.name ? { ...u, status: 'complete' } : u));
        window.dispatchEvent(new CustomEvent('graphUpdate'));
      })
      .catch(err => {
        console.error('Upload error:', err);
        setUploads(prev => prev.map(u => u.name === file.name ? { ...u, status: 'error' } : u));
      });
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6" />;
    if (type.includes('image')) return <ImageIcon className="w-6 h-6" />;
    return <Music className="w-6 h-6" />;
  };

  const getFileColor = (type: string) => {
    if (type.includes('pdf')) return 'from-red-500 to-pink-600';
    if (type.includes('image')) return 'from-orange-500 to-amber-600';
    return 'from-purple-500 to-indigo-600';
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
        <p className="text-sm text-gray-500 mt-1">Add PDFs, images, or audio files to your knowledge base</p>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 mb-6 transition-all cursor-pointer",
          isDragging
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]"
            : "border-blue-200 bg-gradient-to-br from-white to-blue-50 hover:border-blue-400 hover:shadow-lg"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.onchange = (e) => handleFiles(Array.from((e.target as HTMLInputElement).files || []));
          input.click();
        }}
      >
        <div className="text-center">
          <div className={cn(
            "w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center transition-all",
            isDragging
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 scale-110"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          )}>
            <CloudUpload className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">or click to browse</p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" /> PDF
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Images
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-4 h-4" /> Audio
            </span>
          </div>
        </div>
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Uploads ({uploads.length})</h3>
          <div className="space-y-3">
            {uploads.map((upload, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${getFileColor(upload.type)} rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
                    {getFileIcon(upload.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1">{upload.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-700",
                            upload.status === 'complete'
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 w-full"
                              : upload.status === 'error'
                              ? "bg-gradient-to-r from-red-500 to-pink-600 w-full"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 w-2/3 animate-pulse"
                          )}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 capitalize min-w-[70px]">
                        {upload.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div className="shrink-0">
                    {upload.status === 'uploading' && (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    )}
                    {upload.status === 'complete' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {upload.status === 'error' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No uploads yet</p>
        </div>
      )}
    </div>
  );
}
