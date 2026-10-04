// GAME FLOW CONTROLLER. All screens are driven by gameState.js:
// HOME -> NAME_INPUT -> CHARACTER_SELECTION -> CHARACTER_CONFIRMED -> NEXA_INTRO -> ROUND_1_* -> ROUND_n_INTRO -> ROUND_n_INSTRUCTIONS
//      -> ROUND_n_PLAYING -> ROUND_n_ANALYSIS -> ROUND_n_RESULT -> ... -> ROUND_5_ANALYSIS -> FINAL_RESULT
// setState() removes the previous screen's DOM, hides the HUD, cancels NEXA speech and switches game input on only for gameplay states.
import {THREE,scene,camera,renderer,reset,stage,box,cyl,light} from './world.js';
import {CHARS,human} from './player.js';
import {setInputEnabled,input} from './systems/inputSystem.js';
import {createDust,updateDust} from './systems/effectsSystem.js';
import {audio} from './systems/audioSystem.js';
import {gs} from './gameState.js';
import {load,save,names,wipe} from './storage/saveSystem.js';
import {fresh} from './player/playerProfile.js';
import {applyVerdict,resetRun} from './player/playerProgress.js';
import {Nexa} from './ai/nexaAgent.js';
import {Analysis,adaptScore,riskProfile,pattern,verdict} from './ai/analysisAgent.js';
import {GameMaster} from './ai/gameMasterAgent.js';
import {derive,facts as factsOf,predictable,RULES} from './ai/reasoningAgent.js';
import {ROUNDS} from './rounds/index.js';
import * as UI from './ui.js';

const INSTR={
 2:{name:'RED LIGHT, GREEN LIGHT',sub:'STEALTH TEST',say:['Move only during green light.','When I say red light, stop immediately.','Reach the finish without being detected.','Use W A S D or the arrow keys to move.'],
  objective:'Reach the neon gate at the far end. Guards watch from the sides; crates block their sight. Moving on RED inside a guard\'s cone raises DETECTION.',
  controls:['W A S D / Arrow keys: move','GREEN LIGHT: move freely','RED LIGHT: stop immediately','Hide behind orange crates; 3 detections and you are out']},
 3:{name:'MOVING FLOOR',sub:'ADAPT TO SURVIVE',say:['Reach the opposite platform.','Watch the floor. Some tiles will move or disappear.','Choose your path carefully.','Use W A S D or the arrow keys to move.'],
  objective:'Cross the tile floor to the glowing platform. Tiles flash red, then fall; some slide. NEXA runs A* and paints the cheapest route green, recalculating as the floor changes.',
  controls:['W A S D / Arrow keys: move','Follow the GREEN tiles (A* route)','Red flashing tile = about to fall','You have 3 lives']},
 4:{name:'AI PREDICTION',sub:'PLAYER VS NEXA',say:['I will predict your next decision.','Move onto LEFT, CENTER or RIGHT before the timer ends.','Avoid the pad I arm.','Use W A S D or the arrow keys to move.'],
  objective:'Eight trials. Each trial you must stand on LEFT, CENTER or RIGHT when the timer ends. NEXA (Minimax) arms the pad it predicts. Land on it and you lose a life.',
  controls:['W A S D / Arrow keys: run onto a pad','Be on a pad before the timer hits 0','The armed pad turns red after each trial','4 lives; change your strategy to surprise NEXA']},
 5:{name:'ADAPTIVE FINAL',sub:'BUILT FROM YOUR HISTORY',say:['I remember everything.','Your previous choices shaped this challenge.','Obey the freezes. Dodge my strikes.','Use W A S D or the arrow keys to move.'],
  objective:'Survive the personalised arena until the timer ends. Collapsing tiles, FREEZE moments and strikes aimed where you are heading.',
  controls:['W A S D / Arrow keys: move','FREEZE: do not move at all','Red circle on the floor = strike: step out of it','3 lives']}};
const ALGO={1:'CSP: needle position checked against outline / step / damage / mistake constraints',2:'BFS shortest route + DFS alternative routes steered the guards',3:'A* (f = g + h) route over moving tiles',4:'Minimax chose which pad NEXA armed',5:'Hill Climbing tuned the challenge parameters'};

