(() => {
  const templates = [
    {id:'salida-tiendas',icon:'🏪',name:'Formato Técnico · Salida a Tiendas',desc:'Visita técnica con espacio amplio para novedades manuscritas',fields:[['tienda','Tienda / sucursal'],['fecha','Fecha'],['tecnico','Técnico responsable'],['horaSalida','Hora de salida'],['horaLlegada','Hora de llegada']]},
    {id:'visita-tienda',icon:'🏬',name:'Visita a tienda',desc:'Registro general de una visita técnica',fields:[['tienda','Tienda / sucursal'],['fecha','Fecha'],['encargado','Encargado de tienda'],['motivo','Motivo de visita'],['horaEntrada','Hora de entrada'],['horaSalida','Hora de salida']]},
    {id:'orden',icon:'🔧',name:'Orden de trabajo de soporte',desc:'Orden y seguimiento de trabajos técnicos',fields:[['ot','N.º de orden'],['fecha','Fecha'],['solicitante','Solicitante'],['ubicacion','Ubicación'],['problema','Problema reportado'],['diagnostico','Diagnóstico'],['solucion','Solución aplicada']]},
    {id:'incidente',icon:'⚠️',name:'Reporte de incidente',desc:'Registro de incidentes y acciones tomadas',fields:[['tienda','Tienda / sucursal'],['fecha','Fecha'],['equipo','Equipo / código'],['prioridad','Prioridad'],['problema','Problema encontrado'],['accion','Acción tomada']]},
    {id:'pendientes',icon:'📋',name:'Control de pendientes',desc:'Seguimiento de pendientes y compromisos',fields:[['area','Tienda / área'],['fecha','Fecha'],['pendiente','Pendiente'],['responsable','Responsable'],['compromiso','Fecha compromiso'],['prioridad','Prioridad'],['estado','Estado']]},
    {id:'acta',icon:'📝',name:'Acta de visita técnica',desc:'Acta formal para dejar constancia de la visita',fields:[['tienda','Tienda / sucursal'],['fecha','Fecha'],['tecnico','Técnico'],['motivo','Motivo de visita'],['conformidad','Conformidad del encargado']]}
  ];
  const KEY='control-soporte-formatos-v2';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const isLong=k=>/observ|noved|hallaz|problema|diagnost|soluci|activ|seguim|recomend/i.test(k);

  function inject(){
    const b=document.querySelector('[data-formatos-nav]');
    if(!b || b.dataset.v2==='1')return;
    b.dataset.v2='1'; b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openCenter();};
  }
  function openCenter(){
    document.getElementById('fmt-v2-layer')?.remove();
    const layer=document.createElement('div'); layer.id='fmt-v2-layer';
    layer.innerHTML=`<div class="fmt-v2-backdrop"><section class="fmt-v2-modal" role="dialog" aria-modal="true">
      <header class="fmt-v2-head"><div><span>CONTROL SOPORTE · PLANTILLAS</span><h2>📄 Plantillas para imprimir</h2><p>Elegí un formato, editá sus campos y luego imprimilo o guardalo como PDF.</p></div><button class="fmt-v2-close">×</button></header>
      <div class="fmt-v2-grid">${templates.map(t=>`<article class="fmt-v2-card"><div class="fmt-v2-icon">${t.icon}</div><h3>${t.name}</h3><p>${t.desc}</p><small>${t.fields.length} campos · tamaño carta · escritura a mano</small><button data-open="${t.id}">Abrir plantilla</button></article>`).join('')}</div>
      <section class="fmt-v2-saved"><div class="fmt-v2-section-head"><h3>📁 Mis plantillas guardadas</h3><small>Se guardan en este dispositivo</small></div><div class="fmt-v2-history"></div></section>
    </section></div>`;
    document.body.appendChild(layer);
    layer.querySelector('.fmt-v2-close').onclick=()=>layer.remove();
    layer.querySelector('.fmt-v2-backdrop').onclick=e=>{if(e.target===e.currentTarget)layer.remove();};
    layer.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>editor(templates.find(t=>t.id===b.dataset.open),null,layer));
    renderHistory(layer);
  }
  function editor(t,record,layer){
    let fields=JSON.parse(JSON.stringify(record?.fields||t.fields));
    const values=record?.values||{};
    const render=()=>{
      layer.querySelector('.fmt-v2-modal').innerHTML=`<header class="fmt-v2-head"><div><span>DISEÑO DEL FORMATO</span><h2>${t.icon} ${esc(record?.name||t.name)}</h2><p>Podés cambiar los nombres de los campos, agregar campos y preparar el espacio para escribir a mano.</p></div><button class="fmt-v2-back">← Volver</button></header>
      <form class="fmt-v2-editor"><div class="fmt-v2-fields"><div class="fmt-v2-editor-title"><h3>Campos de cabecera</h3><button type="button" class="fmt-v2-add">＋ Agregar campo</button></div><div class="fmt-v2-field-list">${fields.map((f,i)=>`<div class="fmt-v2-field" data-index="${i}"><input value="${esc(f[1])}" aria-label="Nombre del campo"><select><option value="short" ${isLong(f[0])?'':'selected'}>Campo corto</option><option value="long" ${isLong(f[0])?'selected':''}>Campo amplio</option></select><button type="button" class="fmt-v2-remove" title="Quitar campo">×</button></div>`).join('')}</div></div>
      <div class="fmt-v2-handwrite"><div><h3>✏️ Área para novedades manuscritas</h3><p>Esta zona queda en blanco con renglones para rellenarla con lápiz durante la visita.</p></div><label>Alto del área <select id="fmt-lines"><option value="12">12 renglones</option><option value="18" selected>18 renglones</option><option value="25">25 renglones</option><option value="32">32 renglones</option></select></label></div>
      <div class="fmt-v2-preview"><div class="fmt-paper"><div class="paper-brand">CONTROL SOPORTE · ITE</div><h3>${esc(record?.name||t.name)}</h3><div class="paper-fields">${fields.slice(0,8).map(f=>`<div><b>${esc(f[1])}</b><span></span></div>`).join('')}</div><h4>NOVEDADES / ACTIVIDADES REALIZADAS</h4><div class="paper-lines">${'<i></i>'.repeat(18)}</div><div class="paper-sign"><span>Firma técnico / responsable</span><span>Firma encargado</span></div></div></div>
      <div class="fmt-v2-actions"><button type="button" class="fmt-v2-save">💾 Guardar plantilla</button><button type="button" class="fmt-v2-print">🖨️ Imprimir / PDF</button></div><output class="fmt-v2-msg"></output></form>`;
      layer.querySelector('.fmt-v2-back').onclick=()=>openCenter();
      layer.querySelector('.fmt-v2-add').onclick=()=>{fields.push([uid(),'Nuevo campo']);render();};
      layer.querySelectorAll('.fmt-v2-remove').forEach(b=>b.onclick=()=>{fields.splice(Number(b.closest('.fmt-v2-field').dataset.index),1);render();});
      layer.querySelector('.fmt-v2-save').onclick=()=>{
        const nextFields=[...layer.querySelectorAll('.fmt-v2-field')].map((el,i)=>[fields[i]?.[0]||uid(),el.querySelector('input').value.trim()||`Campo ${i+1}`]);
        fields=nextFields; const item={id:record?.id||uid(),template:t.id,name:record?.name||t.name,fields,values,lines:Number(layer.querySelector('#fmt-lines').value),updatedAt:new Date().toISOString()};
        const all=load(); const idx=all.findIndex(x=>x.id===item.id); idx>=0?all[idx]=item:all.unshift(item); save(all); layer.querySelector('.fmt-v2-msg').textContent='✓ Plantilla guardada en este dispositivo.'; renderHistory(layer);
      };
      layer.querySelector('.fmt-v2-print').onclick=()=>{const n=Number(layer.querySelector('#fmt-lines').value);printFormat(t,fields,n,record?.name||t.name);};
    };
    render();
  }
  function printFormat(t,fields,lines,title){
    const w=window.open('','_blank'); if(!w)return alert('El navegador bloqueó la ventana. Permití ventanas emergentes para imprimir.');
    const safeFields=fields.length?fields:[['x','Datos']];
    const header=safeFields.map(f=>`<div class="field"><b>${esc(f[1])}</b><span></span></div>`).join('');
    const ruled=Array.from({length:Math.max(10,Math.min(36,lines||18))},()=>'<i></i>').join('');
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      @page{size:letter portrait;margin:11mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#172033;font-size:10.5pt;margin:0}header{border-bottom:3px solid #1559a8;padding-bottom:8px;margin-bottom:10px;display:flex;justify-content:space-between;gap:20px}header strong{font-size:15pt;letter-spacing:.4px}header small{color:#5b6575}.title{text-align:center;border:1px solid #b8c6d9;background:#eef4fb;padding:8px;margin-bottom:10px}.title h1{font-size:15pt;margin:0 0 3px}.title p{margin:0;color:#536174}.fields{display:grid;grid-template-columns:1fr 1fr;border:1px solid #b8c6d9}.field{min-height:31px;border-right:1px solid #b8c6d9;border-bottom:1px solid #b8c6d9;display:grid;grid-template-columns:43% 57%}.field:nth-child(2n){border-right:0}.field b{background:#f1f5f9;padding:7px}.field span{padding:7px}.section{margin-top:10px;border:1px solid #b8c6d9}.section h2{font-size:10.5pt;margin:0;background:#e9f1fb;padding:6px 8px;border-bottom:1px solid #b8c6d9}.lines{padding:2px 8px}.lines i{display:block;height:22px;border-bottom:1px solid #8f9bad}.sign{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:22px}.sign div{border-top:1px solid #303846;padding-top:5px;text-align:center;font-size:9pt}.footer{margin-top:10px;font-size:8pt;color:#697586;text-align:right}@media print{.no-print{display:none}}</style></head><body>
      <header><div><strong>CONTROL SOPORTE · ITE</strong><br><small>Formato técnico</small></div><small>Fecha de impresión: ${new Date().toLocaleDateString('es-HN')}</small></header>
      <div class="title"><h1>${esc(title)}</h1><p>Documento para registro físico de actividades y novedades</p></div>
      <div class="fields">${header}</div>
      <div class="section"><h2>NOVEDADES / ACTIVIDADES REALIZADAS</h2><div class="lines">${ruled}</div></div>
      <div class="sign"><div>Firma técnico / responsable</div><div>Firma encargado de tienda / área</div></div>
      <div class="footer">Control Soporte · Documento generado para impresión</div>
      <script>window.onload=()=>setTimeout(()=>window.print(),250);</script></body></html>`);
    w.document.close();
  }
  function renderHistory(layer){
    const box=layer.querySelector('.fmt-v2-history');if(!box)return;const all=load();
    if(!all.length){box.innerHTML='<p class="fmt-v2-empty">Todavía no hay plantillas guardadas.</p>';return;}
    box.innerHTML=all.slice(0,15).map(r=>`<div class="fmt-v2-history-row"><div><b>${esc(r.name)}</b><small>${new Date(r.updatedAt).toLocaleString('es-HN')} · ${r.fields?.length||0} campos</small></div><div><button data-edit="${r.id}">Editar</button><button data-print="${r.id}">🖨️ Imprimir</button></div></div>`).join('');
    box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const r=load().find(x=>x.id===b.dataset.edit);const t=templates.find(x=>x.id===r.template)||templates[0];editor(t,r,layer);});
    box.querySelectorAll('[data-print]').forEach(b=>b.onclick=()=>{const r=load().find(x=>x.id===b.dataset.print);printFormat(templates.find(x=>x.id===r.template)||templates[0],r.fields||templates[0].fields,r.lines||18,r.name);});
  }
  const css=document.createElement('style');css.textContent=`
    #fmt-v2-layer{position:fixed;inset:0;z-index:100000;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}.fmt-v2-backdrop{position:absolute;inset:0;background:rgba(15,32,55,.34);backdrop-filter:blur(3px);padding:20px;display:grid;place-items:center}.fmt-v2-modal{width:min(1120px,100%);max-height:min(92dvh,900px);overflow:auto;background:#f7faff;border:1px solid #d6e2f1;border-radius:20px;box-shadow:0 24px 70px rgba(16,48,82,.24);color:#162238}.fmt-v2-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:22px 24px 18px;background:white;border-bottom:1px solid #dce6f2;position:sticky;top:0;z-index:2}.fmt-v2-head span{font-size:10px;font-weight:800;letter-spacing:1px;color:#1769c2}.fmt-v2-head h2{margin:5px 0;font-size:22px}.fmt-v2-head p{margin:0;color:#66758a;font-size:13px}.fmt-v2-close,.fmt-v2-back{border:0;border-radius:10px;background:#1769c2;color:white;padding:9px 14px;font-weight:700;cursor:pointer}.fmt-v2-close{font-size:22px;padding:4px 11px}.fmt-v2-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:20px 24px}.fmt-v2-card{background:white;border:1px solid #dce6f2;border-radius:15px;padding:16px;display:flex;flex-direction:column;min-height:205px;box-shadow:0 5px 18px rgba(31,69,110,.05)}.fmt-v2-icon{font-size:27px}.fmt-v2-card h3{font-size:15px;margin:8px 0 5px}.fmt-v2-card p{font-size:12px;color:#69778a;min-height:34px;margin:0}.fmt-v2-card small{color:#7b8796;margin-top:auto;padding:9px 0;font-size:10px}.fmt-v2-card button,.fmt-v2-history-row button,.fmt-v2-actions button{border:0;border-radius:9px;padding:10px 12px;background:#1769c2;color:white;font-weight:700;cursor:pointer}.fmt-v2-saved{margin:0 24px 24px;background:white;border:1px solid #dce6f2;border-radius:15px;padding:16px}.fmt-v2-section-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.fmt-v2-section-head h3{margin:0}.fmt-v2-section-head small{color:#7a8798}.fmt-v2-history{margin-top:12px}.fmt-v2-history-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;border-top:1px solid #e7edf5}.fmt-v2-history-row b,.fmt-v2-history-row small{display:block}.fmt-v2-history-row small{color:#7a8798;font-size:10px;margin-top:3px}.fmt-v2-history-row div:last-child{display:flex;gap:7px}.fmt-v2-history-row button:nth-child(2){background:#eef4fb;color:#1769c2}.fmt-v2-empty{color:#788598;font-size:12px}.fmt-v2-editor{padding:20px 24px}.fmt-v2-editor-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.fmt-v2-editor-title h3{margin:0}.fmt-v2-add{border:1px solid #cbd9e8;background:#fff;color:#1769c2;border-radius:9px;padding:8px 10px;font-weight:700;cursor:pointer}.fmt-v2-field-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fmt-v2-field{display:grid;grid-template-columns:1fr 125px 34px;gap:7px}.fmt-v2-field input,.fmt-v2-field select,.fmt-v2-handwrite select{width:100%;border:1px solid #cbd8e7;background:white;border-radius:9px;padding:9px;font:inherit;min-width:0}.fmt-v2-remove{border:0;background:#fff0f1;color:#c53030;border-radius:9px;font-size:18px;cursor:pointer}.fmt-v2-handwrite{margin-top:18px;padding:15px;background:#eef5fd;border:1px solid #d4e3f3;border-radius:13px;display:flex;justify-content:space-between;gap:15px;align-items:center}.fmt-v2-handwrite h3{margin:0 0 3px;font-size:15px}.fmt-v2-handwrite p{margin:0;color:#65758a;font-size:12px}.fmt-v2-handwrite label{min-width:150px;font-size:11px;font-weight:700}.fmt-v2-preview{margin-top:18px;background:#dfe7f0;padding:18px;border-radius:14px;display:flex;justify-content:center}.fmt-paper{background:white;width:min(650px,100%);padding:20px;box-shadow:0 8px 22px rgba(20,40,70,.13)}.paper-brand{font-weight:800;color:#1769c2;font-size:12px;border-bottom:2px solid #1769c2;padding-bottom:7px}.fmt-paper h3{text-align:center;font-size:15px;margin:9px 0;background:#eef4fb;padding:8px}.paper-fields{display:grid;grid-template-columns:1fr 1fr}.paper-fields div{border:1px solid #cbd6e3;min-height:25px;display:grid;grid-template-columns:43% 57%}.paper-fields b{background:#f2f5f8;padding:5px;font-size:9px}.paper-fields span{padding:5px}.fmt-paper h4{font-size:10px;background:#e9f1fb;padding:6px;margin:10px 0 0}.paper-lines i{display:block;height:17px;border-bottom:1px solid #aab5c2}.paper-sign{display:flex;gap:40px;margin-top:16px}.paper-sign span{border-top:1px solid #444;flex:1;text-align:center;padding-top:4px;font-size:9px}.fmt-v2-actions{display:flex;gap:9px;margin-top:18px}.fmt-v2-actions .fmt-v2-print{background:#0a9b67}.fmt-v2-msg{display:block;margin-top:9px;color:#0a8a5b;font-weight:700;font-size:12px}
    @media(max-width:800px){.fmt-v2-backdrop{padding:8px}.fmt-v2-modal{max-height:96dvh;border-radius:15px}.fmt-v2-head{padding:16px}.fmt-v2-grid{grid-template-columns:1fr 1fr;padding:14px 16px}.fmt-v2-saved{margin:0 16px 16px}.fmt-v2-editor{padding:16px}.fmt-v2-field-list{grid-template-columns:1fr}.fmt-v2-field{grid-template-columns:1fr 105px 34px}.fmt-v2-handwrite{display:block}.fmt-v2-handwrite label{display:block;margin-top:10px}.paper-fields{grid-template-columns:1fr}.paper-sign{gap:15px}}
    @media(max-width:480px){.fmt-v2-grid{grid-template-columns:1fr}.fmt-v2-head h2{font-size:18px}.fmt-v2-head p{font-size:11px}.fmt-v2-card{min-height:180px}.fmt-v2-history-row{align-items:flex-start;flex-direction:column}.fmt-v2-history-row div:last-child{width:100%}.fmt-v2-history-row button{flex:1}.fmt-v2-field{grid-template-columns:1fr 90px 32px}.fmt-v2-actions{display:grid;grid-template-columns:1fr}.fmt-v2-actions button{width:100%}}
  `;document.head.appendChild(css);
  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});setInterval(inject,500);inject();
})();
