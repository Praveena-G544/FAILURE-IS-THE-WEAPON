// ROUND 2 - RED LIGHT, GREEN LIGHT: arena graph, BFS shortest route + DFS alternative routes steer the Guard Agent.
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
export const R2=(()=>{let S;const end=ok=>{if(S.ended)return;S.ended=1;const r=S.rts.length?S.rts.reduce((a,b)=>a+b)/S.rts.length:.6,g=S.grs.length?S.grs.reduce((a,b)=>a+b)/S.grs.length:1,acc=Math.round(100*(1-S.viol/Math.max(1,S.ph))),risk=Math.min(100,Math.round(S.risk*3+S.caught*15)),obs=[];
 if(!ok)obs.push('You were detected too many times.');if(g<.5)obs.push('Fast reaction.');if(S.slow>=2)obs.push('You were too cautious.');if(S.rmv>=3)obs.push('You took unnecessary risks.');
 if(Math.max(0,...Object.values(S.hide))>=2)obs.push('I noticed you prefer one hiding position.');if(ok&&!S.caught)obs.push('Your movement was controlled.');if(S.c.p.routeHist.includes('R2-'+S.sig))obs.push('You are becoming predictable.');S.c.p.routeHist.push('R2-'+S.sig);
 S.c.done({ok,acc,mistakes:S.caught,react:r,score:ok?Math.round(700+(100-S.T)*5+S.lives*100):100,risk,obs,detections:S.caught,greenReaction:+g.toFixed(2),redMoves:S.rmv,hide:S.hide,lane:S.lane,note:ok?'Crossed via '+S.lane+' lane':'Caught '+S.caught+'x',
  show:[['REACTION TIME',Math.round(r*1000)+' ms'],['DETECTIONS',S.caught],['RISK LEVEL',riskLabel(risk)],['MOVEMENT ACCURACY',acc+'%']]})};
 return{name:'ROUND 2 — RED LIGHT, GREEN LIGHT',brief:'Reach the neon gate. Move on GREEN, freeze on RED. Guards have vision cones: crates block their sight. Moving on red inside a cone raises ALERT. 3 lives.',
 start(c){const p=c.p;S={c,D:Adaptive.diff(p),red:false,tm:3,lives:3,T:0,ph:0,viol:0,rts:[],risk:0,caught:0,redT:0,lane:'',ended:0,vi:0,grs:[],hide:{},rmv:0,slow:0,gt:0,gr:null,hc:0,rs:{},sig:'',route:null,alt:[],cell:''};
  reset(0x9fe8ff);box(50,.3,56,0x39c98a,0,-.15,0);box(50,.32,3,0xffd24a,0,-.14,-18.5,.4);box(50,.32,3,0x19e6ff,0,-.14,19.5,.4);
  [-6,6].forEach(x=>box(.5,7,.5,0xff3df0,x,3.5,-18,1.2));box(12.5,.5,.5,0xff3df0,0,7,-18,1.2);light(0xff3df0,0,6,-17,70,30);light(0x19e6ff,0,8,10,60,40);
  S.covers=[[-8,10],[5,8],[-3,3],[8,-2],[-6,-6],[2,-9],[-1,-14]].map(([x,z])=>{const m=box(2.6,2.2,2.6,0xff8a3d,x,1.1,z,.25);m.userData.hw=1.5;return m});
  S.g=arena(S.covers);S.guards=[[-14,-4,0],[14,-4,Math.PI],[0,-23,-Math.PI/2]].map(([x,z,th])=>{const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=th;
   const h=human({top:0xff3d8a,bot:0x301030,hair:0x111111,skin:0x222222});h.rotation.y=Math.PI/2;g.add(h);
   const cone=new THREE.Mesh(new THREE.CircleGeometry(26,24,-.62,1.24),new THREE.MeshBasicMaterial({color:0x19e6ff,transparent:true,opacity:.25,side:THREE.DoubleSide}));cone.rotation.x=-Math.PI/2;cone.position.y=.08;g.add(cone);stage.add(g);return Object.assign(new Guard(g),{cone})});
  S.pl=newPlayer(p,0,18);camera.position.set(0,9,30);Nexa.say('Green light.',0)},
 update(dt,c){const p=c.p,pos=S.pl.g.position;S.T+=dt;const sp=move(S.pl,dt,5.8,S.T);pos.x=Math.max(-21,Math.min(21,pos.x));pos.z=Math.min(21,pos.z);collide(pos,S.covers);follow(S.pl,dt,[0,9,12]);
  S.tm-=dt;if(S.tm<=0){S.red=!S.red;if(S.red){S.tm=2.4+Math.random()*1.6;S.redT=0;S.rt=null;S.ph++;S.vi=0;S.hc=0;Nexa.say(Math.random()<.5?'Red light.':'Freeze.',0);audio.sfx('red')}
   else{S.tm=3+Math.random()*2.5;S.gt=0;S.gr=null;if(S.vi)S.viol++;Nexa.say('Green light.',0);audio.sfx('green')}S.guards.forEach(g=>g.cone.material.color.setHex(S.red?0xff2244:0x19e6ff))}
  if(S.red){S.redT+=dt;if(S.rt==null&&sp<.4){S.rt=S.redT;S.rts.push(S.rt)}
   if(S.redT>1&&!S.hc&&sp<.4){S.hc=1;let bi=-1,bd=2.6;S.covers.forEach((m,i)=>{const d=Math.hypot(m.position.x-pos.x,m.position.z-pos.z);if(d<bd){bd=d;bi=i}});if(bi>=0){S.hide[bi]=(S.hide[bi]||0)+1;if(S.hide[bi]==2)Nexa.say('I noticed you prefer that position.',0)}}}
  else{S.gt+=dt;if(S.gr==null&&sp>.4){S.gr=S.gt;S.grs.push(S.gr);if(S.gr<.45)Nexa.say('Fast reaction.',8);else if(S.gr>2&&++S.slow==2)Nexa.say("You're becoming too cautious.",0)}}
  // GUARD AGENT: on red, aim at the lane you habitually use (memory); on green, sweep the field.
  const lane=Adaptive.side(p),lx=lane?{L:-7,C:0,R:7}[lane]:pos.x,moving=sp>.4&&S.red&&S.redT>Math.max(.2,.6/S.D);let seen=false,sus=0;const cc=cell(pos.x,pos.z);if(cc!=S.cell){S.cell=cc;S.route=Search.shortest(S.g,cc);S.alt=Search.alternatives(S.g,cc)}const ic=S.route&&S.route.length>2?xz(S.route[2]):[pos.x,pos.z],ix=ic[0]*.5+(lane?lx:pos.x)*.2+pos.x*.3,iz=ic[1]*.6+pos.z*.4;
  S.guards.forEach((g,i)=>{if(S.red)g.aim(dt,ix,iz,1.3*S.D);else{const A=S.alt.length?S.alt[(i+(S.T/3|0))%S.alt.length]:null,q=A?xz(A[Math.min(3,A.length-1)]):[pos.x+Math.sin(S.T*.9+i*2)*10,pos.z];g.aim(dt,q[0],q[1],1.1)}
   if(moving&&g.see(pos,S.covers)){g.sus+=dt*2.2*S.D;seen=true}else g.sus=Math.max(0,g.sus-dt*.8);sus=Math.max(sus,g.sus);g.cone.material.opacity=.2+Math.min(1,g.sus)*.4});
  if(moving){if(!S.vi&&++S.rmv==3)Nexa.say("You're taking unnecessary risks.",0);S.vi=1;if(!seen)S.risk+=dt*3}
  if(sus>=1){S.lives--;S.caught++;audio.sfx('bad');Nexa.say('I saw that.',0);Nexa.log(p,2,'caught',{x:Math.round(pos.x)});pos.set(pos.x,0,18);S.guards.forEach(g=>g.sus=0);if(S.lives<=0)return end(false)}
  [10,0,-10].forEach(z=>{if(!S.rs[z]&&pos.z<z){S.rs[z]=1;S.sig+=pos.x<-3?'L':pos.x>3?'R':'C'}});if(!S.lane&&pos.z<0){const l=pos.x<-3?'L':pos.x>3?'R':'C';S.lane={L:'left',C:'center',R:'right'}[l];if(Adaptive.side(p)==l)Nexa.say('Same lane again.',0);choice(p,l)}
  c.hud({title:'RED LIGHT, GREEN LIGHT',time:Math.max(0,Math.ceil(100-S.T)),lives:S.lives,sus,msg:S.red?'RED — FREEZE':'GREEN — GO'});
  if(pos.z<-18)return end(true);if(S.T>100)end(false)}}})();

