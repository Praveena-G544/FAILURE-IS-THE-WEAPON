"""Backward chaining (NEXA reasoning).  Start from a GOAL: it is true if it is a fact, or if some rule concludes it
and all of that rule's IF-parts can be proved.  Returns (ok, trace). """

def prove(goal, facts, rules, trace=None, depth=0):
    trace = [] if trace is None else trace
    if depth > 6:
        return False, trace
    if goal in facts:
        trace.append("fact: " + goal); return True, trace
    for r in [r for r in rules if r["then"] == goal]:
        trace.append("try: %s <- %s" % (goal, " & ".join(r["if"])))
        if all(prove(g, facts, rules, trace, depth + 1)[0] for g in r["if"]):
            return True, trace
    return False, trace
