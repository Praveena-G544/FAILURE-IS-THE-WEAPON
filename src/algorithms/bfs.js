// Breadth First Search: explores level by level, so the first goal found is the SHORTEST path (fewest steps).
export function bfs(start,isGoal,neighbors){const prev=new Map([[start,null]]),q=[start];
 while(q.length){const n=q.shift();if(isGoal(n)){const path=[];for(let c=n;c!==null;c=prev.get(c))path.unshift(c);return path}
  for(const m of neighbors(n))if(!prev.has(m)){prev.set(m,n);q.push(m)}}return null}
