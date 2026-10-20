// DECISION AGENT (Minimax): NEXA (MAX) plays the marble game against the player (MIN).
// Game: a pile of marbles, each turn take 1, 2 or 3, whoever takes the LAST marble loses.
// Node = {n: marbles left, nexa: true when it is NEXA's turn, take: the move that led here}.
// Leaf value: +1 if NEXA wins, -1 if it loses, 0 if the search depth ran out before the game ended (unknown).
import {minimax} from '../algorithms.js';
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
export function chooseTake(n,depth){
 const kids=s=>s.n==0?[]:shuffle([1,2,3].filter(t=>t<=s.n)).map(t=>({n:s.n-t,nexa:!s.nexa,take:t}));
 // n==0 and it is NEXA's turn next => the player just took the last marble and loses => good for NEXA
 const val=s=>s.n==0?(s.nexa?1:-1):0;
 const r=minimax({n,nexa:true,take:0},depth,true,kids,val);
 return{take:r.node?r.node.take:1,value:r.value,depth}}
