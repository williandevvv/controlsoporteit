import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@19.1.1';
import { createRoot } from 'https://esm.sh/react-dom@19.1.1/client';

const ROOT_ID = 'react-shell-root';

function readMenu() {
  const aside = document.querySelector('.layout > aside');
  if (!aside) return [];
  return [...aside.querySelectorAll('button')]
    .filter((b) => !b.id?.startsWith('logout'))
    .map((b, i) => ({
      id: b.dataset.view || b.dataset.sideTool || `item-${i}`,
      label: b.querySelector('span')?.textContent?.trim() || b.textContent.trim(),
      icon: (b.textContent.trim().match(/^\S+/) || ['•'])[0],
      source: b
    }))
    .filter((x) => x.label && x.label !== 'Salir');
}

function App() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const sync = () => {
      const next = readMenu();
      setItems(next);
      if (!document.querySelector('.layout')) setOpen(false);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
    window.addEventListener('cs:react-refresh', sync);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('cs:react-refresh', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('react-menu-open', open);
    return () => document.body.classList.remove('react-menu-open');
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((x) => x.label.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const main = visible.filter((x) => !['Administración', 'Supervisión', 'Recordatorios', 'Mi Spotify', 'Ajustes', 'Historial operativo', 'Reporte ejecutivo', 'Formatos', 'Centro de alertas', 'Productividad', 'Ficha de colaborador', 'Agenda', 'Minutas', 'Auditoría'].includes(x.label));
  const tools = visible.filter((x) => !main.includes(x));
  const hasLayout = !!document.querySelector('.layout');

  if (!hasLayout) return null;

  const activate = (item) => {
    item.source?.click();
    setOpen(false);
  };

  return (
    <>
      <button className="react-mobile-trigger" aria-label="Abrir menú" onClick={() => setOpen(true)}>
        <span></span><span></span><span></span>
      </button>
      <div className={`react-menu-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`react-sidebar ${open ? 'open' : ''}`} aria-label="Navegación principal">
        <div className="react-brand">
          <div className="react-brand-mark">C</div>
          <div><b>CONTROL</b><small>Soporte</small></div>
          <button className="react-close" onClick={() => setOpen(false)} aria-label="Cerrar menú">×</button>
        </div>
        <div className="react-user">
          <div className="react-avatar">{(document.querySelector('.content header p')?.textContent || 'CS').trim().slice(0,1).toUpperCase()}</div>
          <div><strong>{(document.querySelector('.content header h1')?.textContent || 'Control Soporte')}</strong><small>Panel operativo</small></div>
        </div>
        <label className="react-nav-search">
          <span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar módulo…" />
        </label>
        <div className="react-nav-scroll">
          <div className="react-nav-title">PRINCIPAL</div>
          {main.map((item) => <button key={item.id + item.label} className="react-nav-item" onClick={() => activate(item)}><span className="react-nav-icon">{item.icon}</span><span>{item.label}</span></button>)}
          {tools.length > 0 && <div className="react-nav-title react-tools-title">GESTIÓN</div>}
          {tools.map((item) => <button key={item.id + item.label} className="react-nav-item react-nav-tool" onClick={() => activate(item)}><span className="react-nav-icon">{item.icon}</span><span>{item.label}</span></button>)}
        </div>
        <div className="react-sidebar-foot"><span>●</span> Sistema operativo</div>
      </aside>
    </>
  );
}

function mount() {
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }
  if (!root.__reactRoot) root.__reactRoot = createRoot(root);
  root.__reactRoot.render(<App />);
}

mount();
window.addEventListener('load', mount, { once: true });
