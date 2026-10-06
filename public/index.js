  // ============================================================
  // NAV TOGGLE (mobile menu)
  // ============================================================
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const expanded = navMenu.classList.contains('open');
    navToggle.setAttribute('aria-expanded', expanded);
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('open')));

  // ============================================================
  // PLACEHOLDER IMAGES — generated on the fly, embedded directly
  // as data URIs (no external files needed at all). Swap any of
  // these out later by pasting a real photo's data URI, or by
  // uploading through the "Add" forms below.
  // ============================================================
  function placeholderImage(label, hue, ratio){
    const initials = label.split(' ').map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
    const w = ratio === 'wide' ? 400 : 200;
    const h = ratio === 'wide' ? 300 : 200;
    const fontSize = ratio === 'wide' ? 48 : 64;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='hsl(${hue},40%,20%)'/>
        <stop offset='100%' stop-color='hsl(${hue},50%,10%)'/>
      </linearGradient></defs>
      <rect width='${w}' height='${h}' fill='url(#g)'/>
      <text x='50%' y='52%' font-family='monospace' font-size='${fontSize}' fill='#C9A24B' text-anchor='middle' dominant-baseline='middle'>${initials}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  

  // ============================================================
  // TICKER — decorative currency strip. Edit pairs/values freely.
  // ============================================================
  const pairs = [
    { p: 'EUR/USD', v: '1.0842', dir: 'up' },
    { p: 'GBP/USD', v: '1.2695', dir: 'down' },
    { p: 'USD/JPY', v: '156.20', dir: 'up' },
    { p: 'USD/CHF', v: '0.8931', dir: 'down' },
    { p: 'AUD/USD', v: '0.6512', dir: 'up' },
    { p: 'USD/CAD', v: '1.3688', dir: 'down' },
    { p: 'NZD/USD', v: '0.6003', dir: 'up' },
    { p: 'USD/UGX', v: '3720.5', dir: 'up' }
  ];
  const tickerHTML = pairs.map(x =>
    `<span class="pair">${x.p} <span class="${x.dir}">${x.v} ${x.dir === 'up' ? '▲' : '▼'}</span></span>`
  ).join('');
  document.getElementById('tickerTrack').innerHTML = tickerHTML + tickerHTML; // doubled for seamless loop

  // ============================================================
  // GALLERY IMAGES — images are embedded directly in this file,
  // no separate "images" folder needed.
  //
  // Right now these are auto-generated placeholders. To use a
  // real photo: convert it to a data URI (search "image to base64
  // converter online", or drag it into https://base64.guru/converter/encode/image)
  // and paste the long string in as the "src" value below, replacing
  // the placeholderImage(...) call for that entry.
  // Add a new photo by copying a line; remove one by deleting a line.
  // ============================================================
  const galleryImages = [
    { src: 'aid.jpg', caption: 'My trading setup' },
    { src: 'green.jpg', caption: 'Where the work happens' },
    { src: 'blue.jpg', caption: 'Off the clock' },
  ];

  const grid = document.getElementById('galleryGrid');

  function renderGallery(){
    grid.innerHTML = '';
    galleryImages.forEach(item => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption || 'Gallery image';
      div.appendChild(img);
      if (item.caption){
        const cap = document.createElement('div');
        cap.className = 'cap';
        cap.textContent = item.caption;
        div.appendChild(cap);
      }
      grid.appendChild(div);
    });
  }
  renderGallery();

  // ============================================================
  // PERSONAL DASHBOARD — real server-backed auth.
  // The passcode is checked by the server (server.js), never
  // stored in this file. Session is a secure httpOnly cookie.
  // ============================================================
  const lockPanel = document.getElementById('lockPanel');
  const dashboardPanel = document.getElementById('dashboardPanel');
  const lockInput = document.getElementById('lockInput');
  const lockSubmit = document.getElementById('lockSubmit');
  const lockError = document.getElementById('lockError');
  const relockBtn = document.getElementById('relockBtn');
  const saveDashBtn = document.getElementById('saveDashBtn');
  const saveStatus = document.getElementById('saveStatus');
  const dashInputs = document.querySelectorAll('.dash-input');

  // ---- friends & best friends ----
  let people = []; // { id, name, isBest, photo }
  const peopleGrid = document.getElementById('peopleGrid');
  const personName = document.getElementById('personName');
  const personBest = document.getElementById('personBest');
  const personPhoto = document.getElementById('personPhoto');
  const addPersonBtn = document.getElementById('addPersonBtn');

  function renderPeople(){
    peopleGrid.innerHTML = '';
    if (people.length === 0){
      peopleGrid.innerHTML = '<div class="people-empty">No one added yet — add a friend above.</div>';
      return;
    }
    // best friends first
    const sorted = [...people].sort((a,b) => (b.isBest === true) - (a.isBest === true));
    sorted.forEach(person => {
      const card = document.createElement('div');
      card.className = 'person-card' + (person.isBest ? ' best' : '');
      const photo = person.photo || placeholderImage(person.name, hashHue(person.name));
      card.innerHTML = `
        ${person.isBest ? '<span class="person-star">⭐</span>' : ''}
        <div class="person-avatar"><img src="${photo}" alt="${person.name}"></div>
        <div class="person-name">${person.name}</div>
        <button class="person-remove" type="button">Remove</button>
      `;
      card.querySelector('.person-remove').addEventListener('click', () => {
        people = people.filter(p => p.id !== person.id);
        renderPeople();
      });
      peopleGrid.appendChild(card);
    });
  }

  function hashHue(str){
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
  }

  addPersonBtn.addEventListener('click', () => {
    const name = personName.value.trim();
    if (!name) return;
    const finish = (photoDataUrl) => {
      people.push({ id: Date.now().toString(), name, isBest: personBest.checked, photo: photoDataUrl || '' });
      personName.value = '';
      personBest.checked = false;
      personPhoto.value = '';
      renderPeople();
    };
    const file = personPhoto.files[0];
    if (file){
      const reader = new FileReader();
      reader.onload = (e) => finish(e.target.result);
      reader.readAsDataURL(file);
    } else {
      finish('');
    }
  });

  async function loadPersonalData(){
    const res = await fetch('/api/personal', { credentials: 'include' });
    if (!res.ok) throw new Error('not authenticated');
    const data = await res.json();
    dashInputs.forEach(input => {
      const field = input.dataset.field;
      input.value = data[field] || '';
    });
    people = Array.isArray(data.people) ? data.people : [];
    renderPeople();
  }

  async function tryUnlock(){
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ passcode: lockInput.value })
      });
      if (!res.ok) throw new Error('bad passcode');
      await loadPersonalData();
      lockPanel.style.display = 'none';
      dashboardPanel.style.display = 'block';
      lockError.style.display = 'none';
      lockInput.value = '';
    } catch (e) {
      lockError.style.display = 'block';
    }
  }

  lockSubmit.addEventListener('click', tryUnlock);
  lockInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });

  relockBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    dashboardPanel.style.display = 'none';
    lockPanel.style.display = 'block';
  });

  saveDashBtn.addEventListener('click', async () => {
    const payload = {};
    dashInputs.forEach(input => { payload[input.dataset.field] = input.value; });
    payload.people = people;
    saveStatus.textContent = 'Saving…';
    try {
      const res = await fetch('/api/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('save failed');
      saveStatus.textContent = 'Saved ✓';
      setTimeout(() => saveStatus.textContent = '', 2000);
    } catch (e) {
      saveStatus.textContent = 'Could not save — please log in again.';
    }
  });

  /*If a valid session cookie already exists (e.g. page refresh),*/
  // try loading data straight away so the dashboard stays unlocked.
  loadPersonalData()
    .then(() => {
      lockPanel.style.display = 'none';
      dashboardPanel.style.display = 'block';
    })
    .catch(() => { /* not logged in — stay on lock screen */ });