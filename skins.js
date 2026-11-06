(()=>{"use strict";
const $=id=>document.getElementById(id);
const SOURCE="https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json";
const SOURCE_BACKUP="https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/skins.json";
const SKINPORT="https://api.skinport.com/v1/items?app_id=730&currency=USD&tradable=0";
const MARKETPLACES=[{name:"CSFloat",url:"https://csfloat.com/"},{name:"Skinport",url:"https://skinport.com/es/"},{name:"DMarket",url:"https://dmarket.com/es"}];
const fallback=[
{name:"AK-47 | Redline",image:null},{name:"AWP | Asiimov",image:null},{name:"M4A1-S | Printstream",image:null},
{name:"AK-47 | Inheritance",image:null},{name:"Desert Eagle | Printstream",image:null},{name:"USP-S | Kill Confirmed",image:null}
];
const state={catalog:[],offers:new Map(),mode:"loading",limit:48,query:"",weapon:"",sort:"name",selected:null,updated:null,token:0};
const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v);
const mk=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const okayUrl=s=>{try{const u=new URL(s);return u.protocol==="https:"}catch{return false}};
const clean=s=>String(s||"").toLocaleLowerCase("es-AR");
function assetUrl(src){if(!okayUrl(src))return null;return src}
function altSource(url){if(typeof url!=="string")return null;const p="https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/";return url.startsWith(p)?"https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/"+url.slice(p.length):null}
function preview(item){const stage=mk("div","market-visual");const fallbackBox=mk("div","fallback-icon","◇");fallbackBox.setAttribute("aria-label","Vista previa no disponible");stage.append(fallbackBox);
 const url=assetUrl(item.image);if(url){const img=mk("img");img.alt="Imagen de "+item.name;img.loading="lazy";img.decoding="async";img.width=280;img.height=180;let retried=false;
 img.onload=()=>fallbackBox.remove();img.onerror=()=>{if(!retried){const backup=altSource(url);if(backup){retried=true;img.src=backup;return}}img.remove()};img.src=url;stage.append(img)}return stage}
function normalizeSkins(data){if(!Array.isArray(data))throw Error("Catálogo no disponible");const map=new Map();
for(const x of data){if(!x||typeof x.name!=="string"||!x.name.includes("|")||x.name.length>180)continue;if(!/^(?:[★ ]*)?(?:AK-47|AWP|M4A1-S|M4A4|USP-S|Glock-18|Desert Eagle|FAMAS|Galil AR|MAC-10|MP9|MP7|UMP-45|P90|P250|Five-SeveN|Tec-9|SSG 08|AUG|SG 553|G3SG1|SCAR-20|Nova|XM1014|Sawed-Off|MAG-7|Negev|M249|CZ75-Auto|Dual Berettas|R8 Revolver|PP-Bizon|Zeus x27|Knife|Karambit|Bayonet|Gloves|Hand Wraps|Butterfly Knife|Talon Knife|Skeleton Knife|Kukri Knife|Falchion Knife|Huntsman Knife|Stiletto Knife|Gut Knife|Flip Knife|Shadow Daggers|Navaja Knife|Ursus Knife|Bowie Knife|Paracord Knife|Survival Knife|Classic Knife|Nomad Knife)\s*\|/i.test(x.name))continue;
 const img=assetUrl(x.image);const existing=map.get(x.name);if(!existing||(!existing.image&&img))map.set(x.name,{name:x.name,image:img})}
 if(map.size<50)throw Error("No se recibieron suficientes skins");const images=new Map();const base=name=>name.replace(/\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)$/,"").replace(/^(StatTrak™|Souvenir)\s+/,"");for(const x of map.values())if(x.image&&!images.has(base(x.name)))images.set(base(x.name),x.image);for(const x of map.values())if(!x.image)x.image=images.get(base(x.name))||null;return [...map.values()]}
