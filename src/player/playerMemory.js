// PLAYER MEMORY: turns raw behaviour into stored memory (decision sequence, habit detection, event log, recall).
// Everything NEXA 'remembers' comes from here and is persisted by storage/saveSystem.js.
export function logEvent(p,r,e,d={}){p.hist.push({r,e,...d});if(p.hist.length>150)p.hist.shift()}
export function recallLine(p){const h=p.habits[0],f=p.failures.length;return h?`I remember your preference for ${h}.`:f?'I remember your previous mistake.':'A new subject. Interesting.'}
// Record a LEFT/CENTER/RIGHT decision; detects habits (>45% of 6+ choices).
export function choice(p,l){p.choices[l]++;p.seq.push(l);if(p.seq.length>80)p.seq.shift();const c=p.choices,t=c.L+c.C+c.R,m=Math.max(c.L,c.C,c.R);
 if(t>=6&&m/t>.45){const k={L:'LEFT',C:'CENTER',R:'RIGHT'}[Object.keys(c).find(k=>c[k]==m)];p.habits=[k,...p.habits.filter(h=>h!=k)].slice(0,4)}}