const propertyId = document.body.dataset.property;
const property = window.SCUASSANTE_PROPERTIES.find((item) => item.id === propertyId);

if (!property) {
  throw new Error(`Não foi possível encontrar os dados do imóvel "${propertyId}".`);
}

document.title = `${property.name} | Scuassante Consultoria Imobiliária`;
document.querySelector("[data-property-name]").textContent = property.name;
document.querySelector("[data-property-summary]").textContent = property.description;
document.querySelector("[data-description-heading]").textContent = property.name;
document.querySelector("[data-property-description]").textContent = property.description;

const gallery = document.querySelector("[data-detail-gallery]");
const galleryImage = document.querySelector("[data-detail-image]");
const galleryCaption = document.querySelector("[data-detail-caption]");
const galleryCurrent = document.querySelector("[data-detail-current]");
const galleryDots = document.querySelector("[data-detail-dots]");
const lightbox = document.querySelector(".detail-lightbox");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const contactLink = document.querySelector("[data-property-whatsapp]");
let currentIndex = 0;
let imageRequest = 0;

const whatsappMessage = `Olá! Acessei o site da Scuassante Consultoria Imobiliária e gostaria de obter mais informações sobre o imóvel demonstrativo ${property.name}.`;
contactLink.href = `https://wa.me/5527998277099?text=${encodeURIComponent(whatsappMessage)}`;
document.querySelectorAll(".detail-phone").forEach((link) => {
  link.href = "https://wa.me/5527998277099";
});
document.querySelector("[data-detail-total]").textContent = String(property.images.length).padStart(2, "0");
document.querySelectorAll("[data-current-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

function updateLightbox() {
  const [src, caption] = property.images[currentIndex];
  lightboxImage.src = src;
  lightboxImage.alt = `${caption} de ${property.name}, imóvel ilustrativo`;
  lightboxCaption.textContent = `${caption} · ${String(currentIndex + 1).padStart(2, "0")} / ${String(property.images.length).padStart(2, "0")}`;
}

function showImage(index) {
  currentIndex = (index + property.images.length) % property.images.length;
  const [src, caption] = property.images[currentIndex];
  imageRequest += 1;
  const requestId = imageRequest;
  galleryImage.classList.add("is-changing");

  const nextImage = new Image();
  nextImage.onload = () => {
    if (requestId !== imageRequest) return;
    galleryImage.src = src;
    galleryImage.alt = `${caption} de ${property.name}, imóvel ilustrativo`;
    galleryImage.classList.remove("is-changing");
  };
  nextImage.onerror = () => {
    if (requestId !== imageRequest) return;
    galleryImage.classList.remove("is-changing");
    console.error(`Não foi possível carregar a fotografia da galeria: ${src}`);
  };
  nextImage.src = src;

  galleryCaption.textContent = caption;
  galleryCurrent.textContent = String(currentIndex + 1).padStart(2, "0");
  galleryDots.querySelectorAll(".gallery-dot").forEach((dot, dotIndex) => {
    dot.setAttribute("aria-current", String(dotIndex === currentIndex));
  });
  if (lightbox.open) updateLightbox();
}

property.images.forEach(([, caption], index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "gallery-dot";
  dot.setAttribute("aria-label", `Mostrar ${caption}`);
  dot.setAttribute("aria-current", String(index === 0));
  dot.addEventListener("click", () => showImage(index));
  galleryDots.append(dot);
});

document.querySelector("[data-detail-prev]").addEventListener("click", () => showImage(currentIndex - 1));
document.querySelector("[data-detail-next]").addEventListener("click", () => showImage(currentIndex + 1));
function openLightbox() {
  updateLightbox();
  lightbox.showModal();
}
galleryImage.addEventListener("click", openLightbox);
document.querySelector("[data-detail-expand]").addEventListener("click", openLightbox);
document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => showImage(currentIndex - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => showImage(currentIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") showImage(currentIndex - 1);
  if (event.key === "ArrowRight") showImage(currentIndex + 1);
  if (event.key === "Escape") lightbox.close();
});

let pointerStart = null;
gallery.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  pointerStart = event.clientX;
});
gallery.addEventListener("pointerup", (event) => {
  if (pointerStart === null) return;
  const distance = event.clientX - pointerStart;
  if (Math.abs(distance) > 45) showImage(currentIndex + (distance < 0 ? 1 : -1));
  pointerStart = null;
});
gallery.addEventListener("pointercancel", () => { pointerStart = null; });

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
