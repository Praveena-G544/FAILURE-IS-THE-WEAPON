// Backward chaining: start from a GOAL; it is true if it is a fact, or if some rule concludes it and all its IF-parts can be proved.
// Returns {ok, trace} where trace lists the sub-goals that were checked.
export function prove(goal,facts,rules,trace=[],depth=0){if(depth>6)return{ok:false,trace};
 if(facts.includes(goal)){trace.push('fact: '+goal);return{ok:true,trace}}
 for(const r of rules.filter(r=>r.then===goal)){trace.push('try: '+goal+' <- '+r.if.join(' & '));
  if(r.if.every(g=>prove(g,facts,rules,trace,depth+1).ok))return{ok:true,trace}}
 return{ok:false,trace}}
