import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IconCropDialog } from './IconCropDialog';

const createMockFile = () => new File(['fake'], 'test.png', { type: 'image/png' });

let mockImageOnload: (() => void) | null = null;

beforeAll(() => {
  (global as any).URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  (global as any).URL.revokeObjectURL = jest.fn();

  Object.defineProperty(global, 'Image', {
    writable: true,
    value: class MockImage {
      width = 128;
      height = 128;
      src = '';
      onload: (() => void) | null = null;
      set _src(val: string) {
        this.src = val;
        setTimeout(() => this.onload?.(), 0);
      }
      constructor() {
        mockImageOnload = () => this.onload?.();
      }
    },
  });

  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  })) as any;

  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,cropped');
});

describe('IconCropDialog', () => {
  const defaultProps = {
    imageFile: createMockFile(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders crop dialog when image is provided', async () => {
    render(<IconCropDialog {...defaultProps} />);
    await act(async () => { mockImageOnload?.(); });
    expect(screen.getByTestId('icon-crop-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('crop-canvas')).toBeInTheDocument();
  });

  it('calls onConfirm with base64 data URI when Apply is clicked', async () => {
    render(<IconCropDialog {...defaultProps} />);
    await act(async () => { mockImageOnload?.(); });
    fireEvent.click(screen.getByTestId('crop-confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledWith('data:image/png;base64,cropped');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    render(<IconCropDialog {...defaultProps} />);
    await act(async () => { mockImageOnload?.(); });
    fireEvent.click(screen.getByTestId('crop-cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders size slider for adjusting crop area', async () => {
    render(<IconCropDialog {...defaultProps} />);
    await act(async () => { mockImageOnload?.(); });
    expect(screen.getByTestId('crop-size-slider')).toBeInTheDocument();
  });

  it('renders preview canvas at 64x64', async () => {
    render(<IconCropDialog {...defaultProps} />);
    await act(async () => { mockImageOnload?.(); });
    const preview = screen.getByTestId('crop-preview') as HTMLCanvasElement;
    expect(preview).toHaveAttribute('width', '64');
    expect(preview).toHaveAttribute('height', '64');
  });
});
