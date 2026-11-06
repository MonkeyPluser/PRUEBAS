/* Original procedural 3D scene for FranV6X.
 * Three.js pinned: r160. No Counter-Strike/Valve assets used.
 * Progressive enhancement: static CSS fallback remains until renderer succeeds.
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

export async function mountScene(config=window.V6X_CONFIG){
 const host=document.getElementById("hero-art"),canvas=document.getElementById("hero-canvas");
 if(!host||!canvas)return;
 const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const cores=navigator.hardwareConcurrency||4;
 const memory=navigator.deviceMemory||4;
 const saveData=navigator.connection?.saveData===true;
 if(reduced||saveData||cores<=2||memory<=2)return; // quality fallback, no heavy GPU
 if(!canvas.getContext("webgl2")&&!canvas.getContext("webgl"))return;
 let renderer,scene,camera,group,resizeObserver,observer,raf=0,visible=true,disposed=false;
 const geometry=[],materials=[],pointer={x:0,y:0},gyro={x:0,y:0};
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x0a1016,config?.sceneConcept==="archive"?.018:.035);
  camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,11.5);
  scene.add(new THREE.AmbientLight(0x9fabb7,.95));
  const archive=config?.sceneConcept==="archive";
  host.dataset.concept=archive?"archive":"industrial";
  const accent=new THREE.Color(config?.accent||"#D8A764"),blue=new THREE.Color(config?.secondary||"#68819B");
  const key=new THREE.DirectionalLight(accent,4.5);key.position.set(-4,4,6);scene.add(key);
  const rim=new THREE.DirectionalLight(blue,3.2);rim.position.set(3,-1,-4);scene.add(rim);
  const white=new THREE.PointLight(0xffffff,36,15);white.position.set(1,2,6);scene.add(white);
  const metal=new THREE.MeshStandardMaterial({color:0x30363b,roughness:.24,metalness:.93,side:THREE.DoubleSide});materials.push(metal);
  const bevel=new THREE.MeshStandardMaterial({color:accent,roughness:.27,metalness:.89});materials.push(bevel);
  const floorMaterial=new THREE.LineBasicMaterial({color:0x486176,transparent:true,opacity:.12});materials.push(floorMaterial);
  const atmospheric=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.045,depthWrite:false,side:THREE.DoubleSide});materials.push(atmospheric);
  group=new THREE.Group();scene.add(group);
  function glyph(shape,x){
   const geo=new THREE.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:true,bevelThickness:.055,bevelSize:.028,bevelSegments:2,curveSegments:12});
   geometry.push(geo);const mesh=new THREE.Mesh(geo,metal);mesh.position.set(x,-.95,0);group.add(mesh);
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo,28),new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.55}));geometry.push(edges.geometry);materials.push(edges.material);mesh.add(edges);
  }
  function polygon(points){const s=new THREE.Shape();points.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s}
  const V=polygon([[0,1.95],[.44,1.95],[.99,.58],[1.52,1.95],[1.94,1.95],[1.22,0],[.72,0]]);
  glyph(V,-2.69);
  // Hexagonal 6 with a real inset cutout, extruded from an original vector path.
  const six=polygon([[1.55,1.9],[.56,1.9],[.05,1.32],[0,.46],[.45,0],[1.49,0],[1.88,.4],[1.88,.96],[1.45,1.37],[.52,1.37],[.64,1.57],[1.45,1.57]]);
  const hole=new THREE.Path();hole.absellipse(.94,.68,.39,.31,0,Math.PI*2,true);six.holes.push(hole);glyph(six,-.61);
  // Crossing extruded strokes build a crisp industrial X, not a textured model.
  glyph(polygon([[0,1.95],[.52,1.95],[1.97,0],[1.43,0]]),1.43);
  glyph(polygon([[1.44,1.95],[1.96,1.95],[.52,0],[0,0]]),1.43);
  group.position.x=-.23;group.rotation.y=-.22;group.rotation.x=.08;

  const floor=new THREE.Group();scene.add(floor);floor.rotation.x=-Math.PI/2.7;floor.position.set(0,archive?-3.4:-2.4,-2.2);
  for(let i=-7;i<=7;i++){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i*.75,-7,0),new THREE.Vector3(i*.75,7,0)]);geometry.push(g);floor.add(new THREE.Line(g,floorMaterial))}
  for(let j=-7;j<=7;j++){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-7,j*.75,0),new THREE.Vector3(7,j*.75,0)]);geometry.push(g);floor.add(new THREE.Line(g,floorMaterial))}
  // Sparse architectural fins, deliberately abstract and not maps from CS2.
  for(let i=0;i<5;i++){const g=new THREE.BoxGeometry(.13,2+i*.17,.19);geometry.push(g);const m=new THREE.Mesh(g,atmospheric);m.position.set(-5+i*2.5,-.6,-3.9);scene.add(m)}
  const count=window.innerWidth<650?65:(archive?85:140),positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*13;positions[i*3+1]=(Math.random()-.5)*8;positions[i*3+2]=(Math.random()-.5)*7-2}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));geometry.push(dustGeo);
  const dustMat=new THREE.PointsMaterial({color:accent,size:.017,transparent:true,opacity:.42,depthWrite:false});materials.push(dustMat);
  const dust=new THREE.Points(dustGeo,dustMat);scene.add(dust);
  const glowGeo=new THREE.PlaneGeometry(7,5);geometry.push(glowGeo);
  const glowMat=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.027,depthWrite:false});materials.push(glowMat);
  const glow=new THREE.Mesh(glowGeo,glowMat);glow.position.z=-3;scene.add(glow);

  function size(){const b=host.getBoundingClientRect();if(b.width<1||b.height<1)return;renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.position.z=b.width<480?16:11.5;camera.updateProjectionMatrix()}
  size();resizeObserver=new ResizeObserver(size);resizeObserver.observe(host);
  observer=new IntersectionObserver(e=>visible=e[0]?.isIntersecting===true,{threshold:.01});observer.observe(host);
  const onMove=e=>{if(e.pointerType==="touch")return;const rect=host.getBoundingClientRect();pointer.x=(e.clientX-rect.left)/rect.width-.5;pointer.y=(e.clientY-rect.top)/rect.height-.5};
  const onLeave=()=>{pointer.x=0;pointer.y=0};
  host.addEventListener("pointermove",onMove);host.addEventListener("pointerleave",onLeave);
  const onOrientation=e=>{if(Number.isFinite(e.gamma)&&Number.isFinite(e.beta)){gyro.x=THREE.MathUtils.clamp(e.gamma/60,-.5,.5);gyro.y=THREE.MathUtils.clamp((e.beta-45)/90,-.4,.4)}};
  const gyroButton=document.getElementById("enable-gyro");
  if(config?.mobileGyroscope&&typeof DeviceOrientationEvent!=="undefined"&&gyroButton){
   gyroButton.hidden=false;
   gyroButton.addEventListener("click",async()=>{try{
    const permission=typeof DeviceOrientationEvent.requestPermission==="function"?await DeviceOrientationEvent.requestPermission():"granted";
    if(permission==="granted"){window.addEventListener("deviceorientation",onOrientation,{passive:true});gyroButton.hidden=true}
    else gyroButton.textContent="Movimiento no autorizado";
   }catch{gyroButton.textContent="Movimiento no disponible"}});
  }
  let prev=0;const start=performance.now();
  function frame(now){
   if(disposed)return;
   raf=requestAnimationFrame(frame);
   if(!visible||document.hidden||now-prev<(window.innerWidth<700?32:16))return;
   prev=now;const t=(now-start)*.001;
   const targetX=-pointer.y*.20+gyro.y*.16;
   const targetY=-.22+pointer.x*.40+gyro.x*.25;
   group.rotation.x=THREE.MathUtils.lerp(group.rotation.x,targetX,.035);
   group.rotation.y=THREE.MathUtils.lerp(group.rotation.y,targetY+Math.sin(t*.32)*.075,.035);
   group.position.y=Math.sin(t*.55)*.055;
   dust.rotation.y=t*.006;
   renderer.render(scene,camera);
  }
  renderer.render(scene,camera);host.classList.add("webgl-ready");raf=requestAnimationFrame(frame);
  const dispose=()=>{disposed=true;cancelAnimationFrame(raf);observer?.disconnect();resizeObserver?.disconnect();host.removeEventListener("pointermove",onMove);host.removeEventListener("pointerleave",onLeave);window.removeEventListener("deviceorientation",onOrientation);geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose()};
  window.addEventListener("pagehide",dispose,{once:true});
 }catch(error){
  console.warn("V6X 3D no disponible: se mantiene la imagen CSS.",error);
  host.classList.remove("webgl-ready");try{renderer?.dispose()}catch{}
 }
}
