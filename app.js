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

  function playNote(frequency) {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    const tone = audioContext.createOscillator();
    const overtone = audioContext.createOscillator();
    tone.type = "sine";
    overtone.type = "triangle";
    tone.frequency.setValueAtTime(frequency, now);
    overtone.frequency.setValueAtTime(frequency * 2, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    tone.connect(gain);
    overtone.connect(gain);
    gain.connect(audioContext.destination);
    tone.start(now);
    overtone.start(now);
    tone.stop(now + 0.68);
    overtone.stop(now + 0.68);
  }

  document.querySelectorAll(".score-note").forEach((note) => {
    note.addEventListener("click", () => playNote(Number(note.dataset.tone)));
  });

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.textContent = `音效：${soundEnabled ? "开" : "关"}`;
  });
})();