let P,cur,ctx,lineup=[],peds=[],hero,orb,dust,sel=0,T=0,Ti=0,rn=1,tm;const clock=new THREE.Clock();
const state=()=>gs.get();
const syncInput=()=>setInputEnabled(gs.acceptsGameInput());
// Full transition: new screen. keep=true keeps NEXA speaking (used when moving ANALYSIS -> RESULT).
function setState(s,keep){if(!gs.set(s))return false;clearTimeout(tm);if(!keep)Nexa.stop();UI.clear();UI.hud.show(false);syncInput();return true}
// Sub-phase inside a round (called by round code): changes state without wiping the round's own UI.
const phase=s=>{if(gs.set(s))syncInput()};
const introS=()=>/^(CHARACTER_CONFIRMED|NEXA_INTRO)$/.test(state())||/^ROUND_[2-5]_(INTRO|INSTRUCTIONS)$/.test(state());

const base=()=>{reset(0x7fd0ff);box(60,.3,60,0x2a2f7a,0,-.15,0,.25);light(0xc04bff,-8,6,3,90,40);light(0x19e6ff,8,6,3,90,40);lineup=[];peds=[]};
function stageLineup(){base();lineup=CHARS.map((c,i)=>{const x=-4.5+i*3;peds.push(cyl(1.1,.5,0x1a1450,x,.25,0,.2));const h=human(c);h.position.set(x,.5,0);stage.add(h);return h})}
function stageHero(){base();cyl(1.4,.5,0x1a1450,0,.25,0,.3);hero=human(CHARS[P.character]);hero.position.set(0,.5,0);stage.add(hero)}
// Cinematic chamber: walls, neon strips, hologram ring, spotlight, NEXA orb, floating particles.
function stageIntro(){stageHero();box(40,14,.5,0x1a1f5a,0,7,-9,.15);box(40,.15,.3,0x19e6ff,0,3,-8.7,1.2);box(40,.15,.3,0xc04bff,0,5,-8.7,1.2);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.04,8,64),new THREE.MeshBasicMaterial({color:0x19e6ff}));ring.rotation.x=Math.PI/2;ring.position.y=.55;stage.add(ring);
 const sp=new THREE.SpotLight(0xffffff,150,30,.5,.5);sp.position.set(0,9,4);sp.target=hero;stage.add(sp);dust=createDust(80);
 orb=new THREE.Group();orb.add(new THREE.Mesh(new THREE.SphereGeometry(.6,24,16),new THREE.MeshStandardMaterial({color:0x19e6ff,emissive:0x19e6ff,emissiveIntensity:1.5})));
 [0,1].forEach(i=>orb.add(new THREE.Mesh(new THREE.TorusGeometry(1+i*.35,.03,8,48),new THREE.MeshBasicMaterial({color:i?0xc04bff:0x19e6ff}))));orb.position.set(2.8,2.6,-1);stage.add(orb);light(0x19e6ff,2.8,2.6,-1,60,16)}

// ---------- HOME / NAME / PROFILE ----------
const clean=raw=>raw.trim().toUpperCase().replace(/[^A-Z0-9 ]/g,'').slice(0,16);
const toMenu=()=>{setState('HOME');stageLineup();UI.menu({names:names(),newGame,cont:continueProfile,settings:()=>UI.settings(toMenu)})};
function newGame(raw){const n=clean(raw);if(!n)return Nexa.say('Enter your name.',0);audio.music();setState('NAME_INPUT');stageLineup();
 if(load(n))return UI.confirmOverwrite(n,()=>startNew(n),()=>continueProfile(n),toMenu);startNew(n)}
function startNew(n){wipe(n);P=fresh(n);P.sessions=1;save(P);pick()}                // NEW GAME: empty name field, brand-new profile, no "welcome back"
function continueProfile(n){P=load(n);if(!P)return toMenu();audio.music();P.sessions++;save(P);setState('WELCOME_BACK');stageHero();   // CONTINUE PROFILE: reads the saved data
 Nexa.say(`Welcome back, ${P.name}. ${Nexa.recall(P)}`,0);UI.welcome(P,()=>P.intro?resume():confirm(),pick)}

