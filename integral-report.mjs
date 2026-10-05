import {gpuLabel,ramLabel} from './report.mjs';
export function createIntegralReport(spec,analysis){
 const a=analysis.integral,canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;canvas.setAttribute('aria-label','Resumen integral 1080 por 1920');const c=canvas.getContext('2d');
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};const text=(value,x,y,size=27,color='#15232f',bold=false,max=960)=>{let n=size;c.font=`${bold?700:400} ${n}px Arial`;while(c.measureText(value).width>max&&n>17)c.font=`${bold?700:400} ${--n}px Arial`;c.fillStyle=color;c.fillText(value,x,y);};
 function wrap(value,y,maxLines=3){const words=String(value).split(/\s+/);let row='',count=0;c.font='26px Arial';for(const word of words){if(c.measureText(row+' '+word).width>930&&row){text(row,60,y+count*38,26);row=word;if(++count>=maxLines)return;}else row+=(row?' ':'')+word;}if(row&&count<maxLines)text(row,60,y+count*38,26);}
 box(0,0,1080,1920,'#fff');box(0,0,1080,14,'#77d6f7');text('PC PERFORMANCE ANALYZER',60,85,25,'#007fa8',true);text('¿Qué podés hacer con esta PC?',60,161,44,'#15232f',true);text(a.profile,60,208,27,'#637c8c');
 box(60,248,960,232,'#f3f8fb');text('CONFIGURACIÓN',84,292,20,'#637c8c',true);text(spec.cpu,84,343,34,'#15232f',true,908);text(gpuLabel(spec),84,395,31,'#007fa8',true,908);text(ramLabel(spec),84,446,27,'#15232f',false,908);
 text('RENDIMIENTO GENERAL',60,550,24,'#15232f',true);text('Índices orientativos / 10 · No son benchmarks',60,588,20,'#637c8c');
 for(const [i,cat]of a.ordered.slice(0,7).entries()){const y=633+i*103;text(cat.name,60,y,26,'#15232f',true,720);text(cat.score===null?'Sin referencia':`${cat.score.toFixed(1)} · ${cat.level}`,740,y,23,'#007fa8',true,280);box(60,y+23,960,10,'#e4edf2');if(cat.score!==null)box(60,y+23,960*cat.score/10,10,'#77d6f7');}
 text('IDEAL PARA',60,1398,24,'#15232f',true);wrap(a.ideal.slice(0,4).join(' · ')||'Revisar referencias y requisitos antes de elegir.',1444,3);
 text('TU PC EN POCAS PALABRAS',60,1598,24,'#007fa8',true);wrap(a.conclusion,1645,4);text(`Confianza ${a.confidence==='low'?'baja':'media'} · Hardware y cargas estimadas · Modelo v3`,60,1840,20,'#637c8c');text('Detalle, límites y recomendaciones en la app. El proyecto real puede exigir más.',60,1881,20,'#637c8c');return canvas;
}
