const KEY="shchodnia_game_v2";
const $=s=>document.querySelector(s);
const state=JSON.parse(localStorage.getItem(KEY)||"null")||{
  name:"Гість",xp:0,coins:0,streak:1,games:0,lastReward:"",lastDay:""
};
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function levelInfo(){let level=1,need=100,xp=state.xp;while(xp>=need){xp-=need;level++;need=Math.round(100*level*1.18)}return{level,into:xp,need}}
function render(){
  $("#playerName").textContent=state.name;
  $("#xpStat").textContent=state.xp;
  $("#coins").textContent=state.coins;
  $("#streak").textContent=state.streak;
  $("#streakStat").textContent=state.streak;
  const l=levelInfo();$("#level").textContent=l.level;$("#xp").textContent=l.into;$("#xpNeed").textContent=l.need;
  $("#xpBar").style.width=Math.min(100,l.into/l.need*100)+"%";
  const claimed=state.lastReward===today();
  $("#rewardBtn").textContent=claimed?"ЗАБРАНО ✓":"ЗАБРАТИ";
  $("#rewardBtn").disabled=claimed;
  $("#rewardTitle").textContent=claimed?"Нагороду вже забрано!":"Сьогодні ще не забрано!";
  $("#rewardText").textContent=claimed?"Повертайся завтра за новим бонусом.":"Отримай +50 XP та 25 монет.";
  $("#a1").classList.toggle("unlocked",state.games>0);
  $("#a2").classList.toggle("unlocked",state.games>=3);
  $("#a3").classList.toggle("unlocked",state.xp>=500);
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),1900)}
function addReward(xp,coins){
  state.xp+=xp;state.coins+=coins;state.games++;
  save();toast(`+${xp} XP  •  +${coins} 🪙`);
}
function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.add("show")}
function closeModal(){$("#modal").classList.remove("show");$("#modalContent").innerHTML=""}
$("#closeModal").onclick=closeModal;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
$("#changeNameBtn").onclick=()=>{
  openModal(`<div class="modal-title">Як тебе звати? 👾</div>
  <div class="modal-sub">Ім'я буде збережено на цьому пристрої.</div>
  <div class="modal-actions"><input id="nameInput" maxlength="18" placeholder="Твій нік" value="${state.name==="Гість"?"":state.name}"><button class="primary" id="saveName">ЗБЕРЕГТИ</button></div>`);
  $("#saveName").onclick=()=>{const n=$("#nameInput").value.trim();if(n){state.name=n;save();closeModal();toast("Ім'я збережено ✨")}};
};
$("#rewardBtn").onclick=()=>{
  if(state.lastReward===today())return;
  state.lastReward=today();state.xp+=50;state.coins+=25;save();toast("🎁 +50 XP  •  +25 🪙");
};
document.querySelectorAll(".game-btn").forEach(b=>b.onclick=()=>b.dataset.game==="reaction"?reactionGame():guessGame());

function reactionGame(){
 let n=0,start=0;
 openModal(`<div class="game-center"><div class="modal-title">⚡ РЕАКЦІЯ</div>
 <div class="modal-sub">Натисни 10 разів якомога швидше.</div>
 <div class="big-number" id="count">0 / 10</div>
 <div class="timer" id="timer">Час: —</div>
 <button class="reaction-button" id="reactBtn">НАТИСНИ!</button></div>`);
 $("#reactBtn").onclick=()=>{
   if(!start)start=performance.now();
   n++;$("#count").textContent=`${n} / 10`;
   if(n>=10){let sec=(performance.now()-start)/1000;let xp=Math.max(10,Math.round(40-sec*3));let coins=Math.max(5,Math.round(15-sec));addReward(xp,coins);$("#timer").textContent=`Час: ${sec.toFixed(2)} сек`;$("#reactBtn").disabled=true;$("#reactBtn").textContent="ГОТОВО ✓";setTimeout(closeModal,900)}
   else $("#timer").textContent=`Час: ${((performance.now()-start)/1000).toFixed(2)} сек`;
 };
}
function guessGame(){
 const target=Math.floor(Math.random()*20)+1;let tries=0;
 openModal(`<div class="game-center"><div class="modal-title">🎯 ВГАДАЙ ЧИСЛО</div>
 <div class="modal-sub">Число від 1 до 20. У тебе 5 спроб.</div>
 <div class="big-number">?</div><div class="modal-actions"><input id="guessInput" type="number" min="1" max="20" placeholder="1–20"><button class="primary" id="guessBtn">ВГАДАТИ</button></div><div class="timer" id="guessMsg">Спроб: 0 / 5</div></div>`);
 const input=$("#guessInput"),btn=$("#guessBtn"),msg=$("#guessMsg");
 btn.onclick=()=>{
   const g=Number(input.value);if(g<1||g>20)return toast("Введи число від 1 до 20");
   tries++; if(g===target){addReward(50,20);msg.textContent="🎉 Правильно!";btn.disabled=true;setTimeout(closeModal,1000);return}
   if(tries>=5){msg.textContent=`😅 Було число ${target}`;btn.disabled=true;setTimeout(closeModal,1100);return}
   msg.textContent=(g<target?"⬆️ Більше":"⬇️ Менше")+` • Спроб: ${tries} / 5`;input.value="";
 };
 input.onkeydown=e=>{if(e.key==="Enter")btn.click()};
}
render();
