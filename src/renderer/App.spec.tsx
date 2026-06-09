import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('src/dota/processDetector', () => ({
  getState: jest.fn(() => 'idle'),
  onStateChange: jest.fn(() => () => {}),
}));

jest.mock('src/timer/gameTimer', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  onTick: jest.fn(() => () => {}),
}));

jest.mock('src/tts/muteManager', () => ({
  isMuted: jest.fn(() => false),
  toggleMute: jest.fn(() => true),
}));

jest.mock('src/tts/volumeController', () => ({
  getVolume: jest.fn(() => 100),
  setVolume: jest.fn(),
}));

jest.mock('src/config/eventsLoader', () => ({
  reload: jest.fn(),
}));

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
  getUpcoming: jest.fn(() => []),
}));

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

  it('renders MainDock section', () => {
    render(<App />);
    expect(screen.getByTestId('status-line')).toBeInTheDocument();
    expect(screen.getByTestId('game-clock')).toBeInTheDocument();
  });

  it('renders UpcomingEvents section', () => {
    render(<App />);
    expect(screen.getByTestId('upcoming-events-empty')).toBeInTheDocument();
  });

  it('renders help button', () => {
    render(<App />);
    expect(screen.getByTestId('help-button')).toBeInTheDocument();
  });

  it('clicking help button shows GuideModal', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('help-button'));
    expect(screen.getByTestId('guide-modal')).toBeInTheDocument();
  });

  it('closing guide modal hides it', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('help-button'));
    expect(screen.getByTestId('guide-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('guide-close'));
    expect(screen.queryByTestId('guide-modal')).not.toBeInTheDocument();
  });
});
