// COLLISION: pushes a position out of square crate colliders (each crate has userData.hw = half width).
export function collide(pos,boxes){boxes.forEach(b=>{const hw=b.userData.hw,dx=pos.x-b.position.x,dz=pos.z-b.position.z;if(Math.abs(dx)<hw&&Math.abs(dz)<hw){if(hw-Math.abs(dx)<hw-Math.abs(dz))pos.x=b.position.x+Math.sign(dx||1)*hw;else pos.z=b.position.z+Math.sign(dz||1)*hw}})}
