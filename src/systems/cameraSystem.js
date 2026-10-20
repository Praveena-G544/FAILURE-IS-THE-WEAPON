// CAMERA: smooth third-person follow camera used by the stealth / prediction rounds.
import {THREE,camera} from '../world.js';
export function follow(pl,dt,o=[0,9,11]){const p=pl.g.position;camera.position.lerp(new THREE.Vector3(p.x+o[0],p.y+o[1],p.z+o[2]),Math.min(1,dt*4));camera.lookAt(p.x,p.y+1,p.z-2)}
