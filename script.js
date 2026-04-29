const clockEl = document.getElementById('clock');
const alarmInput = document.getElementById('alarm-input');
const addBtn = document.getElementById('add-btn');
const alarmList = document.getElementById('alarm-list');
const modal = document.getElementById('modal');
const dismissBtn = document.getElementById('dismiss-btn');

let alarms = [];
let ringingAlarm = null;
let audioCtx = null;
let beepNode = null;

function pad(n) {
  return String(n).padStart(2, '0');
}

function tick() {
  const now = new Date();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  clockEl.textContent = `${hh}:${mm}:${ss}`;

  const currentTime = `${hh}:${mm}`;
  if (ss === '00') {
    alarms.forEach(alarm => {
      if (!alarm.triggered && alarm.time === currentTime) {
        alarm.triggered = true;
        triggerAlarm(alarm);
      }
    });
  }
}

function renderAlarms() {
  alarmList.innerHTML = '';
  alarms.forEach(alarm => {
    const li = document.createElement('li');
    li.className = 'alarm-item' + (alarm.ringing ? ' ringing' : '');

    const span = document.createElement('span');
    span.textContent = alarm.time;

    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.title = 'Remove';
    btn.addEventListener('click', () => removeAlarm(alarm.id));

    li.appendChild(span);
    li.appendChild(btn);
    alarmList.appendChild(li);
  });
}

function addAlarm() {
  const time = alarmInput.value;
  if (!time) return;
  const already = alarms.some(a => a.time === time);
  if (already) return;

  alarms.push({ id: Date.now(), time, triggered: false, ringing: false });
  alarmInput.value = '';
  renderAlarms();
}

function removeAlarm(id) {
  alarms = alarms.filter(a => a.id !== id);
  renderAlarms();
}

function triggerAlarm(alarm) {
  alarm.ringing = true;
  ringingAlarm = alarm;
  renderAlarms();
  modal.classList.remove('hidden');
  startBeep();
}

function dismissAlarm() {
  if (ringingAlarm) {
    ringingAlarm.ringing = false;
    ringingAlarm = null;
  }
  modal.classList.add('hidden');
  stopBeep();
  renderAlarms();
}

function startBeep() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function beep() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }

  beep();
  beepNode = setInterval(beep, 800);
}

function stopBeep() {
  clearInterval(beepNode);
  beepNode = null;
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

addBtn.addEventListener('click', addAlarm);
alarmInput.addEventListener('keydown', e => { if (e.key === 'Enter') addAlarm(); });
dismissBtn.addEventListener('click', dismissAlarm);

setInterval(tick, 1000);
tick();
