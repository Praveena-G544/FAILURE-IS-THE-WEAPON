// ADAPTIVE AGENT: difficulty from history, preferred side, and the order-2 -> order-1 -> frequency sequence predictor.
export const Adaptive={
 diff(p){const a=p.acc.length?p.acc.reduce((s,x)=>s+x)/p.acc.length:60;return +Math.min(1.8,1+p.passes*.15+p.completed.length*.08+Math.max(0,a-70)/100+p.failures.length*.02).toFixed(2)},
 side(p){return {LEFT:'L',RIGHT:'R',CENTER:'C'}[p.habits[0]]||null},
 predict(p){const s=p.seq,n=s.length;for(const k of[2,1]){if(n<=k)continue;const ctx=s.slice(-k).join(''),c={L:0,C:0,R:0};
   for(let i=k;i<n;i++)if(s.slice(i-k,i).join('')==ctx)c[s[i]]++;const t=c.L+c.C+c.R;if(t>=2){const l=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return{lane:l,conf:c[l]/t}}}
  const c=p.choices,l=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return{lane:c[l]?l:'C',conf:.34}}};
