'use strict';
const MAX_LEVEL = 5, MAX_ITEMS = 8;
function ownedCount(){return Object.keys(g.weapons).length+Object.keys(g.passives).length}
function xpRequired(lv){return 3*(8+2*lv)+2*(lv-1)**2}
const pairs = [
 ['bolt','✦','항체 탄환','power','◈','응축 에너지','항체 폭풍','자동 조준 탄환','모든 피해 +12% / 레벨','관통 탄막 + 자동 조준'],
 ['orbit','◌','회전 방패','armor','🛡','튼튼한 세포막','이중 세포막','주변을 도는 공격 방패','받는 피해 8% 감소 / 레벨','두 겹의 방패 + 지속 반격'],
 ['frost','❄','냉동 파동','range','◎','확장 세포','절대영도 돔','주위 공격 + 둔화','광역·회전 공격 범위 +12% / 레벨','광역 동결 + 얼음 파편'],
 ['chain','ϟ','이온 연쇄','haste','◷','촉매 효소','이온 코어','가까운 적에게 연쇄 공격','공격 간격 7% 감소 / 레벨','연쇄 타격 + 주변 번개 폭발'],
 ['support','♥','남표니 지원포','regen','✚','재생 인자','남표니의 약속','사방으로 관통탄 발사','초당 체력 0.35 회복 / 레벨','백색 탄막 + 회복 파동'],
 ['boomerang','↶','단백질 부메랑','magnet','🧲','자석 수용체','나선 단백질','날아갔다 돌아오는 단백질','경험치 흡수 범위 +55 / 레벨','세 갈래 나선 + 아이템 끌어오기'],
 ['garden','⬡','효소 지뢰','fortune','⌬','대사 촉진','효소 반응장','적 근처에 지속 피해 반응장','경험치 획득량 +10% / 레벨','효소 반응장 + 처치 보너스 경험치'],
 ['meteor','☄','소포 폭격','speed','➚','세포 추진기','소포 대폭발','적을 겨냥한 지연 폭발','이동 속도 +10% / 레벨','다중 소포 + 잔류 폭발']
].map(([active,icon,name,passive,picon,pname,hidden,desc,pdesc,hdesc])=>({active,icon,name,passive,picon,pname,hidden,desc,pdesc,hdesc}));
const defs=pairs.flatMap(p=>[{id:p.active,kind:'active',icon:p.icon,name:p.name,desc:p.desc,pair:p.passive},{id:p.passive,kind:'passive',icon:p.picon,name:p.pname,desc:p.pdesc,pair:p.active}]);
const healItem={id:'heal',kind:'item',icon:'✚',name:'회복 배양액',desc:'체력을 35 회복합니다.'};
function passive(id){return g?.passives[id]||0}
function level(id){return g?(g.weapons[id]||g.passives[id]||0):0}
function pickupRadius(){return 95+55*passive('magnet')}
function rangeScale(){return 1+.12*passive('range')}
function damageScale(){return 1+.12*passive('power')}
function cooldownScale(){return 1-.07*passive('haste')}
function skillName(d){return g?.hidden[d.id]?pairs.find(p=>p.active===d.id).hidden:d.name}
function skillLevel(d){return g?.hidden[d.id]||level(d.id)}
function upgradePool(){const p=defs.filter(d=>(level(d.id)>0||ownedCount()<MAX_ITEMS)).filter(d=>d.kind==='active'?(g.hidden[d.id]?g.hidden[d.id]<5:level(d.id)<5):level(d.id)<5);return p.length?p:[healItem]}
function checkEvolution(){const evolved=[];for(const p of pairs){if(!g.hidden[p.active]&&level(p.active)===5&&level(p.passive)===5){g.hidden[p.active]=1;evolved.push(p.hidden);g.evolutions.push(p.hidden)}}return evolved}
function grantItem(id){if(id==='heal'){g.hp=Math.min(g.max,g.hp+35);return '체력 +35'}const d=defs.find(d=>d.id===id);if(!d)return '';if(!level(id)&&ownedCount()>=MAX_ITEMS)return '보유 한도 8종';if(d.kind==='active'){if(g.hidden[id])g.hidden[id]=Math.min(5,g.hidden[id]+1);else g.weapons[id]=Math.min(5,level(id)+1)}else g.passives[id]=Math.min(5,level(id)+1);const evolved=checkEvolution();return evolved.length?'★ '+evolved.join(', ')+' 진화!':(g.hidden[id]?'히든 ':'')+'Lv.'+skillLevel(d)}
function shuffle(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function offerSkills(){const pool=upgradePool(),owned=pool.filter(d=>level(d.id)>0||level(d.pair)>0);const first=shuffle(owned).slice(0,1);return [...first,...shuffle(pool.filter(d=>!first.includes(d)))].slice(0,3)}
function card(d){const lv=skillLevel(d),p=pairs.find(p=>p.active===d.id||p.passive===d.id);return `<div class="skill-kind">${d.kind==='item'?'소모품':g.hidden[d.id]?'★ 히든 액티브':d.kind==='active'?'액티브 · 자동 공격':'패시브'}</div><div class="icon">${d.icon}</div><strong>${skillName(d)} ${lv?'Lv.'+lv+' → '+Math.min(5,lv+1):'NEW'}</strong><span>${g.hidden[d.id]?p.hdesc+' · 성능 강화':d.desc}</span>${p?`<small class="pair-hint">${g.hidden[d.id]?'히든 최대 Lv.5':`짝: ${d.kind==='active'?p.pname:p.name} Lv.${level(d.pair)}/5`}</small>`:''}`}
function showEvolutionThen(next){if(!g.evolutions.length){next();return}mode='evolution';sparks(g.x,g.y,'#ffe3ac',70,250);const names=g.evolutions.splice(0);show(`<div class="eyebrow">HIDDEN ACTIVE UNLOCKED</div><div class="chest-symbol">✦</div><h2>히든 액티브 진화!</h2><p>${names.join('<br>')}</p><p>기존 액티브를 대체했습니다.<br>히든 Lv.1 → Lv.5로 다시 강화할 수 있어요.</p><button class="primary" id="evolveContinue">확인 →</button>`);$('evolveContinue').onclick=()=>{if(mode!=='evolution')return;next()};beep(1100)}
function choiceModal(){mode='level';release();keys={};const offered=offerSkills();show(`<div class="eyebrow">LEVEL ${g.lv} · 보유 ${ownedCount()}/${MAX_ITEMS}</div><h2>무엇을 강화할까?</h2><p>무기·패시브 합계 최대 8종 · 짝을 모두 Lv.5로 올리면 진화!</p><div class="choices">${offered.map(d=>`<button class="choice" data-id="${d.id}">${card(d)}</button>`).join('')}</div>`);document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{if(mode!=='level')return;grantItem(b.dataset.id);showEvolutionThen(resume);updateHUD();beep(850)})}
function levelUp(){choiceModal()}
function rollLoot(){const count=1+Math.floor(Math.random()*7),out=[];for(let i=0;i<count;i++){const pool=upgradePool(),d=pool[Math.floor(Math.random()*pool.length)],result=grantItem(d.id);out.push({...d,name:skillName(d),result})}return out}
function showGuide(){if(!['home','play','pause'].includes(mode))return;const back=mode;mode='guide';release();keys={};show(`<div class="eyebrow">SKILL COLLECTION · 8 + 8</div><h2>짝을 완성하면, 숨겨진 힘!</h2><p>액티브 Lv.5 + 짝 패시브 Lv.5 → 히든 액티브 Lv.1<br>히든도 Lv.5까지 강화 · 패시브 효과 유지 · 보유 합계 최대 8종.</p><div class="pair-list">${pairs.map(p=>`<div class="pair-row"><div><b>${p.icon} ${p.name}</b><span>${p.desc} · Lv.${level(p.active)}/5</span></div><div><b>${p.picon} ${p.pname}</b><span>${p.pdesc} · Lv.${level(p.passive)}/5</span></div><div class="hidden-skill"><b>★ ${p.hidden}</b><span>${p.hdesc}${g?.hidden[p.active]?' · Lv.'+g.hidden[p.active]+'/5':''}</span></div></div>`).join('')}</div><button class="primary" id="closeGuide">${back==='home'?'닫기':'계속하기'}</button>`);$('closeGuide').onclick=()=>{if(back==='home'){mode='home';$('modal').hidden=true}else resume()}}
