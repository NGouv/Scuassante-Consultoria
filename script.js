const galleries = window.SCUASSANTE_PROPERTIES.map((property) => property.images);

const carouselCards = [...document.querySelectorAll("[data-carousel]")];
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
let activeCarousel = null;

function renderCarousel(card, index, animate = true) {
  const images = galleries[Number(card.dataset.carouselIndex)];
  const image = card.querySelector(".gallery-image");
  const [src, caption] = images[index];

  if (animate) image.classList.add("is-changing");
  card.dataset.imageRequest = String(Number(card.dataset.imageRequest || 0) + 1);
  const imageRequest = card.dataset.imageRequest;
  const nextImage = new Image();
  nextImage.onload = () => {
    if (card.dataset.imageRequest !== imageRequest) return;
    image.src = src;
    image.alt = `${caption} de ${card.querySelector("h3").textContent}, imóvel ilustrativo`;
    image.classList.remove("is-changing");
  };
  nextImage.onerror = () => {
    if (card.dataset.imageRequest !== imageRequest) return;
    image.classList.remove("is-changing");
    console.error(`Não foi possível carregar a fotografia da galeria: ${src}`);
  };
  nextImage.src = src;

  card.dataset.index = String(index);
  card.querySelector("[data-current]").textContent = String(index + 1).padStart(2, "0");
  card.querySelector("[data-caption]").textContent = caption;
  card.querySelectorAll(".gallery-dot").forEach((dot, dotIndex) => {
    dot.setAttribute("aria-current", String(dotIndex === index));
    dot.setAttribute("aria-label", `Mostrar ${images[dotIndex][1]}`);
  });
  if (lightbox.open && activeCarousel === card) updateLightbox();
}

function moveCarousel(card, offset) {
  const total = galleries[Number(card.dataset.carouselIndex)].length;
  const current = Number(card.dataset.index || 0);
  renderCarousel(card, (current + offset + total) % total);
}

function updateLightbox() {
  const images = galleries[Number(activeCarousel.dataset.carouselIndex)];
  const index = Number(activeCarousel.dataset.index || 0);
  const [src, caption] = images[index];
  lightboxImage.src = src;
  lightboxImage.alt = `${caption} de ${activeCarousel.querySelector("h3").textContent}, imóvel ilustrativo`;
  lightboxCaption.textContent = `${caption} · ${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
}

carouselCards.forEach((card, carouselIndex) => {
  card.dataset.carouselIndex = String(carouselIndex);
  const images = galleries[carouselIndex];
  card.querySelector("[data-total]").textContent = String(images.length).padStart(2, "0");
  const dots = card.querySelector("[data-dots]");
  images.forEach(([, caption], index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", `Mostrar ${caption}`);
    dot.setAttribute("aria-current", String(index === 0));
    dot.addEventListener("click", () => renderCarousel(card, index));
    dots.append(dot);
  });
  card.querySelector("[data-prev]").addEventListener("click", () => moveCarousel(card, -1));
  card.querySelector("[data-next]").addEventListener("click", () => moveCarousel(card, 1));
  card.querySelector("[data-expand]").addEventListener("click", () => {
    activeCarousel = card;
    updateLightbox();
    lightbox.showModal();
  });
  const frame = card.querySelector(".gallery-frame");
  let pointerStart = null;
  let suppressClick = false;
  frame.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    pointerStart = event.clientX;
  });
  frame.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const delta = event.clientX - pointerStart;
    if (Math.abs(delta) > 45) {
      suppressClick = true;
      moveCarousel(card, delta < 0 ? 1 : -1);
      window.setTimeout(() => { suppressClick = false; }, 0);
    }
    pointerStart = null;
  });
  frame.addEventListener("pointercancel", () => { pointerStart = null; });
  frame.addEventListener("click", (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  });
});

document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => moveCarousel(activeCarousel, -1));
document.querySelector(".lightbox-next").addEventListener("click", () => moveCarousel(activeCarousel, 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener("keydown", (event) => {
  if (!lightbox.open || !activeCarousel) return;
  if (event.key === "ArrowLeft") moveCarousel(activeCarousel, -1);
  if (event.key === "ArrowRight") moveCarousel(activeCarousel, 1);
  if (event.key === "Escape") lightbox.close();
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  siteNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});
siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const navLinks = [...document.querySelectorAll(".nav-link")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  observedSections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
