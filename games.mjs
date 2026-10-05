/** Reusable local vector identities, not official third-party logos. */
const shapes={fortnite:'<path d="M12 31V13l6-5 5 5 6-5 7 5v18h-8v-7h-8v7z"/>',warzone:'<circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="3"/><path d="M22 4h4v12h-4zm0 28h4v12h-4zM4 22h12v4H4zm28 0h12v4H32z"/>',rocket:'<path d="M16 29c0-12 8-20 19-22 0 11-6 23-18 25zM15 25l-8 4 4-13 11-3zM23 33l-3 8 12-7 2-10z"/><circle cx="28" cy="17" r="3" fill="white"/>',fc:'<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 15l9 7-4 11H18l-4-11z"/>',gta:'<path d="M9 12h9l6 18 6-18h9L28 38h-8z"/>',cs2:'<path d="M8 19h26v8H20v12h-8V27H8zM32 17h9v5h-9z"/>',valorant:'<path d="M7 10l17 20 17-20v17L24 42 7 27z"/>',minecraft:'<path d="M7 15l17-9 17 9-17 10zM7 19l15 9v15L7 34zm19 9l15-9v15l-15 9z"/>',roblox:'<path d="M12 3l33 9-9 33-33-9zm7 15l-3 12 12 3 3-12z" fill-rule="evenodd"/>'};
export const GAMES=[
 {id:'fortnite',name:'Fortnite',multiplier:1.35,cpuCap:180,color:'#7562d8',note:'DX12, sin Lumen/Nanite; Low aproxima raster competitivo.'},
 {id:'warzone',name:'Warzone',multiplier:1.2,cpuCap:145,color:'#497264',note:'Mapa, temporada y jugadores influyen mucho.'},
 {id:'rocket',name:'Rocket League',multiplier:4,cpuCap:330,color:'#1685be',note:'Partido estándar, sin límite de FPS.'},
 {id:'fc',name:'EA Sports FC',multiplier:2.6,cpuCap:250,color:'#1b8c72',note:'Carga representativa de la serie; puede variar por edición.'},
 {id:'gta',name:'GTA V',multiplier:2.1,cpuCap:160,color:'#638454',note:'Legacy; MSAA y gráficos avanzados desactivados.'},
 {id:'cs2',name:'Counter-Strike 2',multiplier:3.2,cpuCap:280,color:'#b07b32',note:'Humo, mapa y procesador cambian el resultado.'},
 {id:'valorant',name:'Valorant',multiplier:5.5,cpuCap:390,color:'#d64b60',note:'Límite de FPS desactivado; suele dominar el procesador.'},
 {id:'minecraft',name:'Minecraft',multiplier:3.7,cpuCap:260,color:'#58965b',note:'Java, sin shaders/mods, 12 chunks; mundos complejos reducen FPS.'},
 {id:'roblox',name:'Roblox',multiplier:2.8,cpuCap:190,color:'#5c6478',note:'Experiencia moderada; no predice todos los mapas ni sus límites.'}
].map(g=>({...g,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 48 48" color="${g.color}"><rect width="48" height="48" rx="12" fill="${g.color}18"/><g fill="currentColor">${shapes[g.id]}</g></svg>`}));
export const iconURL=game=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(game.svg);
export async function loadIcons(){const tasks=GAMES.map(g=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve([g.id,image]);image.onerror=()=>resolve([g.id,null]);image.src=iconURL(g);}));return new Map(await Promise.all(tasks));}
