'use strict';
const worldArt=new Image(),ovumArt=new Image();worldArt.src='assets/adult-world.png';ovumArt.src='assets/adult-ovum.png';
let lightEffects=false;
try{lightEffects=localStorage.getItem('cell-light-fx')==='1'}catch{}
function sparks(x,y,color,count=8,power=100){if(!g)return;g.particles??=[];const cap=lightEffects?100:450;for(let i=0;i<(lightEffects?Math.ceil(count/3):count)&&g.particles.length<cap;i++){const a=Math.random()*Math.PI*2,v=power*(.3+Math.random()*.7),life=.3+Math.random()*.4;g.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,max:life,color,r:1+Math.random()*2})}}
function updateVisuals(dt){for(const p of g.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*2);p.vy*=Math.exp(-dt*2)}g.particles=g.particles.filter(p=>p.life>0);g.flash=Math.max(0,g.flash-dt)}
function star(x,y,r,color,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,rr=i%2?r*.3:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.restore()}
function ring(x,y,r,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke()}
function drawEnemy(e){
 const a=Math.atan2(g.y-e.y,g.x-e.x),boss=e.type===3;
 if(e.warning>0){ctx.save();ctx.strokeStyle='#ff547b88';ctx.lineWidth=e.r*1.5;ctx.setLineDash([14,10]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+e.aimX*e.chargeSpeed*.65,e.y+e.aimY*e.chargeSpeed*.65);ctx.stroke();ctx.restore();ring(e.x,e.y,e.r+10,'#ffddcc',2)}
 ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);
 const color=e.freeze>0||e.slow>0?'#a5eaff':boss?'#ff99c4':e.elite?'#ffd380':e.type===1?'#ffb88a':e.type===2?'#a79af4':'#c4b4f2';
 ctx.strokeStyle=color;ctx.lineWidth=boss?6:2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-e.r,0);for(let i=1;i<=15;i++){const x=-e.r-i*(boss?5:3);ctx.lineTo(x,Math.sin(g.t*9-i*.5+e.x)*i*.7)}ctx.stroke();
 ctx.fillStyle=e.hit>0?'#fff':color;ctx.beginPath();ctx.ellipse(0,0,e.r,e.r*.76,0,0,TAU);ctx.fill();
 ctx.fillStyle='#ffffff35';ctx.beginPath();ctx.ellipse(-e.r*.2,-e.r*.23,e.r*.64,e.r*.28,-.2,0,TAU);ctx.fill();circle(-e.r*.2,e.r*.12,e.r*.3,boss?'#d65d9b':'#726ab455');
 ctx.strokeStyle='#ffffffaa';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.r*.45,0,e.r*.35,e.r*.55,0,-Math.PI/2,Math.PI/2);ctx.stroke();
 if(e.elite||boss){ctx.strokeStyle='#ffe7a4';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,e.r+4,e.r*.76+4,0,0,TAU);ctx.stroke();ring(0,0,e.r+8,'#d4a5ff50',1)}
 ctx.restore();
 if(boss){ctx.fillStyle='#101d30';ctx.fillRect(e.x-44,e.y-e.r-20,88,5);ctx.fillStyle='#ff9abf';ctx.fillRect(e.x-44,e.y-e.r-20,88*Math.max(0,e.hp/e.max),5);ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(bossNames[e.bossIndex-1],e.x,e.y-e.r-29)}
}
function draw(){
 ctx.fillStyle='#081923';ctx.fillRect(0,0,W,H);
 if(worldArt.complete&&worldArt.naturalWidth){const scale=Math.max(W/worldArt.width,H/worldArt.height);ctx.drawImage(worldArt,(W-worldArt.width*scale)/2,(H-worldArt.height*scale)/2,worldArt.width*scale,worldArt.height*scale)}
 if(!g)return;
 const ox=W/2-g.x,oy=H*.55-g.y;ctx.save();ctx.translate(ox,oy);
 // Quiet moving motes make movement readable without hiding combat.
 for(let i=0;i<30;i++){const x=((i*193-g.x*.2)%(W+100)+W+100)%(W+100)-50-ox,y=((i*137-g.y*.2+g.t*3)%(H+100)+H+100)%(H+100)-50-oy;circle(x,y,1.5,'#8ce9dc25')}
 drawFields();
 for(const gem of g.gems)star(gem.x,gem.y,5,'#9ff1dc',Math.PI/4);
 for(const c of g.chests){ring(c.x,c.y,27+Math.sin(g.t*3)*3,'#ffc9da70',2);star(c.x,c.y-22,7,'#ffe5c9',g.angle);ctx.fillStyle='#8b6e93';ctx.fillRect(c.x-18,c.y-11,36,25);ctx.strokeStyle='#ffe0ea';ctx.lineWidth=2;ctx.strokeRect(c.x-18,c.y-11,36,25);ctx.fillStyle='#ffe0ea';ctx.fillRect(c.x-3,c.y-6,6,15);ctx.fillRect(c.x-8,c.y-1,16,5)}
 for(const e of g.enemies)if(e.x+ox>-100&&e.x+ox<W+100&&e.y+oy>-100&&e.y+oy<H+100)drawEnemy(e);
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const b of g.shots){ctx.strokeStyle=b.color;ctx.globalAlpha=.35;ctx.lineWidth=b.r*1.6;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.045,b.y-b.vy*.045);ctx.stroke();ctx.globalAlpha=1;if(b.shape==='heart'){ctx.fillStyle=b.color;ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText('♥',b.x,b.y+5)}else if(b.returning)star(b.x,b.y,b.r+3,b.color,g.angle*3);else{circle(b.x,b.y,b.r,b.color);circle(b.x,b.y,b.r*.4,'#fff8ea')}}
 for(const ef of g.effects){const f=ef.life/ef.max;ctx.globalAlpha=f;ctx.strokeStyle=ef.color;ctx.lineWidth=ef.line?2:3;ctx.beginPath();if(ef.line){ctx.moveTo(g.x,g.y);const dx=ef.x-g.x,dy=ef.y-g.y;for(let i=1;i<6;i++){const n=i%2?9:-9;ctx.lineTo(g.x+dx*i/6+n,g.y+dy*i/6-n)}ctx.lineTo(ef.x,ef.y);ctx.stroke();}else{const r=ef.r*(1-f*.5);ring(ef.x,ef.y,r,ef.color,3);ring(ef.x,ef.y,r*.82,ef.color+'66',1);if(!lightEffects)for(let i=0;i<8;i++)star(ef.x+Math.cos(i*TAU/8+g.angle)*r,ef.y+Math.sin(i*TAU/8+g.angle)*r,4*f,ef.color)}}
 for(const p of g.particles){ctx.globalAlpha=p.life/p.max;star(p.x,p.y,p.r+1,p.color,p.life*3)}ctx.restore();
 if(level('orbit')){const s=orbitSpec();ring(g.x,g.y,s.radius,'#92efd320');for(let i=0;i<s.count;i++){const a=g.angle+i*TAU/s.count,r=s.h&&i%2?s.radius*.62:s.radius,x=g.x+Math.cos(a)*r,y=g.y+Math.sin(a)*r;circle(x,y,14,s.h?'#ffc5f122':'#91e9d422');star(x,y,11,s.h?'#ffc5f1':'#91e9d4',a);circle(x,y,3,'#fff')}}
 ctx.globalAlpha=g.inv>0?.65+.35*Math.sin(g.t*25)**2:1;
 ring(g.x,g.y,31+Math.sin(g.t*3)*2,'#a0efd477',2);circle(g.x,g.y,38,'#a0efd410');
 if(ovumArt.complete&&ovumArt.naturalWidth)ctx.drawImage(ovumArt,g.x-32,g.y-36,64,64*ovumArt.height/ovumArt.width);else{circle(g.x,g.y,23,'#faeedb');circle(g.x-3,g.y-2,9,'#b6a9da');ring(g.x,g.y,26,'#b9f5ed',2)}
 ctx.globalAlpha=1;ctx.restore();
 for(const c of g.chests){const sx=c.x+ox,sy=c.y+oy;if(sx<30||sx>W-30||sy<160||sy>H-40){const x=Math.max(30,Math.min(W-30,sx)),y=Math.max(165,Math.min(H-45,sy));ctx.fillStyle='#ffd58b';ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText('▣',x,y);ctx.font='10px sans-serif';ctx.fillText('보급함',x,y+16)}}
 if(g.flash>0&&!lightEffects){ctx.fillStyle='#ff7395'+Math.floor(Math.min(.12,g.flash)*255).toString(16).padStart(2,'0');ctx.fillRect(0,0,W,H)}
}

