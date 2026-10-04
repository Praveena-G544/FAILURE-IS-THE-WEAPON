// GUARD AGENT: vision cone + line-of-sight (blocked by crates) + aiming. Round 2 feeds it BFS/DFS routes and habit lanes.
export class Guard{constructor(g){this.g=g;this.sus=0}
 see(pos,covers,range=26,half=.62){const g=this.g.position,dx=pos.x-g.x,dz=pos.z-g.z;if(Math.hypot(dx,dz)>range)return false;let a=Math.atan2(-dz,dx)-this.g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)>half)return false;
  for(let i=1;i<12;i++){const x=g.x+dx*i/12,z=g.z+dz*i/12;if(covers.some(c=>Math.abs(x-c.position.x)<c.userData.hw&&Math.abs(z-c.position.z)<c.userData.hw))return false}return true}
 aim(dt,tx,tz,rate){const want=Math.atan2(-(tz-this.g.position.z),tx-this.g.position.x);let d=want-this.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));this.g.rotation.y+=Math.max(-rate*dt,Math.min(rate*dt,d))}}
export const riskLabel=r=>r>60?'HIGH':r>30?'MEDIUM':'LOW';
