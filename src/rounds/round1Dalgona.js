// ROUND 1 - DALGONA + CONSTRAINT SATISFACTION: number -> secret shape -> reveal -> instructions -> START CUTTING -> carve.
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
function shapePts(n){let P;
 if(n=='circle')P=Array.from({length:48},(_,i)=>[Math.cos(i/48*6.283)*1.6,Math.sin(i/48*6.283)*1.6]);
 else if(n=='triangle')P=[[0,-1.9],[1.9,1.4],[-1.9,1.4]];
 else if(n=='star')P=Array.from({length:10},(_,i)=>{const r=i%2?.85:1.9,a=i/10*6.283-1.571;return[Math.cos(a)*r,Math.sin(a)*r]});
 else if(n=='heart')P=Array.from({length:60},(_,i)=>{const t=i/60*6.283;return[16*Math.pow(Math.sin(t),3)*.115,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.115+.1]});
 else if(n=='hexagon')P=Array.from({length:6},(_,i)=>[Math.cos(i/6*6.283)*1.9,Math.sin(i/6*6.283)*1.9]);
 else{P=Array.from({length:17},(_,i)=>{const a=Math.PI+i/16*Math.PI;return[Math.cos(a)*1.7,Math.sin(a)*1.2+.1]});P.push([0,.1],[0,1.5],[-.4,1.8],[-.7,1.5])}
 const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.07));for(let j=0;j<k;j++)out.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k])}return out}
