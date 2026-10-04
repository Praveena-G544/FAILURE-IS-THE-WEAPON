// Constraint Satisfaction: variables (needle distance, step size, damage, mistakes) must satisfy every constraint.
// Each constraint = {name, msg, test(vars)}. violated() returns the constraints that are broken (empty = valid move).
export const violated=(vars,constraints)=>constraints.filter(c=>!c.test(vars));
export const consistent=(vars,constraints)=>violated(vars,constraints).length===0;
