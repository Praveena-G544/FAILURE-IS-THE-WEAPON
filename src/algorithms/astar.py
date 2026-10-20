"""A* search (Round 2 - Moving Floor).  Always expands the node with the lowest f(n) = g(n) + h(n).
g = real cost from the start, h = estimated cost to the goal.  cost(a, b) returns math.inf for impassable moves.
 (ties are broken by insertion order)."""
import heapq, itertools, math

def astar(start, is_goal, neighbors, cost, h):
    g, prev = {start: 0}, {start: None}
    tie = itertools.count()
    open_heap = [(h(start), next(tie), start)]
    done = set()
    while open_heap:
        _, _, n = heapq.heappop(open_heap)       # lowest f first
        if n in done:
            continue
        done.add(n)
        if is_goal(n):
            path, c = [], n
            while c is not None:
                path.insert(0, c); c = prev[c]
            return path
        for m in neighbors(n):
            c = cost(n, m)
            if c == math.inf:
                continue                           # impassable (fallen tile)
            t = g[n] + c
            if m not in g or t < g[m]:
                g[m] = t; prev[m] = n
                heapq.heappush(open_heap, (t + h(m), next(tie), m))
    return None
