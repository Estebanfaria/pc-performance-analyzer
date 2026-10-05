import {graphicsFor} from './analyzer.mjs';
import {normalizeText,identifyCPU,identifyGPU} from './hardware.mjs';
import {matchMotherboard,matchMemory,matchCatalogGPU} from './catalog.mjs';
const hardwareLabel=/\b(?:CPU|PROCESADOR|MICROPROCESADOR|MICRO|GPU|VGA|PLACA\s+(?:DE\s+)?VIDEO|MEMORIA|RAM|SSD|NVME|DISCO|MOTHERBOARD|MOTHER|PLACA\s+MADRE|FUENTE|PSU|GABINETE|CASE|COOLER|REFRIGERACION)\s*[:|]/gi;
export function segmentText(text){return String(text).replace(/\r/g,'').replace(hardwareLabel,'\n$&').split(/\n|\s*;\s*/).map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);}
const nonRAM=/\b(?:rtx|gtx|radeon|geforce|gpu|vga|mother|motherboard|placa madre|ssd|nvme|disco|almacenamiento)\b/i;
const ramContext=/\b(?:memoria|ram|ddr[345]|dimm|sodimm)\b/i;
const clean=s=>s.replace(/^\d+\s*[|]\s*/,'').replace(/\s+(?:\$|ARS\b|USD\b|precio\b|subtotal\b).*/i,'').trim();
export function parseBudget(text){
 const lines=segmentText(text),s={cpu:'',gpu:'',ram:'',ramType:'',ramFrequency:'',ramModules:'',gpuVram:'',storage:'',capacity:'',motherboard:'',psu:'',cooling:'',case:'',drives:[],evidence:{},candidates:{cpu:[],gpu:[]},issues:[]};
 const keep=(k,value,line)=>{if(!s[k]&&value){s[k]=value;s.evidence[k]=line;}};
 for(const line of lines){const n=normalizeText(line);const boardHint=/\bmother(?:board)?\b|placa madre|\b(?:[ABXZHW]\d{2,3})(?:[MIE]|[- ])\b/i.test(n)||/\b[ABXZHW]\d{2,3}\b/i.test(n);const catalogBoard=boardHint||/\b(?:Asus|ASRock|MSI|Gigabyte|Biostar|NZXT|EVGA|Supermicro)\b/i.test(n)?matchMotherboard(n):null;const board=boardHint||Boolean(catalogBoard);
  if(!board){const cpu=identifyCPU(n);if(cpu){s.candidates.cpu.push(cpu);keep('cpu',cpu,line);const threads=n.match(/\b(\d{1,3})\s*(?:hilos|threads)\b/i);if(threads)keep('cpuThreads',Number(threads[1]),line);}const gpu=identifyGPU(n);if(gpu){s.candidates.gpu.push(gpu);keep('gpu',gpu,line);const v=n.match(/\b(\d{1,2})\s*(?:GB|G)(?:\b|DDR)/i);if(v)keep('gpuVram',Number(v[1]),line);else{const retail=matchCatalogGPU(n);if(retail?.vram)keep('gpuVram',retail.vram,line);}}}
  if(board){keep('motherboard',catalogBoard?.name||clean(line),line);if(catalogBoard&&!s.motherboardDetails)s.motherboardDetails={...catalogBoard};}
  if(ramContext.test(n)&&!nonRAM.test(n)&&!board&&!/gddr/i.test(n)){
   const kit=n.match(/\b([1-8])\s*[x×]\s*(\d{1,3})\s*(?:gb)?\b/i);const capacity=n.match(/\b(\d{1,3})\s*g[b]?\b/i);const qty=n.match(/^\s*([1-8])\s*(?:[|]\s*)?(?:memoria|ram|ddr|kingston|corsair|g\.?skill|patriot|crucial|team)/i)||n.match(/(?:cantidad|cant\.?|qty)\s*[:=]?\s*([1-8])\b/i)||n.match(/\b([1-8])\s*(?:unidades|modulos)\b/i)||n.match(/\bx\s*([1-8])\b/i)||n.match(/\s([1-8])\s+(?=\$|ARS\b|USD\b)/i);
   const type=n.match(/\bDDR\s*([345])\b/i);if(type)keep('ramType','DDR'+type[1],line);const speed=n.match(/\b([1-9]\d{3})\s*(?:mhz|mt\/s|mts)\b/i)||n.match(/\bDDR\s*[345]\s*[- ]\s*([1-9]\d{3})\b/i);if(speed)keep('ramFrequency',Number(speed[1]),line);
   let amount=kit?Number(kit[1])*Number(kit[2]):capacity?Number(capacity[1])*(qty?Number(qty[1]):1):0;let modules=kit?Number(kit[1]):qty?Number(qty[1]):'';
   const catalogRAM=matchMemory(n,{capacity:kit?amount:capacity?Number(capacity[1]):null,type:type?'DDR'+type[1]:null,frequency:speed?Number(speed[1]):null,modules:kit?Number(kit[1]):null});
   if(catalogRAM){s.memoryDetails=catalogRAM;keep('ramType',catalogRAM.type,line);keep('ramFrequency',catalogRAM.frequency,line);if(!modules&&catalogRAM.modules)modules=catalogRAM.modules*(qty?Number(qty[1]):1);if(!amount&&catalogRAM.capacity)amount=catalogRAM.capacity*(qty?Number(qty[1]):1);}
   // Do not add repeated summaries/headers. Separate identical purchased rows are counted only with explicit quantities.
   if(amount>=4&&amount<=512){if(!s.ram){keep('ram',amount,line);s.ramModules=modules;}else if(line!==s.evidence.ram&&qty&&!kit){s.ram+=amount;s.ramModules=(Number(s.ramModules)||1)+Number(qty[1]);}s.evidence.ram=line;}
  }
  if(/\b(?:ssd|nvme|hdd|disco|solid|solido)\b|\bm\.2\b/i.test(n)&&!board&&!/\b(?:rtx|gtx|gpu)\b/i.test(n)){
   const cap=n.match(/\b(\d+(?:[.,]\d+)?)\s*(TB|GB|T)(?:\b|(?=\d))/i);const type=/nvme|pcie|pci-e/i.test(n)?'NVMe':/ssd|solid|solido/i.test(n)?'SSD':/hdd|mecanico|sata.*7200|disco duro/i.test(n)?'HDD':/m\.2/i.test(n)?'SSD':'';
   if(cap||type){const capacity=cap?Math.round(Number(cap[1].replace(',','.'))*(/^t/i.test(cap[2])?1000:1)):'';const d={name:clean(line),type,capacity};if(!s.drives.some(x=>x.name===d.name))s.drives.push(d);}
  }
  if(/\b(?:fuente|psu|power supply)\b/i.test(n))keep('psu',clean(line),line);
  if(/\b(?:cooler|refrigeracion|watercooling|aio|disipador)\b/i.test(n)&&!/\bgabinete\b/i.test(n))keep('cooling',clean(line),line);
  if(/\b(?:gabinete|case|chasis)\b/i.test(n))keep('case',clean(line),line);
 }
 for(const kind of ['cpu','gpu']){s.candidates[kind]=[...new Set(s.candidates[kind])];if(s.candidates[kind].length>1)s.issues.push(`Hay ${s.candidates[kind].length} opciones de ${kind.toUpperCase()} en el documento. Elegimos la primera: revisala antes de confirmar.`);}
 const primary=[...s.drives].sort((a,b)=>({NVMe:3,SSD:2,HDD:1}[b.type]||0)-({NVMe:3,SSD:2,HDD:1}[a.type]||0))[0];if(primary){s.storage=primary.type;s.capacity=primary.capacity;s.evidence.storage=primary.name;}
 if(!s.gpu&&/sin (?:placa|gpu)|video integrad|grafica integrad|graficos integrad/i.test(text)){s.gpu=graphicsFor(s);s.issues.push('Se indicó gráfica integrada; su rendimiento depende de la memoria y del procesador.');}
 return s;
}
export function detect(text){const s=parseBudget(text);return Object.fromEntries(['cpu','gpu','ram','storage','capacity'].map(k=>[k,s[k]]));}


