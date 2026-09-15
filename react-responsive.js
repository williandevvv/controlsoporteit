import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@19.1.1';
import { createRoot } from 'https://esm.sh/react-dom@19.1.1/client';

const ROOT_ID = 'react-shell-root';
const h = React.createElement;

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
    let lastSignature = '';
    let timer = 0;
    const sync = () => {
      const next = readMenu();
      const signature = next.map((x) => `${x.id}|${x.label}|${x.icon}`).join('||');
      if (signature !== lastSignature) {
        lastSignature = signature;
        setItems(next);
      }
      if (!document.querySelector('.layout')) setOpen(false);
    };
    const scheduleSync = () => {
      if (timer) return;
      timer = window.setTimeout(() => { timer = 0; sync(); }, 50);
    };
    sync();
    const target = document.getElementById('app') || document.body;
    const observer = new MutationObserver(scheduleSync);
    observer.observe(target, { childList: true, subtree: true });
    window.addEventListener('cs:react-refresh', scheduleSync);
    window.addEventListener('resize', scheduleSync);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
      window.removeEventListener('cs:react-refresh', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
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

  const special = ['Administración','Supervisión','Recordatorios','Mi Spotify','Ajustes','Historial operativo','Reporte ejecutivo','Formatos','Centro de alertas','Productividad','Ficha de colaborador','Agenda','Minutas','Auditoría'];
  const main = visible.filter((x) => !special.includes(x.label));
  const tools = visible.filter((x) => special.includes(x.label));
  const hasLayout = !!document.querySelector('.layout');
  if (!hasLayout) return null;

  const activate = (item) => { item.source?.click(); setOpen(false); };
  const navButton = (item, tool = false) => h('button', { key: item.id + item.label, className: 'react-nav-item' + (tool ? ' react-nav-tool' : ''), onClick: () => activate(item) }, h('span', { className: 'react-nav-icon' }, item.icon), h('span', null, item.label));

  return h(React.Fragment, null,
    h('button', { className: 'react-mobile-trigger', 'aria-label': 'Abrir menú', onClick: () => setOpen(true) }, h('span'), h('span'), h('span')),
    h('div', { className: 'react-menu-backdrop' + (open ? ' show' : ''), onClick: () => setOpen(false) }),
    h('aside', { className: 'react-sidebar' + (open ? ' open' : ''), 'aria-label': 'Navegación principal' },
      h('div', { className: 'react-brand' }, h('div', { className: 'react-brand-mark' }, 'C'), h('div', null, h('b', null, 'CONTROL'), h('small', null, 'Soporte')), h('button', { className: 'react-close', onClick: () => setOpen(false), 'aria-label': 'Cerrar menú' }, '×')),
      h('div', { className: 'react-user' }, h('div', { className: 'react-avatar' }, 'C'), h('div', null, h('strong', null, 'Control Soporte'), h('small', null, 'Panel operativo'))),
      h('label', { className: 'react-nav-search' }, h('span', null, '⌕'), h('input', { value: query, onChange: (e) => setQuery(e.target.value), placeholder: 'Buscar módulo…', 'aria-label': 'Buscar módulo' })),
      h('div', { className: 'react-nav-scroll' }, h('div', { className: 'react-nav-title' }, 'PRINCIPAL'), main.map((item) => navButton(item)), tools.length ? h('div', { className: 'react-nav-title react-tools-title' }, 'GESTIÓN') : null, tools.map((item) => navButton(item, true))),
      h('div', { className: 'react-sidebar-foot' }, h('span', null, '●'), ' Sistema operativo')
    )
  );
}

function mount() {
  let root = document.getElementById(ROOT_ID);
  if (!root) { root = document.createElement('div'); root.id = ROOT_ID; document.body.appendChild(root); }
  if (!root.__reactRoot) root.__reactRoot = createRoot(root);
  root.__reactRoot.render(h(App));
}
mount();
window.addEventListener('load', mount, { once: true });
