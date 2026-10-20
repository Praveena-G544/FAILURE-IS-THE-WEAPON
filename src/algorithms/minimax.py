"""Minimax with alpha-beta pruning (Round 4 - NEXA predicts the player).
MAX (NEXA) picks the child with the highest value, MIN (player) the lowest.
Returns (value, node): the value of the position and the best child at the root. """
import math

def minimax(node, depth, is_max, children, evaluate, alpha=-math.inf, beta=math.inf):
    kids = list(children(node))      # list() so JS arrays (via Pyodide) behave like Python lists
    if not depth or not kids:
        return evaluate(node), node
    best_v, best_n = (-math.inf if is_max else math.inf), None
    for c in kids:
        v, _ = minimax(c, depth - 1, not is_max, children, evaluate, alpha, beta)
        if (v > best_v) if is_max else (v < best_v):
            best_v, best_n = v, c
        if is_max:
            alpha = max(alpha, best_v)
        else:
            beta = min(beta, best_v)
        if beta <= alpha:
            break                                  # alpha-beta pruning: this branch cannot change the result
    return best_v, best_n
