// SEARCH AGENT: builds graphs of the game world and runs BFS (shortest route), DFS (alternative routes) and A* (cheapest floor route).
import {bfs} from '../algorithms/bfs.js';import {dfsRoutes} from '../algorithms/dfs.js';import {astar} from '../algorithms/astar.js';
export const xz=k=>k.split(',').map(Number);
export const cell=(x,z)=>(Math.round(x/4)*4)+','+(Math.round(z/4)*4);
// Round 2 graph: a node every 4 units; nodes close to a crate are blocked; edges join walkable neighbours.
export function arena(covers){const nodes=new Set();for(let x=-20;x<=20;x+=4)for(let z=20;z>=-20;z-=4)if(!covers.some(c=>Math.hypot(c.position.x-x,c.position.z-z)<2.4))nodes.add(x+','+z);
 return{nb:k=>{const[x,z]=xz(k);return[[x+4,z],[x-4,z],[x,z+4],[x,z-4]].map(a=>a.join(',')).filter(n=>nodes.has(n))}}}
const goalRow=k=>xz(k)[1]<=-20;
export const Search={
 shortest:(g,from)=>bfs(from,goalRow,g.nb),
 alternatives:(g,from)=>dfsRoutes(from,goalRow,k=>g.nb(k).sort(()=>Math.random()-.5),18,4),
 // Round 3: tile costs SAFE 1, MOVING 2, DANGEROUS (warning) 8, UNAVAILABLE (falling) impossible; goal = platform row j = -4.
 floor(tiles,from){const at=new Map(tiles.map(t=>[t.i+','+t.j,t])),nb=k=>{const[i,j]=xz(k);return[[i+1,j],[i-1,j],[i,j-1],[i,j+1]].map(a=>a.join(',')).filter(n=>at.has(n))};
  return astar(from,k=>xz(k)[1]==-4,nb,(a,b)=>{const t=at.get(b);return t.st==2?Infinity:t.st==1?8:t.sl?2:1},k=>xz(k)[1]+4)}};
