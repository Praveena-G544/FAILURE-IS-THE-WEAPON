// Synthesized sound (WebAudio) - no asset files needed.
let ac;
export const audio={muted:false,
 beep(f=440,d=.15,type='sine',v=.12,to){if(this.muted)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.linearRampToValueAtTime(to,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(ac.destination);o.start();o.stop(t+d)}catch{}},
 sfx(k){const m={ok:()=>{this.beep(660,.12);setTimeout(()=>this.beep(990,.2),110)},bad:()=>this.beep(200,.5,'sawtooth',.15,60),warn:()=>this.beep(300,.1,'square',.08),red:()=>this.beep(150,.5,'sawtooth',.15),green:()=>this.beep(880,.25,'triangle'),crack:()=>this.beep(120,.2,'square',.15,60),click:()=>this.beep(520,.05)};m[k]&&m[k]()},
 music(){if(this.mt)return;const n=[110,131,165,196,165,131];let i=0;this.mt=setInterval(()=>this.beep(n[i++%6],.5,'triangle',.04),480)}};
