import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { Router } from 'wouter';
import App from './App';
import { getMeta, ROUTES, buildLlms } from './seo/meta';
import { renderHead } from './seo/head';

export function render(path) {
  const html = renderToString(
    <StrictMode>
      <Router ssrPath={path}>
        <App />
      </Router>
    </StrictMode>,
  );
  const meta = getMeta(path);
  return { html, head: renderHead(meta), meta };
}

export { ROUTES, buildLlms };
