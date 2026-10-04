// SAVE SYSTEM: one localStorage entry per player name (profiles never mix). load() returns null when no profile exists.
import {fresh} from '../player/playerProfile.js';
const K='fitw:';
export const load=n=>{try{const s=localStorage.getItem(K+n);return s?{...fresh(n),...JSON.parse(s)}:null}catch{return null}};
export const save=p=>{try{localStorage.setItem(K+p.name,JSON.stringify(p))}catch{}};
export const names=()=>{try{return Object.keys(localStorage).filter(k=>k.startsWith(K)).map(k=>k.slice(K.length))}catch{return[]}};
export const wipe=n=>{try{localStorage.removeItem(K+n)}catch{}};
