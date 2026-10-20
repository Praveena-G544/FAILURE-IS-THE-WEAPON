# FAILURE IS THE WEAPON

A 3D browser survival game (Three.js + Vite) where the AI agent **NEXA** observes, remembers and adapts to the player.

**Core concept: FAILURE → MEMORY → ADAPTATION**

Live :  https://praveena-g544.github.io/FAILURE-IS-THE-WEAPON/

## Technology stack
JavaScript (ES modules), Three.js, Vite, HTML/CSS, localStorage (player memory), Web Speech API (NEXA voice + subtitles), Web Audio API.
No backend, no external AI API, no machine learning: every algorithm is classical AI written in plain JavaScript.

## Run / build / deploy
```
npm install
npm run dev        # http://localhost:5173/
npm run build      # output in dist/ (Vite base = /FAILURE-IS-THE-WEAPON/)
```
Deploy: push to `main`; `.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages
(Settings → Pages → Source: GitHub Actions).

## Game flow
HOME → NAME → CHARACTER SELECTION → IDENTITY CONFIRMED (**START ROUND 1**) → NEXA INTRO → Round 1 (intro, number selection,
shape reveal, instructions, **START CUTTING**, cutting, analysis, result) → for rounds 2-5: INTRO → INSTRUCTIONS (**START ROUND n**) →
PLAYING → NEXA ANALYSIS → RESULT → … → FINAL RESULT.
`src/gameState.js` is the single state machine; character selection is refused from every round state.

## Five rounds and the AI behind them
| Round | Challenge | Algorithm | Where |
|---|---|---|---|
| 1 | Dalgona: pick a number → secret shape → trace with the needle | **CSP** | `algorithms/csp.py`, `rounds/round1Dalgona.js` |
| 2 | Moving floor with falling / sliding tiles | **A\*** (f = g + h, recalculated every 0.5 s) | `algorithms/astar.py` |
| 3 | Red Light, Green Light stealth arena with guards and crates | **BFS** + **DFS** | `algorithms/bfs.py`, `dfs.py`, `ai/searchAgent.js`, `ai/guardAgent.js` |
| 4 | Marbles: take 1-3 per turn, whoever takes the last marble loses (best of 3 vs NEXA) | **Minimax** (alpha-beta) | `algorithms/minimax.py`, `ai/decisionAgent.js`, `rounds/round4Marbles.js` |
| 5 | Boss duel: 5 waves of strikes; NEXA re-tunes the boss after every wave | **Hill Climbing** (start config from forward + backward chaining) | `algorithms/hill_climbing.py`, `ai/reasoningAgent.js`, `rounds/round5Final.js` |
| all | NEXA's reasoning | **Forward chaining** + **Backward chaining** | `algorithms/forward_chaining.py`, `backward_chaining.py` |

## AI agents
NEXA (`ai/nexaAgent.js`, voice + subtitles + memory log) · Game Master (`ai/gameMasterAgent.js`) · Search (`ai/searchAgent.js`) ·
Analysis (`ai/analysisAgent.js`) · Adaptive (`ai/adaptiveAgent.js`) · Guard (`ai/guardAgent.js`) · Reasoning (`ai/reasoningAgent.js`) ·
Decision (`ai/decisionAgent.js`). Constraint checking (CSP) is done by `algorithms/csp.py` inside Round 1.

## Player memory
`localStorage` key `fitw:NAME` stores one profile per name: character, completed rounds, score, accuracy, mistakes, reaction times, risk,
choices and habits, route history, hiding positions, failures, strategies, derived facts. **NEW GAME** always starts with an empty name field
and a fresh profile; **CONTINUE PROFILE** loads a saved one and NEXA recalls stored habits.

## Project structure
```
src/main.js            flow controller          src/gameState.js   state machine
src/world.js           renderer/scene/camera    src/player.js      4 characters + movement
src/rounds/            round1..5 + floorEngine  src/algorithms/    the 8 algorithms (Python)
src/ai/                agents                   src/player/        profile, memory, progress
src/storage/           saveSystem               src/ui/            all screens + HUD
src/systems/           input, audio, camera, collision, effects
```

## Python AI engine
The 8 algorithms are Python files in `src/algorithms/`. When the game starts, `src/algorithms.js` loads Pyodide (Python in the browser, from a CDN, about 10 MB, internet needed) and runs them; the JavaScript game code calls them by the same names as before. `python/demo.py` and `python -m unittest discover -s python/tests` run the same files outside the browser.
