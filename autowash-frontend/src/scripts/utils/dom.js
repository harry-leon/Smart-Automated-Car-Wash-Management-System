export const $ = (selector, root = document) => root.querySelector(selector);

export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function setFieldError(form, fieldName, message) {
  const target = form.querySelector(`[data-error-for="${fieldName}"]`);
  if (target) {
    target.textContent = message || "";
  }
}

export function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, "");
  $$("[data-nav-link]").forEach((link) => {
    const href = new URL(link.href).pathname.replace(/\/$/, "");
    if (href === path) {
      link.setAttribute("aria-current", "page");
    }
  });
}
