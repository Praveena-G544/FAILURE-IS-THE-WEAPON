"""
FAILURE IS THE WEAPON - Python analysis companion (offline, no backend).

It reads a player profile exported from the game and re-runs NEXA's reasoning in Python:
  facts -> FORWARD CHAINING -> BACKWARD CHAINING (player_predictable) -> adaptation score ->
  HILL CLIMBING for the personalised Round-5 challenge -> charts + text report.
These rules mirror src/ai/reasoningAgent.js, src/algorithms/*.js and src/ai/analysisAgent.js.

Usage:
  python analyze_profile.py sample_profile.json
  python analyze_profile.py my_profile.json --out report
"""
import json, sys, argparse, os

# ---------------------------------------------------------------- algorithms (same logic as the JS files)
def forward(facts, rules):
    known, changed = set(facts), True
    while changed:
        changed = False
        for r in rules:
            if r["then"] not in known and all(f in known for f in r["if"]):
                known.add(r["then"]); changed = True
    return sorted(known)

def prove(goal, facts, rules, trace=None, depth=0):
    trace = [] if trace is None else trace
    if depth > 6: return False, trace
    if goal in facts: trace.append("fact: " + goal); return True, trace
    for r in [r for r in rules if r["then"] == goal]:
        trace.append("try: %s <- %s" % (goal, " & ".join(r["if"])))
        if all(prove(g, facts, rules, trace, depth + 1)[0] for g in r["if"]): return True, trace
    return False, trace

def hill_climb(start, neighbors, score, max_steps=60):
    cur, s, steps = start, score(start), 0
    while steps < max_steps:
        best, bs = None, s
        for n in neighbors(cur):
            v = score(n)
            if v > bs: best, bs = n, v
        if best is None: break          # local peak
        cur, s, steps = best, bs, steps + 1
    return cur, s, steps

# ---------------------------------------------------------------- reasoning (mirror of reasoningAgent.js)
RULES = [{"if": ["player_prefers_" + d], "then": "increase_opposite_direction_challenge"} for d in ("left", "right", "center")] + [
    {"if": ["player_takes_high_risk"], "then": "increase_risk_obstacles"},
    {"if": ["player_repeats_routes"], "then": "change_route_pattern"},
    {"if": ["player_has_high_reaction_speed"], "then": "reduce_reaction_window"},
    {"if": ["player_repeats_directions", "player_repeats_routes"], "then": "player_predictable"},
    {"if": ["player_repeats_directions", "player_repeats_hiding"], "then": "player_predictable"},
    {"if": ["player_repeats_routes", "player_repeats_hiding"], "then": "player_predictable"}]

avg = lambda a: sum(a) / len(a) if a else None
dup = lambda a: any(x in a[:i] for i, x in enumerate(a))

def facts_of(p):
    f, rt = [], avg(p.get("reaction", []))
    if p.get("habits"): f += ["player_prefers_" + p["habits"][0].lower(), "player_repeats_directions"]
    if rt is not None and rt < .45: f.append("player_has_high_reaction_speed")
    if p.get("risk", 0) > 50: f.append("player_takes_high_risk")
    if dup(p.get("routeHist", [])): f.append("player_repeats_routes")
    if any(v >= 2 for v in (p.get("rounds", {}).get("3", {}).get("hide", {}) or {}).values()): f.append("player_repeats_hiding")
    return f

def adapt_score(p):
    r4 = p.get("rounds", {}).get("4"); d = r4["acc"] if r4 else 50
    acc = p.get("acc", []); half = len(acc) // 2
    early, late = acc[:half or 1], acc[half:]
    imp = max(-20, min(20, (avg(late) or 0) - (avg(early) or 0)))
    pred, _ = prove("player_predictable", facts_of(p), RULES)
    return max(0, min(100, round(.5 * d + .3 * (30 if pred else 80) + .2 * (50 + imp * 2.5))))

def risk_profile(r): return "RECKLESS" if r > 60 else "BALANCED" if r > 30 else "CAUTIOUS"

def verdict(p):
    pred, _ = prove("player_predictable", facts_of(p), RULES)
    if p.get("final") != "SURVIVOR": return "You failed."
    return "You became unpredictable." if adapt_score(p) >= 65 and not pred else "You adapted."

# Round-5 hill climbing (mirror of personalize())
BND = {"freeze": (4, 14), "strike": (3, 12), "warn": (.6, 1.3), "dens": (0, 5), "dur": (40, 70)}
STEP = {"freeze": 1, "strike": 1, "warn": .1, "dens": 1, "dur": 5}
def hard(c): return (.22*(14-c["freeze"])/10 + .22*(12-c["strike"])/9 + .14*(1.3-c["warn"])/.7 + .14*c["dens"]/5 + .08*(70-c["dur"])/30 + .2*(c["D"]-1)/.8)

def diff(p):
    acc = avg(p.get("acc", [])) or 60
    return min(1.8, 1 + p.get("passes", 0)*.15 + len(p.get("completed", []))*.08 + max(0, acc-70)/100 + len(p.get("failures", []))*.02)

