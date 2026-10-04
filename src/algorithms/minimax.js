// Minimax with alpha-beta pruning. MAX player picks the child with the highest value, MIN the lowest.
// Returns {value, node}: the value of the position and the best child at the root.
export function minimax(node,depth,max,children,evalFn,alpha=-Infinity,beta=Infinity){const kids=children(node);if(!depth||!kids.length)return{value:evalFn(node),node};
 let best={value:max?-Infinity:Infinity,node:null};
 for(const c of kids){const r=minimax(c,depth-1,!max,children,evalFn,alpha,beta);if(max?r.value>best.value:r.value<best.value)best={value:r.value,node:c};
  if(max)alpha=Math.max(alpha,best.value);else beta=Math.min(beta,best.value);if(beta<=alpha)break}
 return best}
