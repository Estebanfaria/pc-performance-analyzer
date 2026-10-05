/** Rebuild visual PDF rows, including separately positioned quantity columns. */
export function reconstructRows(items){const rows=[];for(const item of items){if(!item.str?.trim())continue;const y=item.transform?.[5]??0;let row=rows.find(r=>Math.abs(r.y-y)<Math.max(2,Math.min(5,(item.height||10)*.3)));if(!row){row={y,items:[]};rows.push(row);}row.items.push(item);}return rows.sort((a,b)=>b.y-a.y).map(row=>row.items.sort((a,b)=>(a.transform?.[4]||0)-(b.transform?.[4]||0)).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim()).join('\n');}
export async function extractDocument(file,onProgress=()=>{},signal){
 const pdfjs=await import('./vendor/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.mjs',import.meta.url).href;
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),standardFontDataUrl:new URL('./vendor/standard_fonts/',import.meta.url).href,wasmUrl:new URL('./vendor/pdf-wasm/',import.meta.url).href,isEvalSupported:false});let ocrWorker;let aborted=false;
 const abort=()=>{aborted=true;task.destroy();ocrWorker?.terminate();};signal?.addEventListener('abort',abort,{once:true});
 try{const pdf=await task.promise;if(pdf.numPages>50)throw new Error('pages');const pages=[];let ocrPages=0;let confidence=[];
 for(let p=1;p<=pdf.numPages;p++){if(aborted)throw new DOMException('Cancelado','AbortError');onProgress(`Leyendo página ${p} de ${pdf.numPages}…`);const page=await pdf.getPage(p);const content=await page.getTextContent();let text=reconstructRows(content.items);let method='text';
 // OCR also handles mixed documents with text-only letterheads and scanned line items.
 if(text.replace(/\s/g,'').length<100||!/(ryzen|core|rtx|gtx|ddr|ssd|nvme|memoria|procesador)/i.test(text)){
  if(ocrPages>=8){pages.push({number:p,text,method:'skipped-ocr'});continue;}ocrPages++;method='ocr';onProgress(`Reconociendo página escaneada ${p}…`);
  if(!ocrWorker){const {default:Tesseract}=await import('./vendor/ocr/tesseract.esm.min.js');ocrWorker=await Tesseract.createWorker('spa+eng',1,{workerPath:new URL('./vendor/ocr/worker.min.js',import.meta.url).href,corePath:new URL('./vendor/ocr/core/',import.meta.url).href,langPath:new URL('./vendor/ocr/lang/',import.meta.url).href,workerBlobURL:false,logger:m=>{if(m.status==='recognizing text')onProgress(`Reconociendo página ${p}: ${Math.round(m.progress*100)} %`);}});}
  const vp=page.getViewport({scale:Math.min(2.2,2400/page.getViewport({scale:1}).width)});const canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
  const result=await ocrWorker.recognize(canvas);text=text+'\n'+result.data.text;confidence.push(result.data.confidence);canvas.width=canvas.height=0;
 }
 pages.push({number:p,text,method});page.cleanup();
 }
 return{text:pages.map(p=>p.text).join('\n'),pages,ocrPages,ocrConfidence:confidence.length?Math.round(confidence.reduce((a,b)=>a+b,0)/confidence.length):null,partial:pages.some(p=>p.method==='skipped-ocr')};
 }finally{signal?.removeEventListener('abort',abort);await ocrWorker?.terminate();await task.destroy();}
}