def personalize(p):
    d = forward(facts_of(p), RULES); D = diff(p)
    a = avg(p.get("acc", [])) or 60; rt = avg(p.get("reaction", [])) or .6
    skill = max(0, min(1, .5*a/100 + .3*(1-rt) + .2*(1-p.get("risk", 0)/100))); target = .3 + .5*skill
    s0 = {"freeze": 11, "strike": 8, "warn": 1.0, "dens": 1, "dur": 55, "D": round(D, 2), "lead": 1.3}
    if "reduce_reaction_window" in d: s0["freeze"] -= 2
    if "increase_risk_obstacles" in d: s0["strike"] -= 2; s0["dens"] += 2
    if "change_route_pattern" in d: s0["lead"] = 1.6
    pred, _ = prove("player_predictable", facts_of(p), RULES)
    if pred: s0["lead"] = max(s0["lead"], 1.8); s0["strike"] = max(BND["strike"][0], s0["strike"] - 1)
    def nb(c):
        out = []
        for k in BND:
            for sg in (-1, 1):
                v = round(c[k] + sg*STEP[k], 2)
                if BND[k][0] <= v <= BND[k][1]: out.append({**c, k: v})
        return out
    best, _, steps = hill_climb(s0, nb, lambda c: -abs(hard(c) - target))
    return s0, best, steps, target

# ---------------------------------------------------------------- report
def report(p, outdir):
    os.makedirs(outdir, exist_ok=True)
    f = facts_of(p); derived = forward(f, RULES); pred, trace = prove("player_predictable", f, RULES)
    s0, best, steps, target = personalize(p)
    ch = p.get("choices", {"L": 0, "C": 0, "R": 0}); tot = sum(ch.values()) or 1
    lines = ["NEXA ANALYSIS - player %s" % p.get("name", "?"), "=" * 48,
      "Rounds completed : %s" % p.get("completed", []), "Score            : %s" % p.get("score", 0),
      "Average accuracy : %.1f%%" % (avg(p.get("acc", [])) or 0), "Total mistakes   : %s" % p.get("mistakes", 0),
      "Avg reaction     : %s" % ("%d ms" % round(avg(p["reaction"]) * 1000) if p.get("reaction") else "n/a"),
      "Risk profile     : %s (%s%%)" % (risk_profile(p.get("risk", 0)), p.get("risk", 0)),
      "Direction use    : " + ", ".join("%s %d%%" % (k, round(100*v/tot)) for k, v in ch.items()),
      "", "FORWARD CHAINING", "  facts   : " + (", ".join(f) or "none"),
      "  derived : " + (", ".join(x for x in derived if x not in f) or "nothing new"),
      "", "BACKWARD CHAINING  goal: player_predictable -> %s" % ("PROVED" if pred else "not proved")] + ["  " + t for t in trace] + [
      "", "HILL CLIMBING (Round 5 personalisation)", "  start  : %s  difficulty %.2f" % (s0, hard(s0)),
      "  result : %s  difficulty %.2f  (target %.2f, %d steps)" % (best, hard(best), target, steps),
      "", "Adaptation score : %d / 100" % adapt_score(p), "Verdict          : " + verdict(p)]
    txt = "\n".join(lines); open(os.path.join(outdir, "nexa_report.txt"), "w").write(txt); print(txt)
    try:
        import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
        fig, ax = plt.subplots(1, 3, figsize=(13, 3.8)); fig.suptitle("NEXA report - %s" % p.get("name", "?"), fontweight="bold")
        rs = sorted(p.get("rounds", {}), key=int)
        ax[0].bar(["R" + r for r in rs], [p["rounds"][r].get("acc", 0) for r in rs], color="#0b8fb0"); ax[0].set_ylim(0, 100); ax[0].set_title("Accuracy per round (%)")
        ax[1].bar(["LEFT", "CENTER", "RIGHT"], [ch.get("L", 0), ch.get("C", 0), ch.get("R", 0)], color=["#d9631a", "#6a2fb0", "#1a8a4a"]); ax[1].set_title("Direction choices (habit)")
        ks = list(BND); ax[2].barh(ks, [(s0[k]-BND[k][0])/(BND[k][1]-BND[k][0]) for k in ks], alpha=.45, label="start", color="#888")
        ax[2].barh(ks, [(best[k]-BND[k][0])/(BND[k][1]-BND[k][0]) for k in ks], height=.4, label="after hill climbing", color="#6a2fb0"); ax[2].set_title("Round 5 parameters (0-1 of range)"); ax[2].legend(fontsize=7)
        plt.tight_layout(); plt.savefig(os.path.join(outdir, "nexa_report.png"), dpi=130); print("\nSaved:", outdir + "/nexa_report.txt and nexa_report.png")
    except ImportError: print("\n(install matplotlib to also get the chart: pip install matplotlib)")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("profile"); ap.add_argument("--out", default="report"); a = ap.parse_args()
    report(json.load(open(a.profile)), a.out)
