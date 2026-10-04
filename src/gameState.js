// CENTRAL GAME STATE. One current state, validated transitions, no scattered booleans.
// Key protection: CHARACTER_SELECTION can only be entered from HOME / NAME_INPUT / WELCOME_BACK
// (explicit player actions). Every round state, NEXA_INTRO, CHARACTER_CONFIRMED and FINAL_RESULT are blocked,
// so gameplay can never fall back into character selection - even if a stray handler tried.
const round=n=>n==1?['INTRO','NUMBER_SELECTION','SHAPE_REVEAL','INSTRUCTIONS','CUTTING','ANALYSIS','RESULT']:n==5?['INTRO','INSTRUCTIONS','PLAYING','ANALYSIS']:['INTRO','INSTRUCTIONS','PLAYING','ANALYSIS','RESULT'];
export const STATES=['HOME','NAME_INPUT','WELCOME_BACK','CHARACTER_SELECTION','CHARACTER_CONFIRMED','NEXA_INTRO',
 ...[1,2,3,4,5].flatMap(n=>round(n).map(s=>`ROUND_${n}_${s}`)),'FINAL_RESULT'];
const SELECT_FROM=['HOME','NAME_INPUT','WELCOME_BACK','CHARACTER_SELECTION'];
let cur='HOME';const history=[];
export const gs={
 get:()=>cur,is:s=>cur===s,history,
 set(next){if(!STATES.includes(next)){console.warn('[state] unknown',next);return false}
  if(next==='CHARACTER_SELECTION'&&!SELECT_FROM.includes(cur)){console.warn('[state] blocked',cur,'->',next);return false}
  if(next!==cur){history.push(cur+'>'+next);if(history.length>60)history.shift()}cur=next;return true},
 // States in which round code runs (R1 runs through its sub-states; R2-5 only in PLAYING)
 playing:()=>/^ROUND_1_(INTRO|NUMBER_SELECTION|SHAPE_REVEAL|INSTRUCTIONS|CUTTING)$/.test(cur)||/^ROUND_[2-5]_PLAYING$/.test(cur),
 acceptsGameInput:()=>cur==='ROUND_1_CUTTING'||/^ROUND_[2-5]_PLAYING$/.test(cur),
 inRoundScene:()=>/^ROUND_\d_/.test(cur)};
