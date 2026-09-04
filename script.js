// Portfolio interactions: navigation, reveals, counters, particles, and form feedback.
const loader = document.querySelector(".loader");
window.addEventListener("load", () =>
  setTimeout(() => loader.classList.add("done"), 450),
);

const progress = document.querySelector(".scroll-progress");
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable ? (window.scrollY / scrollable) * 100 : 0}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
});
document.querySelectorAll(".nav-links a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }),
);

// Persist the user's theme choice, falling back to their system preference.
const themeButtons = document.querySelectorAll(".theme-toggle");
const savedTheme = localStorage.getItem("talib-theme");
const initialTheme =
  savedTheme ||
  (window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark");
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("talib-theme", theme);
  themeButtons.forEach((button) => {
    const light = theme === "light";
    button.classList.toggle("light", light);
    button.setAttribute("aria-pressed", light);
    button.setAttribute(
      "aria-label",
      light ? "Switch to dark mode" : "Switch to light mode",
    );
  });
}
setTheme(initialTheme);
themeButtons.forEach((button) =>
  button.addEventListener("click", () =>
    setTheme(
      document.documentElement.dataset.theme === "light" ? "dark" : "light",
    ),
  ),
);

const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-links a")];
const sectionObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        navItems.forEach((item) =>
          item.classList.toggle(
            "active",
            item.getAttribute("href") === `#${entry.target.id}`,
          ),
        );
    }),
  { rootMargin: "-35% 0px -55% 0px" },
);
sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

const typing = document.querySelector("#typing");
const roles = ["Full Stack Developer", "Backend Engineer", "Problem Solver"];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
function typeRole() {
  const role = roles[roleIndex];
  typing.textContent = deleting
    ? role.slice(0, --charIndex)
    : role.slice(0, ++charIndex);
  let delay = deleting ? 40 : 78;
  if (!deleting && charIndex === role.length) {
    delay = 1500;
    deleting = true;
  }
  if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 300;
  }
  setTimeout(typeRole, delay);
}
typeRole();

const counterObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const decimal = el.dataset.decimal;
      let start = 0;
      const duration = 1000;
      const started = performance.now();
      function tick(now) {
        const amount = Math.min((now - started) / duration, 1);
        const value = start + (target - start) * (1 - Math.pow(1 - amount, 3));
        el.textContent = decimal ? value.toFixed(2) : Math.floor(value);
        if (amount < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }),
  { threshold: 0.8 },
);
document
  .querySelectorAll("[data-count]")
  .forEach((el) => counterObserver.observe(el));

document.querySelectorAll(".ripple").forEach((button) =>
  button.addEventListener("click", (event) => {
    const ripple = document.createElement("i");
    const rect = button.getBoundingClientRect();
    ripple.className = "ripple-dot";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.append(ripple);
    setTimeout(() => ripple.remove(), 600);
  }),
);
const rippleStyle = document.createElement("style");
rippleStyle.textContent =
  ".ripple{position:relative;overflow:hidden}.ripple-dot{position:absolute;width:10px;height:10px;background:rgba(255,255,255,.4);border-radius:50%;transform:translate(-50%,-50%);animation:ripple .6s ease-out forwards;pointer-events:none}@keyframes ripple{to{width:250px;height:250px;opacity:0}}";
document.head.append(rippleStyle);

const form = document.querySelector("#contact-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const note = form.querySelector(".form-note");
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "…";
  note.textContent = "Sending your message…";
  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed");
    form.reset();
    note.textContent = "Thanks — your message has been sent.";
  } catch (error) {
    note.textContent =
      "Could not send right now. Please email me directly at aryantalib60@gmail.com.";
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "↗";
  }
});

const glow = document.querySelector(".mouse-glow");
window.addEventListener(
  "pointermove",
  (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  },
  { passive: true },
);

const canvas = document.querySelector("#particles");
const ctx = canvas.getContext("2d");
let particles = [];
function resizeCanvas() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
function seedParticles() {
  particles = Array.from(
    { length: Math.min(75, Math.floor(innerWidth / 16)) },
    () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }),
  );
}
function drawParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(135,153,255,.45)";
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
resizeCanvas();
seedParticles();
drawParticles();
window.addEventListener("resize", () => {
  resizeCanvas();
  seedParticles();
});
