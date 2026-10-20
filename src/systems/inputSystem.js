// INPUT: keyboard + pointer state. Gated by `input.enabled`, which main.js switches ON only in gameplay states,
// so a mouse drag or key press can never reach gameplay (or anything else) from menus / character selection,
// and gameplay input never leaks into character selection. Listeners are attached exactly once (module scope).
export const input={keys:new Set(),mx:0,my:0,down:false,enabled:false};
export const setInputEnabled=v=>{input.enabled=!!v;if(!v){input.down=false;input.keys.clear()}};
const cv=document.getElementById('c');
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||!input.enabled)return;input.keys.add(e.code);if(e.code.startsWith('Arrow')||e.code=='Space')e.preventDefault()});
addEventListener('keyup',e=>input.keys.delete(e.code));
cv.addEventListener('pointermove',e=>{input.mx=e.clientX/innerWidth*2-1;input.my=-(e.clientY/innerHeight*2-1)});
cv.addEventListener('pointerdown',()=>{if(input.enabled)input.down=true});
addEventListener('pointerup',()=>input.down=false);
addEventListener('pointercancel',()=>input.down=false);
