"""The 8 classical AI algorithms of FAILURE IS THE WEAPON, written in Python.
The game runs these files in the browser through Pyodide (see src/algorithms.js); python/demo.py and the tests run them directly."""
from .csp import violated, consistent
from .bfs import bfs
from .dfs import dfs_routes
from .astar import astar
from .minimax import minimax
from .hill_climbing import hill_climb
from .forward_chaining import forward
from .backward_chaining import prove
