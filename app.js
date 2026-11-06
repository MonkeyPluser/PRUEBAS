(() => {
"use strict";
const config=window.FRAN_DATA;
const $=(q,root=document)=>root.querySelector(q);
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=String(text);return node};
const link=(text,href,cls="btn btn-ghost")=>{const a=el("a",cls,text);a.href=href;a.target="_blank";a.rel="noopener noreferrer";return a};
const steamUrl=id=>"https://steamcommunity.com/sharedfiles/filedetails/?id="+encodeURIComponent(id);
const badge=label=>el("span","placeholder-label",label);
const image=(src,alt,cls="")=>{const img=el("img",cls);img.alt=alt;img.loading="lazy";img.decoding="async";img.width=360;img.height=220;img.src=src;img.addEventListener("error",()=>{img.replaceWith(placeholder())},{once:true});return img};
function placeholder(){const wrap=el("span");wrap.setAttribute("aria-hidden","true");wrap.innerHTML='<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3"><rect x="10" y="18" width="80" height="64" rx="9"/><path d="M15 64L35 46L53 61L69 36L86 53"/><circle cx="35" cy="32" r="7"/></svg>';return wrap}
const status=(target,msg)=>{target.textContent=msg};
function renderMetrics(){
 const grid=$("#metrics-grid");grid.replaceChildren();
 const map={TikTok:"tiktok",Instagram:"instagram",Discord:"discord",YouTube:"youtube",Kick:"kick"};
 for(const m of config.metrics.items){
  const key=map[m.label];
  const url=key?config.social[key]:null;
  const card=el(url?"a":"article","metric"+(m.featured?" featured":""));
  if(url){card.href=url;card.target="_blank";card.rel="noopener noreferrer";card.setAttribute("aria-label","Abrir "+m.label+" en su plataforma; cifra histórica, no en tiempo real")}
  const number=el("strong","metric-number",m.display);number.dataset.value=m.value;number.dataset.display=m.display;
  card.append(number,el("span","",m.label));
  if(url)card.append(el("span","metric-open","Ver perfil ↗"));
  grid.append(card);
 }
 $("#metrics-date").textContent="Datos históricos actualizados: "+config.metrics.updated+". "+config.metrics.context+" Seguí los enlaces para consultar los perfiles públicos.";
 const values=[...document.querySelectorAll(".metric-number")];
 if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;obs.unobserve(e.target);const n=e.target,end=Number(n.dataset.value),goal=n.dataset.display;const start=performance.now();function tick(now){const t=Math.min((now-start)/1100,1),v=Math.floor(end*(1-Math.pow(1-t,3)));n.textContent=end>=100000?(v/1000).toLocaleString("es-AR",{maximumFractionDigits:0})+"K+":end>=1000?(v/1000).toLocaleString("es-AR",{maximumFractionDigits:1})+"K+":String(v);if(t<1)requestAnimationFrame(tick);else n.textContent=goal}requestAnimationFrame(tick)})},{threshold:.4});values.forEach(n=>obs.observe(n));
}
function renderMaps(category="Todos"){
 const root=$("#map-grid");root.replaceChildren();
 const items=config.maps.filter(m=>category==="Todos"||m.category===category);
 if(!items.length){root.append(el("p","empty","No hay mapas en esta categoría todavía. TODO: completar los enlaces de tus mapas."));return}
 for(const m of items){
 const card=el("article","card");const media=el("div","card-image");
 media.append(m.image?image(m.image,"Miniatura de "+m.name):placeholder());
 const body=el("div","card-content");body.append(badge(m.reference?"Referencia externa · "+m.category:m.category),el("h3","",m.name),el("p","",m.description),el("div","card-meta","Dificultad: "+m.difficulty+" · Autor: "+m.author));
 const actions=el("div","card-actions");actions.append(link("Abrir en Steam ↗",steamUrl(m.steamId)));body.append(actions);card.append(media,body);root.append(card)
 }
}
function initMaps(){const filters=$("#map-filters");const cats=["Todos",...new Set(config.maps.map(m=>m.category))];for(const cat of cats){const b=el("button","filter",cat);b.type="button";b.setAttribute("aria-pressed",String(cat==="Todos"));b.addEventListener("click",()=>{filters.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));renderMaps(cat)});filters.append(b)}renderMaps()}
function initClips(){const grid=$("#clips-grid");if(!config.clips.length){const a=el("article","card");const visual=el("div","video-placeholder");visual.append(el("span","","▶"));const body=el("div","card-content");body.append(badge("TODO: videos destacados"),el("h3","","Los mejores clips de FranV6X"),el("p","","Sumá los enlaces de 3 a 6 videos destacados en data.js."),link("Ver el canal",config.social.youtube));a.append(visual,body);grid.append(a);return}
 for(const clip of config.clips.slice(0,6)){if(!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com|instagram\.com)\//i.test(clip.url))continue;const card=el("article","card"),body=el("div","card-content");body.append(badge("Video destacado"),el("h3","",clip.title||"Contenido FranV6X"),link("Ver video ↗",clip.url));card.append(body);grid.append(card)}
}
function initCommunity(){
 const social=$("#social-links");for(const [name,url] of Object.entries(config.social)){if(!url)continue;social.append(link(name==="youtube"?"YouTube":name.charAt(0).toUpperCase()+name.slice(1),url))}
 const discord=$("#discord-link");const nav=$("#discord-nav");
 if(config.social.discord){for(const a of [discord,nav]){a.href=config.social.discord;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Entrar al Discord ↗"}}
 else{for(const a of [discord,nav]){a.href="#comunidad";a.textContent="Discord · enlace pendiente"};$("#discord-todo").hidden=false}
 const contacts=$("#contact-actions");if(config.contact.email){contacts.append(link("Enviar propuesta","mailto:"+config.contact.email))}
 else contacts.append(el("p","muted","TODO: agregar correo comercial para habilitar contacto directo."));
 if(config.contact.mediaKit)contacts.append(link("Ver media kit",config.contact.mediaKit));
 else contacts.append(el("p","muted","TODO: publicar enlace al media kit."));
 const brands=$("#brand-list");config.collaborations.forEach(b=>{const item=el("p","list-line");item.append(el("strong","",b.name),document.createTextNode(" · "+b.note));brands.append(item)});
}
function initMenu(){const trigger=$("#menu-toggle"),menu=$("#menu");trigger.addEventListener("click",()=>{const open=menu.classList.toggle("open");trigger.setAttribute("aria-expanded",String(open))});menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menu.classList.remove("open");trigger.setAttribute("aria-expanded","false")}));
 if("IntersectionObserver" in window){const navs=[...menu.querySelectorAll('a[href^="#"]')];const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){navs.forEach(a=>a.removeAttribute("aria-current"));const a=navs.find(n=>n.getAttribute("href")==="#"+e.target.id);if(a)a.setAttribute("aria-current","location")}})},{rootMargin:"-25% 0px -60% 0px"});document.querySelectorAll("main section[id]").forEach(s=>io.observe(s))}}
