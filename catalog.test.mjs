import test from 'node:test';import assert from 'node:assert/strict';
import {metadata,catalogCPUs,catalogGPUs,catalogBoards,catalogMemory,lookupCPU,matchMotherboard,matchMemory} from './catalog.mjs';
import {identifyCPU,identifyGPU,resolveCPU,resolveGPU} from './hardware.mjs';
import {parseBudget,estimate} from './engine.mjs';
test('pinned catalog contains all four downloaded categories and provenance',()=>{
 assert.equal(catalogCPUs.length,1413);assert.equal(catalogGPUs.length,6636);assert.equal(catalogBoards.length,4973);assert.equal(catalogMemory.length,13553);
 assert.equal(metadata.revision,'c52a04ca9465c83997ed335f7767b09a2005dd26');for(const hash of Object.values(metadata.sha256))assert.match(hash,/^[a-f0-9]{64}$/);
});
test('CPU catalog preserves exact identities and technical specifications',()=>{
 const cpu=lookupCPU('Intel Core Ultra 7 265KF');assert.equal(cpu.cores,20);assert.equal(cpu.architecture,'Arrow Lake');assert.equal(cpu.graphics,null);
 for(const name of ['Core Ultra 5 245KF','Core Ultra 7 265','Core i7-13700F','Core i5-12600KF','Ryzen 9 5950X','Ryzen 7 3700X','Ryzen 5 3600XT','Ryzen 5 2600','Core i7-4790K']){
  const cpu=resolveCPU(name);assert.ok(cpu,`${name} needs a reference`);assert.equal(cpu.name,name);assert.ok(cpu.gaming>0);assert.ok(cpu.cores>=4);
  const result=estimate({cpu:name,gpu:'RTX 5070 Ti',gpuVram:16,ram:32});assert.ok(result.gaming.every(g=>Object.values(g.values).every(v=>v?.min>0)));
 }
});
test('all desktop Core Ultra entries in snapshot resolve without blank FPS',()=>{
 const names=[...new Set(catalogCPUs.filter(c=>/^Core Ultra /.test(c.name)).map(c=>c.name))];assert.ok(names.length>=10);
 for(const name of names)assert.ok(resolveCPU(name),name);
});
test('every Ryzen and desktop Core generation 8–14 in snapshot gets a reference',()=>{
 const products=catalogCPUs.filter(p=>/^Ryzen [3579] /.test(p.name)||/^Core i[3579]-(?:8|9)\d{3}(?:[A-Z]*)$/.test(p.name)||/^Core i[3579]-1[0-4]\d{3}(?:[A-Z]*)$/.test(p.name));
 assert.ok(products.length>150);for(const p of products){assert.equal(identifyCPU(p.name),p.name);const resolved=resolveCPU(p.name);assert.ok(resolved,p.name);assert.ok(Number.isFinite(resolved.gaming)&&resolved.gaming>0,p.name);}
});
test('registered trademarks cannot prevent CPU recognition',()=>{
 assert.equal(identifyCPU('Intel® Core™ Ultra 7 265KF'),'Core Ultra 7 265KF');
});
test('commercial GPU aliases resolve both modern and older gaming hardware',()=>{
 for(const [raw,name]of [['MSI GeForce RTX 5070 Ti 16G GAMING TRIO OC','RTX 5070 Ti'],['GPU NVIDIA GeForce GT 1030 2GB','GT 1030'],['Sapphire Radeon RX 6800 XT 16GB','RX 6800 XT'],['Intel Arc A770 16GB','Arc A770'],['GTX980TI','GTX 980 Ti']]){assert.equal(identifyGPU(raw),name);assert.ok(resolveGPU(raw));}
 assert.equal(resolveGPU('RTX 6090'),null);
});
test('motherboard identification brings socket and capacity without becoming system RAM',()=>{
 const board=matchMotherboard('Mother B650 GAMING MSI PLUS WIFI');assert.equal(board.name,'MSI B650 GAMING PLUS WIFI');assert.equal(board.socket,'AM5');
 const spec=parseBudget('MSI B650 GAMING PLUS WIFI DDR5 hasta 192GB\nMemoria Corsair Vengeance RGB 32 GB DDR5 6000MHz\nCPU Ryzen 7 9700X\nGPU RTX5070Ti 16GB');assert.equal(spec.ram,32);assert.equal(spec.motherboardDetails.socket,'AM5');
 assert.equal(matchMotherboard('Mother ASUS B650 no especificado'),null);
});
test('ambiguous memory products never invent kit or clock',()=>{
 const raw='Corsair Vengeance RGB 32 GB';const matches=catalogMemory.filter(p=>p.name===raw);assert.ok(matches.length>1);
 const found=matchMemory(raw);assert.equal(found.capacity,32);for(const field of ['type','frequency','modules']){const unique=new Set(matches.map(p=>p[field]));assert.equal(found[field],unique.size===1?[...unique][0]:null);}
 const explicit=matchMemory(raw+' DDR5 6000',{capacity:32,type:'DDR5',frequency:6000});assert.equal(explicit.type,'DDR5');assert.equal(explicit.frequency,6000);
 const spec=parseBudget('Memoria '+raw+' DDR5 6000MHz');assert.equal(spec.ram,32);assert.equal(spec.ramType,'DDR5');assert.equal(spec.ramFrequency,6000);
});
test('future and mobile CPU identities cannot use a random desktop catalog profile',()=>{
 assert.equal(resolveCPU('Core Ultra 7 999KF'),null);assert.equal(resolveCPU('Core i7-14700HX'),null);assert.equal(resolveCPU('Ryzen 7 10900X'),null);
});
test('a professional Quadro RTX is not mistaken for a gaming RTX generation',()=>{
 assert.equal(identifyGPU('NVIDIA Quadro RTX 4000 8GB'),'Quadro RTX 4000');assert.equal(resolveGPU('NVIDIA Quadro RTX 4000 8GB'),null);
 assert.equal(identifyCPU('CPU AMD Ryzen 5 PRO 4650G 3.7GHz'),'Ryzen 5 PRO 4650G');assert.ok(resolveCPU('Ryzen 5 PRO 4650G'));
});
