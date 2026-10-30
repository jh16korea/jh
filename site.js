(()=>{
  'use strict';
  const config = JSON.parse(document.getElementById('site-config').textContent);
  const submenuButtons=Array.from(document.querySelectorAll('.submenu-toggle'));
  function closeSubmenus(){submenuButtons.forEach(b=>{b.setAttribute('aria-expanded','false');b.closest('.nav-item').classList.remove('is-open');});}
  submenuButtons.forEach(b=>b.addEventListener('click',()=>{
    const open=b.getAttribute('aria-expanded')!=='true';
    closeSubmenus();b.setAttribute('aria-expanded',String(open));b.closest('.nav-item').classList.toggle('is-open',open);
  }));
  document.addEventListener('click',ev=>{if(!ev.target.closest('.has-sub'))closeSubmenus();});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeSubmenus();});
  try {
    if (location.pathname === '/' || location.pathname === '/index.html') {
      const selected=localStorage.getItem('jh16-language');
      if(['vi','th'].includes(selected)) location.replace('/'+selected+'.html');
    }
    if(location.pathname !== '/')localStorage.setItem('jh16-language',config.lang);
  } catch(_) {}
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero=document.querySelector('.hero');
  if(hero){
    const slides=Array.from(hero.querySelectorAll('.hero-slide'));
    const dots=Array.from(hero.querySelectorAll('[data-slide-to]'));
    const control=hero.querySelector('.hero-motion');
    const summary=hero.querySelector('.hero-summary');
    const primary=hero.querySelector('.hero-primary');
    let current=0,paused=motionPreference.matches,visible=true,hovered=false,timer;
    function show(next){
      current=(next+slides.length)%slides.length;
      slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',String(i!==current));});
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
      const active=slides[current];
      summary.textContent=active.dataset.summary;
      primary.href=active.dataset.href;
      primary.querySelector('span').textContent=active.dataset.cta;
    }
    function schedule(){
      clearInterval(timer);
      const label=paused?control.dataset.play:control.dataset.pause;
      control.setAttribute('aria-label',label);control.title=label;
      control.querySelector('span').textContent=paused?'▶':'Ⅱ';
      if(!paused&&visible&&!hovered&&!document.hidden)timer=setInterval(()=>show(current+1),2500);
    }
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>{show(i);paused=true;schedule();}));
    control.addEventListener('click',()=>{paused=!paused;schedule();});
    hero.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'){hovered=true;schedule();}});
    hero.addEventListener('pointerleave',()=>{hovered=false;schedule();});
    hero.addEventListener('focusin',ev=>{if(ev.target!==control){paused=true;schedule();}});
    let start=null;
    hero.addEventListener('pointerdown',ev=>{if(ev.pointerType==='touch'&&!ev.target.closest('a,button'))start={x:ev.clientX,y:ev.clientY};},{passive:true});
    hero.addEventListener('pointerup',ev=>{if(!start)return;const dx=ev.clientX-start.x,dy=ev.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){show(current+(dx<0?1:-1));paused=true;schedule();}},{passive:true});
    hero.addEventListener('pointercancel',()=>{start=null;});
    document.addEventListener('visibilitychange',schedule);
    motionPreference.addEventListener('change',ev=>{paused=ev.matches;schedule();});
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(hero);
    schedule();
  }
  document.querySelectorAll('.network-video').forEach(video=>{
    const control=video.closest('.network').querySelector('.video-motion');
    let paused=motionPreference.matches,visible=false;
    function update(){
      const label=paused?control.dataset.play:control.dataset.pause;
      control.setAttribute('aria-label',label);control.title=label;
      control.querySelector('span').textContent=paused?'▶':'Ⅱ';
      if(visible&&!paused&&!document.hidden){
        if(!video.src)video.src=video.dataset.src;
        video.play().catch(()=>{paused=true;control.setAttribute('aria-label',control.dataset.play);control.querySelector('span').textContent='▶';});
      }else video.pause();
    }
    control.addEventListener('click',()=>{paused=!paused;update();});
    motionPreference.addEventListener('change',ev=>{paused=ev.matches;update();});
    document.addEventListener('visibilitychange',update);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.12}).observe(video);
    update();
  });
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
