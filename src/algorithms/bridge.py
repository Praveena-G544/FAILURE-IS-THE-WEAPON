"""Glue used ONLY inside the browser (Pyodide).  The game's JavaScript calls these functions; they run the real
algorithms from this folder and hand the result back to JavaScript as plain arrays."""
import json
from pyodide.ffi import to_js
from .csp import violated as _violated
from .bfs import bfs as _bfs
from .dfs import dfs_routes as _dfs
from .astar import astar as _astar
from .minimax import minimax as _minimax
from .hill_climbing import hill_climb as _hill
from .forward_chaining import forward as _forward
from .backward_chaining import prove as _prove

def bfs(start, is_goal, nb):                     return to_js(_bfs(start, is_goal, nb))
def dfs_routes(start, is_goal, nb, depth, n):    return to_js(_dfs(start, is_goal, nb, depth, n))
def astar(start, is_goal, nb, cost, h):          return to_js(_astar(start, is_goal, nb, cost, h))
def minimax(node, depth, is_max, kids, ev):      v, n = _minimax(node, depth, is_max, kids, ev); return to_js([v, n])
def hill_climb(start, nb, score, max_steps):     s, v, k = _hill(start, nb, score, max_steps); return to_js([s, v, k])
def forward(facts_json, rules_json):             return to_js(_forward(json.loads(facts_json), json.loads(rules_json)))
def prove(goal, facts_json, rules_json):         ok, tr = _prove(goal, json.loads(facts_json), json.loads(rules_json)); return to_js([ok, tr])
def violated_idx(variables, tests):
    cons = [{"name": str(i), "msg": "", "test": t} for i, t in enumerate(tests)]
    return to_js([int(c["name"]) for c in _violated(variables, cons)])
