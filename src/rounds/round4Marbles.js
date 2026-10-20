// ROUND 4 - MARBLES: Minimax (decisionAgent) plays NEXA. Take 1, 2 or 3 marbles per turn; whoever takes the LAST marble loses.
// Best of 3 games. NEXA searches the game tree to a depth that grows with the player's level (Adaptive.diff).
import {THREE,camera,stage,reset,box,cyl,light} from '../world.js';
import {Nexa} from '../ai/nexaAgent.js';
import {Adaptive} from '../ai/adaptiveAgent.js';
import {chooseTake} from '../ai/decisionAgent.js';
import {audio} from '../systems/audioSystem.js';
const UIH=document.getElementById('ui');
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
export const R4=(()=>{let S;
 const hideBtns=()=>{const e=document.getElementById('mb');if(e)e.remove()};
 function showBtns(){hideBtns();const d=document.createElement('div');d.id='mb';d.style.cssText='position:absolute;left:50%;bottom:64px;transform:translateX(-50%);text-align:center;white-space:nowrap';
  d.innerHTML=[1,2,3].map(k=>`<button data-k="${k}" style="font-size:22px;padding:12px 26px;${k>S.n?'opacity:.3':''}" ${k>S.n?'disabled':''}>TAKE ${k}</button>`).join('');
  UIH.appendChild(d);d.querySelectorAll('button').forEach(b=>{b.onclick=()=>{if(S.ph=='player'&&!b.disabled){audio.sfx('click');playerTake(+b.dataset.k)}}})}
 function build(n){S.m.forEach(m=>stage.remove(m));S.m=[];
  for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.38,20,14),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(i/18,.8,.55),roughness:.25,emissive:0x111133}));
   m.position.set((i%6-2.5)*.95,.62,Math.floor(i/6)*.95-1);m.castShadow=true;stage.add(m);S.m.push(m)}S.n=n}
 function take(k){for(let i=0;i<k&&S.m.length;i++)S.fly.push({m:S.m.pop(),t:0});S.n-=k}
 function newGame(){const n=S.order[S.games];build(n);S.ph='player';showBtns();Nexa.say(`Game ${S.games+1}. ${n} marbles. You move first.`,0)}
 function playerTake(k){hideBtns();S.moves++;take(k);if(S.n%4==1)S.opt++;   // leaving 1 more than a multiple of 4 is the winning move
  if(S.n==0)return over(false);S.ph='nexa';S.timer=1.3}
 function over(won){S.games++;if(won){S.wins++;if(S.lost)S.learned=true}else{S.losses++;S.lost=true}
  Nexa.say(won?(S.learned&&S.wins==1?'You learned from losing.':'You found the pattern.'):'I took the win.',0);
  if(!won&&S.losses==1)setTimeout(()=>Nexa.say('Think in groups of four.',0),2200);
  S.ph='over';S.timer=3}
 function finish(){hideBtns();const ok=S.wins>=2,acc=Math.round(100*S.wins/Math.max(1,S.games));
  S.c.done({ok,acc,mistakes:S.losses,score:S.wins*350+S.opt*30,risk:Math.min(100,S.losses*30),note:ok?`Won ${S.wins}/${S.games} marble games`:`Lost ${S.losses} marble games`,
   obs:[S.learned?'You learned from your loss.':ok?'You found the winning pattern.':'You did not find the pattern.'],
   show:[['GAMES WON',S.wins+' / '+S.games],['OPTIMAL MOVES',S.opt+' / '+S.moves],['NEXA SEARCH DEPTH',S.depth],['ADAPTATION',S.learned?'LEARNED':ok?'DIRECT':'NONE']]})}
 return{name:'ROUND 4 — MARBLES',brief:'Take 1, 2 or 3 marbles per turn. Whoever takes the last marble loses. NEXA plays with Minimax. Win 2 of 3 games.',
  start(c){reset(0x1a1450);box(44,.3,44,0x2a3a7a,0,-.15,0,.15);cyl(4.4,.4,0xd9953a,0,.1,0);light(0xff8a3d,0,6,0,70,25);light(0x19e6ff,-6,5,4,50,25);
   const orb=new THREE.Group();orb.add(new THREE.Mesh(new THREE.SphereGeometry(.7,24,16),new THREE.MeshStandardMaterial({color:0x19e6ff,emissive:0x19e6ff,emissiveIntensity:1.5})));
   [0,1].forEach(i=>orb.add(new THREE.Mesh(new THREE.TorusGeometry(1.1+i*.4,.03,8,48),new THREE.MeshBasicMaterial({color:i?0xc04bff:0x19e6ff}))));orb.position.set(0,3.6,-4.2);stage.add(orb);
   S={c,orb,t:0,m:[],fly:[],games:0,wins:0,losses:0,moves:0,opt:0,n:0,lost:false,learned:false,ph:'intro',timer:0,order:shuffle([14,15,16]),depth:Math.min(6,Math.round(3+Adaptive.diff(c.p)*1.5))};
   camera.position.set(0,8,9);Nexa.seq(['Round Four. Marbles.','Take one, two or three each turn.','Whoever takes the last marble loses.'],newGame)},
  update(dt,c){S.t+=dt;camera.position.lerp(new THREE.Vector3(0,8,9),Math.min(1,dt*2));camera.lookAt(0,0,-.3);
   S.orb.position.y=3.6+Math.sin(S.t*2)*.15;S.orb.children.forEach((x,i)=>{if(i)x.rotation.set(S.t*(.8+i*.4),S.t*.6*i,0)});
   for(let i=S.fly.length-1;i>=0;i--){const f=S.fly[i];f.t+=dt;f.m.position.y+=dt*3;f.m.scale.setScalar(Math.max(.01,1-f.t/.7));if(f.t>.7){stage.remove(f.m);S.fly.splice(i,1)}}
   if(S.ph=='nexa'){S.timer-=dt;if(S.timer<=0){const r=chooseTake(S.n,S.depth);take(r.take);audio.sfx('crack');
     Nexa.say(r.value>0?`I take ${r.take}. I can see how this ends.`:`I take ${r.take}.`,0);
     if(S.n==0)over(true);else{S.ph='player';showBtns()}}}
   else if(S.ph=='over'){S.timer-=dt;if(S.timer<=0){S.ph='done';if(S.wins>=2||S.losses>=2||S.games>=3)finish();else newGame()}}
   c.hud({title:`MARBLES — GAME ${Math.min(3,S.games+(S.ph=='over'||S.ph=='done'?0:1))}/3`,msg:S.ph=='player'?`${S.n} marbles left — your move`:S.ph=='nexa'?`NEXA is searching (Minimax depth ${S.depth})...`:`Won ${S.wins} · Lost ${S.losses}`})}}})();
