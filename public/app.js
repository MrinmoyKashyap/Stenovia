/* ===========================================================
   0.  Small helper + API wrapper
=========================================================== */
const API = 'http://localhost:5000/api';
let   token = localStorage.getItem('token') || '';

async function api(path, opts={}) {
  const res = await fetch(API+path, {
    ...opts,
    headers:{ 'Content-Type':'application/json',
              'Authorization':'Bearer '+token,
              ...opts.headers }
  });
  return res.json();
}

/* ===========================================================
   1.  Render auth area in navbar (if present)
=========================================================== */
const navAuth = document.getElementById('navAuth');
if (navAuth) renderAuthLinks();

function renderAuthLinks(){
  if (token) {
    // Logged in → show Logout
    navAuth.innerHTML = `<a class="plain" href="#" id="logout">Logout</a>`;
    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      token = '';
      renderAuthLinks();
    });
  } else {
    // Logged out → show Login and Sign Up buttons
    navAuth.innerHTML = `
      <a class="plain" href="login.html">Login</a>
      <a class="button" href="signup.html">Sign Up</a>
    `;
  }
}


/* ===========================================================
   2.  Typing test logic (only on index.html)
=========================================================== */
if (document.getElementById('startBtn')){
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const input    = document.getElementById('input');
  const quote    = document.getElementById('quote');
  const wpmEl    = document.getElementById('wpm');
  const accEl    = document.getElementById('accuracy');
  const timeEl   = document.getElementById('time');

  const TEST_TIME = 30;
  let timer, startTime;

  const set = (el,val)=>el.textContent=val;

  startBtn.onclick = () => {
    if (timer) return;
    startTime = Date.now();
    input.value=''; input.disabled=false; input.focus();
    set(timeEl,TEST_TIME); set(wpmEl,0); set(accEl,100);
    startBtn.disabled=true;

    timer = setInterval(()=>{
      const sec = TEST_TIME - Math.floor((Date.now()-startTime)/1000);
      set(timeEl,sec);
      updateStats();
      if(sec<=0) finish();
    },100);
  };

  resetBtn.onclick = ()=>{ clearInterval(timer); timer=null;
    input.value=''; input.disabled=true; set(timeEl,TEST_TIME);
    set(wpmEl,0); set(accEl,100); startBtn.disabled=false; };

  function updateStats(){
    const typed=input.value;
    const words=typed.trim().split(/\s+/).filter(Boolean).length;
    const mins =(Date.now()-startTime)/60000;
    set(wpmEl, mins?Math.floor(words/mins):0);
    const correct=[...typed].filter((ch,i)=>ch===quote.textContent[i]).length;
    set(accEl, typed.length?Math.floor(correct/typed.length*100):100);
  }

  async function finish(){
    clearInterval(timer); timer=null; input.disabled=true; startBtn.disabled=false; updateStats();
    if(token){
      await api('/tests/results',{method:'POST',body:JSON.stringify({
        wpm:+wpmEl.textContent, accuracy:+accEl.textContent,
        testDuration:30, wordsTyped:input.value.trim().split(/\s+/).filter(Boolean).length
      })});
    }
  }
}

/* ===========================================================
   3.  History page
=========================================================== */
if(document.getElementById('histTbl')){
  if(!token){ alert('Login first'); location.href='index.html'; }
  else (async()=>{
     const rows=await api('/tests/history');
     const tb=document.querySelector('#histTbl tbody');
     rows.forEach(r=>{
       const tr=document.createElement('tr');
       tr.innerHTML=`<td>${new Date(r.created_at).toLocaleString()}</td>
                     <td>${r.wpm}</td><td>${r.accuracy}%</td><td>${r.test_duration}s</td>`;
       tb.appendChild(tr);
     });
  })();
}

/* ===========================================================
   4.  Leaderboard page
=========================================================== */
if(document.getElementById('boardTbl')){
  (async()=>{
     const rows=await api('/board');
     const tb=document.querySelector('#boardTbl tbody');
     rows.forEach((r,i)=>{
       const tr=document.createElement('tr');
       tr.innerHTML=`<td>${i+1}</td><td>${r.username}</td><td>${r.avg_wpm}</td>`;
       tb.appendChild(tr);
     });
  })();
}

/* ===========================================================
   5.  Profile page
=========================================================== */
if(document.getElementById('profWrap')){
  if(!token){ alert('Please log in'); location.href='index.html'; }
  else (async()=>{
     const u=await api('/auth/me');
     const box=document.createElement('div'); box.className='profile-box';
     box.innerHTML=`<dl>
       <dt>User&nbsp;ID</dt><dd>${u.id}</dd>
       <dt>Username</dt><dd>${u.username}</dd>
       <dt>Email</dt><dd>${u.email}</dd>
       <dt>Joined</dt><dd>${new Date(u.created_at).toLocaleDateString()}</dd>
     </dl>`;
     const wrap=document.getElementById('profWrap');
     wrap.replaceChildren(wrap.firstElementChild,box);
  })();
}
/* ===========================================================
   SIGNUP PAGE logic
=========================================================== */
if (document.getElementById('signupForm')) {
  const form = document.getElementById('signupForm');
  const err  = document.getElementById('signupError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.textContent = '';
    const u = form.querySelector('#suUsername').value.trim();
    const m = form.querySelector('#suEmail').value.trim();
    const p = form.querySelector('#suPassword').value;
    const c = form.querySelector('#suConfirm').value;
    const t = form.querySelector('#suTOS').checked;

    if (p !== c) return err.textContent = 'Passwords do not match.';
    if (!t)    return err.textContent = 'You must agree to the Terms.';

    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: u, email: m, password: p })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location = 'index.html';
    } else {
      err.textContent = data.message || 'Signup failed.';
    }
  });
}

/* ===========================================================
   LOGIN PAGE logic
=========================================================== */
if (document.getElementById('loginFormPage')) {
  const form = document.getElementById('loginFormPage');
  const err  = document.getElementById('loginError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.textContent = '';
    const m = form.querySelector('#liEmail').value.trim();
    const p = form.querySelector('#liPassword').value;

    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: m, password: p })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location = 'index.html';
    } else {
      err.textContent = data.message || 'Login failed.';
    }
  });
}