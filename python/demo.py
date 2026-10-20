"""Runs each algorithm on a small example that matches how the game uses it.   python demo.py"""
import math, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src'))   # the game's own Python files
from algorithms import *

print("=== CSP (Round 1: needle rules) ===")
cons = [{"name": "near", "msg": "Too far from the outline.", "test": lambda v: v["dist"] < 0.34},
        {"name": "jump", "msg": "Constraint violated.", "test": lambda v: v["step"] < 0.9},
        {"name": "damage", "msg": "The candy is cracking.", "test": lambda v: v["dmg"] < 100},
        {"name": "mistakes", "msg": "Mistake limit reached.", "test": lambda v: v["mis"] <= 6}]
for v in ({"dist": .1, "step": .2, "dmg": 10, "mis": 1}, {"dist": .8, "step": 1.2, "dmg": 10, "mis": 1}):
    bad = violated(v, cons); print(v, "->", "VALID move" if not bad else "VIOLATED: " + ", ".join(c["msg"] for c in bad))

# a small walkable grid; X = crate (not walkable). Start S, goal G.
grid = ["S..#....", "...#.##.", ".#...#..", ".####.#.", "......#G"]
R, C = len(grid), len(grid[0])
find = lambda ch: next((r, c) for r in range(R) for c in range(C) if grid[r][c] == ch)
S_, G_ = find("S"), find("G")
def nb(n):
    r, c = n
    return [(r+dr, c+dc) for dr, dc in ((-1,0),(1,0),(0,-1),(0,1)) if 0 <= r+dr < R and 0 <= c+dc < C and grid[r+dr][c+dc] != "#"]

print("\n=== BFS (Round 3: shortest route) ===")
p = bfs(S_, lambda n: n == G_, nb); print("steps:", len(p) - 1, "path:", p)
print("\n=== DFS (Round 3: alternative routes) ===")
for i, r in enumerate(dfs_routes(S_, lambda n: n == G_, nb, 30, 3), 1): print("route", i, "length", len(r) - 1)

print("\n=== A* (Round 2: tile costs normal 1, sliding 2, warning 8, fallen = impossible) ===")
tiles = {(r, c): ("fallen" if (r, c) == (2, 2) else "warning" if (r, c) == (1, 2) else "sliding" if r == 2 else "normal") for r in range(5) for c in range(5)}
cost = lambda a, b: {"fallen": math.inf, "warning": 8, "sliding": 2, "normal": 1}[tiles[b]]
nb5 = lambda n: [(n[0]+dr, n[1]+dc) for dr, dc in ((-1,0),(1,0),(0,-1),(0,1)) if 0 <= n[0]+dr < 5 and 0 <= n[1]+dc < 5]
path = astar((4, 2), lambda n: n[0] == 0, nb5, cost, lambda n: n[0])   # h = rows left to the platform
print("best route:", path, "| total cost:", sum(cost(a, b) for a, b in zip(path, path[1:])))

print("\n=== Minimax (Round 4: marbles - take 1-3, whoever takes the last marble loses) ===")
def choose_take(n, depth):
    kids = lambda s: [] if s["n"] == 0 else [{"n": s["n"]-t, "nexa": not s["nexa"], "take": t} for t in (1, 2, 3) if t <= s["n"]]
    val = lambda s: (1 if s["nexa"] else -1) if s["n"] == 0 else 0
    v, node = minimax({"n": n, "nexa": True, "take": 0}, depth, True, kids, val); return node["take"], v
for n in (5, 6, 7, 8):
    t, v = choose_take(n, 8); print("NEXA faces", n, "marbles -> takes", t, "(value %+d: %s)" % (v, "NEXA wins" if v > 0 else "NEXA loses with best play"))

print("\n=== Hill Climbing (Round 5: tune difficulty to the player's skill) ===")
target = 0.62
hard = lambda c: .22*(14-c["freeze"])/10 + .22*(12-c["strike"])/9 + .14*(1.3-c["warn"])/.7 + .14*c["dens"]/5 + .08*(70-c["dur"])/30
BND = {"freeze": (4,14), "strike": (3,12), "warn": (.6,1.3), "dens": (0,5), "dur": (40,70)}; ST = {"freeze": 1, "strike": 1, "warn": .1, "dens": 1, "dur": 5}
def nbh(c): return [{**c, k: round(c[k]+s*ST[k], 2)} for k in BND for s in (-1, 1) if BND[k][0] <= round(c[k]+s*ST[k], 2) <= BND[k][1]]
start = {"freeze": 11, "strike": 8, "warn": 1.0, "dens": 1, "dur": 55}
best, sc, steps = hill_climb(start, nbh, lambda c: -abs(hard(c) - target))
print("start difficulty %.2f -> final %.2f (target %.2f) in %d steps\n%s" % (hard(start), hard(best), target, steps, best))

print("\n=== Forward + Backward chaining (NEXA reasoning) ===")
rules = [{"if": ["player_prefers_left"], "then": "increase_opposite_direction_challenge"},
         {"if": ["player_takes_high_risk"], "then": "increase_risk_obstacles"},
         {"if": ["player_repeats_directions", "player_repeats_routes"], "then": "player_predictable"}]
facts = ["player_prefers_left", "player_repeats_directions", "player_repeats_routes", "player_takes_high_risk"]
print("forward :", forward(facts, rules))
ok, trace = prove("player_predictable", facts, rules); print("backward: player_predictable ->", "PROVED" if ok else "not proved"); [print("   ", t) for t in trace]
