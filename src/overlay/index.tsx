import { createRoot } from 'react-dom/client';
import './index.css';
import './overlay.css';
import { OverlayRoot } from './OverlayRoot';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OverlayRoot />);
}
