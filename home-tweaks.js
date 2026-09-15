(() => {
  const greeting = () => {
    const h = document.querySelector('.greeting h2');
    if (!h) return;
    const text = h.textContent || '';
    const m = text.match(/^(Buenos días|Buenas tardes|Buenas noches),?\s*(.*)$/i);
    if (!m) return;
    const hour = new Date().getHours();
    const sal = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
    const name = m[2].replace(/\s*👋.*$/,'').trim();
    const next = `${sal}, ${name} 👋`;
    if (h.textContent !== next) h.textContent = next;
  };
  const hideDashboardFloats = () => {
    ['#supervision-fab','#cs-r-fab'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el && el.style.display !== 'none') el.style.display = 'none';
    });
  };
  const run = () => { greeting(); hideDashboardFloats(); };
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; run(); });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(run, 60000);
  run();
})();
