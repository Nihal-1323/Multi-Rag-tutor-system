import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Music, CheckCircle, AlertCircle, Loader2, FolderOpen, File } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UploadManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<Array<{ name: string; status: 'uploading' | 'complete' | 'error'; type: string; size?: number }>>([]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newUpload = { name: file.name, status: 'uploading' as const, type: file.type, size: file.size };
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf') || type.includes('text')) return <FileText className="w-4 h-4" />;
    if (type.includes('image')) return <ImageIcon className="w-4 h-4" />;
    if (type.includes('audio')) return <Music className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg/50">
      {/* Header - File Browser Style */}
      <div className="p-3 bg-cyber-panel/80 backdrop-blur-sm border-b border-cyber-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-cyber-accent" />
          <span className="text-xs font-mono text-cyber-accent uppercase tracking-wider">Knowledge Vault</span>
          <span className="text-xs text-cyber-muted font-mono">/ uploads</span>
        </div>
        <span className="text-[10px] font-mono text-cyber-muted">{uploads.length} FILES</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Upload Zone */}
        <div className="w-80 border-r border-cyber-line p-4 flex flex-col">
          <div 
            className={cn(
              "flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden",
              isDragging 
                ? "border-cyber-accent bg-cyber-accent/10 cyber-glow" 
                : "border-cyber-line bg-cyber-surface/20 hover:border-cyber-accent/50"
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
            {isDragging && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/20 to-purple-500/20 animate-pulse" />
            )}
            <Upload className={cn(
              "w-12 h-12 mb-4 relative z-10",
              isDragging ? "text-cyber-accent animate-bounce" : "text-cyber-muted"
            )} />
            <p className="text-sm text-cyber-text font-mono uppercase tracking-wide relative z-10">
              {isDragging ? 'Release to Upload' : 'Drop Files Here'}
            </p>
            <p className="text-xs text-cyber-muted mt-2 font-mono relative z-10">
              or click to browse
            </p>
            <div className="mt-4 flex gap-2 relative z-10">
              <span className="text-[10px] px-2 py-1 bg-cyber-surface border border-cyber-line rounded text-cyber-muted font-mono">PDF</span>
              <span className="text-[10px] px-2 py-1 bg-cyber-surface border border-cyber-line rounded text-cyber-muted font-mono">IMG</span>
              <span className="text-[10px] px-2 py-1 bg-cyber-surface border border-cyber-line rounded text-cyber-muted font-mono">AUDIO</span>
            </div>
          </div>
        </div>

        {/* Right: File List - Table Style */}
        <div className="flex-1 overflow-auto">
          {uploads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-cyber-muted">
              <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm font-mono">No files uploaded</p>
              <p className="text-xs font-mono mt-1 opacity-50">Upload files to begin</p>
            </div>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead className="bg-cyber-surface/30 sticky top-0">
                <tr className="border-b border-cyber-line">
                  <th className="text-left p-3 text-cyber-muted uppercase tracking-wider">Name</th>
                  <th className="text-left p-3 text-cyber-muted uppercase tracking-wider">Type</th>
                  <th className="text-left p-3 text-cyber-muted uppercase tracking-wider">Size</th>
                  <th className="text-left p-3 text-cyber-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload, i) => (
                  <tr 
                    key={i} 
                    className="border-b border-cyber-line/50 hover:bg-cyber-surface/20 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1 rounded",
                          upload.type.includes('pdf') ? "text-blue-400" :
                          upload.type.includes('image') ? "text-orange-400" :
                          upload.type.includes('audio') ? "text-purple-400" :
                          "text-cyber-muted"
                        )}>
                          {getFileIcon(upload.type)}
                        </div>
                        <span className="text-cyber-text truncate max-w-xs">{upload.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-cyber-muted">
                      {upload.type.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                    </td>
                    <td className="p-3 text-cyber-muted">
                      {formatFileSize(upload.size)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {upload.status === 'uploading' && (
                          <>
                            <Loader2 className="w-4 h-4 text-cyber-accent animate-spin" />
                            <span className="text-cyber-accent">UPLOADING</span>
                          </>
                        )}
                        {upload.status === 'complete' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-cyber-accent" />
                            <span className="text-cyber-accent">COMPLETE</span>
                          </>
                        )}
                        {upload.status === 'error' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-cyber-secondary" />
                            <span className="text-cyber-secondary">ERROR</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
