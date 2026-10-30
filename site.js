(()=>{
  'use strict';
  const config = JSON.parse(document.getElementById('site-config').textContent);
  try {
    if (location.pathname === '/' || location.pathname === '/index.html') {
      const selected=localStorage.getItem('jh16-language');
      if(['vi','th'].includes(selected)) location.replace('/'+selected+'.html');
    }
    if(location.pathname !== '/')localStorage.setItem('jh16-language',config.lang);
  } catch(_) {}
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#navigation');
  const closeMenu=()=>{toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',toggle.dataset.open);nav.classList.remove('open');document.body.classList.remove('menu-open');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?toggle.dataset.close:toggle.dataset.open);nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){closeMenu();toggle.focus();}});
  document.addEventListener('click',ev=>{if(!ev.target.closest('.site-header'))closeMenu();});
  window.matchMedia('(min-width: 1101px)').addEventListener('change',closeMenu);
  document.querySelectorAll('.languages a').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('jh16-language',a.lang);}catch(_){}if(location.search)a.href+=location.search;}));
  const form=document.getElementById('enquiry-form');
  if(!form)return;
  const requested=new URLSearchParams(location.search).get('product');
  if(requested && Array.from(form.elements.product.options).some(o=>o.value===requested))form.elements.product.value=requested;
  const status=document.getElementById('form-status');
  const preview=document.getElementById('enquiry-preview');
  function draft(){
    if(!form.reportValidity())return null;
    const data=new FormData(form);
    const fields=['name','company','email','country','product','channel','volume','message'];
    const body=fields.map(k=>{const el=form.elements[k];const value=el.tagName==='SELECT'?(el.value?el.options[el.selectedIndex].text:''):data.get(k);return config.labels[k]+': '+(value||'—');}).join('\n\n');
    preview.value=body; preview.hidden=false;
    return {body,subject:config.subject+' — '+data.get('company')};
  }
  form.addEventListener('submit',ev=>{
    ev.preventDefault();const d=draft();if(!d)return;
    const a=document.createElement('a');
    a.href='mailto:contact@jh16korea.com?subject='+encodeURIComponent(d.subject)+'&body='+encodeURIComponent(d.body);
    a.click();status.textContent=config.emailOpened;
  });
  document.getElementById('copy-enquiry').addEventListener('click',async()=>{
    const d=draft();if(!d)return;
    try {await navigator.clipboard.writeText(d.subject+'\n\n'+d.body);status.textContent=config.copied;}
    catch(_){preview.focus();preview.select();status.textContent='';}
  });
})();
