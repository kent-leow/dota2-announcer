import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from './App';

describe('App', () => {
  it('mounts without crash', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders heading text', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /dota 2 announcer/i })).toBeInTheDocument();
  });
});
