// EFFECTS: floating cinematic dust particles used by the character-confirmation / NEXA / round-intro scenes.
import {THREE,stage} from '../world.js';
export function createDust(n=80){const a=new Float32Array(n*3);for(let i=0;i<n*3;i+=3){a[i]=(Math.random()-.5)*10;a[i+1]=Math.random()*5;a[i+2]=(Math.random()-.5)*8}
 const d=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(a,3)),new THREE.PointsMaterial({size:.08,color:0x8ff6ff}));d.frustumCulled=false;stage.add(d);return d}
export function updateDust(d,dt){const a=d.geometry.attributes.position;for(let i=1;i<a.array.length;i+=3){a.array[i]+=dt*.3;if(a.array[i]>5)a.array[i]=0}a.needsUpdate=true}
