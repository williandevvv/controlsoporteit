(() => {
  const greeting = () => {
    const h = document.querySelector('.greeting h2');
    if (h) {
      const text = h.textContent || '';
      const m = text.match(/^(Buenos días|Buenas tardes|Buenas noches),?\s*(.*)$/i);
      if (m) {
        const hour = new Date().getHours();
        const sal = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
        const name = m[2].replace(/\s*👋.*$/,'').trim();
        h.textContent = `${sal}, ${name} 👋`;
      }
    }
  };
  const hideDashboardFloats = () => {
    ['#supervision-fab','#cs-r-fab'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.display = 'none';
    });
  };
  const run = () => { greeting(); hideDashboardFloats(); };
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  setInterval(run,1000); run();
})();
