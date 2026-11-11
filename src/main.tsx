import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './styles/global.css';
import './styles/hero.css';
import './styles/overlay.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