// ---------- CHARACTER SELECTION -> CONFIRMATION -> NEXA INTRO ----------
function pick(){if(!setState('CHARACTER_SELECTION'))return;stageLineup();sel=P.character;drawSel()}
const drawSel=()=>UI.select(CHARS[sel].n+' — '+CHARS[sel].d,()=>{sel=(sel+3)%4;drawSel()},()=>{sel=(sel+1)%4;drawSel()},()=>{if(state()!='CHARACTER_SELECTION')return;P.character=sel;save(P);confirm()});
// IDENTITY CONFIRMED scene: 3D character + info card + NEXA lines + a START button that is visible immediately.
function confirm(){setState('CHARACTER_CONFIRMED');Ti=0;stageIntro();const first=P.round==1&&!P.eliminated&&!P.final;P.intro=true;save(P);
 UI.introUI(null,UI.card(P,CHARS[P.character]));UI.introBtn(first?nexaIntro:resume,first?'START ROUND 1':(P.eliminated||P.final=='SURVIVOR'?'PLAY AGAIN':'CONTINUE ROUND '+Math.min(5,P.round)));
 Nexa.seq(first?['Your identity has been registered.','Your first challenge is ready.','Are you prepared?']:[`Identity confirmed, ${P.name}.`])}
function nexaIntro(){if(state()!='CHARACTER_CONFIRMED')return;setState('NEXA_INTRO');Ti=0;stageIntro();
 UI.introUI(()=>{Nexa.stop();begin()},UI.roundTitle(1,'DALGONA','CONSTRAINT SATISFACTION'),'CONTINUE');
 Nexa.seq(['NEXA online.','I am NEXA.','I observe your decisions.','I learn from your failures.','And I adapt.'],()=>{if(state()=='NEXA_INTRO')begin()})}

// ---------- ROUND SEQUENCE (no dashboard screen) ----------
const resume=()=>P.eliminated||P.final=='SURVIVOR'?again():begin();
function again(){resetRun(P);save(P);begin()}
const begin=()=>{rn=P.round;rn==1?start():roundIntro()};
// Rounds 2-5: INTRO (title + NEXA names the round) -> INSTRUCTIONS (objective, controls, START ROUND n) -> PLAYING.
function roundIntro(){setState(`ROUND_${rn}_INTRO`);Ti=0;stageIntro();const I=INSTR[rn],s=`ROUND_${rn}_INTRO`;
 UI.introUI(()=>{Nexa.stop();instr()},UI.roundTitle(rn,I.name,I.sub),'CONTINUE');
 Nexa.seq([`Round ${['','One','Two','Three','Four','Five'][rn]}.`,I.name.toLowerCase().replace(/,/g,'')+'.'],()=>{if(state()==s)instr()})}
function instr(){const I=INSTR[rn];setState(`ROUND_${rn}_INSTRUCTIONS`);const why=rn==5?GameMaster.finalCfg(P).why:[];
 UI.instructions({n:rn,name:I.name,objective:I.objective+(why.length?'<br><br><b>NEXA BUILT THIS FOR YOU:</b><br>'+why.join('<br>'):''),controls:I.controls},start);
 Nexa.seq(I.say)}
function start(){if(rn>1&&state()!=`ROUND_${rn}_INSTRUCTIONS`)return;setState(rn==1?'ROUND_1_INTRO':`ROUND_${rn}_PLAYING`);cur=ROUNDS[rn-1];
 ctx={p:P,state:phase,done:finish,hud:o=>UI.hud.set({round:rn,nexa:/ANALYSIS/.test(state())?'ANALYZING':'ONLINE',stats:`SCORE ${P.score} · RISK ${P.risk}% · MISTAKES ${P.mistakes} · ADAPT ${Analysis.level(P)}`,...o})};
 UI.hud.show(true,rn<5);cur.start(ctx)}

