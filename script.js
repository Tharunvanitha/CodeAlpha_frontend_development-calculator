const mainEl = document.getElementById('main');
const exprEl = document.getElementById('expr');
const prevEl = document.getElementById('preview');
const SYMBOL = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };

let cur = '0';      // number being typed (string)
let prev = null;    // left operand
let op = null;      // pending operator
let fresh = false;  // next digit starts a new number
let error = false;

const fmt = n => String(n);

function compute(a, b, o) {
  let r;
  if (o === '+') r = a + b;
  else if (o === '-') r = a - b;
  else if (o === '*') r = a * b;
  else if (o === '/') { if (b === 0) return null; r = a / b; }
  return parseFloat(r.toPrecision(12));   // avoids 0.1 + 0.2 = 0.30000000000000004
}

function update(expr = null) {
  mainEl.textContent = cur;
  mainEl.classList.toggle('error', error);
  exprEl.textContent = expr !== null ? expr : (op ? `${fmt(prev)} ${SYMBOL[op]}` : '');
  // real-time result while typing the second number
  prevEl.textContent = '';
  if (op && !fresh && !error) {
    const r = compute(prev, parseFloat(cur), op);
    if (r !== null) prevEl.textContent = '= ' + r;
  }
}

function reset() { cur = '0'; prev = null; op = null; fresh = false; error = false; update(); }

function digit(d) {
  if (error) reset();
  if (fresh) { cur = d; fresh = false; }
  else if (cur.replace(/[-.]/g, '').length < 15) cur = cur === '0' ? d : cur + d;
  update();
}
function dot() {
  if (error) reset();
  if (fresh) { cur = '0.'; fresh = false; }
  else if (!cur.includes('.')) cur += '.';
  update();
}
function operator(o) {
  if (error) return;
  if (op && !fresh) {
    const r = compute(prev, parseFloat(cur), op);
    if (r === null) return fail();
    prev = r; cur = fmt(r);
  } else if (!op) prev = parseFloat(cur);
  op = o; fresh = true;
  update();
}
function equals() {
  if (error || !op) return;
  const b = parseFloat(cur);
  const r = compute(prev, b, op);
  if (r === null) return fail();
  const text = `${fmt(prev)} ${SYMBOL[op]} ${fmt(b)} =`;
  cur = fmt(r); prev = null; op = null; fresh = true;
  update(text);
}
function fail() { cur = 'Cannot divide by 0'; error = true; prev = null; op = null; update(); }
function back() {
  if (error) return reset();
  if (fresh) return;
  cur = cur.length > 1 && !(cur.length === 2 && cur[0] === '-') ? cur.slice(0, -1) : '0';
  update();
}
function sign() {
  if (error || cur === '0') return;
  cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur;
  update();
}
function percent() {
  if (error) return;
  cur = fmt(parseFloat((parseFloat(cur) / 100).toPrecision(12)));
  update();
}

function press(k) {
  if (/^\d$/.test(k)) digit(k);
  else if (k === '.') dot();
  else if ('+-*/'.includes(k) && k.length === 1) operator(k);
  else if (k === '=') equals();
  else if (k === 'clear') reset();
  else if (k === 'back') back();
  else if (k === 'sign') sign();
  else if (k === 'percent') percent();
}

document.querySelector('.calc').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) press(b.dataset.k);
});

// Keyboard support
document.addEventListener('keydown', e => {
  let k = e.key;
  if (k === 'Enter') { e.preventDefault(); k = '='; }
  else if (k === 'Backspace') k = 'back';
  else if (k === 'Escape' || k.toLowerCase() === 'c') k = 'clear';
  else if (k === 'x' || k === 'X') k = '*';
  else if (k === ',') k = '.';
  else if (k === '%') k = 'percent';
  else if (!/^[\d.+\-*/=]$/.test(k)) return;
  press(k);
  const btn = document.querySelector(`button[data-k="${k}"]`);
  if (btn) { btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 120); }
});

update();
