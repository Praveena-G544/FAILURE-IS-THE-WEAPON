// ROUNDS 3 + 5 share one engine: moving floor + A*. final=true adds freezes and predicted strikes (Round 5).
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
export function floor(final){let S;
 const hurt=m=>{S.lives--;S.falls++;audio.sfx('bad');Nexa.say(m,0);if(S.lives<=0)end(false);else{S.pl.g.position.set(0,.5,S.sz);S.vy=0;S.tiles[S.si].st=0;S.tiles[S.si].m.position.y=0}};
 const end=ok=>{if(S.ended)return;S.ended=1;S.c.p.routeHist.push((final?'F-':'R3-')+S.sig);const f=S.falls,risk=Math.min(100,f*20+S.fv*10),eff=final?Math.round(100*Math.min(1,S.t/S.cfg.dur)):Math.round(100*(S.po||0)/Math.max(1,S.pn||1)),acc=Math.max(0,100-f*20-S.fv*10);
  S.c.done({ok,acc,mistakes:f,score:Math.round((final?900:600)+S.lives*120+(ok?200:0)),risk,route:S.sig,pathEff:eff,detections:S.fv,note:ok?(final?'Final survived':'Reached platform'):'Fell '+f+'x ('+(S.dyn||S.cfg.bias||'?')+' side)',
   obs:[...(S.dyn?['You are relying on an old strategy.']:[]),...(f==0?['Your movement was controlled.']:[])],
   show:final?[['SURVIVED',Math.round(S.t)+'s / '+S.cfg.dur+'s'],['FALLS / HITS',f],['FREEZE BREAKS',S.fv],['RISK LEVEL',riskLabel(risk)]]:[['PATH EFFICIENCY (A*)',eff+'%'],['FALLS',f],['ROUTE',S.sig||'-'],['RISK LEVEL',riskLabel(risk)]]})};
 return{name:final?'ROUND 5 — ADAPTIVE FINAL':'ROUND 3 — MOVING FLOOR',
 brief:final?'NEXA built this arena from YOUR history: collapsing tiles, freezes (do not move!) and strikes aimed where you are heading. Survive until the timer ends.':'Reach the glowing platform at the far end. Tiles flash red then fall and some slide. NEXA runs A* and shows the cheapest route in green, recalculating as the floor changes.',
 start(c){const p=c.p,cfg=final?GameMaster.finalCfg(p):{D:Adaptive.diff(p),freeze:0,strike:0,bias:null,dur:60,warn:1,why:[]};
  reset(final?0x3a1a70:0xc4b0ff);box(120,.5,120,0xff5a1f,0,-7,0,.9);light(0xff5a1f,0,-3,0,90,40);light(0x19e6ff,0,10,0,90,50);light(0xc04bff,10,8,-8,60,40);
  const tiles=[];for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)tiles.push({m:box(2.8,.4,2.8,0x19e6ff,i*3,0,j*3,.35),i,j,bx:i*3,st:0,tm:0,dx:0,sl:j%2!=0});
  if(!final)for(let i=-1;i<=1;i++)tiles.push({m:box(2.8,.4,2.8,0x3dff9a,i*3,0,-12,.6),i,j:-4,bx:i*3,st:0,tm:0,dx:0,sl:false,fixed:1});
  const sz=final?0:9,pl=newPlayer(p,0,sz);pl.g.position.y=.2;S={c,cfg,tiles,pl,sz,si:24+(final?0:3),map:new Map(tiles.map(t=>[t.i+','+t.j,t])),path:[],ps:0,sig:'',rows:[],t:0,tm:0,next:2,lives:3,falls:0,fv:0,vy:0,cnt:{L:0,C:0,R:0},n:0,dyn:null,fz:cfg.freeze,freeze:0,cool:0,sk:cfg.strike,strike:null,ended:0,sa:0};
  camera.position.set(0,14,14);Nexa.say(final?'I remember everything.':'Round Three. Adapt.',0);
  if(final){setTimeout(()=>Nexa.say('Your mistakes brought you here.',0),3500);setTimeout(()=>Nexa.say("Let's see if you've adapted.",0),7500)}},
 update(dt,c){if(S.ended)return;const p=c.p,pl=S.pl,pos=pl.g.position,D=S.cfg.D;S.t+=dt;S.tm+=dt;S.cool-=dt;
  const sp=move(pl,dt,6.5,S.tm);pos.x=Math.max(-11,Math.min(11,pos.x));pos.z=Math.max(-13.4,Math.min(11,pos.z));
  S.tiles.forEach(T=>{const m=T.m;T.dx=0;if(T.st<2){const nx=T.sl?T.bx+Math.sin(S.tm*.9+T.j)*.8:T.bx;T.dx=S.tm<.05?0:nx-m.position.x;m.position.x=nx;m.position.y=Math.sin(S.tm*2+T.i+T.j)*.08;
    if(T.st==1){T.tm-=dt;m.material.emissive.setHex(Math.floor(S.tm*8)%2?0xff2244:0xffaa00);m.rotation.z=Math.sin(S.tm*30)*.05;if(T.tm<=0){T.st=2;T.tm=4;audio.sfx('warn')}}}
   else{m.position.y-=dt*14;T.tm-=dt;if(T.tm<=0){T.st=0;m.position.y=0;m.rotation.z=0;m.material.emissive.setHex(0x19e6ff)}}});
  // ADAPTIVE: choose tiles to collapse, weighted toward the player's detected habit side and nearby tiles
  S.next-=dt;if(S.next<=0){S.next=Math.max(.9,2.4/D)*(final?.8:1);const side=S.dyn||S.cfg.bias,n=Math.min(12,3+Math.floor(S.t/9)+(D>1.3?1:0)+(S.cfg.dens||0)),cand=S.tiles.filter(T=>T.st==0&&!T.fixed);
   const w=T=>1+((side=='L'&&T.i<0)||(side=='R'&&T.i>0)||(side=='C'&&Math.abs(T.i)<2)?3:0)+(Math.hypot(T.m.position.x-pos.x,T.j*3-pos.z)<4?1.5:0);
   for(let k=0;k<n&&cand.length;k++){let r=Math.random()*cand.reduce((s,T)=>s+w(T),0),ix=0;for(;ix<cand.length-1;ix++){r-=w(cand[ix]);if(r<=0)break}const T=cand.splice(ix,1)[0];T.st=1;T.tm=1.5/Math.sqrt(D)*S.cfg.warn}}
  let on=null;if(pos.y>-.3&&S.vy<=.01)on=S.tiles.find(T=>T.st<2&&Math.abs(pos.x-T.m.position.x)<1.45&&Math.abs(pos.z-T.j*3)<1.45);
  if(on){pos.y=.2+on.m.position.y;pos.x+=on.dx;S.vy=0}else{S.vy-=26*dt;pos.y+=S.vy*dt;if(pos.y<-6)hurt('Fell.')}
  if(!final){{const k=Math.max(-3,Math.min(3,Math.round(pos.x/3)))+','+Math.max(-3,Math.min(3,Math.round(pos.z/3)));S.pn=(S.pn||0)+1;if(S.path.includes(k))S.po=(S.po||0)+1}S.ps-=dt;if(S.ps<=0&&pos.z>-11){S.ps=.5;const ci=Math.max(-3,Math.min(3,Math.round(pos.x/3))),cj=Math.max(-3,Math.min(3,Math.round(pos.z/3))),path=Search.floor(S.tiles,ci+','+cj)||[],old=S.path;   // A* recalculated every 0.5 s
    const at2=a=>a.find(k=>k.split(',')[1]==-2),blocked=old.some(k=>{const t=S.map.get(k);return t&&t.st>0}),changed=old.length&&at2(path)!=at2(old);
    old.forEach(k=>{const t=S.map.get(k);if(t&&t.st==0&&!t.fixed)t.m.material.emissive.setHex(0x19e6ff)});path.forEach(k=>{const t=S.map.get(k);if(t&&t.st==0&&!t.fixed)t.m.material.emissive.setHex(0x3dff9a)});
    if(blocked)Nexa.say('Your previous path is no longer optimal.',7);else if(changed)Nexa.say('Route recalculated.',7);S.path=path}
   const rj=Math.round(pos.z/3);if([2,0,-2].includes(rj)&&!S.rows.includes(rj)){S.rows.push(rj);S.sig+=pos.x<-3?'L':pos.x>3?'R':'C'}
   if(pos.z<-11&&on&&on.fixed)return end(true)}
  // PATTERN DETECTION: sample run direction; every 8 samples record a decision and test for predictability
  S.sa+=dt;if(S.sa>.4){S.sa=0;if(sp>1){const l=Math.abs(pl.v.x)>Math.abs(pl.v.z)?(pl.v.x<0?'L':'R'):'C';S.cnt[l]++;p.moves[l]++;S.n++;
   if(S.n%8==0){const d=Object.keys(S.cnt).sort((a,b)=>S.cnt[b]-S.cnt[a])[0],sh=S.cnt[d]/8;choice(p,d);Nexa.log(p,final?5:3,'run',{d,sh});
    if(sh>.6&&!S.dyn){S.dyn=d;Nexa.say(final?"You're becoming predictable.":'Pattern detected.',0);setTimeout(()=>Nexa.say('Try something different.',0),4000)}
    else if(sh<.45&&S.dyn){S.dyn=null;Nexa.say('Good decision.',0)}S.cnt={L:0,C:0,R:0}}}}
  if(final){
   if(S.freeze>0){S.freeze-=dt;if(sp>.6&&S.cool<=0){S.fv++;S.cool=1.2;hurt('Movement detected.')}if(S.freeze<=0)scene.background.setHex(0x3a1a70)}
   else{S.fz-=dt;if(S.fz<=0){S.freeze=2;S.fz=S.cfg.freeze+Math.random()*3;Nexa.say('Freeze.',0);scene.background.setHex(0x8a0a30);audio.sfx('red')}}
   S.sk-=dt;if(S.sk<=0&&!S.strike){S.sk=S.cfg.strike;const v=pl.v,cl=x=>Math.max(-11,Math.min(11,x)),m=new THREE.Mesh(new THREE.CircleGeometry(2.2,32),new THREE.MeshBasicMaterial({color:0xff2244,transparent:true,opacity:.55}));
    m.rotation.x=-Math.PI/2;S.strike={x:cl(pos.x+v.x*(S.cfg.lead||1.3)),z:cl(pos.z+v.z*(S.cfg.lead||1.3)),t:1.2,m};m.position.set(S.strike.x,.5,S.strike.z);stage.add(m);Nexa.say('I know where you are going.',6)}
   if(S.strike){S.strike.t-=dt;if(S.strike.t<=0){const k=S.strike;S.strike=null;stage.remove(k.m);audio.sfx('crack');if(Math.hypot(pos.x-k.x,pos.z-k.z)<2.2&&S.cool<=0){S.cool=1;hurt('Predicted.')}}}}
  if(S.ended)return;
  camera.position.lerp(new THREE.Vector3(pos.x*.5,14,pos.z*.5+13),Math.min(1,dt*3));camera.lookAt(pos.x*.5,0,pos.z*.5);
  c.hud({title:final?'ADAPTIVE FINAL':'MOVING FLOOR',time:Math.max(0,Math.ceil(S.cfg.dur-S.t)),lives:S.lives,msg:S.freeze>0?'FREEZE — DO NOT MOVE':(S.t<9&&final?S.cfg.why.join(' • '):(S.dyn?'NEXA is targeting your '+{L:'LEFT',R:'RIGHT',C:'FORWARD'}[S.dyn]+' habit':''))});
  if(S.t>=S.cfg.dur)end(final)}}}

