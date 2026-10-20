// Instruction panels: every round explains objective + controls and waits for the player to press START.
import {show,bind,U,esc} from './core.js';
import {audio} from '../systems/audioSystem.js';
export const instructions=({n,name,objective,controls},start)=>{show(`<h2>ROUND ${n} — ${name}</h2><p style="max-width:560px"><b>OBJECTIVE</b><br>${objective}</p><p style="max-width:560px;text-align:left"><b>CONTROLS</b><br>${controls.map(c=>'• '+c).join('<br>')}</p><button id="go" class="cta2" style="position:static;transform:none;margin-top:8px">START ROUND ${n}</button>`);bind('go',start)};
export const numbers=f=>{show(`<h2>CHOOSE YOUR NUMBER</h2><div>${[1,2,3,4,5,6].map(n=>`<button class="num" data-n="${n}">${n}</button>`).join('')}</div><p style="font-size:13px;opacity:.7">Each number hides a shape. Then: mouse = needle, hold left button to cut.</p>`,'top:auto;bottom:24px;transform:translate(-50%,0)');U.querySelectorAll('.num').forEach(b=>b.onclick=()=>{audio.sfx('click');f(+b.dataset.n)})};
export const cta=(label,f)=>{show(`<button id="x" style="font-size:22px">${label}</button>`,'top:auto;bottom:24px;transform:translate(-50%,0);padding:8px');bind('x',f)};
