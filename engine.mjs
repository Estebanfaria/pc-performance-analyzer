// Relative heuristic indexes. They are not measured benchmark results.
export const cpus=[['Ryzen 5 5600',1],['Ryzen 5 5600G',.82],['Ryzen 5 5500',.82],['Ryzen 5 7600',1.35],['Ryzen 7 5700X',1.2],['Ryzen 7 5800X',1.28],['Ryzen 7 7800X3D',1.85],['Ryzen 9 7950X',2],['Core i3-12100',.8],['Core i5-12400F',1.05],['Core i5-13400F',1.25],['Core i5-14400F',1.3],['Core i7-12700K',1.6],['Core i7-14700K',1.95],['Core i9-14900K',2.2]];
export const gpus=[['GTX 1650',.4,4],['GTX 1660 Super',.62,6],['RTX 2060',.72,6],['RTX 3060',1,12],['RTX 3060 Ti',1.3,8],['RTX 3070',1.45,8],['RTX 3080',1.85,10],['RTX 4060',1.15,8],['RTX 4060 Ti',1.4,8],['RTX 4070',1.95,12],['RTX 4070 Super',2.2,12],['RTX 4080',2.8,16],['RTX 4090',3.6,24],['RX 6600',.87,8],['RX 6650 XT',1.03,8],['RX 6700 XT',1.35,12],['RX 7600',1.08,8],['RX 7800 XT',2.05,16],['RX 7900 XTX',2.8,24],['Radeon integrada (5600G)',.16,0]];
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
export function detect(text){
 const find=list=>list.filter(([n])=>{const tokens=n.replace(/^Core /,'').match(/[a-z]+|\d+/gi);const pattern=tokens.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[ \\t-]*');return new RegExp('\\b'+pattern+'\\b','i').test(text);}).sort((a,b)=>b[0].length-a[0].length)[0]?.[0]||'';
 const lines=text.split(/\n/); const ramLines=lines.filter(l=>/ram|ddr[345]|memoria/i.test(l)); let ram=0;
 for(const line of ramLines){const kit=line.match(/(\d+)\s*[x×]\s*(\d+)\s*gb/i);const amount=line.match(/(\d+)\s*gb/i);if(kit)ram=Number(kit[1])*Number(kit[2]);else if(amount)ram=Number(amount[1]);if(ram)break;}
 const storageLine=lines.find(l=>/ssd|nvme|m\.2|hdd|disco/i.test(l))||'';
 const capacity=storageLine.match(/(\d+(?:[.,]\d+)?)\s*(tb|gb)/i);
 return {cpu:find(cpus),gpu:find(gpus),ram:ram||'',storage:/nvme|m\.2/i.test(storageLine)?'NVMe':/ssd/i.test(storageLine)?'SSD':/hdd|disco/i.test(storageLine)?'HDD':'',capacity:capacity?Math.round(Number(capacity[1].replace(',','.'))*(capacity[2].toLowerCase()==='tb'?1000:1)):''};
}
export function estimate(spec,resolution='1080p'){
 const cpu=cpus.find(x=>x[0]===spec.cpu),gpu=gpus.find(x=>x[0]===spec.gpu); const ram=Number(spec.ram);
 if(!cpu||!gpu||!Number.isFinite(ram)||ram<4||!['NVMe','SSD','HDD'].includes(spec.storage)||!(Number(spec.capacity)>0))return null;
 const r={'1080p':1,'1440p':.7,'4K':.4}[resolution]||1;const memory=Math.min(1,ram/16);const c=cpu[1],g=gpu[1];
 const gaming=[['Fortnite',95,220],['Rocket League',210,360],['Roblox',110,220],['EA Sports FC',130,240]].map(([name,base,cap])=>{const fps=Math.min(base*g*r,cap*c)*memory;return{name,min:Math.max(1,Math.round(fps*.75)),max:Math.max(2,Math.round(fps*1.15))};});
 const disk=spec.storage==='HDD'?.65:spec.storage==='SSD'?.92:1; const scores=[['Ofimática',Math.min(c,1.4)*Math.min(1,ram/8)*disk*85],['Multitarea',c*Math.min(1,ram/32)*disk*70],['Photoshop',c*.6+g*.4],['Premiere Pro',c*.45+g*.55],['After Effects',c*.8+g*.2],['DaVinci Resolve',c*.25+g*.75]].map(([name,x],i)=>({name,score:Math.max(5,Math.min(100,Math.round(i<2?x:x*55*Math.min(1,ram/(name==='After Effects'?64:32))*disk)))}));
 const warnings=[];if(ram<16)warnings.push('Menos de 16 GB de RAM: puede limitar juegos y multitarea.');if(ram<32)warnings.push('Para edición de video y proyectos creativos, conviene 32 GB o más.');if(spec.storage==='HDD')warnings.push('Un SSD mejora el inicio, la carga de aplicaciones y la respuesta general.');if(gpu[2]===0)warnings.push('La gráfica integrada comparte RAM: el doble canal influye mucho.');if(g/c>1.7)warnings.push('En juegos competitivos, el procesador puede limitar esta GPU.');
 return{gaming,productivity:scores,warnings};
}
export const rating=score=>score>=80?'Muy cómodo':score>=60?'Buen desempeño':score>=35?'Uso moderado':'Limitado';
export function makeBudget(spec,name='Mi presupuesto'){return{id:crypto.randomUUID(),name,spec:{...spec},createdAt:new Date().toISOString(),schemaVersion:1};}
