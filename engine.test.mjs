import test from 'node:test';import assert from 'node:assert/strict';import {detect,estimate,makeBudget} from './engine.mjs';
const s={cpu:'Ryzen 5 5600',gpu:'RTX 3060',ram:16,storage:'NVMe',capacity:1000};
test('detects a multiline quotation and RAM kit without using GPU VRAM',()=>{assert.deepEqual(detect('CPU AMD Ryzen 5 5600\nGPU NVIDIA RTX 3060 12GB\nMemoria DDR4 2 x 8 GB\nSSD M.2 NVMe 1 TB'),s);});
test('longer model wins and unknown hardware stays empty',()=>{assert.equal(detect('Ryzen 5 5600G\nRTX 3060 Ti').cpu,'Ryzen 5 5600G');assert.equal(detect('RTX 3060 Ti').gpu,'RTX 3060 Ti');assert.equal(detect('CPU desconocida GPU desconocida').cpu,'');});
test('resolution reduces FPS and productivity exposes all six workloads',()=>{assert.ok(estimate(s,'4K').gaming[0].max<estimate(s).gaming[0].max);assert.equal(estimate(s).productivity.length,6);});
test('incomplete and invalid configurations do not produce fabricated estimates',()=>{assert.equal(estimate({...s,gpu:''}),null);assert.equal(estimate({...s,ram:0}),null);assert.equal(estimate({...s,capacity:''}),null);});
test('budget records keep independent snapshots for future comparison',()=>{const original={...s};const b=makeBudget(original);original.ram=32;assert.equal(b.spec.ram,16);assert.equal(b.schemaVersion,1);});

