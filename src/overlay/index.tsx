import { createRoot } from 'react-dom/client';
import './index.css';
import './overlay.css';
import { NotificationStack } from './NotificationStack';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<NotificationStack />);
}
