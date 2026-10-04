// UI core: one overlay container (#ui) on top of the 3D canvas. Every screen replaces the previous one, so old buttons
// (and their handlers) are destroyed with their DOM and can never receive input later.
import {audio} from '../systems/audioSystem.js';
export const U=document.getElementById('ui');
export const show=(h,st='')=>{U.innerHTML=`<div class="panel" style="${st}">${h}</div>`};
export const bind=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=()=>{audio.sfx('click');f()}};
export const cards=a=>`<div class="grid">${a.map((c,i)=>`<div class="card" style="animation-delay:${i*60}ms">${c[0]}<b>${c[1]}</b></div>`).join('')}</div>`;
export const avg=a=>a.length?a.reduce((x,y)=>x+y)/a.length:0;
export const clear=()=>{U.innerHTML=''};
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
