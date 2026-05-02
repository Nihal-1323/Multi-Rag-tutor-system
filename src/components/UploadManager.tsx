import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Music, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
        
        // Trigger a custom event to refresh the graph
        window.dispatchEvent(new CustomEvent('graphUpdate'));
      })
      .catch(err => {
        console.error('Upload error:', err);
        setUploads(prev => prev.map(u => u.name === file.name ? { ...u, status: 'error' } : u));
      });
    });
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-4 border-b border-dash-line flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-dash-text">Upload Documents</h2>
        <span className="text-xs text-dash-muted">Drag & drop or click to upload</span>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div 
          className={cn(
            "w-full md:w-72 m-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all px-4 text-center cursor-pointer",
            isDragging ? "border-purple-500 bg-purple-50" : "border-dash-line bg-dash-surface hover:bg-white hover:border-purple-300"
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
          <Upload className={cn("w-8 h-8 mb-3 transition-colors", isDragging ? "text-purple-500" : "text-dash-muted")} />
          <p className="text-sm text-dash-text font-semibold">Drop files here</p>
          <p className="text-xs text-dash-muted mt-2">PDF • Images • Audio</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploads.map((upload, i) => (
              <div key={i} className="bg-white border border-dash-line p-3 rounded-xl flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                  {upload.type.includes('pdf') ? <FileText className="w-5 h-5 text-blue-500" /> :
                   upload.type.includes('image') ? <ImageIcon className="w-5 h-5 text-orange-500" /> :
                   <Music className="w-5 h-5 text-purple-500" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1.5">
                    <p className="text-xs font-medium truncate text-dash-text pr-2">{upload.name}</p>
                    <span className="text-xs text-dash-muted capitalize">{upload.status}</span>
                  </div>
                  <div className="h-1 w-full bg-dash-surface rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-700",
                      upload.status === 'complete' ? "w-full" : "w-1/3 animate-pulse"
                    )} />
                  </div>
                </div>

                <div className="shrink-0 ml-1">
                  {upload.status === 'uploading' && <Loader2 className="w-4 h-4 text-dash-muted animate-spin" />}
                  {upload.status === 'complete' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {upload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
          {uploads.length === 0 && (
             <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-dash-line rounded-xl">
               <div className="text-sm text-dash-muted">No uploads yet</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
