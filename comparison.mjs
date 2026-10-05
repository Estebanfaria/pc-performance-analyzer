import {estimate} from './engine.mjs';
export function compareBudgets(budgets,resolution='1080p',preset='high',mode='gaming'){
 const columns=budgets.slice(0,3).map(b=>({...b,analysis:estimate(b.spec,resolution,preset)}));
 const sample=columns.find(c=>c.analysis)?.analysis;
 const rows=mode==='gaming'?(sample?.gaming||[]).map(game=>({name:game.name,values:columns.map(c=>c.analysis?.gaming.find(g=>g.id===game.id)?.values[resolution]||null)})):(sample?.productivity||[]).map(job=>({name:job.name,values:columns.map(c=>c.analysis?.productivity.find(j=>j.name===job.name)?.level||'Sin referencia')}));
 return{columns,rows,mode,resolution,preset};
}
