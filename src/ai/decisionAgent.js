// DECISION AGENT (Minimax): NEXA (MAX) chooses which pad to arm; the player (MIN) answers with the pad that hurts NEXA most.
// Leaf value = (+1 if the player lands on the armed pad, else -1) x how plausible that player reply is (from the player model).
import {minimax} from '../algorithms/minimax.js';
const L=['L','C','R'];
export function laneWeights(p,pred){const s=p.seq,n=s.length;return Object.fromEntries(L.map(l=>[l,.5*((s.filter(x=>x==l).length+1)/(n+3))+.5*(pred.lane==l?pred.conf:(1-pred.conf)/2)]))}
export function chooseTrap(p,pred){const w=laneWeights(p,pred);
 const kids=n=>n.depth==0?L.map(t=>({depth:1,trap:t})):n.depth==1?L.map(r=>({depth:2,trap:n.trap,reply:r})):[];
 const r=minimax({depth:0},2,true,kids,n=>(n.reply==n.trap?1:-1)*w[n.reply]);return{lane:r.node.trap,value:r.value,w}}
