import {
  speak,
  stop,
  isSpeaking,
  formatMessage,
  setMuted,
  setVolume,
  _resetForTesting,
} from './announcer';

const mockSpeak = jest.fn();
const mockCancel = jest.fn();

const mockSynthesis = {
  speak: mockSpeak,
  cancel: mockCancel,
};

Object.defineProperty(global, 'window', {
  value: { speechSynthesis: mockSynthesis },
  writable: true,
});

class MockUtterance {
  text: string;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

(global as any).SpeechSynthesisUtterance = MockUtterance;

describe('announcer', () => {
  beforeEach(() => {
    _resetForTesting();
    jest.clearAllMocks();
  });

  describe('formatMessage', () => {
    it('formats event name + offset into announcement text', () => {
      expect(formatMessage('Lotus Pool', 60)).toBe('Lotus Pool in 60 seconds');
      expect(formatMessage('Roshan', 30)).toBe('Roshan in 30 seconds');
    });
  });

  describe('speak', () => {
    it('speaks correctly formatted message', () => {
      const msg = formatMessage('Lotus Pool', 60);
      speak(msg);

      expect(mockSpeak).toHaveBeenCalledTimes(1);
      const utterance = mockSpeak.mock.calls[0][0] as MockUtterance;
      expect(utterance.text).toBe('Lotus Pool in 60 seconds');
    });

    it('does not speak when muted', () => {
      setMuted(true);
      speak('test');
      expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('applies volume setting to utterance', () => {
      setVolume(75);
      speak('test');

      const utterance = mockSpeak.mock.calls[0][0] as MockUtterance;
      expect(utterance.volume).toBe(0.75);
    });

    it('cancels current speech on high priority', () => {
      speak('first');
      speak('urgent', 'high');

      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('halts speech immediately without error', () => {
      speak('test');
      const utterance = mockSpeak.mock.calls[0][0] as MockUtterance;
      utterance.onstart?.();

      expect(isSpeaking()).toBe(true);

      stop();

      expect(mockCancel).toHaveBeenCalled();
      expect(isSpeaking()).toBe(false);
    });
  });

  describe('null synthesis', () => {
    it('speak no-ops when getSynthesis returns null', () => {
      const origWindow = (global as any).window;
      (global as any).window = {};

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      speak('should not crash');
      expect(mockSpeak).not.toHaveBeenCalled();
      warnSpy.mockRestore();

      (global as any).window = origWindow;
    });
  });
});
