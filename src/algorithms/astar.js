// A* search: always expands the node with the lowest f(n) = g(n) + h(n).
// g = real cost from the start, h = estimated cost to the goal. cost() returns Infinity for impassable moves.
export function astar(start,isGoal,neighbors,cost,h){const g=new Map([[start,0]]),prev=new Map([[start,null]]),open=[[h(start),start]],done=new Set();
 while(open.length){open.sort((a,b)=>a[0]-b[0]);const n=open.shift()[1];if(done.has(n))continue;done.add(n);
  if(isGoal(n)){const p=[];for(let c=n;c!==null;c=prev.get(c))p.unshift(c);return p}
  for(const m of neighbors(n)){const c=cost(n,m);if(c===Infinity)continue;const t=g.get(n)+c;if(!g.has(m)||t<g.get(m)){g.set(m,t);prev.set(m,n);open.push([t+h(m),m])}}}
 return null}
