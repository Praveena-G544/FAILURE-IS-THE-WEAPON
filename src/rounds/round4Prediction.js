// ROUND 4 - AI PREDICTION: Minimax (decisionAgent) picks the pad NEXA arms against the player's modelled behaviour.
import {THREE,scene,camera,stage,reset,box,cyl,light,label} from '../world.js';
import {human,CHARS,newPlayer,move} from '../player.js';
import {follow} from '../systems/cameraSystem.js';
import {collide} from '../systems/collisionSystem.js';
import {input} from '../systems/inputSystem.js';
import {Nexa} from '../ai/nexaAgent.js';
import {Adaptive} from '../ai/adaptiveAgent.js';
import {GameMaster,NUM_SHAPE} from '../ai/gameMasterAgent.js';
import {Guard,riskLabel} from '../ai/guardAgent.js';
import {choice} from '../player/playerMemory.js';
import * as UI from '../ui.js';
import {save} from '../storage/saveSystem.js';
import {arena,cell,xz,Search} from '../ai/searchAgent.js';
import {violated} from '../algorithms/csp.js';
import {chooseTrap} from '../ai/decisionAgent.js';
import {predictable} from '../ai/reasoningAgent.js';
import {audio} from '../systems/audioSystem.js';
export const R4=(()=>{let S;const L=['L','C','R'],X=[-7,0,7],NM={L:'Left',C:'Center',R:'Right'};
 function trial(c){const D=Adaptive.diff(c.p);S.ph='choose';S.limit=Math.max(3.5,6/Math.sqrt(D));S.t=S.limit;S.pl.g.position.set(0,0,8);S.pr=Adaptive.predict(c.p);const mm=chooseTrap(c.p,S.pr);S.pr={lane:mm.lane,conf:Math.max(...Object.values(mm.w))};
  S.trap=Math.random()<Math.min(.95,.5*D+.25*S.pr.conf+(predictable(c.p).ok?.12:0))?mm.lane:L[Math.random()*3|0];S.pads.forEach(m=>{m.material.color.setHex(0x19e6ff);m.material.emissive.setHex(0x19e6ff)});S.said=0}
 return{name:'ROUND 4 — AI PREDICTION',brief:'Each trial, run onto LEFT, CENTER or RIGHT pad before time runs out. NEXA predicts your pick from your history and arms that pad. Land on the armed pad and you lose a life (4 lives, 8 trials). Be unpredictable.',
 start(c){const p=c.p;reset(0xffb27a);box(44,.3,44,0x2a3a7a,0,-.15,-4,.15);light(0xc04bff,0,8,-4,90,40);
  const pads=X.map((x,i)=>{const m=cyl(2.6,.3,0x19e6ff,x,.15,-8,.6);const lb=label(['LEFT','CENTER','RIGHT'][i]);lb.position.set(x,3.2,-8);return m});
  S={c,pads,pl:newPlayer(p,0,8),tm:0,n:0,N:8,hits:0,dodge:0,t:0,limit:6,pr:{lane:'C',conf:.3}};trial(c);camera.position.set(0,10,20);Nexa.say(predictable(p).ok?'You are becoming predictable.':p.habits[0]?'I know you prefer '+p.habits[0]+'.':'I am watching your choices.',0)},
 update(dt,c){const p=c.p,pl=S.pl,pos=pl.g.position;S.tm+=dt;move(pl,dt,7,S.tm);follow(pl,dt,[0,9,10]);
  if(S.ph=='choose'){S.t-=dt;if(!S.said&&S.t<S.limit-1.2&&S.pr.lane==p.seq[p.seq.length-1]&&S.pr.conf>.5){S.said=1;Nexa.say(NM[S.pr.lane]+' again?',0)}
   if(S.t<=0){const lane=pos.x<-3.5?'L':pos.x>3.5?'R':'C',near=Math.abs(pos.z+8)<3.6&&Math.abs(pos.x-X[L.indexOf(lane)])<3.2,prev=p.seq[p.seq.length-1],hit=!near||lane==S.trap;
    if(near)choice(p,lane);S.n++;if(hit){S.hits++;audio.sfx('bad');Nexa.say(near?'I predicted that.':'Too slow.',0);Nexa.log(p,4,'predicted',{lane})}
    else{S.dodge++;audio.sfx('ok');Nexa.say(lane!=prev?'I did not expect that.':'Interesting.',0)}
    S.pads[L.indexOf(S.trap)].material.color.setHex(0xff2244);S.pads[L.indexOf(S.trap)].material.emissive.setHex(0xff2244);if(near&&!hit){S.pads[L.indexOf(lane)].material.color.setHex(0x3dff9a);S.pads[L.indexOf(lane)].material.emissive.setHex(0x3dff9a)}
    S.ph='reveal';S.t=2.2;S.last=hit}}
  else{S.t-=dt;if(S.t<=0){if(S.n>=S.N||S.hits>=4){const ok=S.hits<=3;return c.done({ok,acc:Math.round(100*S.dodge/S.N),mistakes:S.hits,score:S.dodge*120,risk:30,note:ok?'Dodged NEXA '+S.dodge+'/'+S.N:'Predicted '+S.hits+'x',obs:[predictable(p).ok?'You are becoming predictable.':'Interesting. You adapted.'],show:[['PREDICTED',S.hits+' / '+S.N],['DODGED',S.dodge+' / '+S.N],['ADAPTATION',Math.round(100*S.dodge/S.N)+'%'],['PREFERRED SIDE',p.habits[0]||'none']]})}trial(c)}}
  c.hud({title:'PREDICTION '+Math.min(S.N,S.n+(S.ph=='choose'?1:0))+'/'+S.N,time:S.ph=='choose'?Math.max(0,Math.ceil(S.t)):'-',lives:4-S.hits,msg:S.ph=='choose'?'Choose a pad!':(S.last?'PREDICTED — ':'DODGED — ')+'NEXA confidence '+Math.round(S.pr.conf*100)+'%'})}}})();

