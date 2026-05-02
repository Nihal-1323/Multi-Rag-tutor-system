import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from './ChatInterface';

describe('ChatInterface', () => {
  const mockQueryResponse = {
    answer: 'This is a test answer',
    explanation: 'Test explanation',
    sources: [
      { title: 'Source 1', type: 'vector' },
      { title: 'Source 2', type: 'graph' },
    ],
    graph_data: {
      nodes: [],
      links: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockQueryResponse),
      })
    ) as any;
  });

  it('renders the component with title', () => {
    render(<ChatInterface />);
    expect(screen.getByText('Multi-Modal Context')).toBeInTheDocument();
  });

  it('displays initial welcome message', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Hello! I'm your Multi-Modal Education Tutor/)).toBeInTheDocument();
  });

  it('displays input field with placeholder', () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    expect(input).toBeInTheDocument();
  });

  it('sends message when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    const sendButton = screen.getByRole('button');
    
    await user.type(input, 'What is calculus?');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8000/query?query=What%20is%20calculus'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    
    await user.type(input, 'Test query{Enter}');
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('displays user message after sending', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    await user.type(input, 'My test question{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('My test question')).toBeInTheDocument();
    });
  });

  it('displays assistant response', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    await user.type(input, 'Test{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('This is a test answer')).toBeInTheDocument();
    });
  });

  it('displays typing indicator while waiting for response', async () => {
    const user = userEvent.setup();
    
    // Make fetch take longer
    global.fetch = vi.fn(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          json: () => Promise.resolve(mockQueryResponse),
        }), 100)
      )
    ) as any;
    
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    await user.type(input, 'Test{Enter}');
    
    expect(screen.getByText('Generating grounded response...')).toBeInTheDocument();
  });

  it('displays sources when available', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    await user.type(input, 'Test{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Source 1')).toBeInTheDocument();
      expect(screen.getByText('Source 2')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
    
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...');
    await user.type(input, 'Test{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Error connecting to backend.')).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Query multi-modal knowledge...') as HTMLInputElement;
    await user.type(input, 'Test message{Enter}');
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const sendButton = screen.getByRole('button');
    await user.click(sendButton);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('displays RAG pipeline badge', () => {
    render(<ChatInterface />);
    expect(screen.getByText('RAG PIPELINE')).toBeInTheDocument();
  });
});
