// NEXA AGENT: the central intelligence. Observes (log), remembers (recall), decides what to say, and speaks
// with browser Text-to-Speech while showing the same words as subtitles.
import {audio} from '../systems/audioSystem.js';
import {recallLine,logEvent} from '../player/playerMemory.js';
const $=id=>document.getElementById(id);
// NEXA VOICE SELECTION: every device ships different TTS voices (laptop: Microsoft David/Mark, phone: often a female one).
// We list the installed English voices, prefer known male voices, never pick a known female one, and remember the choice.
const MALE=/\b(male|david|mark|daniel|alex|fred|george|james|guy|ryan|thomas|oliver|arthur|rishi|aaron|gordon|bruce|lee|ralph|junior|albert|diego|jorge|google uk english male)\b|en-gb-x-(rjs|gbb|gbd)|en-us-x-(iom|iol|tpd)|en-au-x-(aub|auc)|en-in-x-(ene|end)/i;
const FEMALE=/\b(female|zira|samantha|susan|hazel|linda|heather|catherine|karen|moira|tessa|victoria|fiona|kate|serena|allison|ava|nicky|joana|aria|jenny|emma|amy|siri)\b|en-gb-x-(gba|gbc)|en-us-x-(sfg|tpc|tpf)|en-au-x-(aua|aud)|en-in-x-(ena|enc)/i;
export const Nexa={last:0,voice:true,vo:null,
 isMale(v){const k=v.name+' '+(v.voiceURI||'')+' '+v.lang;return MALE.test(k)&&!FEMALE.test(k)},
 pickVoice(){if(this.vo)return this.vo;const L=(window.speechSynthesis?speechSynthesis.getVoices():[]).filter(v=>/^en/i.test(v.lang));if(!L.length)return null;
  const key=v=>v.name+' '+(v.voiceURI||'')+' '+v.lang,isM=v=>MALE.test(key(v))&&!FEMALE.test(key(v)),rank=v=>(isM(v)?4:0)+(/^en-(us|gb)/i.test(v.lang)?1:0)+(v.localService?.5:0)-(FEMALE.test(key(v))?5:0);
  this.vo=[...L].sort((a,b)=>rank(b)-rank(a))[0];return this.vo},
 sq:0,
 say(t,gap=2.5,cb){const n=performance.now()/1000;if(gap&&n-this.last<gap)return;this.last=n;const s=$('sub');s.innerHTML=`<b>NEXA</b>“${t}”`;s.classList.add('on');clearTimeout(this.tm);
  let f=!cb;const fin=()=>{if(!f){f=true;cb()}},ms=Math.max(1800,t.length*95);this.tm=setTimeout(()=>s.classList.remove('on'),cb?ms+1500:3400);
  if(this.voice&&window.speechSynthesis&&!audio.muted){const u=new SpeechSynthesisUtterance(t),v=this.pickVoice();if(v){u.voice=v;u.lang=v.lang}u.pitch=v&&this.isMale(v)?.6:.2;u.rate=.95;   // male voice -> pitch .6 ; no male voice on this device -> pitch .2 (deeper)
  u.onend=u.onerror=()=>setTimeout(fin,250);speechSynthesis.cancel();speechSynthesis.speak(u);if(cb)setTimeout(fin,ms+2500)}else if(cb)setTimeout(fin,ms)},
 seq(lines,done){const id=++this.sq;let i=0;const nx=()=>{if(id!=this.sq)return;if(i>=lines.length)return done&&done();this.say(lines[i++],0,nx)};nx()},
 stop(){this.sq++;if(window.speechSynthesis)speechSynthesis.cancel();$('sub').classList.remove('on')},
 log(p,r,e,d={}){logEvent(p,r,e,d)},
 recall(p){return recallLine(p)}};
if(window.speechSynthesis)speechSynthesis.onvoiceschanged=()=>{Nexa.vo=null;Nexa.pickVoice()};   // voices load late on phones