// Round finished: ANALYSIS (algorithm outputs on screen) -> RESULT (or FINAL_RESULT after round 5).
function finish(s){if(!gs.playing())return;setState(`ROUND_${rn}_ANALYSIS`);
 const v=Analysis.eval(P,rn,s);P.facts=derive(P);
 if(s.hide)for(const k in s.hide)P.hiding[k]=(P.hiding[k]||0)+s.hide[k];P.detections+=s.detections||0;
 applyVerdict(P,rn,v.ok);P.adapt=adaptScore(P);if(s.note)(v.ok?P.strategies.good:P.strategies.bad).push(s.note);save(P);audio.sfx(v.ok?'ok':'bad');
 const f=factsOf(P),pr=predictable(P);
 UI.analysis(rn,[`ALGORITHM: ${ALGO[rn]}`,`OBSERVED: accuracy ${s.acc}% · mistakes ${s.mistakes}`+(s.react?` · reaction ${Math.round(s.react*1000)} ms`:'')+` · risk ${s.risk||0}%`,
  `FORWARD CHAINING facts: ${f.join(', ')||'none yet'}`,`DERIVED: ${P.facts.filter(x=>!f.includes(x)).join(', ')||'nothing new'}`,
  `BACKWARD CHAINING goal player_predictable: ${pr.ok?'PROVED':'not proved'}`,`VERDICT: ${v.ok?'ELIGIBLE':'ELIMINATED'}`]);
 const o=(s.obs||[]).slice(0,2);
 if(rn==5)Nexa.say(v.ok?'You adapted.':'I remember your mistake.',0);
 else Nexa.seq(s.passed?['You passed. That has a cost.',`Round ${rn+1} awaits.`]:v.ok?(rn==1?['Well done.','You successfully completed the Dalgona challenge.','You are eligible for the next round.']:['Well done.',...o,`You are eligible for round ${rn+1}.`]):['You are not eligible.',...o,'You are eliminated.']);
 const as=state();tm=setTimeout(()=>{if(state()!=as)return;
  if(rn==5){setState('FINAL_RESULT',true);const m={adapt:P.adapt,risk:riskProfile(P),pattern:pattern(P),verdict:verdict(P)};
   const t=`${m.verdict} You survived ${P.completed.length} of 5 rounds. ${P.habits[0]?'Your habit was '+P.habits[0]+'. ':''}${P.failures.length?'I stored '+P.failures.length+' failures and used them against you.':'You gave me little to learn from.'}`;UI.final(P,m,t,again,toMenu)}
  else{setState(`ROUND_${rn}_RESULT`,true);UI.result(v,s,v.ok?`CONTINUE TO ROUND ${rn+1}`:'PLAY AGAIN',v.ok?begin:again,rn)}},3200)}
function pass(){if(!gs.playing()||rn>=5||!gs.acceptsGameInput())return;P.passes++;P.score=Math.max(0,P.score-300);finish({ok:true,acc:40,mistakes:0,score:0,risk:0,passed:1,note:'passed R'+rn})}
UI.hud.onPass(pass);
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;if(e.code=='KeyP')pass();if(state()=='CHARACTER_SELECTION'&&(e.code=='ArrowLeft'||e.code=='ArrowRight')){sel=(sel+(e.code=='ArrowLeft'?3:1))%4;drawSel()}});

function tick(){requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05);T+=dt;const st=state();
 if(gs.playing()&&cur)cur.update(dt,ctx);
 else if(/_(ANALYSIS|RESULT)$/.test(st)||st=='FINAL_RESULT'){camera.position.set(Math.cos(T*.3)*18,10,Math.sin(T*.3)*18);camera.lookAt(0,0,0)}
 else if(introS()&&hero&&orb){Ti+=dt;camera.position.set(Math.sin(Ti*.3)*5,2+Math.min(1.5,Ti*.15),9-Math.min(3,Ti*.4));camera.lookAt(1,1.6,0);hero.rotation.y=Math.sin(Ti*.6)*.4;
  orb.position.y=2.6+Math.sin(Ti*2)*.15;orb.children.forEach((c,i)=>{if(i)c.rotation.set(Ti*(.8+i*.4),Ti*.6*i,0)});updateDust(dust,dt)}
 else if(st=='WELCOME_BACK'&&hero){camera.position.set(Math.sin(T*.2)*2,2.5,7);camera.lookAt(0,1.4,0);hero.rotation.y=Math.sin(T*.5)*.5}
 else if(st=='HOME'||st=='NAME_INPUT'||st=='CHARACTER_SELECTION'){const cs=st=='CHARACTER_SELECTION';camera.position.set(cs?0:Math.sin(T*.2)*3,cs?2.6:3,9);camera.lookAt(0,1.3,0);
  lineup.forEach((h,i)=>{h.rotation.y=cs?(i==sel?T*1.5:0):Math.sin(T+i)*.4;if(peds[i])peds[i].material.emissiveIntensity=cs&&i==sel?1.4:.2})}
 renderer.render(scene,camera)}
window.__fitw={gs,get P(){return P}};   // read-only debug handle (state history / profile) for testing in the console
toMenu();tick();
