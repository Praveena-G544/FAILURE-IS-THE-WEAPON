// FINAL_RESULT: complete statistics + NEXA's verdict computed from the whole profile.
import {show,bind,cards,avg,esc} from './core.js';
export const final=(P,m,txt,again,dashf)=>{show(`<h1>GAME COMPLETE</h1><div class="big ${P.final=='SURVIVOR'?'ok':'no'}">${P.final}</div>${cards([['FINAL SCORE',P.score],['ROUNDS COMPLETED',P.completed.length+' / 5'],['TOTAL MISTAKES',P.mistakes],['AVG REACTION',P.reaction.length?Math.round(avg(P.reaction)*1000)+' ms':'—'],['ADAPTATION SCORE',m.adapt+' / 100'],['RISK PROFILE',m.risk],['BEHAVIOR PATTERN',m.pattern]])}
 <p style="max-width:620px">SUCCESSFUL STRATEGIES: ${esc(P.good.slice(-4).join(', ')||'none')}<br>FAILED STRATEGIES: ${esc(P.bad.slice(-4).join(', ')||'none')}</p>
 <div class="big" style="font-size:28px">${esc(m.verdict)}</div><p style="max-width:620px">NEXA FINAL ANALYSIS: “${esc(txt)}”</p><button id="a">PLAY AGAIN (NEXA REMEMBERS)</button><button id="d">MAIN MENU</button>`);bind('a',again);bind('d',dashf)};
