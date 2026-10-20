// ALGORITHMS: the 8 AI algorithms are written in PYTHON (src/algorithms/*.py: csp, bfs, dfs, astar, minimax,
// hill_climbing, forward_chaining, backward_chaining). This file loads Pyodide (Python running inside the browser)
// once at start-up, copies those .py files into it, and exposes them to the game with the same names as before.
import initPy from './algorithms/__init__.py?raw';
import cspPy from './algorithms/csp.py?raw';
import bfsPy from './algorithms/bfs.py?raw';
import dfsPy from './algorithms/dfs.py?raw';
import astarPy from './algorithms/astar.py?raw';
import minimaxPy from './algorithms/minimax.py?raw';
import hillPy from './algorithms/hill_climbing.py?raw';
import fwdPy from './algorithms/forward_chaining.py?raw';
import bwdPy from './algorithms/backward_chaining.py?raw';
import bridgePy from './algorithms/bridge.py?raw';

const CDN='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const FILES={'__init__':initPy,csp:cspPy,bfs:bfsPy,dfs:dfsPy,astar:astarPy,minimax:minimaxPy,hill_climbing:hillPy,forward_chaining:fwdPy,backward_chaining:bwdPy,bridge:bridgePy};
let f=null;
const script=src=>new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>bad(new Error('Could not download the Python engine (Pyodide). An internet connection is needed.'));document.head.appendChild(s)});

// Call once before the game starts. Resolves when Python and all 8 algorithms are ready.
export async function loadAlgorithms(){
 if(f)return;
 await script(CDN+'pyodide.js');
 const py=await window.loadPyodide({indexURL:CDN});
 py.FS.mkdirTree('/home/pyodide/algorithms');
 for(const[n,src]of Object.entries(FILES))py.FS.writeFile(`/home/pyodide/algorithms/${n}.py`,src);
 py.runPython('import sys\nif "/home/pyodide" not in sys.path: sys.path.insert(0,"/home/pyodide")');
 const B=py.pyimport('algorithms.bridge');
 f={bfs:B.bfs,dfs:B.dfs_routes,astar:B.astar,minimax:B.minimax,hill:B.hill_climb,forward:B.forward,prove:B.prove,viol:B.violated_idx}}

const need=()=>{if(!f)throw new Error('Python engine is not loaded yet')};
const nul=r=>r==null?null:r;

export const bfs=(start,isGoal,neighbors)=>{need();return nul(f.bfs(start,isGoal,neighbors))};
export const dfsRoutes=(start,isGoal,neighbors,maxDepth=16,maxRoutes=4)=>{need();return f.dfs(start,isGoal,neighbors,maxDepth,maxRoutes)};
export const astar=(start,isGoal,neighbors,cost,h)=>{need();return nul(f.astar(start,isGoal,neighbors,cost,h))};
export const minimax=(node,depth,max,children,evalFn)=>{need();const r=f.minimax(node,depth,max,children,evalFn);return{value:r[0],node:r[1]}};
export const hillClimb=(start,neighbors,score,maxSteps=60)=>{need();const r=f.hill(start,neighbors,score,maxSteps);return{state:r[0],score:r[1],steps:r[2]}};
export const forward=(facts,rules)=>{need();return f.forward(JSON.stringify(facts),JSON.stringify(rules))};
export const prove=(goal,facts,rules)=>{need();const r=f.prove(goal,JSON.stringify(facts),JSON.stringify(rules));return{ok:r[0],trace:r[1]}};
export const violated=(vars,constraints)=>{need();return f.viol(vars,constraints.map(c=>c.test)).map(i=>constraints[i])};
