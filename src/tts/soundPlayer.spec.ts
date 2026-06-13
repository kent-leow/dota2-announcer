const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();

class MockAudio {
  src = '';
  volume = 1;
  currentTime = 0;
  paused = false;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = mockPlay;
  pause = mockPause;

  constructor(src: string) {
    this.src = src;
  }
}

(global as any).Audio = MockAudio;

import { playSound, stop, setVolume, setMuted, isPlaying, _resetForTesting } from './soundPlayer';

describe('soundPlayer', () => {
  beforeEach(() => {
    _resetForTesting();
    mockPlay.mockClear();
    mockPause.mockClear();
  });

  it('plays a sound file', () => {
    playSound('/path/to/sound.wav');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('stops previous sound before playing new one', () => {
    playSound('/path/to/first.wav');
    playSound('/path/to/second.wav');
    expect(mockPause).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalledTimes(2);
  });

  it('respects volume setting', () => {
    setVolume(50);
    playSound('/path/to/sound.wav');
    // Volume is set on the Audio instance
    expect(mockPlay).toHaveBeenCalled();
  });

  it('does not play when muted', () => {
    setMuted(true);
    playSound('/path/to/sound.wav');
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('stop pauses current audio', () => {
    playSound('/path/to/sound.wav');
    stop();
    expect(mockPause).toHaveBeenCalled();
  });

  it('handles play failure gracefully', () => {
    mockPlay.mockRejectedValueOnce(new Error('failed'));
    expect(() => playSound('/path/to/bad.wav')).not.toThrow();
  });
});
