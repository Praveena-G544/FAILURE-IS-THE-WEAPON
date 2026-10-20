// PLAYER PROGRESS: applies a finished round's verdict to the profile (completed rounds, unlocked round, elimination).
export function applyVerdict(P,rn,ok){
 if(ok){if(!P.completed.includes(rn))P.completed.push(rn);P.round=rn+1;P.highest=Math.max(P.highest,Math.min(5,rn+1));if(rn==5)P.final='SURVIVOR'}
 else{P.eliminated=true;P.final='ELIMINATED'}}
export function resetRun(P){Object.assign(P,{eliminated:false,final:null,round:1,completed:[],score:0,rounds:{},acc:[]})}
