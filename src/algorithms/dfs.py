"""Depth First Search with a depth limit (Round 3 - alternative routes for the guards).
Goes deep first (recursion = stack) and collects several DIFFERENT routes to the goal.
A node budget stops it from running too long. """

def dfs_routes(start, is_goal, neighbors, max_depth=16, max_routes=4):
    routes, budget = [], [3000]

    def go(n, path, seen):
        if len(routes) >= max_routes:
            return
        budget[0] -= 1
        if budget[0] < 0:
            return
        if is_goal(n):
            routes.append(path[:]); return
        if len(path) > max_depth:
            return
        for m in neighbors(n):
            if m not in seen:
                seen.add(m); path.append(m)
                go(m, path, seen)          # go deeper ...
                path.pop(); seen.discard(m)  # ... then back up and try the next branch

    go(start, [start], {start})
    return routes
