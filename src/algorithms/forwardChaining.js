// Forward chaining: start from known facts, fire every rule whose IF-facts are all known, add its THEN-fact, repeat until nothing new.
export function forward(facts,rules){const known=new Set(facts);let changed=true;
 while(changed){changed=false;for(const r of rules)if(!known.has(r.then)&&r.if.every(f=>known.has(f))){known.add(r.then);changed=true}}
 return[...known]}
