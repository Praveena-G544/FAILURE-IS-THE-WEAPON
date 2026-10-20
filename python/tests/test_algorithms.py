"""Unit tests.  Run from the python/ folder:   python -m unittest discover -s tests -v"""
import math, sys, os, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))
from algorithms import *

G = {0: [1, 2], 1: [3], 2: [3], 3: [4], 4: []}
nb = lambda n: G[n]

class T(unittest.TestCase):
    def test_csp(self):
        c = [{"name": "n", "msg": "m", "test": lambda v: v["x"] < 3}]
        self.assertEqual(len(violated({"x": 5}, c)), 1); self.assertTrue(consistent({"x": 1}, c))
    def test_bfs_shortest(self): self.assertEqual(bfs(0, lambda n: n == 4, nb), [0, 1, 3, 4])
    def test_bfs_unreachable(self): self.assertIsNone(bfs(4, lambda n: n == 0, nb))
    def test_dfs_finds_two_routes(self): self.assertEqual(len(dfs_routes(0, lambda n: n == 4, nb)), 2)
    def test_dfs_depth_limit(self): self.assertEqual(dfs_routes(0, lambda n: n == 4, nb, max_depth=1), [])
    def test_astar_avoids_costly_tile(self):
        self.assertEqual(astar(0, lambda n: n == 4, nb, lambda a, b: 10 if b == 1 else 1, lambda n: 0), [0, 2, 3, 4])
    def test_astar_impassable(self):
        self.assertIsNone(astar(0, lambda n: n == 4, nb, lambda a, b: math.inf if b == 3 else 1, lambda n: 0))
    def test_minimax_max(self):
        kids = lambda n: [{"d": 1, "v": 3}, {"d": 1, "v": -2}] if n["d"] == 0 else []
        self.assertEqual(minimax({"d": 0}, 1, True, kids, lambda n: n["v"])[0], 3)
    def test_minimax_min(self):
        kids = lambda n: [{"d": 1, "v": 3}, {"d": 1, "v": -2}] if n["d"] == 0 else []
        self.assertEqual(minimax({"d": 0}, 1, False, kids, lambda n: n["v"])[0], -2)
    def test_minimax_marbles(self):
        kids = lambda s: [] if s["n"] == 0 else [{"n": s["n"]-k, "nexa": not s["nexa"], "take": k} for k in (1, 2, 3) if k <= s["n"]]
        val = lambda s: (1 if s["nexa"] else -1) if s["n"] == 0 else 0
        play = lambda n: minimax({"n": n, "nexa": True, "take": 0}, 12, True, kids, val)
        self.assertEqual(play(6)[0], 1); self.assertEqual(play(6)[1]["take"], 1)   # leaves 5 = 1 more than a multiple of 4
        self.assertEqual(play(5)[0], -1)                                          # n % 4 == 1 is lost for the player to move
    def test_hill_climb_reaches_peak(self):
        s, sc, steps = hill_climb(0, lambda x: [x - 1, x + 1], lambda x: -abs(x - 7)); self.assertEqual((s, steps), (7, 7))
    def test_forward_chaining(self):
        R = [{"if": ["a"], "then": "b"}, {"if": ["b", "c"], "then": "d"}]
        self.assertIn("d", forward(["a", "c"], R)); self.assertNotIn("d", forward(["a"], R))
    def test_backward_chaining(self):
        R = [{"if": ["a"], "then": "b"}, {"if": ["b", "c"], "then": "d"}]
        self.assertTrue(prove("d", ["a", "c"], R)[0]); self.assertFalse(prove("d", ["a"], R)[0])
if __name__ == "__main__": unittest.main()
