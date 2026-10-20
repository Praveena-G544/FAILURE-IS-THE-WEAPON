// ANALYSIS AGENT: judges each round from the real stats, updates the profile, derives the adaptation level / score.
import {save} from '../storage/saveSystem.js';
import {predictable} from './reasoningAgent.js';
export const Analysis={
 eval(p,r,s){p.rounds[r]=s;p.acc.push(s.acc);p.mistakes+=s.mistakes;p.score=Math.max(0,p.score+s.score);if(s.react)p.reaction.push(s.react);p.risk=Math.min(100,Math.round(p.risk*.5+(s.risk||0)*.5));
  const t=[];t.push(s.ok?(s.acc>85?'Precision high.':'You survived, but not cleanly.'):'You failed. I will remember how.');if(p.habits[0])t.push(`Habit logged: ${p.habits[0]}.`);if(s.obs&&s.obs.length){t.push(...s.obs);p.obs.push(...s.obs.map(o=>({r,o})));p.obs=p.obs.slice(-60)}else if(s.mistakes>3)t.push('Repeated errors stored.');
  (s.ok?p.good:p.bad).push(s.note||'R'+r);if(!s.ok)p.failures.push({r,note:s.note||''});
  if(s.ok&&s.acc>=95&&!p.ach.includes('Perfect R'+r))p.ach.push('Perfect R'+r);if(s.ok&&!p.ach.includes('Survivor R'+r))p.ach.push('Survivor R'+r);
  save(p);return{ok:s.ok,text:t.join(' ')}},
 level(p){const v=p.failures.length+p.habits.length*2+p.hist.length/20;return v>8?'HIGH':v>3?'MEDIUM':'LOW'}};
// Adaptation score 0..100: did the player change behaviour? (dodging NEXA in R4, not being predictable, improving over time)
export const adaptScore=p=>{const r4=p.rounds[4],d=r4?r4.acc:50,half=Math.floor(p.acc.length/2),early=p.acc.slice(0,half||1),late=p.acc.slice(half),av=a=>a.length?a.reduce((x,y)=>x+y)/a.length:0,imp=Math.max(-20,Math.min(20,av(late)-av(early)));
 return Math.max(0,Math.min(100,Math.round(.5*d+.3*(predictable(p).ok?30:80)+.2*(50+imp*2.5))))};
export const riskProfile=p=>p.risk>60?'RECKLESS':p.risk>30?'BALANCED':'CAUTIOUS';
export const pattern=p=>p.habits[0]?`Prefers ${p.habits[0]}`+(predictable(p).ok?' · predictable':''):(p.hist.length?'No stable pattern':'Not enough data');
export const verdict=p=>p.final!='SURVIVOR'?'You failed.':(adaptScore(p)>=65&&!predictable(p).ok?'You became unpredictable.':'You adapted.');
