"""Constraint Satisfaction (Round 1 - Dalgona).
Variables (needle distance, step size, damage, mistakes) must satisfy every constraint.
A constraint is a dict {"name", "msg", "test": function(vars) -> bool}. """

def violated(variables, constraints):
    """Return the constraints that are broken (empty list = the move is valid)."""
    return [c for c in constraints if not c["test"](variables)]

def consistent(variables, constraints):
    return len(violated(variables, constraints)) == 0
