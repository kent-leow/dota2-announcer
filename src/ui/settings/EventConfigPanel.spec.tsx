import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventConfigPanel } from './EventConfigPanel';

jest.mock('src/config/eventsLoader', () => {
  const defaults = {
    events: [
      {
        id: 'bounty-rune',
        name: 'Bounty Rune',
        spawnTime: 180,
        repeatEvery: 180,
        warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
      },
      {
        id: 'power-rune',
        name: 'Power Rune',
        spawnTime: 360,
        repeatEvery: 120,
        warnings: [{ offsetSeconds: 60 }],
      },
    ],
  };

  const reloaded = {
    events: [
      {
        id: 'reloaded-event',
        name: 'Reloaded Event',
        spawnTime: 60,
        warnings: [{ offsetSeconds: 15 }],
      },
    ],
  };

  let callCount = 0;
  return {
    getEvents: () => defaults,
    reload: () => {
      callCount++;
      return reloaded;
    },
  };
});

describe('EventConfigPanel', () => {
  it('mounts and lists all event names', () => {
    render(<EventConfigPanel />);

    expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
    expect(screen.getByText('Power Rune')).toBeInTheDocument();
  });

  it('displays event details correctly', () => {
    render(<EventConfigPanel />);

    expect(screen.getByText('bounty-rune')).toBeInTheDocument();
    expect(screen.getByText('180s')).toBeInTheDocument();
    expect(screen.getByText('60s, 30s')).toBeInTheDocument();
  });

  it('has a Reload Events button', () => {
    render(<EventConfigPanel />);
    expect(screen.getByRole('button', { name: /reload events/i })).toBeInTheDocument();
  });

  it('reload button updates displayed events', () => {
    render(<EventConfigPanel />);

    fireEvent.click(screen.getByRole('button', { name: /reload events/i }));

    expect(screen.getByText('Reloaded Event')).toBeInTheDocument();
    expect(screen.getByText('reloaded-event')).toBeInTheDocument();
  });
});
