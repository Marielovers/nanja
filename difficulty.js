'use strict';
// 매 60초 지점을 선형 보간합니다. 난이도 조절은 이 표부터 수정하세요.
const DIFFICULTY = [
  {hp:18, speed:52, runner:92, damage:10, batch:2, interval:.70, elite:0},
  {hp:38, speed:68, runner:110, damage:13, batch:3, interval:.56, elite:0},
  {hp:72, speed:86, runner:132, damage:16, batch:5, interval:.44, elite:.08},
  {hp:115, speed:104, runner:152, damage:19, batch:7, interval:.35, elite:.14},
  {hp:165, speed:123, runner:174, damage:22, batch:9, interval:.29, elite:.20},
  {hp:225, speed:140, runner:190, damage:25, batch:11, interval:.25, elite:.25}
];
const ENEMY_LIMIT=340;
const BOSS_HP=[650,1400,2600,4400,7200];
function difficultyAt(seconds){
  const t=Math.max(0,Math.min(300,seconds))/60,i=Math.min(4,Math.floor(t)),f=t-i,a=DIFFICULTY[i],b=DIFFICULTY[i+1],out={};
  for(const key of Object.keys(a))out[key]=a[key]+(b[key]-a[key])*f;
  return out;
}
// 보스는 예고 시작 시 방향을 고정합니다. 옆 이동·대시로 회피할 수 있습니다.
function enemyMotion(e,dt){
  const dx=g.x-e.x,dy=g.y-e.y,d=Math.hypot(dx,dy)||1;
  let vx=dx/d*e.speed,vy=dy/d*e.speed;
  if(e.type===3){
    if(e.charge>0){e.charge-=dt;vx=e.aimX*e.chargeSpeed;vy=e.aimY*e.chargeSpeed;}
    else if(e.warning>0){e.warning=Math.max(0,e.warning-dt);vx=vy=0;if(e.warning===0)e.charge=.65;}
    else {e.chargeCooldown-=dt;if(e.chargeCooldown<=0){e.aimX=dx/d;e.aimY=dy/d;e.warning=.85;e.chargeCooldown=6-e.bossIndex*.5;vx=vy=0;}}
  }
  const slow=e.freeze>0?0:e.slow>0?.4:1;e.x+=vx*slow*dt;e.y+=vy*slow*dt;
}
