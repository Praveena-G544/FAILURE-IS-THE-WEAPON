"""Hill Climbing (Round 5 - personalised final).  From a start state, move to the best neighbour while the
score improves; stop at a local peak.  Returns (state, score, steps). """

def hill_climb(start, neighbors, score, max_steps=60):
    cur, s, steps = start, score(start), 0
    while steps < max_steps:
        best, bs = None, s
        for n in list(neighbors(cur)):
            v = score(n)
            if v > bs:
                best, bs = n, v
        if best is None:
            break                                  # no better neighbour: local peak
        cur, s, steps = best, bs, steps + 1
    return cur, s, steps
