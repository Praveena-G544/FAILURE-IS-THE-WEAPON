// ROUND_n_ANALYSIS: NEXA 'thinks' on screen - shows which algorithm outputs it used for this round (real data, not decoration).
import {show,esc} from './core.js';
export const analysis=(n,lines)=>{show(`<h2>NEXA ANALYSING ROUND ${n}…</h2><div class="ring" style="margin:8px auto"></div><div style="text-align:left;max-width:560px;font-family:monospace;font-size:13px;line-height:1.5">${lines.map(l=>'› '+esc(l)).join('<br>')}</div>`)};
