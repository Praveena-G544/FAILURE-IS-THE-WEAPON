// ROUND 5 - BOSS DUEL: NEXA attacks in 5 waves. The start configuration comes from forward/backward chaining (GameMaster.finalCfg);
// after EVERY wave Hill Climbing re-tunes the boss (strike interval, warning time, radius, aim-ahead) so its difficulty matches how well you just did.
import {THREE,camera,scene,stage,reset,box,light} from '../world.js';
import {newPlayer,move} from '../player.js';
import {Nexa} from '../ai/nexaAgent.js';
import {GameMaster} from '../ai/gameMasterAgent.js';
import {waveStart,tuneWave,hardW} from '../ai/reasoningAgent.js';
import {riskLabel} from '../ai/guardAgent.js';
import {audio} from '../systems/audioSystem.js';
const WAVES=5,WAVE_T=12,CALM_T=3.2,LANE={L:-7,C:0,R:7},cl=(v,a)=>Math.max(-a,Math.min(a,v));
export const R5=(()=>{let S;
 function strike(){const pl=S.pl,pos=pl.g.position,w=S.wc,habit=S.cfg.bias&&Math.random()<.4;
  const x=habit?LANE[S.cfg.bias]:pos.x+pl.v.x*w.lead,z=habit?pos.z:pos.z+pl.v.z*w.lead;
  const m=new THREE.Mesh(new THREE.CircleGeometry(w.rad,36),new THREE.MeshBasicMaterial({color:0xff2244,transparent:true,opacity:.5}));m.rotation.x=-Math.PI/2;m.position.set(cl(x,11),.08,cl(z,11));stage.add(m);
  S.sk.push({x:m.position.x,z:m.position.z,t:w.warn,m,r:w.rad,habit});S.bossFlash=.25}
 function resolve(k){S.tot++;S.wTot++;const pos=S.pl.g.position,hit=Math.hypot(pos.x-k.x,pos.z-k.z)<k.r;
  if(hit&&S.cool<=0){S.hits++;S.lives--;S.cool=1;if(k.habit)S.bHit++;audio.sfx('bad');Nexa.say(k.habit?'I remember where you go.':'Predicted.',3);pos.set(0,0,6)}
  else{S.dodged++;S.wDod++}
  k.m.material.color.setHex(0xffffff);k.m.material.opacity=.9;S.fx.push({m:k.m,t:.2});audio.sfx('crack')}
 function endWave(){const dr=S.wDod/Math.max(1,S.wTot);S.hist.push({w:S.w,dr});
  if(S.w>=WAVES)return finish(true);
  S.target=Math.max(.2,Math.min(.9,S.target+(dr>=.8?.1:dr<.5?-.1:0)));
  const r=tuneWave(S.wc,S.target);S.wc=r.cfg;S.steps+=r.steps;S.fh=r.hard;S.msg=`HILL CLIMBING: ${r.steps} steps -> difficulty ${Math.round(r.hard*100)}% (target ${Math.round(S.target*100)}%)`;
  Nexa.seq([`Wave ${S.w} complete. You dodged ${Math.round(dr*100)} percent.`,dr>=.8?'Too easy. I am adjusting.':dr<.5?'That was too hard. I am adjusting.':'I am adjusting slightly.']);
  S.ph='calm';S.t=CALM_T}
 function nextWave(){S.w++;S.wDod=0;S.wTot=0;S.ph='wave';S.t=WAVE_T;S.next=.8;Nexa.say(`Wave ${S.w}.`,0)}
 function finish(ok){if(S.ended)return;S.ended=1;const acc=Math.round(100*S.dodged/Math.max(1,S.tot)),risk=Math.min(100,S.hits*25);
  S.c.done({ok,acc,mistakes:S.hits,score:S.dodged*40+S.lives*120+(ok?300:0),risk,note:ok?'Boss duel survived':`Hit ${S.hits}x in wave ${S.w}`,
   obs:[...(S.bHit?['I aimed at your habit and it worked.']:[]),...(ok&&S.hits==0?['Your movement was controlled.']:[]),...(ok?['You adapted to every wave.']:[])],
   show:[['WAVES SURVIVED',(ok?S.w:S.w-1)+' / '+WAVES],['DODGED',S.dodged+' / '+S.tot],['FINAL BOSS LEVEL',Math.round(S.fh*100)+'%'],['HILL-CLIMB STEPS',S.steps],['RISK LEVEL',riskLabel(risk)]]})}
 return{name:'ROUND 5 — BOSS DUEL',brief:'NEXA attacks in 5 waves. After every wave it re-tunes its attacks with Hill Climbing to match how well you dodged. Red circles show where strikes land.',
  start(c){const p=c.p,cfg=GameMaster.finalCfg(p);reset(0x3a1a70);box(26,.4,26,0x1a1450,0,-.2,0,.25);box(26.6,.2,.4,0x19e6ff,0,.05,-13,1.2);box(26.6,.2,.4,0x19e6ff,0,.05,13,1.2);
   light(0xff2244,0,8,-10,90,40);light(0x19e6ff,0,10,6,90,50);light(0xc04bff,10,8,-8,60,40);
   const boss=new THREE.Group();boss.add(new THREE.Mesh(new THREE.SphereGeometry(1.4,28,18),new THREE.MeshStandardMaterial({color:0xff2244,emissive:0xff2244,emissiveIntensity:1.2})));
   [0,1,2].forEach(i=>boss.add(new THREE.Mesh(new THREE.TorusGeometry(2+i*.5,.05,8,64),new THREE.MeshBasicMaterial({color:i%2?0xc04bff:0x19e6ff}))));boss.position.set(0,6.5,-14);stage.add(boss);
   const wc=waveStart(cfg);S={c,cfg,boss,pl:newPlayer(p,0,6),wc,target:cfg.target||.5,sk:[],fx:[],tm:0,t:0,w:0,ph:'intro',lives:3,hits:0,dodged:0,tot:0,wDod:0,wTot:0,bHit:0,cool:0,next:0,steps:0,fh:hardW(wc),hist:[],ended:0,bossFlash:0,msg:''};
   camera.position.set(0,17,16);Nexa.seq(['I remember everything.','Your mistakes brought you here.','Five waves. I adapt after each one.'],()=>nextWave())},
  update(dt,c){if(S.ended)return;S.tm+=dt;S.cool-=dt;const pl=S.pl,pos=pl.g.position;move(pl,dt,7,S.tm);pos.x=cl(pos.x,12);pos.z=cl(pos.z,12);
   camera.position.lerp(new THREE.Vector3(0,17,16),Math.min(1,dt*2));camera.lookAt(0,0,-1);
   S.boss.position.y=6.5+Math.sin(S.tm*2)*.3;S.boss.children.forEach((x,i)=>{if(i)x.rotation.set(S.tm*(.5+i*.3),S.tm*.4*i,0)});S.bossFlash=Math.max(0,S.bossFlash-dt);S.boss.scale.setScalar(1+S.bossFlash*1.2);
   for(let i=S.sk.length-1;i>=0;i--){const k=S.sk[i];k.t-=dt;k.m.material.opacity=.35+.35*Math.abs(Math.sin(S.tm*10));if(k.t<=0){S.sk.splice(i,1);resolve(k)}}
   for(let i=S.fx.length-1;i>=0;i--){const f=S.fx[i];f.t-=dt;if(f.t<=0){stage.remove(f.m);S.fx.splice(i,1)}}
   if(S.lives<=0)return finish(false);
   if(S.ph=='wave'){S.t-=dt;S.next-=dt;if(S.next<=0&&S.t>1.2){strike();S.next=S.wc.iv*(.8+Math.random()*.4)}if(S.t<=0)endWave()}
   else if(S.ph=='calm'){S.t-=dt;if(S.t<=0)nextWave()}
   c.hud({title:`BOSS DUEL — WAVE ${Math.max(1,S.w)}/${WAVES}`,time:S.ph=='wave'?Math.max(0,Math.ceil(S.t)):'-',lives:S.lives,msg:S.ph=='calm'?S.msg:S.ph=='wave'?`Dodged ${S.wDod}/${S.wTot} this wave`:''})}}})();
