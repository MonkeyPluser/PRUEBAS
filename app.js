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
 if(!items.length){root.append(el("p","empty","Todavía no hay mapas en esta categoría. Probá con otra."));return}
 for(const m of items){
 const card=el("article","card");const media=el("div","card-image");
 media.append(m.image?image(m.image,"Miniatura de "+m.name):placeholder());
 const body=el("div","card-content");body.append(badge(m.reference?"Referencia externa · "+m.category:m.category),el("h3","",m.name),el("p","",m.description),el("div","card-meta","Dificultad: "+m.difficulty+" · Autor: "+m.author));
 const actions=el("div","card-actions");actions.append(link("Abrir en Steam ↗",steamUrl(m.steamId)));body.append(actions);card.append(media,body);root.append(card)
 }
}
function initMaps(){const filters=$("#map-filters");const cats=["Todos",...new Set(config.maps.map(m=>m.category))];for(const cat of cats){const b=el("button","filter",cat);b.type="button";b.setAttribute("aria-pressed",String(cat==="Todos"));b.addEventListener("click",()=>{filters.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));renderMaps(cat)});filters.append(b)}renderMaps()}
function initClips(){
 const grid=$("#clips-grid");if(!grid)return;grid.replaceChildren();
 const items=Array.isArray(config.clips)?config.clips.slice(0,6):[];
 if(!items.length){
  const card=el("article","card");const media=el("div","video-placeholder");media.append(el("span","","▶"));
  const body=el("div","card-content");body.append(badge("Selección editorial"),el("h3","","Lo próximo de FranV6X"),el("p","","Nuevos clips, mapas y análisis de Counter-Strike."),link("Explorar YouTube",config.social.youtube));
  card.append(media,body);grid.append(card);return;
 }
 for(const item of items){
  if(typeof item.url!=="string"||!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com)\//i.test(item.url))continue;
  const card=el("article","card"),media=el("div","card-image");
  const youtube=/^(?:https:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/.exec(item.url);
  if(youtube){
   const button=el("button","video-facade");button.type="button";button.setAttribute("aria-label","Reproducir "+(item.title||"video"));
   const img=image("https://i.ytimg.com/vi/"+youtube[1]+"/hqdefault.jpg","Miniatura de "+(item.title||"video"));button.append(img,el("span","","Reproducir ▶"));
   button.addEventListener("click",()=>{
    const iframe=document.createElement("iframe");iframe.title=item.title||"Video de FranV6X";iframe.loading="lazy";
    iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen=true;iframe.src="https://www.youtube-nocookie.com/embed/"+youtube[1]+"?autoplay=1";
    button.replaceWith(iframe);
   });media.append(button);
  }else{media.append(el("div","video-placeholder","Video de FranV6X"))}
  const body=el("div","card-content");body.append(el("h3","",item.title||"Video destacado"),link("Abrir video ↗",item.url));
  card.append(media,body);grid.append(card);
 }
}
function initCommunity(){
 const social=$("#social-links");if(!social)return;
 social.replaceChildren();for(const [name,url] of Object.entries(config.social)){if(!url)continue;social.append(link(name==="youtube"?"YouTube":name.charAt(0).toUpperCase()+name.slice(1),url))}
 const discord=$("#discord-link"),nav=$("#discord-nav");
 if(config.social.discord)for(const a of [discord,nav].filter(Boolean)){a.href=config.social.discord;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Entrar al Discord ↗"}
 const contacts=$("#contact-actions");contacts.replaceChildren();
 if(config.contact.email){contacts.append(link("Enviar propuesta ↗","mailto:"+config.contact.email))}
 else contacts.append(link("Contactar por Instagram ↗",config.social.instagram)); // no invented email
 if(config.contact.mediaKit)contacts.append(link("Ver media kit ↗",config.contact.mediaKit));
 const brands=$("#brand-list");if(!brands)return;
 const collabs=(config.collaborations||[]).filter(b=>b?.name);
 if(!collabs.length){brands.hidden=true;return}brands.hidden=false;
 const title=brands.querySelector("h3");brands.replaceChildren();if(title)brands.append(title);
 collabs.forEach(b=>{const item=el("p","list-line");item.append(el("strong","",b.name));if(b.note)item.append(document.createTextNode(" · "+b.note));brands.append(item)});
}
function initMenu(){
 const trigger=$("#menu-toggle"),menu=$("#menu");if(!trigger||!menu)return;
 const mobile=()=>matchMedia("(max-width:760px)").matches;
 const setOpen=open=>{menu.classList.toggle("open",open);trigger.setAttribute("aria-expanded",String(open));if(open&&mobile())menu.querySelector("a")?.focus()};
 trigger.addEventListener("click",()=>setOpen(!menu.classList.contains("open")));
 menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
 document.addEventListener("keydown",e=>{
  if(!mobile()||!menu.classList.contains("open"))return;
  if(e.key==="Escape"){e.preventDefault();setOpen(false);trigger.focus()}
  if(e.key==="Tab"){const links=[...menu.querySelectorAll('a:not([hidden])')];if(!links.length)return;const first=links[0],last=links[links.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
 });
 window.addEventListener("resize",()=>{if(!mobile())setOpen(false)});
 if("IntersectionObserver" in window){
  const navs=[...menu.querySelectorAll('a[href^="#"]')];
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   navs.forEach(a=>a.removeAttribute("aria-current"));
   const current=navs.find(a=>a.getAttribute("href")==="#"+entry.target.id);
   if(current)current.setAttribute("aria-current","location");
  }),{rootMargin:"-25% 0px -60% 0px"});
  document.querySelectorAll("main section[id]").forEach(node=>io.observe(node));
 }
}
function initServer(){
 const v=window.V6X_CONFIG?.server,section=$("#servidor");
 if(!section||!v)return;
 const states={coming_soon:"Próximamente",online:"Online",offline:"Offline"};
 const badge=$("#server-state");badge.textContent=states[v.state]||states.coming_soon;
 badge.classList.toggle("online",v.state==="online");badge.classList.toggle("offline",v.state==="offline");
 $("#server-name").textContent=v.name||"Servidor V6X";
 $("#server-region").textContent=v.region||"Sudamérica";
 $("#server-mode").textContent=v.mode||"Comunidad";
 const rules=$("#server-rules");rules.replaceChildren();(v.rules||[]).forEach(rule=>rules.append(el("li","",rule)));
 const connect=$("#server-connect"),copy=$("#server-copy");
 const canConnect=v.state==="online"&&/^[\da-zA-Z.:-]+$/.test(v.ip||"")&&Number.isInteger(v.port)&&v.port>0&&v.port<65536;
 connect.hidden=!canConnect;copy.hidden=!canConnect;
 if(canConnect){connect.href="steam://connect/"+v.ip+":"+v.port;
  copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(v.ip+":"+v.port);copy.textContent="IP copiada"}catch{copy.textContent="No se pudo copiar"}});
 }
 // Static GitHub Pages can't use the Steam UDP query protocol.
 // Disabled by default; expects a JSON endpoint from a trusted proxy or scheduled snapshot.
 if(!v.statusApi?.enabled||!v.statusApi.url)return;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),v.statusApi.timeoutMs||4500);
 fetch(v.statusApi.url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error("status");return r.json()}).then(data=>{
  if(typeof data?.players!=="number"||typeof data?.map!=="string")return;
  const target=$("#server-live-data");target.textContent=data.players+" jugadores · "+data.map.slice(0,70);target.hidden=false;
 }).catch(()=>{}).finally(()=>clearTimeout(timer));
}
function initHero(){
 const region=$("#hero-art"),toggle=$("#motion-toggle");
 if(region?.classList.contains("premium-webgl")){
  if("requestIdleCallback" in window)requestIdleCallback(()=>import("./scene3d.js").then(x=>x.mountScene(window.V6X_CONFIG)).catch(()=>{}),{timeout:1500});
  else setTimeout(()=>import("./scene3d.js").then(x=>x.mountScene(window.V6X_CONFIG)).catch(()=>{}),300);
  return;
 }
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
function safeInit(rootSelector,fn){
 try{fn()}catch(error){
  console.warn("FranV6X: error de sección, se muestra respaldo.",error);
  const root=$(rootSelector);if(!root)return;
  root.replaceChildren();
  const box=el("div","empty");box.append(el("p","","No pudimos mostrar esta sección. Probá nuevamente."));
  const retry=el("button","btn btn-ghost","Reintentar");retry.type="button";retry.addEventListener("click",()=>safeInit(rootSelector,fn));
  box.append(retry);root.append(box);
 }
}
function init(){
 safeInit("#metrics-grid",renderMetrics);
 safeInit("#map-grid",initMaps);
 safeInit("#clips-grid",initClips);
 safeInit("#social-links",initCommunity);
 safeInit("#menu",initMenu);
 safeInit("#servidor",initServer);
 safeInit("#hero-art",initHero);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
