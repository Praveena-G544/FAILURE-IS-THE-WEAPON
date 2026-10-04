// Hill Climbing: from a start state, move to the best neighbour while the score improves; stop at a local peak.
export function hillClimb(start,neighbors,score,maxSteps=60){let cur=start,s=score(cur),steps=0;
 while(steps<maxSteps){let best=null,bs=s;for(const n of neighbors(cur)){const v=score(n);if(v>bs){bs=v;best=n}}if(!best)break;cur=best;s=bs;steps++}
 return{state:cur,score:s,steps}}
