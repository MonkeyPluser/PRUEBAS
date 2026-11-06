/* FranV6X preview configuration. Public client-side values only, never secrets.
 * Swap sceneConcept between "industrial" and "archive" without editing 3D code.
 */
window.V6X_CONFIG=Object.freeze({
  sceneConcept:"industrial",
  accent:"#D8A764",
  secondary:"#68819B",
  mobileGyroscope:true,
  statsSource:"local",
  server:{
    name:"Servidor V6X",
    state:"coming_soon", // coming_soon | online | offline
    region:"Argentina / Sudamérica",
    mode:"Comunidad CS2",
    rules:["Sin trampas ni exploits","Respeto entre jugadores","Moderación comunitaria"],
    ip:null, // TODO: IP pública del servidor
    port:27015,
    // GitHub Pages cannot query a Source server over UDP.
    // Option A: read-only Cloudflare Worker proxy with a server-query service.
    // Option B: scheduled GitHub Action creates a public status JSON (not real-time).
    statusApi:{enabled:false,url:null,timeoutMs:4500}
  }
});