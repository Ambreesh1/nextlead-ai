import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/leads/StatusBadge';

describe('StatusBadge', () => {
  it('renders a human-readable label for each known status', () => {
    render(<StatusBadge status="GOOD_LEAD_FOLLOW_UP" />);
    expect(screen.getByText('Follow up')).toBeInTheDocument();
  });

  it('renders "Sale done" for SALE_DONE', () => {
    render(<StatusBadge status="SALE_DONE" />);
    expect(screen.getByText('Sale done')).toBeInTheDocument();
  });

  it('renders a dash placeholder when status is null', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
