import { render, screen } from '@testing-library/react';
import { ImportSteps } from '@/components/import/ImportSteps';

describe('ImportSteps', () => {
  it('renders all four step labels', () => {
    render(<ImportSteps current="upload" />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Confirm & Import')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows the current step number for "success" (the 4th step)', () => {
    render(<ImportSteps current="success" />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
