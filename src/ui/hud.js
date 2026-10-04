// HUD: ROUND x/5, NEXA status, time, lives, score, risk, mistakes, adaptation + round-specific progress / alert.
const H=document.getElementById('hud');
H.innerHTML='<div id="bar"><span id="hr"></span><span id="hn"></span><span id="ht"></span><span id="hl"></span><span id="hs"></span></div><div id="bar2"><span id="h2"></span></div><div id="msg"></div><button id="ps" style="position:absolute;right:16px;top:78px">PASS (P)</button>';
const g=id=>document.getElementById(id);
export const hud={show(v,pass){H.style.display=v?'block':'none';g('ps').style.display=pass?'block':'none'},onPass(f){g('ps').onclick=f},
 set(o){g('hr').textContent=(o.round?'ROUND '+o.round+' / 5 · ':'')+(o.title||'');g('hn').textContent=o.nexa?'NEXA '+o.nexa:'';g('ht').textContent=o.time!=null?'⏱ '+o.time:'';g('hl').textContent=o.lives!=null?'♥'.repeat(Math.max(0,o.lives)):'';
  g('hs').textContent=o.prog!=null?'PROGRESS '+Math.round(o.prog*100)+'%':(o.sus!=null?'DETECTION '+Math.round(Math.min(1,o.sus)*100)+'%':'');
  g('h2').textContent=o.stats||'';g('msg').textContent=o.msg||''}};
hud.show(false);
