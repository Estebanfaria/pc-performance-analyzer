import {resolveCPU,resolveGPU} from './hardware.mjs';
import {lookupCPU} from './catalog.mjs';
const cap=(n,a=0,b=10)=>Math.max(a,Math.min(b,n));
export const useLevel=n=>n===null?'Sin referencia':n>=9?'Excelente':n>=8?'Muy bueno':n>=7?'Bueno':n>=6?'Correcto':n>=5?'Limitado':'No recomendado';
export function graphicsFor(spec){
 if(spec.gpu?.trim())return spec.gpu;
 const graphics=lookupCPU(spec.cpu)?.graphics;
 if(!graphics||/none|no|false/i.test(String(graphics)))return 'Gráfica no informada';
 if(/780M/i.test(graphics)||/8700G/.test(spec.cpu))return 'Radeon 780M integrada';
 if(/5600G|5700G/.test(spec.cpu))return 'Radeon integrada (5600G)';
 return /Intel|Core/.test(spec.cpu)?'Intel UHD integrada':'Radeon integrada básica';
}
// Suitability index, not a benchmark. CPU/GPU reference capacity is normalized
// against workload targets; RAM, VRAM and disk impose explicit ceilings.
export function analyzeHardware(spec,gamingAnalysis){
 const cpu=resolveCPU(spec.cpu),gpu=resolveGPU(graphicsFor(spec),spec.gpuVram),catalog=lookupCPU(spec.cpu);
 const ram=Number(spec.ram),vram=Number(spec.gpuVram)||gpu?.vram||0,integrated=gpu?.vram===0;
 const single=cpu?.gaming||0,multi=single*(1+Math.log2(Math.max(1,(cpu?.cores||1)/6))*.25);
 const memoryPenalty=Number(spec.ramModules)===1?.95:1,frequency=Number(spec.ramFrequency)>0&&Number(spec.ramFrequency)<2666?.96:1;
 const speed=spec.storage==='NVMe'?10:spec.storage==='SSD'?8.5:spec.storage==='HDD'?3.5:null;
 const gpuPower=gpu?gpu.values[0]/61.5:null;
 const fit=(value,target)=>cap(10*value/(value+target*.22)),components={single,multi,gpuPower,ram,vram,speed};
 const tasks=[];
 function task(name,{cpuTarget=1.3,gpuTarget=1,ramTarget=32,vramTarget=0,weights={cpu:.4,gpu:.3,ram:.2,disk:.1},parallel=false,note='',max=10}={}){
  const inputs={cpu:cpu?fit((parallel?multi:single)*memoryPenalty*frequency,cpuTarget):null,gpu:gpuPower===null?null:fit(gpuPower,gpuTarget),ram:fit(ram,ramTarget),disk:speed};
  let score=null;const required=Object.entries(weights).filter(([,w])=>w>0);
  if(required.every(([key])=>inputs[key]!==null)){score=required.reduce((s,[key,w])=>s+inputs[key]*w,0);score=Math.min(score,max,ram<ramTarget?4+5*ram/ramTarget:10);if(vramTarget)score=Math.min(score,integrated?4.5:vram?4+6*Math.min(1,vram/vramTarget):7);score=Math.round(cap(score)*2)/2;}
  const missing=required.filter(([key])=>inputs[key]===null).map(([key])=>key==='disk'?'tipo de disco':key==='gpu'?'referencia de GPU':'referencia de CPU');
  const confidence=score===null||cpu?.method==='family'||gpu?.method==='family'||(vramTarget&&!vram&&!integrated)?'low':'medium';
  const result={name,score,level:useLevel(score),confidence,note,requirements:{cpuTarget,gpuTarget,ramTarget,vramTarget,weights,parallel},inputs,missing,method:'estimated-suitability'};tasks.push(result);return result;
 }
 const officeW={cpu:.45,ram:.35,disk:.2},devW={cpu:.5,ram:.35,disk:.15},creativeW={cpu:.4,gpu:.2,ram:.25,disk:.15},gpuW={cpu:.2,gpu:.5,ram:.2,disk:.1};
 const office=task('Oficina y navegación',{cpuTarget:.65,ramTarget:8,weights:officeW,note:'Word, Office, Excel habitual, videollamadas y sistemas administrativos. Planillas complejas tienen otra exigencia.'});
 const tabs=task('Multitarea y muchas pestañas',{cpuTarget:1,ramTarget:16,weights:officeW,note:'Apps y pestañas simultáneas; la cantidad y complejidad cambian el consumo de RAM.'});
 task('Photoshop',{cpuTarget:1.4,gpuTarget:.5,ramTarget:24,weights:creativeW,note:'Edición fotográfica moderada; documentos grandes y funciones de IA exigen más recursos.'});
 task('Illustrator',{cpuTarget:1.2,gpuTarget:.3,ramTarget:16,weights:creativeW,note:'Diseño vectorial moderado; archivos extensos requieren más memoria.'});
 task('Lightroom',{cpuTarget:1.5,gpuTarget:.8,ramTarget:32,weights:creativeW,note:'Revelado y catálogos; reducción de ruido por IA puede elevar la exigencia de GPU.'});
 task('Canva',{cpuTarget:.65,ramTarget:8,weights:officeW,note:'Trabajo web habitual; también depende de conexión y navegador.'});
 const video1080=task('Edición de video 1080p',{cpuTarget:1.2,gpuTarget:.65,ramTarget:16,vramTarget:4,weights:creativeW,note:'Timeline sencillo en Premiere, Resolve o CapCut. El codec puede exigir proxies.'});
 const video4K=task('Edición de video 4K',{cpuTarget:1.7,gpuTarget:1.8,ramTarget:32,vramTarget:8,weights:creativeW,note:'Timeline y efectos moderados; no garantiza fluidez con RAW, multicámara o codecs difíciles.'});
 task('Edición 6K/8K',{cpuTarget:2.7,gpuTarget:3.2,ramTarget:64,vramTarget:16,parallel:true,weights:creativeW,max:8.5,note:'Orientación conservadora. Usar proxies y verificar codec, efectos, disco y software; sin tiempos de exportación.'});
 task('Premiere Pro',{cpuTarget:1.7,gpuTarget:1.5,ramTarget:32,vramTarget:8,weights:creativeW,note:'Edición 4K moderada. Decode/encode dependen del codec, versión y hardware compatible.'});
 task('DaVinci Resolve',{cpuTarget:1.5,gpuTarget:2,ramTarget:32,vramTarget:8,weights:gpuW,note:'Color y efectos moderados. Noise reduction/Fusion y edición Free/Studio cambian las necesidades.'});
 task('CapCut Desktop',{cpuTarget:1.2,gpuTarget:.8,ramTarget:16,vramTarget:4,weights:creativeW,note:'Contenido 1080p habitual; efectos e IA pueden exigir más.'});
 const motion=task('After Effects / Motion Graphics',{cpuTarget:2.1,gpuTarget:1,ramTarget:64,vramTarget:8,parallel:true,weights:{cpu:.45,gpu:.1,ram:.35,disk:.1},note:'CPU, RAM y caché dominan preview, composiciones y render. 32 GB para proyectos moderados; 64 GB o más para trabajo pesado.'});
 task('AutoCAD 2D',{cpuTarget:1.2,ramTarget:16,weights:devW,note:'Dibujo 2D moderado. No representa nubes de puntos ni ensamblajes grandes.'});
 task('SketchUp / modelado 3D',{cpuTarget:1.5,gpuTarget:1,ramTarget:32,vramTarget:4,weights:creativeW,note:'Viewport y escenas moderadas; plugins y geometría cambian la carga.'});
 task('Revit',{cpuTarget:1.7,gpuTarget:.8,ramTarget:32,vramTarget:4,weights:creativeW,note:'BIM de tamaño moderado; modelos complejos pueden requerir 64 GB o más.'});
 task('Blender / 3ds Max — modelado',{cpuTarget:1.6,gpuTarget:1.2,ramTarget:32,vramTarget:8,weights:creativeW,note:'Modelado y viewport. Verificar drivers, versión y soporte del software.'});
 task('Lumion',{cpuTarget:1.5,gpuTarget:2.5,ramTarget:32,vramTarget:12,weights:gpuW,note:'Visualización moderada; ray tracing, grandes escenas y resolución elevan la demanda.'});
 const renderCPU=task('V-Ray / render CPU',{cpuTarget:3,ramTarget:64,parallel:true,weights:{cpu:.65,ram:.25,disk:.1},note:'Carga de CPU y memoria. El número de núcleos no equivale directamente a velocidad; no estimamos minutos.'});
 const renderGPU=task('Blender / V-Ray — render GPU',{cpuTarget:1.4,gpuTarget:2.5,ramTarget:32,vramTarget:12,weights:gpuW,note:'Índice orientativo de capacidad, no benchmark de render. Compatibilidad CUDA/OptiX/HIP/oneAPI depende del motor, GPU y versión.'});
 const web=task('VS Code / desarrollo web',{cpuTarget:1,ramTarget:16,weights:devW,note:'Editor, navegador y servidores locales habituales. Una GPU dedicada no es necesaria para este índice.'});
 task('Compilación',{cpuTarget:2.7,ramTarget:32,parallel:true,weights:{cpu:.65,ram:.2,disk:.15},note:'Proyectos moderados; lenguaje, paralelismo y tamaño del código cambian los tiempos.'});
 task('Docker / máquinas virtuales',{cpuTarget:2.2,ramTarget:64,parallel:true,weights:devW,note:'Varios contenedores o VMs. Verificar virtualización y reservar RAM para host e invitados.'});
 task('Android Studio',{cpuTarget:2,ramTarget:32,parallel:true,weights:devW,note:'IDE, emulador y compilación moderada; requiere virtualización compatible.'});
 const stream=task('OBS / streaming 1080p',{cpuTarget:1.3,gpuTarget:.8,ramTarget:16,weights:creativeW,note:'Preferir encoder por hardware compatible. No se verifican codecs, drivers ni conexión de subida.'});
 task('Streaming 1440p',{cpuTarget:1.7,gpuTarget:1.5,ramTarget:32,vramTarget:6,weights:creativeW,note:'Verificar encoder, bitrate, plataforma y conexión. No garantiza calidad a un bitrate concreto.'});
 task('Gaming + streaming',{cpuTarget:1.9,gpuTarget:2,ramTarget:32,vramTarget:8,weights:creativeW,note:'Juego y OBS comparten GPU/CPU. FPS y calidad dependen del encoder y del título.'});
 task('Grabación de pantalla / redes',{cpuTarget:.9,gpuTarget:.3,ramTarget:16,weights:creativeW,note:'Capturas y contenido ligero; un encoder compatible reduce carga de CPU.'});
 const ai=task('IA / cargas locales',{cpuTarget:1.4,gpuTarget:2.8,ramTarget:32,vramTarget:16,weights:{cpu:.1,gpu:.45,ram:.2,disk:.05},max:8.5,note:'VRAM y compatibilidad del entorno son decisivas. No garantiza ningún modelo, Stable Diffusion, tamaño de contexto ni tiempo de inferencia.'});
 // AI weights sum to .8; the remaining .2 explicitly evaluates memory on GPU.
 if(ai.score!==null){ai.inputs.vram=fit(vram,16);ai.requirements.weights.vram=.2;ai.score=Math.round(Math.min(ai.score+ai.inputs.vram*.2,integrated?4.5:vram?4+6*Math.min(1,vram/16):7,ram<32?4+5*ram/32:10,8.5)*2)/2;ai.level=useLevel(ai.score);}
 const gamingRows=(gamingAnalysis?.summary||[]).map(s=>({name:`Gaming ${s.resolution}`,score:s.center===null?null:Math.round(cap(s.center/12)*2)/2,level:s.level,confidence:'medium',note:'FPS modelados, resolución nativa. Para gaming AAA consultá los juegos y ajustes concretos.'}));
 if(gamingRows.length)gamingRows.push({...gamingRows[0],name:'Gaming competitivo',note:'Consultá CS2, Valorant y Rocket League abajo; CPU, doble canal y ajustes bajos influyen.'});
 function category(id,name,members,description){const selected=members.map(n=>typeof n==='string'?tasks.find(t=>t.name===n):n).filter(Boolean);const available=selected.filter(t=>t.score!==null);const score=available.length===selected.length&&available.length?Math.round(available.reduce((s,t)=>s+t.score,0)/available.length*2)/2:null;return{id,name,score,level:useLevel(score),confidence:score===null||selected.some(t=>t.confidence==='low')?'low':'medium',description,details:selected};}
 const categories=[category('office','Oficina y multitarea',[office,tabs],'Office, navegación, estudio y trabajo diario.'),category('gaming','Gaming',gamingRows,'Competitivo y AAA según juego, resolución y calidad.'),category('video','Edición de video',[video1080,video4K],'Timeline, preview, efectos y exportación.'),category('motion','After Effects / motion',[motion],'Composiciones, animaciones y preview.'),category('design','Diseño gráfico',['Photoshop','Illustrator','Lightroom','Canva'],'Fotografía, diseño vectorial y contenido visual.'),category('threeD','Arquitectura / 3D',['AutoCAD 2D','SketchUp / modelado 3D','Revit','Blender / 3ds Max — modelado','Lumion'],'Modelado, BIM y visualización; render separado.'),category('render','Renderizado 3D',[renderCPU,renderGPU],'Motores CPU y GPU con requisitos diferentes.'),category('development','Programación',[web,'Compilación','Docker / máquinas virtuales','Android Studio'],'Desarrollo web, apps, compilación y entornos locales.'),category('stream','Streaming / contenido',[stream,'Streaming 1440p','Gaming + streaming','Grabación de pantalla / redes'],'OBS, grabación y edición de contenido.'),category('ai','IA / cargas locales',[ai],'Capacidad orientativa; verificar entorno y modelos.')];
 categories.find(c=>c.id==='video').details.push(...tasks.filter(t=>['Edición 6K/8K','Premiere Pro','DaVinci Resolve','CapCut Desktop'].includes(t.name)));
 const strengths=[],limitations=[],upgrades=[];if(office.score>=8)strengths.push('Buen margen para Office, navegación y trabajo diario.');if(video4K.score>=8)strengths.push('Buen margen estimado para edición 4K moderada.');if(ram>=32)strengths.push(`${ram} GB de RAM dan margen para multitarea y proyectos creativos.`);if(!integrated&&vram>=12)strengths.push(`${vram} GB de VRAM amplían el margen para escenas y texturas.`);if(spec.storage==='NVMe')strengths.push('NVMe favorece cargas y cachés; velocidad real depende del modelo.');
 if(ram<32){limitations.push(`${ram} GB pueden limitar edición 4K y composiciones pesadas; 32 GB es una base más cómoda.`);upgrades.push({current:`${ram} GB RAM`,recommended:'32 GB RAM',benefit:'Más margen para multitarea pesada y edición 4K. Para After Effects pesado, evaluar 64 GB.',scope:'Si vas a editar o usar varias aplicaciones exigentes.'});}else if(ram<64)limitations.push('After Effects pesado y varias máquinas virtuales pueden necesitar 64 GB o más.');
 if(integrated)limitations.push('Gráfica integrada: menor margen para AAA, render GPU e IA; comparte la RAM del sistema.');if(!gpu)limitations.push('GPU sin referencia: no asignamos puntuaciones gráficas ni inventamos FPS.');if(graphicsFor(spec)==='Gráfica no informada')limitations.push('No se confirmó video integrado ni una GPU. Verificá una salida de video funcional, especialmente en procesadores F/KF.');if(!cpu)limitations.push('CPU sin referencia: faltan datos comparables para puntuar.');if(!spec.storage)limitations.push('Falta el tipo de disco; los índices que dependen de él quedan sin referencia.');
 if(spec.storage==='HDD'){limitations.push('HDD limita respuesta y cachés de trabajo.');upgrades.push({current:'HDD',recommended:'SSD para sistema y proyectos activos',benefit:'Mejores cargas y respuesta en aplicaciones.',scope:'Trabajo diario y edición.'});}
 if(Number(spec.capacity)>0&&Number(spec.capacity)<=500)limitations.push(`${spec.capacity} GB pueden quedar cortos para juegos y material de video.`);
 if(!integrated&&vram>0&&vram<8)limitations.push('VRAM reducida para edición 4K con efectos, texturas grandes y gaming exigente.');
 const cpuLimit=!!cpu&&gpuPower!==null&&!integrated&&gpuPower>single*1.6;if(cpuLimit)limitations.push('Posible límite de CPU en gaming competitivo: una GPU de mayor capacidad no garantiza más FPS.');if(Number(spec.ramModules)===1)limitations.push('Un solo módulo puede reducir ancho de banda; confirmar canales y compatibilidad de motherboard.');
 const ideal=[];if(office.score>=7)ideal.push('Oficina, estudio y navegación');if(web.score>=7)ideal.push('Desarrollo web');else if(web.score>=6)ideal.push('Desarrollo web básico');if(video4K.score>=8)ideal.push('Edición 4K moderada');else if(video1080.score>=7)ideal.push('Edición 1080p');if(categories.find(c=>c.id==='design').score>=8)ideal.push('Diseño gráfico');if(gamingAnalysis?.summary?.[1]?.center>=80&&!integrated)ideal.push('Gaming 1440p');else if(gamingAnalysis?.summary?.[0]?.center>=55)ideal.push('Gaming 1080p');if(stream.score>=8)ideal.push('Streaming 1080p con encoder compatible');
 const profile=integrated?'PC office / general':ram>=64&&multi>=2&&gpuPower>=1.8?'Workstation':gpuPower>=.8?'PC gamer / creación':'PC general';
 const priority=profile.startsWith('PC office')?['office','development','design','video','motion','stream','gaming']:profile==='Workstation'?['video','motion','threeD','render','ai','development','office']:['gaming','video','design','office','development','stream','threeD'];
 const ordered=priority.map(id=>categories.find(c=>c.id===id));
 const idealPriority=profile.startsWith('PC office')?['Oficina','Desarrollo']:profile==='Workstation'?['Edición','Diseño','Gaming','Streaming','Desarrollo']:['Gaming','Edición','Streaming','Diseño','Desarrollo','Oficina'];ideal.sort((a,b)=>idealPriority.findIndex(p=>a.startsWith(p))-idealPriority.findIndex(p=>b.startsWith(p)));const conclusion=ideal.length?`${profile}. Recomendada para ${ideal.slice(0,4).join(', ')}. ${cpuLimit?'Revisá el equilibrio CPU/GPU en juegos competitivos.':ram<32?'Para trabajo creativo pesado, ampliar RAM puede dar más margen.':'La fluidez en tareas profesionales depende del proyecto y del software.'}`:'Faltan referencias o recursos para recomendar usos exigentes. Revisá los datos y los requisitos de cada aplicación.';
 return{schemaVersion:3,categories,tasks,ordered,profile,ideal,strengths,limitations,upgrades,conclusion,balance:cpuLimit?'Posible limitación de CPU en gaming competitivo':integrated?'Adecuada para usos sin GPU dedicada; revisar tareas gráficas':ram<32?'RAM a revisar para trabajo creativo pesado':!cpu||!gpu||!speed?'Faltan datos para evaluar el equilibrio completo':'Sin desajustes prioritarios detectados para usos moderados',confidence:categories.some(c=>c.confidence==='low')?'low':'medium',facts:{cores:catalog?.cores||cpu?.cores||null,threads:Number(spec.cpuThreads)>0?Number(spec.cpuThreads):null,architecture:catalog?.architecture||cpu?.architecture||null,graphics:catalog?.graphics||null,ramType:spec.ramType||null,ramFrequency:Number(spec.ramFrequency)||null,vram:vram||null},components,method:'estimated-suitability'};
}



