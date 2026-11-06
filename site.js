(() => {
  const CHECKOUT_URL = "https://checkout.payt.com.br/787b642b0c477d45658b37bd4c8b0bc5";

  const todayDate = document.querySelector("#todayDate");
  const countdown = document.querySelector("#countdown");
  const updateUrgency = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const remaining = Math.max(0, end.getTime() - now.getTime());
    const hours = String(Math.floor(remaining / 3600000)).padStart(2, "0");
    const minutes = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    if (todayDate) todayDate.textContent = new Intl.DateTimeFormat("pt-BR").format(now);
    if (countdown) countdown.textContent = `${hours}:${minutes}:${seconds}`;
  };
  updateUrgency();
  window.setInterval(updateUrgency, 1000);

  document.querySelectorAll("[data-checkout]").forEach((link) => {
    if (CHECKOUT_URL) {
      link.href = CHECKOUT_URL;
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      link.addEventListener("click", (event) => event.preventDefault());
    }
  });

  const track = document.querySelector("#previewTrack");
  const prev = document.querySelector(".carousel-arrow.prev");
  const next = document.querySelector(".carousel-arrow.next");
  const dots = document.querySelector(".carousel-dots");
  const figures = track ? [...track.querySelectorAll("figure")] : [];
  let carouselTimer;

  const cardStep = () => {
    if (!figures.length) return 320;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 20;
    return figures[0].getBoundingClientRect().width + gap;
  };

  const visibleCards = () => Math.max(1, Math.round(track.clientWidth / cardStep()));
  const lastStartIndex = () => Math.max(0, figures.length - visibleCards());
  const currentIndex = () => Math.max(0, Math.min(lastStartIndex(), Math.round(track.scrollLeft / cardStep())));

  const updateDots = () => {
    if (!dots) return;
    const active = currentIndex();
    [...dots.children].forEach((dot, index) => dot.classList.toggle("active", index === active));
  };

  const move = (direction) => {
    if (!track || !figures.length) return;
    const index = currentIndex();
    let target = index + direction;
    const last = lastStartIndex();
    if (target > last) target = 0;
    if (target < 0) target = last;
    track.scrollTo({ left: target * cardStep(), behavior: "smooth" });
  };

  const restartAuto = () => {
    window.clearInterval(carouselTimer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    carouselTimer = window.setInterval(() => move(1), 5200);
  };

  if (track && dots) {
    Array.from({ length: lastStartIndex() + 1 }).forEach((_, index) => {
      const dot = document.createElement("i");
      if (index === 0) dot.classList.add("active");
      dots.appendChild(dot);
    });
    track.addEventListener("scroll", () => window.requestAnimationFrame(updateDots), { passive: true });
    let pointerStartX = 0;
    let pointerStartedAtEnd = false;
    let pointerStartedAtStart = false;
    track.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
      pointerStartedAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      pointerStartedAtStart = track.scrollLeft <= 4;
      window.clearInterval(carouselTimer);
    });
    track.addEventListener("pointerup", (event) => {
      const delta = event.clientX - pointerStartX;
      if (pointerStartedAtEnd && delta < -35) track.scrollTo({ left: 0, behavior: "smooth" });
      if (pointerStartedAtStart && delta > 35) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      restartAuto();
    });
    prev?.addEventListener("click", () => { move(-1); restartAuto(); });
    next?.addEventListener("click", () => { move(1); restartAuto(); });
    restartAuto();
  }

  document.querySelectorAll("[data-music-player]").forEach((player) => {
    const audio = player.querySelector("audio");
    const button = player.querySelector(".music-play");
    const progress = player.querySelector(".music-progress");
    const times = player.querySelectorAll(".music-time span");
    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds)) return "0:00";
      const minutes = Math.floor(seconds / 60);
      return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
    };
    button?.addEventListener("click", () => {
      if (audio.paused) {
        document.querySelectorAll("audio").forEach((item) => { if (item !== audio) item.pause(); });
        audio.play();
      } else audio.pause();
    });
    audio?.addEventListener("play", () => { button.textContent = "❚❚"; button.setAttribute("aria-label", "Pausar prévia"); });
    audio?.addEventListener("pause", () => { button.textContent = "▶"; button.setAttribute("aria-label", "Reproduzir prévia"); });
    audio?.addEventListener("loadedmetadata", () => { if (times[1]) times[1].textContent = formatTime(audio.duration); });
    audio?.addEventListener("timeupdate", () => {
      if (progress && audio.duration) progress.value = String((audio.currentTime / audio.duration) * 100);
      if (times[0]) times[0].textContent = formatTime(audio.currentTime);
    });
    progress?.addEventListener("input", () => { if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration; });
    audio?.addEventListener("ended", () => { audio.currentTime = 0; });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
