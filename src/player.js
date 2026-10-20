// PLAYER: four procedural human-like characters (different build, hair, outfit, accessories) + movement.
// The character chosen in CHARACTER_SELECTION is stored in the profile and rebuilt with human() in every round.
import {THREE,stage} from './world.js';
import {input} from './systems/inputSystem.js';
// Four distinct characters: different build (H=height, W=width), hairstyle (hs), outfit (fit), face extras.
export const CHARS=[
 {n:'VOLT',d:'Tall · crop hair · glasses · neon jacket',top:0x19e6ff,bot:0x203a70,hair:0x1a1a1a,skin:0xf0c090,acc:0xff3df0,H:1.1,W:.9,hs:'crop',fit:'jacket',glasses:1},
 {n:'EMBER',d:'Slim · long hair · headband · dress',top:0xff8a3d,bot:0xff8a3d,hair:0x7a2a10,skin:0xc88a60,acc:0xffe14a,H:.95,W:.8,hs:'long',fit:'dress'},
 {n:'NOVA',d:'Short & stocky · beanie · hoodie',top:0xc04bff,bot:0x28204a,hair:0xe8e8ff,skin:0xf6d0b0,acc:0x3dff9a,H:.85,W:1.3,hs:'beanie',fit:'hoodie'},
 {n:'JADE',d:'Broad · afro · beard · suit & tie',top:0x2a2f3a,bot:0x2a2f3a,hair:0x101010,skin:0x8a5a3a,acc:0xe03050,H:1.15,W:1.15,hs:'afro',fit:'suit',beard:1}];
export function human(o){const H=o.H||1,W=o.W||1,hs=o.hs||'crop',acc=o.acc||0xffffff,dress=o.fit=='dress',g=new THREE.Group(),M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.7});
 const add=(geo,c,x,y,z,p)=>{const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m};
 const B=new THREE.Group();B.scale.set(W,H,1);g.add(B);const hd=new THREE.Group();hd.position.y=1.95*H;hd.scale.setScalar(W>1.2?1.12:H<.9?1.08:1);g.add(hd);
 add(new THREE.CapsuleGeometry(.3,.5,4,10),o.top,0,1.3,0,B);
 if(o.fit=='jacket'){add(new THREE.BoxGeometry(.12,.8,.04),acc,0,1.3,.3,B);add(new THREE.BoxGeometry(.5,.08,.4),acc,0,1.68,0,B)}
 if(o.fit=='hoodie'){add(new THREE.TorusGeometry(.26,.09,8,16),o.top,0,1.68,-.05,B).rotation.x=1.2;add(new THREE.BoxGeometry(.45,.18,.05),0x8030b0,0,1.1,.3,B)}
 if(o.fit=='suit'){add(new THREE.BoxGeometry(.22,.5,.04),0xffffff,0,1.4,.3,B);add(new THREE.BoxGeometry(.07,.42,.05),acc,0,1.38,.33,B)}
 if(dress)add(new THREE.CylinderGeometry(.28,.6,.55,16),o.top,0,.95,0,B);
 const limb=(x,y,len,c,r,ec,shoe)=>{const p=new THREE.Group();p.position.set(x,y,0);add(new THREE.CapsuleGeometry(r,len,4,8),c,0,-len/2-.1,0,p);
  if(shoe)add(new THREE.BoxGeometry(.22,.1,.34),ec,0,-len-.17,.06,p);else add(new THREE.SphereGeometry(r*1.15,8,8),ec,0,-len-.2,0,p);B.add(p);return p};
 g.userData.l=[limb(-.42,1.55,.55,o.top,.1,o.skin),limb(.42,1.55,.55,o.top,.1,o.skin),limb(-.17,.98,.7,dress?o.skin:o.bot,dress?.08:.11,0x222222,1),limb(.17,.98,.7,dress?o.skin:o.bot,dress?.08:.11,0x222222,1)];
 add(new THREE.SphereGeometry(.27,16,12),o.skin,0,0,0,hd);
 [-.09,.09].forEach(x=>{add(new THREE.SphereGeometry(.045,8,8),0xffffff,x,.04,.235,hd);add(new THREE.SphereGeometry(.025,8,8),0x111111,x,.04,.275,hd);add(new THREE.BoxGeometry(.1,.02,.02),o.hair,x,.12,.255,hd)});
 add(new THREE.ConeGeometry(.035,.09,6),o.skin,0,-.03,.28,hd).rotation.x=Math.PI/2;add(new THREE.BoxGeometry(.11,.03,.03),dress?0xd02050:0x7a3030,0,-.12,.26,hd);
 const cap=(c,len=1.5)=>add(new THREE.SphereGeometry(.29,16,12,0,6.3,0,len),c,0,.03,-.02,hd);
 if(hs=='crop')cap(o.hair);
 if(hs=='long'){cap(o.hair);add(new THREE.CapsuleGeometry(.2,.5,4,8),o.hair,0,-.3,-.14,hd);add(new THREE.TorusGeometry(.28,.02,6,20),acc,0,.12,0,hd).rotation.x=Math.PI/2}
 if(hs=='beanie'){cap(acc,1.7);add(new THREE.SphereGeometry(.07,8,8),0xffffff,0,.32,0,hd)}
 if(hs=='afro')add(new THREE.SphereGeometry(.4,16,12),o.hair,0,.1,-.05,hd);
 if(o.glasses){[-.09,.09].forEach(x=>add(new THREE.TorusGeometry(.07,.012,6,12),0x111111,x,.04,.285,hd));add(new THREE.BoxGeometry(.05,.012,.012),0x111111,0,.04,.285,hd)}
 if(o.beard)add(new THREE.SphereGeometry(.28,12,10,0,6.3,1.9,1),o.hair,0,-.02,.01,hd);
 return g}
const walk=(h,s,t)=>{const l=h.userData.l,a=Math.sin(t*10)*.8*Math.min(1,s/3);l[0].rotation.x=a;l[1].rotation.x=-a;l[2].rotation.x=-a;l[3].rotation.x=a};
export function newPlayer(p,x=0,z=0){const g=human(CHARS[p.character]);g.position.set(x,0,z);stage.add(g);return{g,v:new THREE.Vector3()}}
// WASD/arrows move on the ground plane (W = away from camera). Returns current speed.
export function move(pl,dt,spd,t){const k=input.keys,h=a=>a.some(c=>k.has(c));let x=(h(['KeyD','ArrowRight'])?1:0)-(h(['KeyA','ArrowLeft'])?1:0),z=(h(['KeyS','ArrowDown'])?1:0)-(h(['KeyW','ArrowUp'])?1:0);
 const l=Math.hypot(x,z);if(l){x/=l;z/=l;pl.v.set(x*spd,0,z*spd);pl.g.position.x+=x*spd*dt;pl.g.position.z+=z*spd*dt;pl.g.rotation.y=Math.atan2(x,z)}else pl.v.set(0,0,0);
 walk(pl.g,pl.v.length(),t);return pl.v.length()}
