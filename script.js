const barsEl = document.getElementById('bars');
const algoEl = document.getElementById('algo');
const sizeEl = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');
const speedEl = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const startBtn = document.getElementById('startBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const comparisonsEl = document.getElementById('comparisons');
const swapsEl = document.getElementById('swaps');

let values = [];
let barEls = [];
let algorithm = 'bubble';
let comparisons = 0;
let swaps = 0;
let running = false;

function randomValues(size) {
  return Array.from({ length: size }, () => 5 + Math.floor(Math.random() * 95));
}

function renderBars() {
  barsEl.innerHTML = '';
  barEls = values.map((value) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${value}%`;
    barsEl.appendChild(bar);
    return bar;
  });
}

function updateHeights() {
  barEls.forEach((bar, index) => {
    bar.style.height = `${values[index]}%`;
  });
}

function updateCounters() {
  comparisonsEl.textContent = comparisons;
  swapsEl.textContent = swaps;
}

function delay() {
  return Math.max(4, 140 - Number(speedEl.value) * 6);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mark(indices, className) {
  indices.forEach((index) => barEls[index] && barEls[index].classList.add(className));
}

function unmark(indices, className) {
  indices.forEach((index) => barEls[index] && barEls[index].classList.remove(className));
}

async function compare(i, j) {
  comparisons++;
  updateCounters();
  mark([i, j], 'comparing');
  await sleep(delay());
  unmark([i, j], 'comparing');
}

async function swap(i, j) {
  swaps++;
  updateCounters();
  mark([i, j], 'swapping');

  const temp = values[i];
  values[i] = values[j];
  values[j] = temp;
  updateHeights();

  await sleep(delay());
  unmark([i, j], 'swapping');
}

async function bubbleSort() {
  const n = values.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      await compare(j, j + 1);
      if (values[j] > values[j + 1]) await swap(j, j + 1);
    }
    barEls[n - 1 - i].classList.add('sorted');
  }

  barEls[0].classList.add('sorted');
}

async function selectionSort() {
  const n = values.length;

  for (let i = 0; i < n - 1; i++) {
    let smallest = i;

    for (let j = i + 1; j < n; j++) {
      await compare(smallest, j);
      if (values[j] < values[smallest]) smallest = j;
    }

    if (smallest !== i) await swap(i, smallest);
    barEls[i].classList.add('sorted');
  }

  barEls[n - 1].classList.add('sorted');
}

async function insertionSort() {
  const n = values.length;

  for (let i = 1; i < n; i++) {
    let j = i;

    while (j > 0) {
      await compare(j - 1, j);
      if (values[j - 1] <= values[j]) break;
      await swap(j - 1, j);
      j--;
    }
  }

  barEls.forEach((bar) => bar.classList.add('sorted'));
}

async function quickSort(lo, hi) {
  if (lo > hi) return;

  if (lo === hi) {
    barEls[lo].classList.add('sorted');
    return;
  }

  const pivot = values[hi];
  let smaller = lo;

  for (let j = lo; j < hi; j++) {
    await compare(j, hi);
    if (values[j] < pivot) {
      if (smaller !== j) await swap(smaller, j);
      smaller++;
    }
  }

  if (smaller !== hi) await swap(smaller, hi);
  barEls[smaller].classList.add('sorted');

  await quickSort(lo, smaller - 1);
  await quickSort(smaller + 1, hi);
}

function setControls(enabled) {
  startBtn.disabled = !enabled;
  shuffleBtn.disabled = !enabled;
  sizeEl.disabled = !enabled;
  speedEl.disabled = !enabled;

  algoEl.querySelectorAll('button').forEach((button) => {
    button.disabled = !enabled;
  });
}

async function startSort() {
  if (running) return;

  running = true;
  comparisons = 0;
  swaps = 0;
  updateCounters();
  setControls(false);

  startBtn.textContent = 'Sorting…';

  barEls.forEach((bar) => {
    bar.classList.remove('sorted', 'comparing', 'swapping');
  });

  try {
    if (algorithm === 'bubble') await bubbleSort();
    else if (algorithm === 'selection') await selectionSort();
    else if (algorithm === 'insertion') await insertionSort();
    else await quickSort(0, values.length - 1);
  } finally {
    barEls.forEach((bar) => bar.classList.add('sorted'));
    running = false;
    startBtn.textContent = 'Sort';
    setControls(true);
  }
}

function shuffle() {
  if (running) return;

  values = randomValues(Number(sizeEl.value));
  comparisons = 0;
  swaps = 0;
  updateCounters();
  renderBars();
}

algoEl.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || running) return;

  algorithm = button.dataset.algo;
  algoEl.querySelectorAll('button').forEach((item) => {
    item.classList.toggle('active', item === button);
  });
});

sizeEl.addEventListener('input', () => {
  sizeValue.textContent = sizeEl.value;
  shuffle();
});

speedEl.addEventListener('input', () => {
  speedValue.textContent = speedEl.value;
});

startBtn.addEventListener('click', startSort);
shuffleBtn.addEventListener('click', shuffle);

sizeValue.textContent = sizeEl.value;
speedValue.textContent = speedEl.value;
shuffle();
