// Depth First Search with a depth limit: goes deep first and collects several DIFFERENT routes to the goal.
export function dfsRoutes(start,isGoal,neighbors,maxDepth=16,maxRoutes=4){const routes=[];let budget=3000;
 (function go(n,path,seen){if(routes.length>=maxRoutes||budget--<=0)return;if(isGoal(n)){routes.push(path.slice());return}
  if(path.length>maxDepth)return;for(const m of neighbors(n))if(!seen.has(m)){seen.add(m);path.push(m);go(m,path,seen);path.pop();seen.delete(m)}})(start,[start],new Set([start]));
 return routes}
