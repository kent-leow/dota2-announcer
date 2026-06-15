import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Download } from './Download';

const mockRelease = {
  tag_name: 'v0.2.0',
  assets: [
    { name: 'Dota 2 Announcer Setup 0.2.0.exe', browser_download_url: 'https://github.com/kent-leow/dota2-announcer/releases/download/v0.2.0/Dota.2.Announcer.Setup.0.2.0.exe' },
    { name: 'Dota 2 Announcer-0.2.0.dmg', browser_download_url: 'https://github.com/kent-leow/dota2-announcer/releases/download/v0.2.0/Dota.2.Announcer-0.2.0.dmg' },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Download', () => {
  it('renders download heading', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    render(<Download />);
    expect(screen.getByText(/Ready to/)).toBeInTheDocument();
  });

  it('renders Windows and macOS download buttons with direct URLs when release exists', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRelease),
    } as Response);

    render(<Download />);

    await waitFor(() => {
      expect(screen.getByText(/Download for Windows/)).toBeInTheDocument();
    });

    const winLink = screen.getByText(/Download for Windows/).closest('a');
    const macLink = screen.getByText(/Download for macOS/).closest('a');

    expect(winLink).toHaveAttribute('href', mockRelease.assets[0].browser_download_url);
    expect(macLink).toHaveAttribute('href', mockRelease.assets[1].browser_download_url);
  });

  it('falls back to GitHub Releases page when no release exists', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);

    render(<Download />);

    await waitFor(() => {
      const winLink = screen.getByText(/Download for Windows/).closest('a');
      expect(winLink).toHaveAttribute('href', 'https://github.com/kent-leow/dota2-announcer/releases/latest');
    });
  });

  it('shows version tag when release exists', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRelease),
    } as Response);

    render(<Download />);

    await waitFor(() => {
      expect(screen.getByText(/v0.2.0/)).toBeInTheDocument();
    });
  });

  it('section has aria-label="Download"', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    const { container } = render(<Download />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Download');
  });

  it('download links have descriptive aria-labels', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRelease),
    } as Response);

    const { container } = render(<Download />);

    await waitFor(() => {
      const links = container.querySelectorAll('a[aria-label]');
      const labels = Array.from(links).map((l) => l.getAttribute('aria-label'));
      expect(labels).toContain('Download Dota 2 Announcer for Windows');
      expect(labels).toContain('Download Dota 2 Announcer for macOS');
    });
  });
});
