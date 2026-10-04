// REASONING AGENT: turns the saved profile into FACTS, derives new facts (forward chaining), tests the goal
// "player_predictable" (backward chaining) and personalises the final challenge with Hill Climbing.
import {forward} from '../algorithms/forwardChaining.js';
import {prove} from '../algorithms/backwardChaining.js';
import {hillClimb} from '../algorithms/hillClimbing.js';
const avg=a=>a.length?a.reduce((x,y)=>x+y)/a.length:null,dup=a=>a.some((x,i)=>a.indexOf(x)!=i);
export function facts(p){const f=[],h=p.habits[0],rt=avg(p.reaction);
 if(h)f.push('player_prefers_'+h.toLowerCase(),'player_repeats_directions');
 if(rt!=null&&rt<.45)f.push('player_has_high_reaction_speed');if(p.risk>50)f.push('player_takes_high_risk');if(dup(p.routeHist))f.push('player_repeats_routes');
 if(Object.values((p.rounds[2]||{}).hide||{}).some(v=>v>=2))f.push('player_repeats_hiding');return f}
export const RULES=[
 {if:['player_prefers_left'],then:'increase_opposite_direction_challenge'},{if:['player_prefers_right'],then:'increase_opposite_direction_challenge'},{if:['player_prefers_center'],then:'increase_opposite_direction_challenge'},
 {if:['player_takes_high_risk'],then:'increase_risk_obstacles'},{if:['player_repeats_routes'],then:'change_route_pattern'},{if:['player_has_high_reaction_speed'],then:'reduce_reaction_window'},
 {if:['player_repeats_directions','player_repeats_routes'],then:'player_predictable'},{if:['player_repeats_directions','player_repeats_hiding'],then:'player_predictable'},{if:['player_repeats_routes','player_repeats_hiding'],then:'player_predictable'}];
export const derive=p=>forward(facts(p),RULES);                       // forward chaining
export const predictable=p=>prove('player_predictable',facts(p),RULES); // backward chaining
// HILL CLIMBING over the Round-5 challenge parameters. State = {freeze, strike, warn, dens, dur, D, lead, bias}.
// hard(state) in [0..1] says how hard that configuration is; the objective is to be as close as possible to the
// difficulty that matches the player's measured skill. Each step tries every single-parameter change (neighbours),
// keeps the best one if it improves the objective, and stops when no neighbour is better (local peak).
const BND={freeze:[4,14],strike:[3,12],warn:[.6,1.3],dens:[0,5],dur:[40,70]};
const STEP={freeze:1,strike:1,warn:.1,dens:1,dur:5};
export const hard=c=>.22*(14-c.freeze)/10+.22*(12-c.strike)/9+.14*(1.3-c.warn)/.7+.14*c.dens/5+.08*(70-c.dur)/30+.2*(c.D-1)/.8;   // 0 = easy ... 1 = hard
export function personalize(p,D){const d=derive(p),a=avg(p.acc)??60,rt=avg(p.reaction)??.6,skill=Math.max(0,Math.min(1,.5*a/100+.3*(1-rt)+.2*(1-p.risk/100))),target=.3+.5*skill;
 const s0={freeze:11,strike:8,warn:1,dens:1,dur:55,D,lead:1.3,bias:{LEFT:'L',RIGHT:'R',CENTER:'C'}[p.habits[0]]||null},why=[];
 // FORWARD CHAINING output (derived facts) sets the starting configuration
 if(d.includes('reduce_reaction_window')){s0.freeze-=2;why.push('fast reactions -> more freezes')}
 if(d.includes('increase_risk_obstacles')){s0.strike-=2;s0.dens+=2;why.push('risk-taking -> more strikes and collapsing tiles')}
 if(d.includes('change_route_pattern')){s0.lead=1.6;why.push('repeated routes -> strikes aim further ahead')}
 if(d.includes('increase_opposite_direction_challenge'))why.push((p.habits[0]||'habit')+' side is tested first');
 // BACKWARD CHAINING result (goal player_predictable) hardens the strike prediction
 const pr=predictable(p);if(pr.ok){s0.lead=Math.max(s0.lead,1.8);s0.strike=Math.max(BND.strike[0],s0.strike-1);why.push('predictable -> NEXA anticipates you')}
 if(p.habits[0])why.push(p.habits[0]+' habit -> that side collapses first');
 const nb=c=>Object.keys(BND).flatMap(k=>[-1,1].map(sg=>{const v=+(c[k]+sg*STEP[k]).toFixed(2);return v>=BND[k][0]&&v<=BND[k][1]?{...c,[k]:v}:null})).filter(Boolean);
 const r=hillClimb(s0,nb,c=>-Math.abs(hard(c)-target));why.push(`hill climbing: ${r.steps} steps, difficulty ${hard(r.state).toFixed(2)} (target ${target.toFixed(2)})`);
 return{cfg:r.state,why,steps:r.steps,target,start:hard(s0)}}
