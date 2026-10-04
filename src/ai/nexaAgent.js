// NEXA AGENT: the central intelligence. Observes (log), remembers (recall), decides what to say, and speaks
// with browser Text-to-Speech while showing the same words as subtitles.
import {audio} from '../systems/audioSystem.js';
import {recallLine,logEvent} from '../player/playerMemory.js';
const $=id=>document.getElementById(id);
export const Nexa={last:0,voice:true,
 sq:0,
 say(t,gap=2.5,cb){const n=performance.now()/1000;if(gap&&n-this.last<gap)return;this.last=n;const s=$('sub');s.innerHTML=`<b>NEXA</b>“${t}”`;s.classList.add('on');clearTimeout(this.tm);
  let f=!cb;const fin=()=>{if(!f){f=true;cb()}},ms=Math.max(1800,t.length*95);this.tm=setTimeout(()=>s.classList.remove('on'),cb?ms+1500:3400);
  if(this.voice&&window.speechSynthesis&&!audio.muted){const u=new SpeechSynthesisUtterance(t);u.pitch=.6;u.rate=.95;u.onend=u.onerror=()=>setTimeout(fin,250);speechSynthesis.cancel();speechSynthesis.speak(u);if(cb)setTimeout(fin,ms+2500)}else if(cb)setTimeout(fin,ms)},
 seq(lines,done){const id=++this.sq;let i=0;const nx=()=>{if(id!=this.sq)return;if(i>=lines.length)return done&&done();this.say(lines[i++],0,nx)};nx()},
 stop(){this.sq++;if(window.speechSynthesis)speechSynthesis.cancel();$('sub').classList.remove('on')},
 log(p,r,e,d={}){logEvent(p,r,e,d)},
 recall(p){return recallLine(p)}};