import { StrictMode, startTransition } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = document.getElementById('root');
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

/* Hydrating in a transition yields to the browser, so long pages stay responsive while they load. */
if (root.firstElementChild) startTransition(() => hydrateRoot(root, tree));
else createRoot(root).render(tree);
