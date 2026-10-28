(function () {
  "use strict";
  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(pointer: fine)");
  var menu = document.getElementById("menu-toggle");
  var links = document.getElementById("nav-links");
  var progress = document.getElementById("scroll-progress");
  var hero = document.querySelector(".hero");
  var deck = document.getElementById("key-stage");
  var cards = Array.prototype.slice.call(deck.querySelectorAll(".oracle-card"));
  var deckCurrent = document.getElementById("deck-current");
  var cardNames = ["The Key", "The Star", "The Mirror"];
  var cardNumbers = ["I", "II", "III"];
  var activeCard = 0;
  var ignoreClickUntil = 0;
  var preview = document.getElementById("hover-preview");
  var previewMedia = preview.querySelector(".hover-preview-media");
  var previewTitle = preview.querySelector(".hover-preview-title");

  function setCard(index) {
    activeCard = (index + cards.length) % cards.length;
    cards.forEach(function (card, i) {
      card.classList.remove("is-active", "is-next", "is-prev", "is-flipped", "is-dragging");
      card.style.removeProperty("--drag-x");
      card.style.removeProperty("--drag-y");
      card.style.removeProperty("--drag-rotate");
      card.classList.add(i === activeCard ? "is-active" : i === (activeCard + 1) % cards.length ? "is-next" : "is-prev");
      card.setAttribute("aria-expanded", "false");
      card.setAttribute("aria-label", cardNames[i] + (i === activeCard ? ". Turn the card to read it" : ". Bring this card forward"));
      card.querySelector(".oracle-front").setAttribute("aria-hidden", "false");
      card.querySelector(".oracle-back").setAttribute("aria-hidden", "true");
    });
    deckCurrent.textContent = cardNumbers[activeCard] + " / III   " + cardNames[activeCard].toUpperCase();
  }
  function flipCard() {
    var card = cards[activeCard];
    var open = card.classList.toggle("is-flipped");
    card.setAttribute("aria-expanded", String(open));
    card.setAttribute("aria-label", cardNames[activeCard] + (open ? ". Turn back to the illustration" : ". Turn the card to read it"));
    card.querySelector(".oracle-front").setAttribute("aria-hidden", String(open));
    card.querySelector(".oracle-back").setAttribute("aria-hidden", String(!open));
    if (!reduced.matches) sparkleAtCard(card, 14);
  }
  function sparkleAtCard(card, count) {
    var rect = card.getBoundingClientRect();
    var deckRect = deck.getBoundingClientRect();
    for (var i = 0; i < count; i++) {
      var x = rect.left - deckRect.left + rect.width * (.16 + Math.random() * .68);
      var y = rect.top - deckRect.top + rect.height * (.12 + Math.random() * .76);
      spawnGlint(x, y);
    }
  }
  function spawnGlint(x, y) {
    if (reduced.matches) return;
    var glint = document.createElement("i");
    glint.className = "drag-glint";
    glint.style.left = x + "px";
    glint.style.top = y + "px";
    glint.style.setProperty("--drift-x", (Math.random() * 54 - 27).toFixed(0) + "px");
    glint.style.setProperty("--drift-y", (Math.random() * -50 - 15).toFixed(0) + "px");
    deck.appendChild(glint);
    glint.addEventListener("animationend", function () { glint.remove(); }, { once: true });
  }
  cards.forEach(function (card, index) {
    var drag = null;
    card.addEventListener("click", function () {
      if (performance.now() < ignoreClickUntil) return;
      if (index !== activeCard) {
        setCard(index);
        if (!reduced.matches) sparkleAtCard(card, 8);
      } else flipCard();
    });
    card.addEventListener("pointerdown", function (event) {
      if (index !== activeCard || (event.pointerType === "mouse" && event.button !== 0)) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, lastSparkle: 0 };
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener("pointermove", function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      var dx = event.clientX - drag.x;
      var dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 7) drag.moved = true;
      if (!drag.moved) return;
      card.classList.add("is-dragging");
      card.style.setProperty("--drag-x", Math.max(-180, Math.min(180, dx)) + "px");
      card.style.setProperty("--drag-y", Math.max(-45, Math.min(45, dy * .25)) + "px");
      card.style.setProperty("--drag-rotate", Math.max(-13, Math.min(13, dx * .07)) + "deg");
      if (performance.now() - drag.lastSparkle > 42) {
        var rect = deck.getBoundingClientRect();
        spawnGlint(event.clientX - rect.left, event.clientY - rect.top);
        drag.lastSparkle = performance.now();
      }
    });
    function finishDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      var dx = event.clientX - drag.x;
      var moved = drag.moved;
      drag = null;
      card.classList.remove("is-dragging");
      card.style.removeProperty("--drag-x");
      card.style.removeProperty("--drag-y");
      card.style.removeProperty("--drag-rotate");
      if (moved) ignoreClickUntil = performance.now() + 280;
      if (Math.abs(dx) > 68) {
        setCard(activeCard + (dx < 0 ? 1 : -1));
        sparkleAtCard(cards[activeCard], 12);
      }
    }
    card.addEventListener("pointerup", finishDrag);
    card.addEventListener("pointercancel", finishDrag);
  });
  deck.querySelectorAll(".deck-arrow").forEach(function (arrow) {
    arrow.addEventListener("click", function () {
      setCard(activeCard + Number(arrow.getAttribute("data-direction")));
      if (!reduced.matches) sparkleAtCard(cards[activeCard], 9);
    });
  });
  deck.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      setCard(activeCard + (event.key === "ArrowRight" ? 1 : -1));
      cards[activeCard].focus();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && cards[activeCard].classList.contains("is-flipped")) {
      flipCard();
      cards[activeCard].focus();
    }
  });

  function updateScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max ? scrollY / max * 100 : 0) + "%";
  }
  updateScroll();
  addEventListener("scroll", updateScroll, { passive: true });

  menu.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      links.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open navigation");
    });
  });

  if ("IntersectionObserver" in window && !reduced.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -25px 0px" });
    document.querySelectorAll(".reveal").forEach(function (element) { revealObserver.observe(element); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (element) { element.classList.add("visible"); });
  }

  document.querySelectorAll(".case").forEach(function (caseFile) {
    caseFile.addEventListener("toggle", function () {
      preview.classList.remove("show");
      var hoverVideo = previewMedia.querySelector("video");
      if (hoverVideo) hoverVideo.pause();
      var video = caseFile.querySelector("video");
      if (!video) return;
      if (caseFile.open && !reduced.matches) {
        var played = video.play();
        if (played && played.catch) played.catch(function () {});
      } else {
        video.pause();
      }
    });
  });

  function movePreview(event) {
    var x = Math.min(innerWidth - 165, Math.max(165, event.clientX + 175));
    var y = Math.min(innerHeight - 135, Math.max(135, event.clientY - 5));
    preview.style.left = x + "px";
    preview.style.top = y + "px";
  }
  if (fine.matches) {
    document.querySelectorAll(".case[data-preview]").forEach(function (caseFile) {
      var path = caseFile.getAttribute("data-preview");
      if (!path) return;
      var summary = caseFile.querySelector("summary");
      summary.addEventListener("pointerenter", function (event) {
        if (event.pointerType !== "mouse" || innerWidth < 900 || caseFile.open) return;
        previewMedia.replaceChildren();
        var media = document.createElement(caseFile.getAttribute("data-type") === "video" ? "video" : "img");
        media.src = path;
        if (media.tagName === "VIDEO") {
          media.muted = true;
          media.loop = true;
          media.playsInline = true;
          var played = media.play();
          if (played && played.catch) played.catch(function () {});
        } else {
          media.alt = "";
        }
        previewMedia.appendChild(media);
        previewTitle.textContent = caseFile.getAttribute("data-title") || "";
        movePreview(event);
        preview.classList.add("show");
      });
      summary.addEventListener("pointermove", movePreview);
      summary.addEventListener("click", function () { preview.classList.remove("show"); });
      summary.addEventListener("pointerleave", function () {
        preview.classList.remove("show");
        var media = previewMedia.querySelector("video");
        if (media) media.pause();
      });
    });
  }

  if (fine.matches && !reduced.matches) {
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
      hero.style.setProperty("--my", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
    });
  }

  var canvas = document.getElementById("magic-canvas");
  var wand = document.getElementById("wand-cursor");
  var ctx = canvas.getContext("2d");
  var particles = [];
  var lastTrail = 0;
  function sizeCanvas() {
    var ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function particle(x, y, burst) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - .5) * (burst ? 8 : 1.7),
      vy: (Math.random() - .5) * (burst ? 8 : 1.7) - .45,
      life: 1,
      decay: burst ? .02 + Math.random() * .02 : .04 + Math.random() * .02,
      radius: burst ? 2 + Math.random() * 3.2 : 1.3 + Math.random() * 1.8,
      star: burst || Math.random() > .48,
      rgb: Math.random() > .25 ? "214,170,95" : "169,72,68"
    });
    if (particles.length > 130) particles.shift();
  }
  function burst(x, y) { for (var i = 0; i < 22; i++) particle(x, y, true); }
  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter(function (p) { return p.life > 0; });
    particles.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += .018;
      p.life = Math.max(0, p.life - p.decay);
      if (!p.life) return;
      ctx.beginPath();
      var size = p.radius * p.life;
      if (p.star) {
        ctx.moveTo(p.x, p.y - size * 1.9);
        ctx.lineTo(p.x + size * .33, p.y - size * .33);
        ctx.lineTo(p.x + size * 1.9, p.y);
        ctx.lineTo(p.x + size * .33, p.y + size * .33);
        ctx.lineTo(p.x, p.y + size * 1.9);
        ctx.lineTo(p.x - size * .33, p.y + size * .33);
        ctx.lineTo(p.x - size * 1.9, p.y);
        ctx.lineTo(p.x - size * .33, p.y - size * .33);
        ctx.closePath();
      } else ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + p.rgb + "," + p.life + ")";
      ctx.shadowBlur = p.star ? 13 : 8;
      ctx.shadowColor = "rgba(" + p.rgb + ",.7)";
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  if (ctx && fine.matches && !reduced.matches) {
    sizeCanvas();
    addEventListener("resize", sizeCanvas);
    document.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") return;
      body.classList.add("has-mouse");
      wand.style.left = event.clientX + "px";
      wand.style.top = event.clientY + "px";
      var now = performance.now();
      if (now - lastTrail > 25) {
        particle(event.clientX, event.clientY, false);
        lastTrail = now;
      }
    }, { passive: true });
    document.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse") burst(event.clientX, event.clientY);
    });
    addEventListener("blur", function () { body.classList.remove("has-mouse"); });
    draw();
  }
})();
