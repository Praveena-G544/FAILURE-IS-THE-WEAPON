"""Breadth First Search (Round 3 - shortest route for the guards).
Explores level by level with a QUEUE, so the first goal reached is the path with the fewest steps.
"""
from collections import deque

def bfs(start, is_goal, neighbors):
    prev = {start: None}          # prev[n] = the node we came from (used to rebuild the path)
    q = deque([start])
    while q:
        n = q.popleft()           # oldest node first (FIFO)
        if is_goal(n):
            path, c = [], n
            while c is not None:
                path.insert(0, c); c = prev[c]
            return path
        for m in neighbors(n):
            if m not in prev:
                prev[m] = n; q.append(m)
    return None                   # no route exists
