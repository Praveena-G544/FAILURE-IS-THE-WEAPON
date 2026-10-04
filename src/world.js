// Scene, lights, camera, input, procedural human characters (no model files needed).
import * as THREE from 'three';
export {THREE};
const cv=document.getElementById('c');
export const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
renderer.shadowMap.enabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,2));
export const scene=new THREE.Scene();
export const camera=new THREE.PerspectiveCamera(60,1,.1,300);
const sun=new THREE.DirectionalLight(0xffffff,1.8);sun.position.set(12,24,10);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,far:90});sun.shadow.mapSize.set(2048,2048);
scene.add(sun,new THREE.HemisphereLight(0xa8e4ff,0x6a3aa0,1.2));
const fit=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};
addEventListener('resize',fit);fit();
export let stage=new THREE.Group();scene.add(stage);
export function reset(bg=0x7fd0ff){scene.remove(stage);stage.traverse(o=>o.geometry&&o.geometry.dispose());stage=new THREE.Group();scene.add(stage);scene.background=new THREE.Color(bg);scene.fog=new THREE.Fog(bg,45,120)}
const mat=(c,em)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:em,roughness:.6});
const put=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;stage.add(m);return m};
export const box=(w,h,d,c,x=0,y=0,z=0,em=0)=>put(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,em)),x,y,z);
export const cyl=(r,h,c,x=0,y=0,z=0,em=0)=>put(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,48),mat(c,em)),x,y,z);
export const light=(c,x,y,z,i=40,d=30)=>{const l=new THREE.PointLight(c,i,d);l.position.set(x,y,z);stage.add(l);return l};
export function label(txt,col='#fff',w=4){const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.font='bold 60px sans-serif';g.fillStyle=col;g.textAlign='center';g.fillText(txt,128,70);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));s.scale.set(w,w*96/256,1);stage.add(s);return s}
