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
 for(const m of config.metrics.items){const card=el("article","metric"+(m.featured?" featured":""));const number=el("strong","metric-number",m.display);number.dataset.value=m.value;number.dataset.display=m.display;card.append(number,el("span","",m.label));grid.append(card)}
 $("#metrics-date").textContent="Actualización: "+config.metrics.updated+". "+config.metrics.context;
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
const fallbackCases=config.cases.map((c,i)=>({id:"local-"+i,name:c.name,year:c.year,image:null,items:c.items.map(name=>({name,image:null,rarity:"#a98dd4"}))}));
let cases=fallbackCases,currentCase=null,previousFocus=null;
function normalizeApi(raw){
 if(!Array.isArray(raw))throw Error("Formato de catálogo no compatible");
 const result=[];
 for(const entry of raw){if(!entry||typeof entry!=="object"||typeof entry.name!=="string"||!entry.name.endsWith("Case"))continue;
 const items=Array.isArray(entry.contains)?entry.contains.slice(0,50).filter(x=>x&&typeof x.name==="string").map(x=>({name:x.name.slice(0,110),image:typeof x.image==="string"&&/^https:\/\//.test(x.image)?x.image:null,rarity:typeof x.rarity?.color==="string"&&/^#[\da-fA-F]{6}$/.test(x.rarity.color)?x.rarity.color:"#a98dd4"})):[];
 if(!items.length)continue;
 result.push({id:String(entry.id||entry.name),name:entry.name.slice(0,100),year:0,image:typeof entry.image==="string"&&/^https:\/\//.test(entry.image)?entry.image:null,items})}
 if(!result.length)throw Error("No se encontraron cajas válidas");return result
}
async function loadCases(){
 const label=$("#catalog-status");status(label,"Cargando imágenes del catálogo…");
 $("#case-grid").replaceChildren(...Array.from({length:8},()=>el("div","skeleton")));
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),5500);
 try{const res=await fetch("https://bymykel.github.io/CSGO-API/api/en/crates.json",{signal:ctl.signal,cache:"force-cache"});if(!res.ok)throw Error("HTTP "+res.status);const parsed=normalizeApi(await res.json());cases=parsed;status(label,"Catálogo visual cargado. Aperturas gratuitas simuladas, sin premios reales.")}
 catch(err){cases=fallbackCases;status(label,"No pudimos cargar las imágenes externas. Mostramos el catálogo de respaldo. Podés reintentar.")}
 finally{clearTimeout(timer);renderCases()}
}
function renderCases(){
 const root=$("#case-grid");root.replaceChildren();$("#case-count").textContent=cases.length+" cajas disponibles";
 for(const c of cases){const btn=el("button","case-button");btn.type="button";btn.setAttribute("aria-label","Explorar "+c.name);const art=el("div","card-image object");art.append(c.image?image(c.image,c.name):placeholder());btn.append(art,el("span","case-name",c.name));btn.addEventListener("click",()=>openCase(c));root.append(btn)}
}
function safeRarity(raw){return /^#[\da-fA-F]{6}$/.test(raw||"")?raw:"#a98dd4"}
function makeSkinTile(item){const card=el("div","skin-tile");card.style.setProperty("--rarity",safeRarity(item.rarity));const media=el("div","card-image object");media.style.height="105px";media.append(item.image?image(item.image,item.name):placeholder());card.append(media,el("b","",item.name));return card}
function openCase(c){currentCase=c;previousFocus=document.activeElement;$("#dialog-title").textContent=c.name;const list=$("#skin-list");list.replaceChildren();c.items.forEach(item=>list.append(makeSkinTile(item)));$("#roulette-track").replaceChildren();$("#opening-result").textContent="";$("#open-case").disabled=false;$("#case-dialog").showModal();document.body.classList.add("modal-open");$("#close-dialog").focus()}
function closeDialog(){const dlg=$("#case-dialog");if(dlg.open)dlg.close();document.body.classList.remove("modal-open");previousFocus?.focus()}
function initDialog(){const dlg=$("#case-dialog");$("#close-dialog").addEventListener("click",closeDialog);dlg.addEventListener("close",()=>{document.body.classList.remove("modal-open");previousFocus?.focus()});dlg.addEventListener("click",e=>{if(e.target===dlg)closeDialog()});$("#open-case").addEventListener("click",rollCase)}
let rolling=false;
function rollCase(){
 if(!currentCase||rolling||!currentCase.items.length)return;rolling=true;
 const b=$("#open-case"),track=$("#roulette-track"),result=$("#opening-result");
 b.disabled=true;result.textContent="Apertura en curso…";track.replaceChildren();
 const pool=currentCase.items;const chosen=pool[Math.floor(Math.random()*pool.length)];
 const sequence=Array.from({length:35},(_,i)=>i===30?chosen:pool[Math.floor(Math.random()*pool.length)]);
 sequence.forEach(item=>{const card=el("div","roulette-card");card.style.setProperty("--rarity",safeRarity(item.rarity));if(item.image)card.append(image(item.image,item.name));card.append(el("span","",item.name));track.append(card)});
 const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const finish=()=>{result.textContent="Resultado simulado: "+chosen.name+". No tiene valor económico ni puede retirarse.";b.disabled=false;rolling=false};
 if(reduce){finish();return}
 track.style.transition="none";track.style.transform="translateX(0px)";
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const item=track.firstElementChild;if(!item){finish();return}const step=item.getBoundingClientRect().width+8;const offset=30*step+step/2-$("#roulette").clientWidth/2;track.style.transition="transform 4.5s cubic-bezier(.12,.76,.14,1)";track.style.transform="translateX(-"+Math.max(0,offset)+"px)";setTimeout(finish,4650)}));
}
function initHero(){
 const region=$("#hero-art"),canvas=$("#hero-canvas");
 if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 // WebGL is optional: the CSS fallback stays visible when Three.js or WebGL fails.
 import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js").then(THREE=>{
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.z=11;
 scene.add(new THREE.AmbientLight(0xe1e5eb,1.45));
 const key=new THREE.DirectionalLight(0xe3b87a,3.6);key.position.set(-2,3,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0x7c9dbd,2.7);fill.position.set(3,-3,3);scene.add(fill);
 const group=new THREE.Group();scene.add(group);
 const metal=new THREE.MeshStandardMaterial({color:0xb8c2c9,metalness:.9,roughness:.22,side:THREE.DoubleSide});
 const handle=new THREE.MeshStandardMaterial({color:0x222932,metalness:.4,roughness:.48});
 const gold=new THREE.MeshStandardMaterial({color:0xb9915d,metalness:.8,roughness:.3});
 const shape=new THREE.Shape();[[-3.6,.1],[-2.7,.5],[-.65,.52],[-.35,.25],[-.35,-.25],[-2.7,-.4]].forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
 group.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2}),metal));
 const grip=new THREE.Mesh(new THREE.BoxGeometry(2.65,.59,.3),handle);grip.position.x=1.05;group.add(grip);
 const guard=new THREE.Mesh(new THREE.BoxGeometry(.18,1,.38),gold);guard.position.x=-.31;group.add(guard);
 for(let i=0;i<6;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(.045,.61,.33),gold);line.position.x=.08+i*.36;group.add(line)}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.29,.08,10,30),gold);ring.position.x=2.57;group.add(ring);
 const pointer={x:0,y:0};region.addEventListener("pointermove",e=>{if(e.pointerType==="touch")return;const r=region.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5)*2;pointer.y=((e.clientY-r.top)/r.height-.5)*2});region.addEventListener("pointerleave",()=>{pointer.x=0;pointer.y=0});
 const resize=()=>{const r=region.getBoundingClientRect();if(r.width<1||r.height<1)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=r.width<430?14:11;camera.updateProjectionMatrix()};resize();
 const ro=new ResizeObserver(resize);ro.observe(region);region.classList.add("is-3d");
 let visible=true;const io=new IntersectionObserver(v=>visible=v[0].isIntersecting);io.observe(region);
 let last=0;function frame(time){requestAnimationFrame(frame);if(!visible||document.hidden||time-last<33)return;last=time;group.rotation.y+=(pointer.x*.34-group.rotation.y)*.055;group.rotation.x+=(-pointer.y*.2-group.rotation.x)*.055;group.rotation.z=-.18+Math.sin(time*.0006)*.045;renderer.render(scene,camera)}requestAnimationFrame(frame)
 }).catch(()=>{region.classList.remove("is-3d")});
}
function init(){renderMetrics();initMaps();initClips();initCommunity();initMenu();initDialog();renderCases();loadCases();$("#retry-catalog").addEventListener("click",loadCases);initHero();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
