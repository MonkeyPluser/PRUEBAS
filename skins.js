(() => {
"use strict";
const API="https://api.skincash.gg/v1";
const FBACK=[
"AK-47 | Redline (Field-Tested)","AK-47 | Asiimov (Field-Tested)","AK-47 | Neon Rider (Field-Tested)",
"AWP | Asiimov (Field-Tested)","AWP | Atheris (Field-Tested)","AWP | Neo-Noir (Field-Tested)",
"M4A1-S | Printstream (Field-Tested)","M4A1-S | Player Two (Field-Tested)",
"M4A4 | Temukau (Field-Tested)","M4A4 | The Emperor (Field-Tested)",
"USP-S | Printstream (Field-Tested)","USP-S | Neo-Noir (Field-Tested)",
"Glock-18 | Vogue (Field-Tested)","Glock-18 | Bullet Queen (Field-Tested)",
"Desert Eagle | Printstream (Field-Tested)","Desert Eagle | Mecha Industries (Field-Tested)"
];
const $=id=>document.getElementById(id);
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
const isHttp=s=>{try{const u=new URL(s);return u.protocol==="https:"||u.protocol==="http:"}catch{return false}};
const isValidItem=name=>typeof name==="string"&&name.length<220&&name.includes("|")&&!/^(Sticker|Graffiti|Sealed Graffiti|Music Kit|Patch|Charm|Keychain)\s*\|/i.test(name);
const uri=name=>"https://steamcommunity.com/market/search?appid=730&q="+encodeURIComponent(name);
const currency=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});
const state={items:[],visible:40,search:"",weapon:"",sort:"low",updated:null,mode:"loading",imageMap:new Map()};
const clean=(value)=>String(value||"").toLocaleLowerCase("es-AR");
function getWeapon(name){const raw=name.split("|")[0].trim().replace(/^★\s*/,"");
if(/(knife|karambit|bayonet|daggers|falchion|talon|stiletto|kukri)/i.test(raw))return "Knife";
if(/(gloves|hand wraps)/i.test(raw))return "Gloves";return raw}
function unique(items){const byName=new Map();for(const item of items){if(!isValidItem(item.name))continue;const existing=byName.get(item.name);
if(!existing||((item.price??Infinity)<(existing.price??Infinity)))byName.set(item.name,item)}return [...byName.values()]}
async function loadJson(url,timeout=8500){const controller=new AbortController();const timeoutId=setTimeout(()=>controller.abort(),timeout);
try{const r=await fetch(url,{cache:"default",signal:controller.signal,headers:{"Accept":"application/json"}});if(!r.ok)throw Error("HTTP "+r.status);
return await r.json()}finally{clearTimeout(timeoutId)}}
function parsePrices(json){if(!json||!Array.isArray(json.items))throw Error("Lista de precios inválida");const list=[];
for(const p of json.items){if(!isValidItem(p?.market_hash_name))continue;
const value=Number(p.price);if(!Number.isFinite(value)||value<=0)continue;
list.push({name:p.market_hash_name,price:value,link:isHttp(p.item_page)?p.item_page:uri(p.market_hash_name),image:null})}
if(!list.length)throw Error("Sin artículos con precio válido");return unique(list)}
function parseCatalog(json){if(!json||!Array.isArray(json.items))throw Error("Catálogo inválido");
const map=new Map();for(const item of json.items){if(isValidItem(item?.market_hash_name)&&isHttp(item?.image))map.set(item.market_hash_name,item.image)}return map}
async function loadMarket(){
const status=$("feed-status"),grid=$("skin-grid"),refresh=$("refresh-prices");
refresh.disabled=true;status.textContent="Consultando precios y miniaturas…";
if(!state.items.length)grid.replaceChildren(node("div","market-loading","Cargando catálogo de skins…"));
const [priceRes,imageRes]=await Promise.allSettled([loadJson(API+"/prices",10000),loadJson(API+"/catalog",10000)]);
let prices=null,images=new Map();
if(priceRes.status==="fulfilled"){try{prices=parsePrices(priceRes.value);state.updated=priceRes.value.updated_at||null}catch(e){console.info("Precios incompletos",e)}}
if(imageRes.status==="fulfilled"){try{images=parseCatalog(imageRes.value)}catch(e){console.info("Miniaturas incompletas",e)}}
state.imageMap=images;
if(prices){state.items=prices.map(x=>({...x,image:images.get(x.name)||null}));state.mode="live";status.textContent="Precios publicados en SkinCash"+(state.updated?" · "+formatDate(state.updated):"")+" · USD"}
else{
 state.items=FBACK.map(name=>({name,price:null,link:uri(name),image:images.get(name)||null}));
 state.mode="offline";status.textContent="No se pudieron consultar precios actuales. Mostramos una selección sin valores; probá actualizar."}
state.visible=40;refresh.disabled=false;render()}
function formatDate(v){const d=new Date(v);return Number.isNaN(d.getTime())?"":d.toLocaleString("es-AR",{dateStyle:"short",timeStyle:"short"})}
function filter(){const q=clean(state.search).trim();let items=state.items.filter(x=>(!q||clean(x.name).includes(q))&&(!state.weapon||getWeapon(x.name)===state.weapon));
if(state.sort==="name")items.sort((a,b)=>a.name.localeCompare(b.name));
else if(state.sort==="high")items.sort((a,b)=>(b.price??-1)-(a.price??-1)||a.name.localeCompare(b.name));
else items.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity)||a.name.localeCompare(b.name));
return items}
function card(item){
const article=node("article","market-card");
const art=node("div","market-visual");
const fallback=node("div","fallback-icon","◇");fallback.setAttribute("aria-label","Imagen no disponible");
art.append(fallback);
if(item.image){const img=node("img");img.alt="Skin "+item.name;img.loading="lazy";img.decoding="async";img.width=260;img.height=170;
img.onerror=()=>img.remove();img.onload=()=>fallback.remove();img.src=item.image;art.append(img)}
const body=node("div","market-info");
body.append(node("h2","",item.name));
const price=node("div",item.price!==null?"market-price":"market-price not-available",item.price!==null?currency.format(item.price):"Precio no disponible");
const source=node("span","market-source",item.price!==null?"Mínimo publicado · SkinCash":"Consultar mercado para ver precios");
const a=node("a","market-action",item.price!==null?"Ver oferta ↗":"Consultar en Steam ↗");
a.href=item.link;a.target="_blank";a.rel="noopener noreferrer";
body.append(price,source,a);article.append(art,body);return article}
function render(){
const items=filter(),shown=items.slice(0,state.visible);
$("results-count").textContent=items.length.toLocaleString("es-AR")+" variantes encontradas"+(state.mode==="offline"?" · selección sin precios":"");
const grid=$("skin-grid");const frag=document.createDocumentFragment();for(const item of shown)frag.append(card(item));grid.replaceChildren(frag);
$("market-empty").hidden=items.length!==0;
const more=$("load-more");more.hidden=shown.length===items.length;more.textContent="Mostrar más ("+(items.length-shown.length).toLocaleString("es-AR")+")";
}
function init(){
$("skin-search").addEventListener("input",e=>{state.search=e.target.value;state.visible=40;render()});
$("weapon-filter").addEventListener("change",e=>{state.weapon=e.target.value;state.visible=40;render()});
$("sort-filter").addEventListener("change",e=>{state.sort=e.target.value;state.visible=40;render()});
$("clear-filters").addEventListener("click",()=>{$("skin-search").value="";$("weapon-filter").value="";state.search="";state.weapon="";state.visible=40;render()});
$("refresh-prices").addEventListener("click",loadMarket);
$("load-more").addEventListener("click",()=>{state.visible+=40;render()});
loadMarket();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();