(function () {
  const SESSION_KEY = "idv.staging.session";
  const SESSION_VERSION = "v2";
  const SESSION_DAYS = 7;
  const GATE_PATH = "/gate.html";
  const SALT = "idv:staging:v2";
  const ALLOWED = [
    {
      label: "temporary",
      sha256: "f33c92eace1a5497870986ba832cc1583273a3c2e2d15fbc08d28cebbc85e5bb"
    }
  ];

  function now() {
    return Date.now();
  }

  function days(value) {
    return value * 24 * 60 * 60 * 1000;
  }

  function readSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || session.v !== SESSION_VERSION || session.exp < now()) return null;
      return session;
    } catch {
      return null;
    }
  }

  function saveSession() {
    const session = {
      v: SESSION_VERSION,
      exp: now() + days(SESSION_DAYS)
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function nextTarget() {
    const url = new URL(window.location.href);
    const candidate = url.searchParams.get("next");
    if (!candidate || !candidate.startsWith("/")) return "/de/guided/";
    if (candidate === "/") return "/de/guided/";
    return candidate;
  }

  async function sha256Hex(value) {
    const encoded = new TextEncoder().encode(value);
    const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  if (window.location.pathname !== GATE_PATH) {
    return;
  }

  if (readSession()) {
    window.location.replace(nextTarget());
    return;
  }

  const form = document.getElementById("staging-gate-form");
  const input = document.getElementById("staging-passphrase");
  const toggle = document.getElementById("staging-toggle-passphrase");
  const message = document.getElementById("staging-gate-message");

  if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  toggle.addEventListener("click", () => {
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    toggle.textContent = reveal ? "verbergen" : "anzeigen";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = input.value.trim();

    if (!value) {
      if (message) {
        message.textContent = "Bitte eine Passphrase eingeben.";
        message.classList.remove("is-ok");
      }
      return;
    }

    const digest = await sha256Hex(SALT + ":" + value);
    const isAllowed = ALLOWED.some((entry) => entry.sha256 === digest);

    if (!isAllowed) {
      if (message) {
        message.textContent = "Falsche Passphrase.";
        message.classList.remove("is-ok");
      }
      return;
    }

    saveSession();

    if (message) {
      message.textContent = "Weiterleitung ...";
      message.classList.add("is-ok");
    }

    window.location.replace(nextTarget());
  });
})();
