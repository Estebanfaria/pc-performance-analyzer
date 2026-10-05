import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
for(const f of ['index.html','style.css','app.mjs','engine.mjs','favicon.svg']) await copyFile(f,`dist/${f}`);
for(const f of ['pdf.mjs','pdf.worker.mjs']) await copyFile(`node_modules/pdfjs-dist/build/${f}`,`dist/vendor/${f}`);
await cp('node_modules/pdfjs-dist/standard_fonts','dist/vendor/standard_fonts',{recursive:true});
console.log('Static production build ready');