async function fetchJson(url,ms){const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(url,{signal:ac.signal,cache:"force-cache"});if(!r.ok)throw Error("HTTP "+r.status);return await r.json()}finally{clearTimeout(timer)}}
function parseSkinport(data){if(!Array.isArray(data))throw Error("Formato incorrecto");const result=new Map();
for(const v of data){if(!v||typeof v.market_hash_name!=="string"||!v.market_hash_name.includes("|"))continue;
const price=v.min_price;if(typeof price!=="number"||!Number.isFinite(price)||price<=0||v.quantity<1)continue;
const root=v.market_hash_name.replace(/\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)$/,"").replace(/^(StatTrak™|Souvenir)\s+/,"");
const old=result.get(root);if(!old||price<old.price)result.set(root,{price,variant:v.market_hash_name,link:okayUrl(v.item_page)?v.item_page:"https://skinport.com/",count:v.quantity,source:"Skinport"})}return result}
async function load(){
 const gen=++state.token;const status=$("feed-status");status.textContent="Cargando imágenes del catálogo de CS2…";$("refresh-prices").disabled=true;
 try{let raw;try{raw=await fetchJson(SOURCE,15000)}catch{raw=await fetchJson(SOURCE_BACKUP,15000)}
 if(gen!==state.token)return;state.catalog=normalizeSkins(raw);state.mode="catalog";status.textContent="Imágenes de CS2 cargadas · Consultando precios permitidos";render()
 }catch(e){if(gen!==state.token)return;state.catalog=fallback;state.mode="offline";status.textContent="El catálogo de imágenes no respondió. Mostramos una selección de respaldo.";render()}
 try{const prices=parseSkinport(await fetchJson(SKINPORT,11000));if(gen!==state.token)return;state.offers=prices;state.updated=new Date();state.mode="priced";status.textContent="Catálogo cargado · precios disponibles de Skinport en USD (cuando hay stock)"}catch(e){if(gen!==state.token)return;state.offers=new Map();status.textContent="Imágenes cargadas. Cotizaciones automáticas no disponibles: consultá cada mercado directamente."}
 $("refresh-prices").disabled=false;render()
}
function visibleRows(){const q=clean(state.query).trim();const result=state.catalog.filter(x=>(!q||clean(x.name).includes(q))&&(!state.weapon||x.name.replace(/^★\s*/,"").startsWith(state.weapon+" |")||(state.weapon==="Knife"&&/knife|karambit|bayonet|daggers/i.test(x.name))||(state.weapon==="Gloves"&&/gloves|hand wraps/i.test(x.name))));
result.sort((a,b)=>{const pa=state.offers.get(a.name)?.price,pb=state.offers.get(b.name)?.price;
if(state.sort==="low"||state.sort==="high"){const A=pa??(state.sort==="low"?Infinity:-Infinity),B=pb??(state.sort==="low"?Infinity:-Infinity);return state.sort==="low"?A-B||a.name.localeCompare(b.name):B-A||a.name.localeCompare(b.name)}return a.name.localeCompare(b.name)});return result}
function skinCard(x){const card=mk("article","market-card");card.append(preview(x));const body=mk("div","market-info"),quote=state.offers.get(x.name);body.append(mk("h2","",x.name));
body.append(mk("div",quote?"market-price":"market-price not-available",quote?"Desde "+money(quote.price):"Consultar precio"));
body.append(mk("span","market-source",quote?"Skinport · "+quote.variant.match(/\(([^)]+)\)/)?.[1]||"Skinport · stock verificado":"Sin cotización automática verificada"));
const btn=mk("button","market-action market-compare","Comparar mercados");btn.type="button";btn.addEventListener("click",()=>compare(x));body.append(btn);card.append(body);return card}
function render(){const rows=visibleRows(),shown=rows.slice(0,state.limit),root=$("skin-grid"),frag=document.createDocumentFragment();
for(const x of shown)frag.append(skinCard(x));root.replaceChildren(frag);
$("results-count").textContent=rows.length.toLocaleString("es-AR")+" skins · "+state.offers.size.toLocaleString("es-AR")+" acabados con precio de referencia";
$("market-empty").hidden=rows.length>0;const next=$("load-more");next.hidden=shown.length>=rows.length;next.textContent="Mostrar más ("+(rows.length-shown.length).toLocaleString("es-AR")+")"}
function compare(x){state.selected=x;const dialog=$("market-dialog"),list=$("market-offers"),quote=state.offers.get(x.name);$("market-dialog-title").textContent=x.name;$("market-dialog-context").textContent="Precios mínimos publicados únicamente cuando hay datos verificados; cada botón abre el sitio correspondiente.";list.replaceChildren();
for(const provider of MARKETPLACES){const row=mk("div","offer-row");row.append(mk("strong","",provider.name));
const q=provider.name==="Skinport"?quote:null;const display=mk("span",q?"verified-quote":"missing-quote",q?money(q.price):"Consultar");row.append(display);
const a=mk("a","btn btn-ghost",q?"Ver oferta ↗":"Abrir mercado ↗");a.href=q?q.link:(provider.search?provider.url+encodeURIComponent(x.name):provider.url);a.target="_blank";a.rel="noopener noreferrer";row.append(a);list.append(row)}
dialog.showModal();document.body.classList.add("modal-open");$("market-dialog-close").focus()}
function init(){const providerBar=$("market-providers");for(const p of MARKETPLACES){const b=mk("span","provider-chip",p.name);providerBar.append(b)}
$("skin-search").addEventListener("input",e=>{state.query=e.target.value;state.limit=48;render()});
$("weapon-filter").addEventListener("change",e=>{state.weapon=e.target.value;state.limit=48;render()});
$("sort-filter").value="name";$("sort-filter").addEventListener("change",e=>{state.sort=e.target.value;state.limit=48;render()});
$("refresh-prices").addEventListener("click",load);
$("load-more").addEventListener("click",()=>{state.limit+=48;render()});
$("clear-filters").addEventListener("click",()=>{state.query="";state.weapon="";state.limit=48;$("skin-search").value="";$("weapon-filter").value="";render()});
const dlg=$("market-dialog");$("market-dialog-close").addEventListener("click",()=>dlg.close());dlg.addEventListener("close",()=>document.body.classList.remove("modal-open"));dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
load()
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();