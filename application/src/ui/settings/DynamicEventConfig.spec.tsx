import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { DynamicEventsConfig } from 'src/config/events.schema';

const mockElectronAPI = {
  getDynamicEvents: jest.fn((): Promise<DynamicEventsConfig> => Promise.resolve({
    dynamicEvents: [
      { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
    ],
  })),
  setDynamicEvents: jest.fn(() => Promise.resolve({ success: true })),
  getRecordMatches: jest.fn(() => Promise.resolve(false)),
  setRecordMatches: jest.fn(() => Promise.resolve({ success: true })),
  openRecordingsFolder: jest.fn(() => Promise.resolve({ success: true })),
};

(window as any).electronAPI = mockElectronAPI;

import { DynamicEventConfig } from './DynamicEventConfig';

describe('DynamicEventConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.getDynamicEvents.mockResolvedValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
  });

  it('renders roshan entry with toggle', async () => {
    render(<DynamicEventConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-toggle-roshan')).toBeInTheDocument();
      expect(screen.getByText('Roshan')).toBeInTheDocument();
    });
  });

  it('master toggle disables and hides sub-toggles', async () => {
    render(<DynamicEventConfig />);
    await waitFor(() => expect(screen.getByTestId('dynamic-toggle-roshan')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('dynamic-toggle-roshan'));

    expect(mockElectronAPI.setDynamicEvents).toHaveBeenCalledWith({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
    expect(screen.queryByTestId('dynamic-notif-roshan-kill')).not.toBeInTheDocument();
  });

  it('individual notification toggle saves correct config', async () => {
    render(<DynamicEventConfig />);
    await waitFor(() => expect(screen.getByTestId('dynamic-notif-roshan-countdown')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('dynamic-notif-roshan-countdown'));

    expect(mockElectronAPI.setDynamicEvents).toHaveBeenCalledWith({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: false, respawn: true } },
      ],
    });
  });

  it('loads saved state on mount', async () => {
    mockElectronAPI.getDynamicEvents.mockResolvedValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: false, countdown: true, respawn: true } },
      ],
    });

    render(<DynamicEventConfig />);
    await waitFor(() => expect(screen.getByTestId('dynamic-toggle-roshan')).toBeInTheDocument());

    expect(screen.getByTestId('dynamic-toggle-roshan')).toHaveTextContent('Off');
    expect(screen.queryByTestId('dynamic-notif-roshan-kill')).not.toBeInTheDocument();
  });

  describe('map awareness', () => {
    const MAP_AWARENESS = {
      id: 'map-awareness', name: 'Map Awareness', enabled: true,
      notifications: { visible: true, fog: true },
      settings: { leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20 },
    };
    const ROSHAN = { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } };

    beforeEach(() => {
      mockElectronAPI.getDynamicEvents.mockResolvedValue({ dynamicEvents: [ROSHAN, MAP_AWARENESS] });
    });

    it('renders toggles, three number inputs and the limitation note', async () => {
      render(<DynamicEventConfig />);
      await waitFor(() => expect(screen.getByTestId('dynamic-toggle-map-awareness')).toBeInTheDocument());
      expect(screen.getByTestId('dynamic-notif-map-awareness-visible')).toBeChecked();
      expect(screen.getByTestId('dynamic-notif-map-awareness-fog')).toBeChecked();
      expect(screen.getByTestId('dynamic-setting-map-awareness-leadSeconds')).toHaveValue(5);
      expect(screen.getByTestId('dynamic-setting-map-awareness-engageDistance')).toHaveValue(800);
      expect(screen.getByTestId('dynamic-setting-map-awareness-maxFogSeconds')).toHaveValue(20);
      expect(screen.getByTestId('dynamic-note-map-awareness')).toBeInTheDocument();
    });

    it('clamps an out-of-range lead time on blur and saves it', async () => {
      render(<DynamicEventConfig />);
      const input = await screen.findByTestId('dynamic-setting-map-awareness-leadSeconds');
      fireEvent.change(input, { target: { value: '20' } });
      fireEvent.blur(input);
      expect(input).toHaveValue(15);
      const saved = (mockElectronAPI.setDynamicEvents.mock.calls as unknown[][]).at(-1)![0] as { dynamicEvents: typeof MAP_AWARENESS[] };
      expect(saved.dynamicEvents[1].settings.leadSeconds).toBe(15);
    });

    it('saves on Enter', async () => {
      render(<DynamicEventConfig />);
      const input = await screen.findByTestId('dynamic-setting-map-awareness-engageDistance');
      fireEvent.change(input, { target: { value: '1000' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      const saved = (mockElectronAPI.setDynamicEvents.mock.calls as unknown[][]).at(-1)![0] as { dynamicEvents: typeof MAP_AWARENESS[] };
      expect(saved.dynamicEvents[1].settings.engageDistance).toBe(1000);
    });

    it('reverts an empty input without saving', async () => {
      render(<DynamicEventConfig />);
      const input = await screen.findByTestId('dynamic-setting-map-awareness-maxFogSeconds');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      expect(input).toHaveValue(20);
      expect(mockElectronAPI.setDynamicEvents).not.toHaveBeenCalled();
    });

    it('saves the fog toggle', async () => {
      render(<DynamicEventConfig />);
      fireEvent.click(await screen.findByTestId('dynamic-notif-map-awareness-fog'));
      const saved = (mockElectronAPI.setDynamicEvents.mock.calls as unknown[][]).at(-1)![0] as { dynamicEvents: typeof MAP_AWARENESS[] };
      expect(saved.dynamicEvents[1].notifications).toEqual({ visible: true, fog: false });
    });

    it('hides sub-controls when the master toggle is off', async () => {
      render(<DynamicEventConfig />);
      fireEvent.click(await screen.findByTestId('dynamic-toggle-map-awareness'));
      expect(screen.queryByTestId('dynamic-setting-map-awareness-leadSeconds')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dynamic-notif-map-awareness-fog')).not.toBeInTheDocument();
    });

    it('renders no number inputs for roshan', async () => {
      render(<DynamicEventConfig />);
      await screen.findByTestId('dynamic-toggle-roshan');
      expect(screen.queryByTestId(/dynamic-setting-roshan/)).not.toBeInTheDocument();
    });
  });

  describe('record matches', () => {
    it('reflects the loaded preference', async () => {
      mockElectronAPI.getRecordMatches.mockResolvedValueOnce(true);
      render(<DynamicEventConfig />);
      await waitFor(() => {
        expect(screen.getByTestId('dynamic-record-matches-toggle')).toBeChecked();
      });
    });

    it('saves true when clicked', async () => {
      render(<DynamicEventConfig />);
      const toggle = screen.getByTestId('dynamic-record-matches-toggle');
      await waitFor(() => expect(toggle).not.toBeDisabled());
      fireEvent.click(toggle);
      expect(mockElectronAPI.setRecordMatches).toHaveBeenCalledWith(true);
    });

    it('opens the recordings folder', async () => {
      render(<DynamicEventConfig />);
      fireEvent.click(screen.getByTestId('dynamic-open-recordings'));
      expect(mockElectronAPI.openRecordingsFolder).toHaveBeenCalled();
    });
  });
});
