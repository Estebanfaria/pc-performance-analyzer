import {metadata,cpuRows,gpuRows,motherboardRows,memoryRows} from './catalog-data.mjs';
export {metadata};
const key=value=>String(value||'').replace(/[®™]/g,'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/wi[ -]?fi/g,'wifi').replace(/[^a-z0-9]/g,'');
export const canonicalCPU=name=>String(name).replace(/^(AMD|Intel)\s+/i,'').trim();
export const catalogCPUs=cpuRows.map(([name,cores,clock,boost,architecture,tdp,graphics])=>({name:canonicalCPU(name),cores,clock,boost,architecture,tdp,graphics}));
export const catalogGPUs=gpuRows.map(([name,chipset,vram])=>({name,chipset,vram}));
export const catalogBoards=motherboardRows.map(([name,socket,formFactor,maxMemory,memorySlots])=>({name,socket,formFactor,maxMemory,memorySlots}));
export const catalogMemory=memoryRows.map(([name,speed,modules,latency])=>({name,type:speed?.[0]?'DDR'+speed[0]:'',frequency:speed?.[1]||0,modules:modules?.[0]||0,moduleGB:modules?.[1]||0,capacity:(modules?.[0]||0)*(modules?.[1]||0),latency}));
const cpuIndex=new Map(catalogCPUs.map(p=>[key(p.name),p]));
const identities=catalogCPUs.map(p=>({p,key:key(p.name)})).sort((a,b)=>b.key.length-a.key.length);
export function lookupCPU(raw){const normalized=key(canonicalCPU(raw));return cpuIndex.get(normalized)||null;}
// Exact product identity embedded in a quotation; trailing numeric suffixes must
// not turn a different SKU (e.g. 265KF/265K or 5600G/5600) into an exact match.
export function matchCatalogCPU(raw){const normalized=key(canonicalCPU(raw));for(const {p,key:k}of identities){const index=normalized.indexOf(k);if(index<0)continue;const tail=normalized.slice(index+k.length);if(/^(?:x3d|xt|kf|ks|ge|[xgkfhtu]|\d)/i.test(tail))continue;return p;}return null;}
const boardIndex=catalogBoards.map(p=>({p,key:key(p.name),model:key(p.name.replace(/^(?:Asus|ASRock|MSI|Gigabyte|Biostar|NZXT|EVGA|Supermicro)\s+/i,''))})).sort((a,b)=>b.model.length-a.model.length);
export function matchMotherboard(raw){const normalized=key(raw);const brands=String(raw).match(/\b(?:Asus|ASRock|MSI|Gigabyte|Biostar|NZXT|EVGA|Supermicro)\b/gi)||[];const modelText=key(String(raw).replace(/\b(?:Asus|ASRock|MSI|Gigabyte|Biostar|NZXT|EVGA|Supermicro)\b/gi,''));const hits=boardIndex.filter(({p,key:k,model})=>(!brands.length||brands.some(b=>key(p.name).startsWith(key(b))))&&(normalized.includes(k)||(model.length>=8&&modelText.includes(model))));if(!hits.length)return null;const longest=hits[0].model.length;const candidates=hits.filter(x=>x.model.length===longest);const unique=new Map(candidates.map(x=>[key(x.p.name),x.p]));return unique.size===1?[...unique.values()][0]:null;}
const memoryIndex=catalogMemory.map(p=>({p,key:key(p.name)}));
export function matchMemory(raw,constraints={}){
 const normalized=key(raw);const hits=memoryIndex.filter(({p,key:k})=>k.length>=10&&normalized.includes(k)&&(!constraints.capacity||p.capacity===Number(constraints.capacity))&&(!constraints.type||p.type===constraints.type)&&(!constraints.frequency||p.frequency===Number(constraints.frequency))&&(!constraints.modules||p.modules===Number(constraints.modules))).map(x=>x.p);
 if(!hits.length)return null;const common={};for(const field of ['name','type','frequency','modules','capacity']){const values=new Set(hits.map(p=>p[field]));common[field]=values.size===1?[...values][0]:null;}
 return{...common,matches:hits.length};
}
const gpuIndex=catalogGPUs.map(p=>({p,key:key(p.name)})).sort((a,b)=>b.key.length-a.key.length);
export function matchCatalogGPU(raw){const normalized=key(raw);const hits=gpuIndex.filter(({key:k})=>k.length>=8&&normalized.includes(k));if(!hits.length)return null;const longest=hits[0].key.length;const candidates=hits.filter(x=>x.key.length===longest);const chips=new Set(candidates.map(x=>x.p.chipset));if(chips.size!==1)return null;const memory=new Set(candidates.map(x=>x.p.vram));return{...candidates[0].p,vram:memory.size===1?[...memory][0]:null};}
const chipsets=[...new Set(catalogGPUs.map(g=>g.chipset.replace(/\s+\d+GB$/i,'')))].map(name=>({name,key:key(name),short:key(name.replace(/^(GeForce|Radeon)\s+/i,''))})).sort((a,b)=>b.short.length-a.short.length);
export function matchChipset(raw){const normalized=key(raw);for(const chip of chipsets){if(chip.short.length<5)continue;const index=normalized.indexOf(chip.short);if(index<0)continue;const tail=normalized.slice(index+chip.short.length);if(/^(?:ti|super|xt)/.test(tail)||(/^\d/.test(tail)&&!/^\d{1,2}(?:gb|gddr|g)/.test(tail)))continue;return chip.name.replace(/^(GeForce|Radeon)\s+/i,'');}return '';}
