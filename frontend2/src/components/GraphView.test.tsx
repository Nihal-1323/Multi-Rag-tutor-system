import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GraphView from './GraphView';

describe('GraphView', () => {
  const mockGraphData = {
    nodes: [
      { id: 'Node1', val: 10 },
      { id: 'Node2', val: 5 },
    ],
    links: [
      { source: 'Node1', target: 'Node2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockGraphData),
      })
    ) as any;
  });

  it('renders the component with title', () => {
    render(<GraphView />);
    expect(screen.getByText('Knowledge Graph Visualizer')).toBeInTheDocument();
  });

  it('fetches graph data on mount', async () => {
    render(<GraphView />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/graph');
    });
  });

  it('displays refresh and maximize buttons', () => {
    render(<GraphView />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('calls fetch when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<GraphView />);
    
    // Wait for initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    const refreshButton = screen.getAllByRole('button')[0];
    await user.click(refreshButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('handles fetch errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
    
    render(<GraphView />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to load graph:',
        expect.any(Error)
      );
    });
    
    consoleError.mockRestore();
  });

  it('displays the query label', () => {
    render(<GraphView />);
    expect(screen.getByText(/Query:/)).toBeInTheDocument();
  });

  it('displays legend items', () => {
    render(<GraphView />);
    expect(screen.getByText('Core Node')).toBeInTheDocument();
    expect(screen.getByText('Sub-Topic')).toBeInTheDocument();
  });
});
