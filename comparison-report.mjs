import {compareBudgets} from './comparison.mjs';
import {formatFPS,ramLabel,gpuLabel} from './report.mjs';
export function createComparisonReport(budgets,resolution,preset,mode){
 const data=compareBudgets(budgets,resolution,preset,mode),width=1600,margin=60,labelWidth=320,colWidth=(width-margin*2-labelWidth)/budgets.length;
 const canvas=document.createElement('canvas'),c=canvas.getContext('2d');canvas.width=width;
 const rows=[['PC',budgets.map(b=>b.name)],['Procesador',budgets.map(b=>b.spec.cpu)],['GPU',budgets.map(b=>gpuLabel(b.spec))],['RAM',budgets.map(b=>ramLabel(b.spec))],['Disco',budgets.map(b=>b.spec.capacity?`${b.spec.capacity} GB ${b.spec.storage||''}`:b.spec.storage||'No informado')],...data.rows.map(r=>[r.name,r.values.map(v=>mode==='gaming'?v?formatFPS(v):'Sin referencia':v)])];
 const warnings=data.columns.flatMap(col=>(col.analysis?.warnings||[]).map(w=>`${col.name}: ${w}`));
 function lines(value,max,size=24){c.font=`${size}px Arial`;const output=[];let line='';for(const word of String(value).split(/\s+/)){if(c.measureText(line+(line?' ':'')+word).width>max&&line){output.push(line);line='';}line+=(line?' ':'')+word;}if(line)output.push(line);return output;}
 const laidOut=rows.map(([label,values])=>({cells:[lines(label,labelWidth-30),...values.map(v=>lines(v,colWidth-30))]}));
 for(const row of laidOut)row.height=Math.max(72,Math.max(...row.cells.map(cell=>cell.length))*32+28);
 const notes=warnings.flatMap(w=>lines(w,width-margin*2,21));canvas.height=240+laidOut.reduce((n,r)=>n+r.height,0)+120+notes.length*30;
 canvas.setAttribute('aria-label','Imagen de comparación de PCs');c.fillStyle='#fff';c.fillRect(0,0,width,canvas.height);c.fillStyle='#77d6f7';c.fillRect(0,0,width,14);
 const text=(s,x,y,size=24,color='#15232f',bold=false)=>{c.fillStyle=color;c.font=`${bold?'700':'400'} ${size}px Arial`;c.fillText(s,x,y);};
 text('PC PERFORMANCE ANALYZER',margin,65,24,'#007fa8',true);text(`Comparación de ${budgets.length} PCs`,margin,125,42,'#15232f',true);
 text(mode==='gaming'?`Gaming · ${resolution} · ${preset==='low'?'Competitivo / Low':preset==='ultra'?'Ultra':'High'} · FPS estimados`:mode==='integral'?'Análisis integral · Índices estimados / 10':'Productividad · Capacidad orientativa para tareas moderadas',margin,176,25,'#637c8c');
 let y=220;for(const [i,row]of laidOut.entries()){if(i===0){c.fillStyle='#dff5fe';c.fillRect(margin,y,width-margin*2,row.height);}for(const [j,cell]of row.cells.entries()){const x=margin+(j?labelWidth+(j-1)*colWidth:0)+15;cell.forEach((line,k)=>text(line,x,y+39+k*32,24,i>=5&&j?'#007fa8':'#15232f',i===0||j===0));}y+=row.height;c.fillStyle='#e4edf2';c.fillRect(margin,y,width-margin*2,1);}
 y+=42;text(mode==='gaming'?'Rangos orientativos · Resolución nativa · Sin RT ni reescalado.':'Niveles orientativos · No son tiempos de render ni mediciones reales.',margin,y,21,'#637c8c');y+=32;text('El rendimiento real varía por versión, escena, drivers y configuración.',margin,y,21,'#637c8c');for(const note of notes){y+=30;text(note,margin,y,21,'#637c8c');}return canvas;
}

