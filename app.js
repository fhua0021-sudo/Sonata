(function () {
  const data = window.SONATA_CONTENT;
  const byId = (id) => document.getElementById(id);
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

  function imageMarkup(src, alt) {
    return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">` : `<span>${escapeHtml(alt)}占位</span>`;
  }

  function fillMedia(id, src, alt) {
    const element = byId(id);
    if (!src) return;
    element.classList.add("has-image");
    element.innerHTML = imageMarkup(src, alt);
  }

  byId("cover-intro").textContent = data.cover.intro;
  fillMedia("hero-media", data.cover.heroImage, "Sonata 主视觉");
  fillMedia("profile-media", data.profile.image, "Sonata 档案立绘");
  byId("profile-quote").textContent = data.profile.quote;
  byId("profile-facts").innerHTML = data.profile.facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  byId("profile-summary").textContent = data.profile.summary;

  const narrativeItems = Array.from({ length: Math.max(data.narratives.placeholderCount, data.narratives.items.length) }, (_, index) => data.narratives.items[index] || {
    title: `图像片段 ${String(index + 1).padStart(2, "0")}`,
    image: "",
    story: "这里将放置与画面相关的小片段故事。",
    date: "时间待填写",
    location: "地点待填写",
    artist: "画师署名待填写"
  });

  const narrativeGrid = byId("narrative-grid");
  narrativeGrid.innerHTML = narrativeItems.map((item, index) => `<button class="art-card" type="button" data-kind="narrative" data-index="${index}"><span class="art-card-media">${imageMarkup(item.image, item.title)}</span><span class="art-card-meta"><strong>${escapeHtml(item.title)}</strong><span>阅读片段</span></span></button>`).join("");

  const outfitItems = Array.from({ length: Math.max(data.wardrobe.placeholderCount, data.wardrobe.items.length) }, (_, index) => data.wardrobe.items[index] || {
    title: `服装 ${String(index + 1).padStart(2, "0")}`,
    image: "",
    status: "尚未登场",
    occasion: "适用场合待填写",
    period: "故事时期待填写",
    notes: "这里将放置服装设计说明。",
    artist: "画师署名待填写"
  });

  const wardrobeGrid = byId("wardrobe-grid");
  wardrobeGrid.innerHTML = outfitItems.map((item, index) => `<button class="wardrobe-card" type="button" data-kind="outfit" data-index="${index}"><span class="wardrobe-media">${imageMarkup(item.image, item.title)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.status)} · ${escapeHtml(item.occasion)}</p></button>`).join("");

  byId("comic-strip").innerHTML = data.comic.map((item, index) => `<button class="comic-page" type="button" data-kind="comic" data-index="${index}" aria-label="放大漫画第 ${item.page} 页">${item.image ? imageMarkup(item.image, `漫画第 ${item.page} 页`) : `<span>第 ${item.page} 页占位</span>`}</button>`).join("");

  byId("story-toc").innerHTML = data.story.chapters.map((chapter, index) => `<a href="#chapter-${index + 1}">${escapeHtml(chapter.title)}</a>`).join("");
  byId("story-content").innerHTML = data.story.chapters.map((chapter, index) => `<section id="chapter-${index + 1}"><h3>${escapeHtml(chapter.title)}</h3>${chapter.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("");

  const dialog = byId("detail-dialog");
  const dialogBody = byId("dialog-body");

  function openNarrative(item) {
    dialogBody.innerHTML = `<div class="detail-layout"><div class="detail-media">${imageMarkup(item.image, item.title)}</div><article class="detail-copy"><p class="eyebrow">VISUAL STORY</p><h2>${escapeHtml(item.title)}</h2><dl><div><dt>时间</dt><dd>${escapeHtml(item.date)}</dd></div><div><dt>地点</dt><dd>${escapeHtml(item.location)}</dd></div></dl><p>${escapeHtml(item.story)}</p><p class="credit">${escapeHtml(item.artist)} · 请勿转载或用于训练</p></article></div>`;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }

  function openOutfit(item) {
    dialogBody.innerHTML = `<div class="detail-layout"><div class="detail-media">${imageMarkup(item.image, item.title)}</div><article class="detail-copy"><p class="eyebrow">WARDROBE</p><h2>${escapeHtml(item.title)}</h2><p><span class="status">${escapeHtml(item.status)}</span></p><dl><div><dt>场合</dt><dd>${escapeHtml(item.occasion)}</dd></div><div><dt>时期</dt><dd>${escapeHtml(item.period)}</dd></div></dl><p>${escapeHtml(item.notes)}</p><p class="credit">${escapeHtml(item.artist)} · 请勿转载或用于训练</p></article></div>`;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-kind]");
    if (!trigger) return;
    const index = Number(trigger.dataset.index);
    if (trigger.dataset.kind === "narrative") openNarrative(narrativeItems[index]);
    if (trigger.dataset.kind === "outfit") openOutfit(outfitItems[index]);
    if (trigger.dataset.kind === "comic") {
      const item = data.comic[index];
      dialogBody.innerHTML = `<div class="detail-media">${imageMarkup(item.image, `漫画第 ${item.page} 页`)}</div>`;
      dialog.showModal();
      document.body.classList.add("dialog-open");
    }
  });

  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

  const menuButton = document.querySelector(".menu-toggle");
  const siteNav = byId("site-nav");
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
  });
  siteNav.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  });

  let soundEnabled = true;
  let audioContext;
  const soundToggle = document.querySelector(".sound-toggle");
  const homeLink = document.querySelector(".brand");
  const scoreNav = document.querySelector(".score-nav");
  const scoreCanvas = document.querySelector(".score-canvas");
  const scoreNotes = Array.from(document.querySelectorAll(".score-note"));

  function drawScore() {
    const width = scoreNav.clientWidth;
    const height = scoreNav.clientHeight;
    if (!width || !height) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    scoreCanvas.width = Math.round(width * pixelRatio);
    scoreCanvas.height = Math.round(height * pixelRatio);
    scoreCanvas.style.width = `${width}px`;
    scoreCanvas.style.height = `${height}px`;
    const context = scoreCanvas.getContext("2d");
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
    context.globalAlpha = 0.42;
    context.lineWidth = 1;
    const centerY = height * 0.26;
    const edgeY = height * 0.78;
    const controlY = 2 * centerY - edgeY;
    const curveY = (x) => centerY + (edgeY - centerY) * Math.pow((x / width - 0.5) * 2, 2);
    const lineOffsets = [-14, -7, 0, 7, 14];
    lineOffsets.forEach((offset) => {
      context.beginPath();
      context.moveTo(0, edgeY + offset);
      context.quadraticCurveTo(width / 2, controlY + offset, width, edgeY + offset);
      context.stroke();
    });
    const notePositions = [0.08, 0.25, 0.42, 0.59, 0.76];
    const noteLines = [14, 7, 0, -7, -14];
    scoreNotes.forEach((note, index) => {
      const x = width * notePositions[index];
      note.style.left = `${x}px`;
      note.style.top = `${curveY(x) + noteLines[index]}px`;
    });
    scoreNav.classList.add("is-ready");
  }

  drawScore();
  if ("ResizeObserver" in window) new ResizeObserver(drawScore).observe(scoreNav);
  else window.addEventListener("resize", drawScore);

  function playNote(frequency) {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;
    const duration = 1.05;
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const tone = audioContext.createOscillator();
    const vibrato = audioContext.createOscillator();
    const vibratoDepth = audioContext.createGain();
    const wave = audioContext.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.56, 0.34, 0.2, 0.12, 0.07])
    );
    tone.setPeriodicWave(wave);
    tone.frequency.setValueAtTime(frequency, now);
    vibrato.type = "sine";
    vibrato.frequency.setValueAtTime(5.4, now);
    vibratoDepth.gain.setValueAtTime(0, now);
    vibratoDepth.gain.linearRampToValueAtTime(frequency * 0.011, now + 0.24);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(0.7, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.075);
    gain.gain.setValueAtTime(0.075, now + 0.55);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    vibrato.connect(vibratoDepth);
    vibratoDepth.connect(tone.frequency);
    tone.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    tone.start(now);
    vibrato.start(now);
    tone.stop(now + duration + 0.03);
    vibrato.stop(now + duration + 0.03);
  }

  function playStringSnap() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;
    const twang = audioContext.createOscillator();
    const twangGain = audioContext.createGain();
    const noise = audioContext.createBufferSource();
    const noiseFilter = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();
    const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * 0.16), audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
    noise.buffer = buffer;
    twang.type = "sawtooth";
    twang.frequency.setValueAtTime(360, now);
    twang.frequency.exponentialRampToValueAtTime(72, now + 0.24);
    twangGain.gain.setValueAtTime(0.07, now);
    twangGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1700, now);
    noiseFilter.Q.setValueAtTime(0.8, now);
    noiseGain.gain.setValueAtTime(0.045, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    twang.connect(twangGain).connect(audioContext.destination);
    noise.connect(noiseFilter).connect(noiseGain).connect(audioContext.destination);
    twang.start(now);
    noise.start(now);
    twang.stop(now + 0.3);
    noise.stop(now + 0.18);
  }

  document.querySelectorAll(".score-note").forEach((note) => {
    note.addEventListener("click", () => playNote(Number(note.dataset.tone)));
  });

  homeLink.addEventListener("click", () => {
    if (!soundEnabled) return;
    [261.63, 329.63, 392, 523.25].forEach((frequency, index) => {
      window.setTimeout(() => playNote(frequency), index * 145);
    });
  });

  soundToggle.addEventListener("click", () => {
    if (soundEnabled) {
      playStringSnap();
      soundEnabled = false;
    } else {
      soundEnabled = true;
      playNote(440);
    }
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.querySelector(".string-label").textContent = soundEnabled ? "弦未断" : "弦已断";
  });
})();

