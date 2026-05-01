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
    <div className="flex flex-col h-full bg-dash-bg overflow-auto">
      <div className="p-3 border-b border-dash-line bg-dash-panel flex items-center justify-between shrink-0">
        <h2 className="mono-label">Multi-Modal Ingestion</h2>
        <span className="text-[9px] text-dash-muted font-mono">PIPELINE: BUSY</span>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div 
          className={cn(
            "w-full md:w-64 m-4 border border-dashed rounded-lg flex flex-col items-center justify-center transition-all px-4 text-center cursor-pointer",
            isDragging ? "border-dash-accent bg-dash-accent/10" : "border-dash-line bg-dash-panel hover:bg-dash-surface"
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
          <Upload className={cn("w-6 h-6 mb-2 transition-colors", isDragging ? "text-dash-accent" : "text-dash-muted")} />
          <p className="text-[11px] text-dash-text font-bold">DROP MEDIA</p>
          <p className="text-[9px] text-dash-muted mt-1 uppercase tracking-tight">PDF • Image • Audio</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {uploads.map((upload, i) => (
              <div key={i} className="bg-dash-panel border border-dash-line p-2 rounded flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-1.5 bg-dash-surface rounded">
                  {upload.type.includes('pdf') ? <FileText className="w-3.5 h-3.5 text-blue-400" /> :
                   upload.type.includes('image') ? <ImageIcon className="w-3.5 h-3.5 text-orange-400" /> :
                   <Music className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[10px] font-medium truncate text-dash-text pr-2">{upload.name}</p>
                    <span className="text-[8px] font-mono text-dash-muted uppercase">{upload.status}</span>
                  </div>
                  <div className="h-0.5 w-full bg-dash-surface rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full bg-dash-accent transition-all duration-700",
                      upload.status === 'complete' ? "w-full" : "w-1/3 animate-pulse"
                    )} />
                  </div>
                </div>

                <div className="shrink-0 ml-1">
                  {upload.status === 'uploading' && <Loader2 className="w-3 h-3 text-dash-muted animate-spin" />}
                  {upload.status === 'complete' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                  {upload.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
          {uploads.length === 0 && (
             <div className="h-32 flex flex-col items-center justify-center border border-dash-line rounded-lg border-dashed opacity-30">
               <div className="text-[10px] mono-label">Ingest Queue Empty</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