function initHero(){
 const region=$("#hero-art"),toggle=$("#motion-toggle");
 if(!region||!toggle)return;
 // No external 3D library is needed; the browser animates CSS 3D geometry.
 // This is visibly rotating by default unless reduced motion is requested.
 const prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const setPaused=paused=>{
  region.classList.toggle("is-paused",paused);
  toggle.setAttribute("aria-pressed",String(paused));
  toggle.setAttribute("aria-label",paused?"Reanudar animación 3D":"Pausar animación 3D");
  toggle.textContent=paused?"Reanudar movimiento ▶":"Pausar movimiento Ⅱ";
 };
 setPaused(prefersReduced);
 toggle.addEventListener("click",()=>setPaused(!region.classList.contains("is-paused")));
 let latest=0;
 region.addEventListener("pointermove",event=>{
  if(event.pointerType==="touch"||prefersReduced)return;
  const now=performance.now();if(now-latest<30)return;latest=now;
  const rect=region.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width-.5;
  const y=(event.clientY-rect.top)/rect.height-.5;
  region.style.setProperty("--tilt-x",(-y*13).toFixed(1)+"deg");
  region.style.setProperty("--tilt-y",(x*17).toFixed(1)+"deg");
 });
 region.addEventListener("pointerleave",()=>{
  region.style.setProperty("--tilt-x","0deg");
  region.style.setProperty("--tilt-y","0deg");
 });
}
function init(){renderMetrics();initMaps();initClips();initCommunity();initMenu();initHero();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
