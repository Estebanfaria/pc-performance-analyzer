import {RESOLUTIONS} from './engine.mjs';
const C={ink:'#15232f',muted:'#637c8c',accent:'#007fa8',blue:'#dff5fe',line:'#e4edf2'};
export const formatFPS=v=>v?`${v.min}–${v.max}`:'—';
export const ramLabel=s=>`${s.ram} GB${s.ramType?' '+s.ramType:''}${s.ramFrequency?' · '+s.ramFrequency+' MT/s':''}`;
export const gpuLabel=s=>`${s.gpu}${s.gpuVram?' · '+s.gpuVram+' GB':''}`;
export function createReport(spec,analysis,mode,icons){const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;canvas.setAttribute('aria-label','Ficha de rendimiento 1080 por 1920');const c=canvas.getContext('2d');
 const box=(x,y,w,h,color,r=0)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
 const text=(s,x,y,size=28,color=C.ink,weight=400,max=940)=>{c.fillStyle=color;let fontSize=size;c.font=`${weight} ${fontSize}px Arial`;while(c.measureText(String(s)).width>max&&fontSize>16){fontSize--;c.font=`${weight} ${fontSize}px Arial`;}c.fillText(String(s),x,y);};
 const wrap=(s,x,y,max,size=28,line=39,color=C.ink)=>{c.font=`${size}px Arial`;let row='',count=0;for(const word of String(s).split(/\s+/)){if(c.measureText(row+' '+word).width>max&&row){text(row,x,y+count*line,size,color);row=word;count++;}else row+=(row?' ':'')+word;}if(row)text(row,x,y+count*line,size,color);return count+1;};
 box(0,0,1080,1920,'#fff');box(0,0,1080,14,'#77d6f7');text('PC PERFORMANCE',60,83,24,C.ink,700);text('ANALYZER / FICHA DE RENDIMIENTO',60,119,19,C.muted);box(838,54,182,54,C.blue,27);text(mode==='gaming'?'GAMING':'TRABAJO',865,89,21,C.accent,700,140);
 text(mode==='gaming'?'Una PC. Tres resoluciones.':'Tu próximo espacio de trabajo.',60,213,46,C.ink,700);
 text(mode==='gaming'?`Preset ${analysis.preset==='low'?'Competitivo / Low':analysis.preset==='ultra'?'Ultra':'High'} · Nativo · Sin RT, reescalado ni frame generation`:'Capacidad orientativa · Proyectos moderados · Sin tiempos de render',60,261,23,C.muted);
 box(60,300,960,226,'#f4f8fb',20);text('CONFIGURACIÓN',87,338,17,C.muted,700);text(spec.cpu,87,386,34,C.ink,700,880);text(gpuLabel(spec),87,434,34,C.accent,700,880);text(ramLabel(spec),87,480,27,C.ink,400,880);
 if(mode==='gaming'){
  for(const [i,s]of analysis.summary.entries()){const x=60+i*327;box(x,556,305,98,s.resolution===analysis.recommended?C.blue:'#f4f7f9',14);text(s.resolution==='1440p'?'1440p / 2K':s.resolution,x+22,590,22,C.muted);text(s.level,x+22,628,27,C.ink,700,265);}
  text('JUEGO',60,718,19,C.muted,700);for(const [i,label]of ['1080P','1440P / 2K','2160P / 4K'].entries())text(label,430+i*200,718,18,C.muted,700,180);
  box(60,740,960,2,C.line);for(const [i,game]of analysis.gaming.entries()){const y=760+i*91;const img=icons.get(game.id);if(img)c.drawImage(img,60,y+8,50,50);else{box(60,y+8,50,50,C.blue,10);text(game.name.slice(0,1),75,y+43,25);}text(game.name,125,y+40,25,C.ink,600,270);for(const [j,res]of RESOLUTIONS.entries())text(formatFPS(game.values[res]),430+j*200,y+40,27,C.ink,700,184);box(60,y+78,960,1,C.line);}
  text('Rangos estimados de FPS · No son mediciones de esta PC.',60,1604,20,C.muted);box(60,1632,960,173,C.blue,18);text(`RECOMENDACIÓN · ${analysis.recommended==='1440p'?'1440p / 2K':analysis.recommended}`,85,1672,20,C.accent,700);wrap(analysis.conclusion,85,1716,908,25,34);
 }else{
  text('TAREA',60,581,19,C.muted,700);text('CAPACIDAD ORIENTATIVA',620,581,19,C.muted,700);
  for(const [i,job]of analysis.productivity.entries()){const y=615+i*104;text(job.name,60,y+26,28,C.ink,600,540);text(job.level,620,y+26,25,C.accent,700,390);wrap(job.note,60,y+60,930,19,25,C.muted);box(60,y+91,960,1,C.line);}
  box(60,1675,960,129,C.blue,18);const suitable=analysis.productivity.filter(j=>j.score>=60).slice(0,3).map(j=>j.name);wrap(suitable.length?`Más margen para ${suitable.join(', ')}. En proyectos complejos, los codecs, la RAM y la VRAM determinan la experiencia.`:'Para proyectos complejos, considerá más RAM, aceleración gráfica y el uso de proxies.',85,1715,908,24,34);
 }
 text(`Modelo v2 · Incertidumbre ${analysis.uncertainty} · Datos y supuestos en la app.`,60,1849,21,C.muted);text('El rendimiento real varía por versión, escena, drivers y configuración.',60,1886,20,C.muted);return canvas;
}
