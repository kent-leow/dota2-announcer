import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GuideModal } from './GuideModal';

describe('GuideModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<GuideModal open={false} onClose={jest.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal when open', () => {
    render(<GuideModal open={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('guide-modal')).toBeInTheDocument();
  });

  it('displays all five guide sections', () => {
    render(<GuideModal open={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('section-overview')).toBeInTheDocument();
    expect(screen.getByTestId('section-controls')).toBeInTheDocument();
    expect(screen.getByTestId('section-hotkeys')).toBeInTheDocument();
    expect(screen.getByTestId('section-gsi-setup')).toBeInTheDocument();
    expect(screen.getByTestId('section-config')).toBeInTheDocument();
  });

  it('GSI setup section contains path and restart instructions', () => {
    render(<GuideModal open={true} onClose={jest.fn()} />);
    const section = screen.getByTestId('section-gsi-setup');
    expect(section).toHaveTextContent('gamestate_integration_announcer.cfg');
    expect(section).toHaveTextContent('steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/');
    expect(section).toHaveTextContent('Restart Dota 2');
  });

  it('close button calls onClose', () => {
    const onClose = jest.fn();
    render(<GuideModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('guide-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clicking backdrop calls onClose', () => {
    const onClose = jest.fn();
    render(<GuideModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('guide-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clicking modal body does not close', () => {
    const onClose = jest.fn();
    render(<GuideModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('guide-modal'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