export const R1=(()=>{let S;const NS=120,ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.27),tmp=new THREE.Vector3(),NAMES={1:'one',2:'two',3:'three',4:'four',5:'five',6:'six'};
 const emit=(x,z,col,n)=>{for(let k=0;k<n;k++){const i=S.si=(S.si+1)%NS;S.sp.set([x,.35,z],i*3);S.sv.set([(Math.random()-.5)*2.5,Math.random()*3,(Math.random()-.5)*2.5],i*3);S.sl[i]=.5;S.sc.set(col,i*3)}};
 const fx=dt=>{for(let i=0;i<NS;i++){if(S.sl[i]>0){S.sl[i]-=dt;S.sv[i*3+1]-=9*dt;for(let a=0;a<3;a++)S.sp[i*3+a]+=S.sv[i*3+a]*dt}else S.sp[i*3+1]=-50}S.sg.attributes.position.needsUpdate=true;S.sg.attributes.color.needsUpdate=true};
 function build(shape){S.shape=shape;S.pts=shapePts(shape);S.cov=[];S.nc=0;S.n=0;S.tg.setDrawRange(0,0);
  const a=new Float32Array(S.pts.length*3);S.pts.forEach((q,i)=>a.set([q[0],.26,q[1]],i*3));const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));
  S.o=new THREE.Points(g,new THREE.PointsMaterial({size:.12,color:0x4a2208}));S.o.visible=false;stage.add(S.o);
  const eg=new THREE.ExtrudeGeometry(new THREE.Shape(S.pts.map(q=>new THREE.Vector2(q[0],-q[1]))),{depth:.08,bevelEnabled:false});eg.rotateX(-Math.PI/2);
  S.piece=new THREE.Mesh(eg,new THREE.MeshStandardMaterial({color:0xf0b45c,roughness:.5}));S.piece.position.y=.15;S.piece.castShadow=true;S.piece.scale.setScalar(.01);stage.add(S.piece)}
 function fin(ok,why){const p=S.c.p,ct=S.t-S.t0,acc=Math.round(100*(1-S.of/Math.max(1,S.fr))),prog=S.nc/S.pts.length,tl=S.limit-ct,av=S.spd.length?S.spd.reduce((a,b)=>a+b)/S.spd.length:0,zmax=Math.max(0,...Object.values(S.zones));
  const elig=!!ok&&acc>=60&&S.mis<=S.maxMis&&ct<=S.limit,obs=[];
  if(!elig)obs.push(why||(acc<60?'Precision too low.':'Too many mistakes.'));
  if(acc>=90)obs.push('Your precision is high.');else if(acc<60)obs.push('Your precision is low.');
  if(av>3.2||S.fast>8)obs.push("You're rushing.");if(ct>S.limit*.8)obs.push("You're losing time.");if(S.delay>12)obs.push('You hesitated before starting.');
  if(zmax>=3)obs.push('I noticed that pattern.');if(S.corr>3)obs.push('You corrected yourself often.');
  if(!elig)p.shapeFails[S.shape]=(p.shapeFails[S.shape]||0)+1;
  S.c.done({ok:elig,acc,mistakes:S.mis,score:Math.round(prog*500+(100-Math.min(100,S.dmg))*3+Math.max(0,tl)*4),risk:Math.min(100,S.fast*2+S.mis*6),react:S.react||1,num:S.num,shape:S.shape,precision:acc,cutTime:+ct.toFixed(1),startDelay:+S.delay.toFixed(1),damage:Math.round(Math.min(100,S.dmg)),corrections:S.corr,avgSpeed:+av.toFixed(2),repeatZone:zmax,obs,note:'Dalgona '+S.shape+(elig?'':' failed'),show:[['PRECISION',acc+'%'],['MISTAKES',S.mis],['TIME',ct.toFixed(1)+'s'],['RISK LEVEL',riskLabel(Math.min(100,S.fast*2+S.mis*6))]]})}
 function reveal(){const p=S.c.p,sh=S.shape,w=NAMES[S.num],cm=p.shapeFails[sh]?'I remember you failed this shape before.':"Let's see how precise you can be.";
  S.ph='reveal';S.cam.set(0,6.5,3.6);stage.remove(S.q);S.c.state('ROUND_1_SHAPE_REVEAL');
  Nexa.seq([`You chose number ${w}.`,`Your assigned shape is ${sh.toUpperCase()}.`,cm],()=>{S.ph='needle';S.cur.visible=true;S.needleT=S.t;S.c.state('ROUND_1_INSTRUCTIONS');
   UI.cta('START CUTTING',startCut);   // button visible immediately; NEXA explains the controls while it is on screen
   Nexa.seq(['Use your mouse or touchpad to control the needle.','Trace the shape carefully and stay close to the outline.','Your precision, mistakes, and time will be recorded.'])})}
 function choose(n){const p=S.c.p;S.num=n;UI.clear();build(NUM_SHAPE[n]);p.pick={num:n,shape:S.shape};save(p);Nexa.log(p,1,'pick',{n,shape:S.shape});reveal()}
 function startCut(){Nexa.stop();S.c.state('ROUND_1_CUTTING');S.ph='cut';S.t0=S.t;S.delay=S.t0-S.needleT;UI.clear();Nexa.say('Begin.',0)}
 return{name:'ROUND 1 — DALGONA',brief:'Choose a number. NEXA assigns a secret shape. Then hold the left mouse button and trace the dotted outline with the needle.',
 start(c){const p=c.p,D=Adaptive.diff(p);reset(0xffc98a);box(40,.2,40,0xe8b6ff,0,-.2,0,.1);light(0xff8a3d,0,6,0,70,25);light(0x19e6ff,-6,5,4,50,25);
  S={c,t:0,t0:0,ph:'pick',dmg:0,mis:0,corr:0,fast:0,fr:0,of:0,off:0,has:0,tol:.34/Math.sqrt(D),maxMis:Math.max(4,Math.round(9-D*2)),limit:70/Math.pow(D,.4),si:0,sl:new Float32Array(NS),sv:new Float32Array(NS*3),sc:new Float32Array(NS*3),sp:new Float32Array(NS*3).fill(-50),spd:[],zones:{},tp:new Float32Array(7500),tc:new Float32Array(7500),lastSp:0,win:null,done:0,cam:new THREE.Vector3(0,9,9),camP:new THREE.Vector3(0,12,12),delay:0,react:null};
  S.tg=new THREE.BufferGeometry();S.tg.setAttribute('position',new THREE.BufferAttribute(S.tp,3));S.tg.setAttribute('color',new THREE.BufferAttribute(S.tc,3));
  const tr=new THREE.Points(S.tg,new THREE.PointsMaterial({size:.14,vertexColors:true}));tr.frustumCulled=false;stage.add(tr);
  S.sg=new THREE.BufferGeometry();S.sg.setAttribute('position',new THREE.BufferAttribute(S.sp,3));S.sg.setAttribute('color',new THREE.BufferAttribute(S.sc,3));
  const spk=new THREE.Points(S.sg,new THREE.PointsMaterial({size:.12,vertexColors:true}));spk.frustumCulled=false;stage.add(spk);
  S.cons=[{name:'near',msg:'Too far from the outline.',test:v=>v.dist<S.tol},{name:'jump',msg:'Constraint violated.',test:v=>v.step<.9},{name:'damage',msg:'The candy is cracking.',test:v=>v.dmg<100},{name:'mistakes',msg:'Mistake limit reached.',test:v=>v.mis<=S.maxMis}];S.tbl=cyl(2.7,.3,0xd9953a);S.q=label('?','#ffd24a',3);S.q.position.set(0,1.6,0);
  const nd=new THREE.Group(),tip=new THREE.Mesh(new THREE.ConeGeometry(.06,.6,10),new THREE.MeshStandardMaterial({color:0xdde6ff,emissive:0x19e6ff,emissiveIntensity:.8})),hd=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.5,10),new THREE.MeshStandardMaterial({color:0xc04bff}));
  tip.rotation.x=Math.PI;tip.position.y=.3;hd.position.y=.85;nd.add(tip,hd);nd.visible=false;stage.add(nd);S.cur=nd;
  const h=human(CHARS[p.character]);h.position.set(-4.8,0,2);h.rotation.y=1.2;stage.add(h);camera.position.copy(S.camP);
  const toNum=()=>{S.c.state('ROUND_1_NUMBER_SELECTION');UI.numbers(choose)};S.c.state('ROUND_1_INTRO');Nexa.seq(['Round One.','Dalgona.','Your precision will determine whether you survive.'],()=>{toNum();Nexa.say('Choose your number carefully.',0)})},
 update(dt,c){const p=c.p;if(S.done)return;S.t+=dt;fx(dt);S.camP.lerp(S.cam,Math.min(1,dt*2));camera.position.copy(S.camP);camera.lookAt(0,0,.2);S.tbl.position.x*=.8;
  if(S.ph!='pick'&&S.ph!='done'){S.rv=Math.min(1,(S.rv||0)+dt/1.2);S.piece.scale.setScalar(Math.max(.01,S.rv));if(S.rv>=1)S.o.visible=true}
  if(S.win!=null){S.win-=dt;if(S.ok){S.piece.position.y+=dt*1.6;S.piece.rotation.y+=dt*4}else{S.piece.rotation.z+=dt*1.5;S.piece.position.y-=dt*.4}
   emit((Math.random()-.5)*3,(Math.random()-.5)*3,S.ok?[1,.9,.3]:[1,.2,.2],1);if(S.win<=0){S.win=null;S.done=1;fin(S.ok,S.why)}return}
  if(S.ph=='needle')S.cur.position.set(0,.8+Math.sin(S.t*3)*.05,2.2);
  let prog=0,tl=S.limit;
  if(S.ph=='cut'){prog=S.nc/S.pts.length;tl=S.limit-(S.t-S.t0);ray.setFromCamera({x:input.mx,y:input.my},camera);
   if(ray.ray.intersectPlane(plane,tmp)){S.cur.position.set(tmp.x,.3,tmp.z);
    if(input.down&&Math.hypot(tmp.x,tmp.z)<2.85){
     let d=9,bi=0;S.pts.forEach((q,i)=>{const e=Math.hypot(q[0]-tmp.x,q[1]-tmp.z);if(e<d){d=e;bi=i}});
     const bad=violated({dist:d,step:S.has?Math.hypot(tmp.x-S.lx,tmp.z-S.lz):0,dmg:S.dmg,mis:S.mis},S.cons),on=!bad.length,sp=S.has?Math.hypot(tmp.x-S.lx,tmp.z-S.lz)/dt:0;if(S.react==null)S.react=S.t-S.t0;if(sp)S.spd.push(sp);
     if(on){if(S.off){S.off=0;S.corr++}S.pts.forEach((q,i)=>{if(!S.cov[i]&&Math.hypot(q[0]-tmp.x,q[1]-tmp.z)<S.tol){S.cov[i]=1;S.nc++}});
      if(S.t-S.lastSp>.07){S.lastSp=S.t;emit(tmp.x,tmp.z,[.3,1,.6],3);audio.beep(600+prog*600,.04,'sine',.04)}}
     else{S.dmg+=dt*30;S.tbl.position.x=Math.sin(S.t*60)*.04;if(!S.off){S.off=1;S.mis++;audio.sfx('crack');emit(tmp.x,tmp.z,[1,.2,.2],14);const z=bi*4/S.pts.length|0,k=S.shape+z;S.zones[z]=(S.zones[z]||0)+1;p.errZones[k]=(p.errZones[k]||0)+1;
      Nexa.say(S.zones[z]>2?'I noticed that pattern.':p.errZones[k]>2?'Same spot again. I remember that.':S.mis>=S.maxMis?'One more mistake and it breaks.':(bad[0]&&bad[0].msg||'Careful.'))}}
     if(sp>5){S.dmg+=dt*20;S.fast++;Nexa.say('Too much pressure.',4)}
     S.fr++;if(!on)S.of++;
     if(!S.has||Math.hypot(tmp.x-S.lx,tmp.z-S.lz)>.06){if(S.n<2500){S.tp.set([tmp.x,.28,tmp.z],S.n*3);S.tc.set(on?[.2,1,.5]:[1,.2,.2],S.n*3);S.n++;S.tg.setDrawRange(0,S.n);S.tg.attributes.position.needsUpdate=true;S.tg.attributes.color.needsUpdate=true}}
     S.has=1;S.lx=tmp.x;S.lz=tmp.z}else S.has=0}
   S.tbl.material.color.setHex(0xd9953a).lerp(new THREE.Color(0x6a1a10),Math.min(1,S.dmg/100)*.7);
   if(prog>.5&&!S.half){S.half=1;Nexa.say('Keep going.',0)}if(tl<15&&!S.warn){S.warn=1;Nexa.say("You're losing time.",0)}
   if(prog>=.92){S.ok=1;S.win=1.6;S.why='';emit(0,0,[1,.9,.3],40);audio.sfx('ok');Nexa.say('Clean cut.',0)}
   else if(S.dmg>=100||S.mis>S.maxMis||tl<=0){S.ok=0;S.win=1.4;S.why=tl<=0?'Time ran out.':S.mis>S.maxMis?'Your mistakes exceeded the allowed limit.':'The Dalgona broke.';emit(0,0,[1,.2,.2],40);audio.sfx('bad');Nexa.say('It broke.',0)}}
  c.hud({title:'DALGONA'+(S.shape&&S.ph!='pick'?' — '+S.shape.toUpperCase():''),time:S.ph=='cut'?Math.max(0,Math.ceil(tl)):undefined,prog:S.ph=='cut'?prog:undefined,msg:S.ph=='pick'?'Choose your number':S.ph=='cut'?`Mistakes ${S.mis}/${S.maxMis} · Cracks ${Math.round(Math.min(100,S.dmg))}%`:''})}}})();

