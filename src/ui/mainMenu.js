// HOME screen: NEW GAME (empty name field) and CONTINUE PROFILE are separate actions. Plus settings + dashboard.
import {audio} from '../systems/audioSystem.js';
import {Nexa} from '../ai/nexaAgent.js';
import {show,bind,esc} from './core.js';
export function menu({names,newGame,cont,settings}){
 show(`<h1>FAILURE IS THE WEAPON</h1><p>Failure → Memory → Adaptation</p><p>Enter your name</p><input id="nm" maxlength="16" placeholder="Enter Your Name" autocomplete="off" value="">
 <div><button id="b1">NEW GAME</button><button id="b4">SETTINGS</button></div>
 ${names.length?`<p style="margin:10px 0 0;opacity:.8">CONTINUE PROFILE</p><div>${names.map(n=>`<button class="chip" data-n="${esc(n)}">▶ ${esc(n)}</button>`).join('')}</div>`:''}`);
 const nm=()=>document.getElementById('nm').value;document.getElementById('nm').value='';
 bind('b1',()=>newGame(nm()));bind('b4',settings);
 document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{audio.sfx('click');cont(b.dataset.n)});
 document.getElementById('nm').onkeydown=e=>{if(e.key=='Enter')newGame(nm())}}
export function confirmOverwrite(name,overwrite,cont,back){show(`<h2>PROFILE EXISTS</h2><p>A profile named <b>${esc(name)}</b> already exists.</p><button id="o1">CONTINUE THAT PROFILE</button><button id="o2">ERASE IT AND START NEW</button><button id="o3">BACK</button>`);bind('o1',cont);bind('o2',overwrite);bind('o3',back)}
export function settings(back){show(`<h2>SETTINGS</h2><button id="s1">NEXA voice: ${Nexa.voice?'ON':'OFF'}</button><button id="s2">Sound: ${audio.muted?'OFF':'ON'}</button><div><button id="s3">BACK</button></div>`);
 bind('s1',()=>{Nexa.voice=!Nexa.voice;settings(back)});bind('s2',()=>{audio.muted=!audio.muted;settings(back)});bind('s3',back)}