function drawFertilization(){
 const t=g.finaleTime,x=W/2,y=H*.55;
 ctx.fillStyle='#061923d9';ctx.fillRect(0,0,W,H);
 const r=Math.min(85,W*.18),p=Math.min(1,t/3),sx=x+Math.min(300,W*.4)*(1-p)+r*.76;
 ctx.save();ctx.shadowColor='#a7fff1';ctx.shadowBlur=lightEffects?0:26;
 if(ovumArt.complete&&ovumArt.naturalWidth)ctx.drawImage(ovumArt,x-r,y-r,r*2,r*2);else{circle(x,y,r,'#eedce8');ring(x,y,r+4,'#8ce9de',3)}
 if(!g.friendly.fused){
 ctx.strokeStyle='#efffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx+15,y);for(let i=1;i<30;i++)ctx.lineTo(sx+15+i*2.2,y+Math.sin(t*10-i*.45)*i*.24);ctx.stroke();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(sx,y,17,10,0,0,TAU);ctx.fill();circle(sx+2,y,5,'#b8e8ea');
 }else{circle(x-12,y,9,'#e3baff');circle(x+12,y,9,'#c9f9ff');for(let i=0;i<3;i++)ring(x,y,r+(t-3)*45+i*12,'#c5fff0'+Math.max(0,Math.floor((5.5-t)*45)).toString(16).padStart(2,'0'),2);}
 ctx.restore();ctx.textAlign='center';ctx.fillStyle='#d9fff6';ctx.font='600 22px sans-serif';ctx.fillText(g.friendly.fused?'수정 완료':'남표니의 정자 도착',x,y+r+55);ctx.fillStyle='#9fc8c9';ctx.font='13px sans-serif';ctx.fillText(g.friendly.fused?'함께 지켜낸 새로운 시작':'난자의 방어선이 안전해졌습니다',x,y+r+82);
}
