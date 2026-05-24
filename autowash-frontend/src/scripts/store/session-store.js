const KEY = "autowash.session";

export function getSession() {
  return JSON.parse(sessionStorage.getItem(KEY) || "null");
}

export function setSession(session) {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

export function roleHome(role) {
  return {
    CUSTOMER: "/src/pages/customer/home.html",
    STAFF: "/src/pages/staff/queue.html",
    ADMIN: "/src/pages/admin/dashboard.html",
  }[role] || "/index.html";
}
