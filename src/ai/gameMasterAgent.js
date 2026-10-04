// GAME MASTER AGENT: round progression data - number->shape mapping, which shape to hit hardest, final configuration.
import {personalize} from './reasoningAgent.js';
import {Adaptive} from './adaptiveAgent.js';
export const SHAPES=['circle','triangle','star','umbrella','heart','hexagon'];
export const NUM_SHAPE={1:'circle',2:'triangle',3:'star',4:'umbrella',5:'heart',6:'hexagon'};
export const GameMaster={shape:p=>SHAPES.slice().sort((a,b)=>(p.shapeFails[b]||0)-(p.shapeFails[a]||0))[0],
 finalCfg(p){const r=personalize(p,Adaptive.diff(p));return{...r.cfg,warn:r.cfg.warn,why:r.why}}};
