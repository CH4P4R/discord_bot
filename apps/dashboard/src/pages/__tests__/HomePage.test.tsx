import { render, screen } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';

const metrics = [
  { captured_at: new Date().toISOString(), message_count: 10, voice_minutes: 5 }
];

const logs = [
  { action: 'ban', created_at: new Date().toISOString(), reason: 'Testing' }
];

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: unknown) => useQueryMock(args)
}));

beforeEach(() => {
  useQueryMock.mockReset();
  useQueryMock.mockReturnValueOnce({ data: metrics }).mockReturnValueOnce({ data: logs });
  process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
});

describe('HomePage', () => {
  it('renders summary cards with data', async () => {
    const { HomePage } = await import('../HomePage');

    render(<HomePage />);

    expect(screen.getByText('Toplam Mesaj')).toBeInTheDocument();
    expect(screen.getByText('Son 7 gun')).toBeInTheDocument();
    expect(screen.getByText(/Toplam dakika/i)).toBeInTheDocument();
    expect(screen.getByText('ban')).toBeInTheDocument();
  });
});
