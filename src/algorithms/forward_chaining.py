"""Forward chaining (NEXA reasoning).  Start from known facts, fire every rule whose IF-facts are all known,
add its THEN-fact, repeat until nothing new.  A rule is {"if": [facts], "then": fact}.
Returns the facts in the order they were known/derived."""

def forward(facts, rules):
    known = list(dict.fromkeys(facts))      # keep order, remove duplicates
    seen, changed = set(known), True
    while changed:
        changed = False
        for r in rules:
            if r["then"] not in seen and all(f in seen for f in r["if"]):
                known.append(r["then"]); seen.add(r["then"]); changed = True
    return known
