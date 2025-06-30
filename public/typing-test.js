// typing-test.js

window.addEventListener('DOMContentLoaded', async () => {
  const quoteEl  = document.getElementById('quote');
  const inputEl  = document.getElementById('input');
  const wpmEl    = document.getElementById('wpm');
  const accEl    = document.getElementById('accuracy');
  const timeEl   = document.getElementById('time');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  if (!quoteEl || !inputEl) return;

  // Get 30 random words
  let words;
  try {
    const res = await fetch('https://random-word-api.herokuapp.com/word?number=30');
    words = await res.json();
  } catch {
    words = 'The bicycle is a wonderfully simple elegant and efficient machine used for fast motion riding and relaxing fitness on the road among the hills and breeze'.split(' ');
  }

  // Capitalize first word
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  const sentence = words.join(' ') + '.';

  let started = false,
      startTime,
      timerID,
      currentIndex = 0,
      correctCount = 0,
      totalCount = 0;

  // Render each word
  function renderWords() {
    quoteEl.innerHTML = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.dataset.index = i;
      span.textContent = w;
      quoteEl.appendChild(span);
      quoteEl.appendChild(document.createTextNode(' '));
    });
  }

  renderWords();

  // Reset UI and state
  function resetTest() {
    clearInterval(timerID);
    started = false;
    startTime = null;
    currentIndex = 0;
    correctCount = 0;
    totalCount = 0;
    wpmEl.textContent = '0';
    accEl.textContent = '100';
    timeEl.textContent = '30';
    inputEl.value = '';
    inputEl.disabled = true;

    renderWords();
  }

  function updateStats() {
    const elapsedMin = (Date.now() - startTime) / 60000;
    const wpm = elapsedMin > 0 ? Math.round(correctCount / elapsedMin) : 0;
    const acc = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
    wpmEl.textContent = wpm;
    accEl.textContent = acc;
  }

  function finishTest() {
    clearInterval(timerID);
    inputEl.disabled = true;
    updateStats();
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/tests/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          wpm: parseFloat(wpmEl.textContent),
          accuracy: parseFloat(accEl.textContent),
          test_duration: 30,
          words_typed: totalCount
        })
      });
    }
  }

  // EVENTS
  startBtn.addEventListener('click', () => {
    if (started) return;
    started = true;
    startTime = Date.now();
    inputEl.disabled = false;
    inputEl.focus();
    timerID = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remain = 30 - elapsed;
      timeEl.textContent = remain >= 0 ? remain : '0';
      if (remain <= 0) finishTest();
    }, 1000);
  });

  resetBtn.addEventListener('click', resetTest);

  // Input: character-by-character highlight
  inputEl.addEventListener('input', () => {
    const typed = inputEl.value.trim();
    const spans = quoteEl.querySelectorAll('.word');
    const span = spans[currentIndex];
    if (!span) return;

    // Highlight active
    spans.forEach(s => s.classList.remove('active'));
    span.classList.add('active');

    if (span.textContent.startsWith(typed)) {
      span.classList.remove('incorrect');
    } else {
      span.classList.add('incorrect');
    }
  });

  // Confirm word on space/enter
  inputEl.addEventListener('keydown', e => {
    if (!started) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const typed = inputEl.value.trim();
      inputEl.value = '';

      const spans = quoteEl.querySelectorAll('.word');
      const span = spans[currentIndex];
      if (!span) return;

      totalCount++;
      span.classList.remove('active');

      if (typed === span.textContent) {
        span.classList.add('correct');
        span.classList.remove('incorrect');
        correctCount++;
      } else {
        span.classList.add('incorrect');
      }

      currentIndex++;
      updateStats();
    }
  });

  // Initial reset
  resetTest();
});
