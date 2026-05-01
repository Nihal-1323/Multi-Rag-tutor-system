import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadManager from './UploadManager';

describe('UploadManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Successfully received test.pdf',
          content_type: 'application/pdf',
          status: 'processing',
        }),
      })
    ) as any;
  });

  it('renders the component with title', () => {
    render(<UploadManager />);
    expect(screen.getByText('Multi-Modal Ingestion')).toBeInTheDocument();
  });

  it('displays the drop zone', () => {
    render(<UploadManager />);
    expect(screen.getByText('DROP MEDIA')).toBeInTheDocument();
    expect(screen.getByText(/PDF • Image • Audio/)).toBeInTheDocument();
  });

  it('shows empty state when no uploads', () => {
    render(<UploadManager />);
    expect(screen.getByText('Ingest Queue Empty')).toBeInTheDocument();
  });

  it('handles file drop', async () => {
    render(<UploadManager />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText('DROP MEDIA').closest('div');
    
    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
    }
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/upload',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('displays upload status', async () => {
    render(<UploadManager />);
    
    const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText('DROP MEDIA').closest('div');
    
    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
    }
    
    // Should show uploading status initially
    await waitFor(() => {
      expect(screen.getByText('uploading')).toBeInTheDocument();
    });
    
    // Should show complete status after fetch resolves
    await waitFor(() => {
      expect(screen.getByText('complete')).toBeInTheDocument();
    });
  });

  it('handles upload errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error('Upload failed')),
      })
    ) as any;
    
    render(<UploadManager />);
    
    const file = new File(['test'], 'error.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText('DROP MEDIA').closest('div');
    
    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
    }
    
    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  it('handles drag over state', async () => {
    const user = userEvent.setup();
    render(<UploadManager />);
    
    const dropZone = screen.getByText('DROP MEDIA').closest('div');
    
    if (dropZone) {
      fireEvent.dragOver(dropZone);
      // Component should update styling on drag over
      expect(dropZone.className).toContain('border-dash-accent');
    }
  });

  it('displays pipeline status', () => {
    render(<UploadManager />);
    expect(screen.getByText('PIPELINE: BUSY')).toBeInTheDocument();
  });
});
