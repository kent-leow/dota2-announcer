import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('src/tts/soundPlayer', () => ({
  playSound: jest.fn(),
  setVolume: jest.fn(),
  setMuted: jest.fn(),
}));

const mockElectronAPI = {
  getEvents: jest.fn(() => Promise.resolve({
    events: [
      { id: 'bounty-rune', name: 'Bounty Rune', spawnTime: 0, repeatEvery: 180 },
      { id: 'lotus-rune', name: 'Lotus Rune', spawnTime: 180, repeatEvery: 180 },
    ],
  })),
  getSoundAssignments: jest.fn(() => Promise.resolve({
    'bounty-rune': { type: 'bundled', filename: 'bounty-rune.wav' },
  })),
  getSoundFilePath: jest.fn((): Promise<string | null> => Promise.resolve('/path/to/bounty-rune.wav')),
  openSoundFileDialog: jest.fn(() => Promise.resolve({ success: true, filePath: '/tmp/custom.mp3' })),
  assignSound: jest.fn((): Promise<{ success: boolean; error?: string; filename?: string }> => Promise.resolve({ success: true, filename: 'custom.mp3' })),
  removeSound: jest.fn(() => Promise.resolve({ success: true })),
};

(window as any).electronAPI = mockElectronAPI;

import { SoundConfig } from './SoundConfig';

describe('SoundConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.getSoundAssignments.mockResolvedValue({
      'bounty-rune': { type: 'bundled', filename: 'bounty-rune.wav' },
    });
  });

  it('renders event list with sound assignments', async () => {
    render(<SoundConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('sound-row-bounty-rune')).toBeInTheDocument();
      expect(screen.getByTestId('sound-row-lotus-rune')).toBeInTheDocument();
    });
    expect(screen.getByTestId('sound-row-bounty-rune')).toHaveTextContent('bounty-rune.wav');
    expect(screen.getByTestId('sound-row-lotus-rune')).toHaveTextContent('No sound');
  });

  it('shows preview button for events with sound', async () => {
    render(<SoundConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('preview-bounty-rune')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('preview-lotus-rune')).not.toBeInTheDocument();
  });

  it('preview plays the sound', async () => {
    const soundPlayer = require('src/tts/soundPlayer');
    render(<SoundConfig />);
    await waitFor(() => expect(screen.getByTestId('preview-bounty-rune')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByTestId('preview-bounty-rune'));
    });

    expect(mockElectronAPI.getSoundFilePath).toHaveBeenCalledWith('bounty-rune');
    expect(soundPlayer.playSound).toHaveBeenCalledWith('/path/to/bounty-rune.wav');
  });

  it('upload triggers file dialog and assigns sound', async () => {
    render(<SoundConfig />);
    await waitFor(() => expect(screen.getByTestId('upload-lotus-rune')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByTestId('upload-lotus-rune'));
    });

    expect(mockElectronAPI.openSoundFileDialog).toHaveBeenCalled();
    expect(mockElectronAPI.assignSound).toHaveBeenCalledWith('lotus-rune', '/tmp/custom.mp3');
  });

  it('shows error on failed upload', async () => {
    mockElectronAPI.assignSound.mockResolvedValueOnce({ success: false, error: 'File too large' });
    render(<SoundConfig />);
    await waitFor(() => expect(screen.getByTestId('upload-lotus-rune')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByTestId('upload-lotus-rune'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('sound-error')).toHaveTextContent('File too large');
    });
  });

  it('remove button clears custom assignment', async () => {
    mockElectronAPI.getSoundAssignments.mockResolvedValue({
      'bounty-rune': { type: 'custom', filename: 'custom-coin.mp3' },
    });
    render(<SoundConfig />);
    await waitFor(() => expect(screen.getByTestId('remove-bounty-rune')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-bounty-rune'));
    });

    expect(mockElectronAPI.removeSound).toHaveBeenCalledWith('bounty-rune');
  });
});
