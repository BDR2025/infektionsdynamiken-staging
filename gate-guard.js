(function () {
  const SESSION_KEY = "idv.staging.session";
  const SESSION_VERSION = "v4";
  const GATE_PATH = "/gate.html";
  const DEFAULT_TARGET = "/de/guided/";
  const CHANNEL_NAME = "idv-staging-tabs";
  const PROBE_TIMEOUT_MS = 140;

  function randomId() {
    try {
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      }
    } catch {}

    return String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function readSession() {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || session.v !== SESSION_VERSION || typeof session.tabId !== "string" || !session.tabId) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  function clearSession() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {}

    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  function saveSession() {
    const session = {
      v: SESSION_VERSION,
      tabId: randomId()
    };

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    clearLegacyLocalSession();
    return session;
  }

  function clearLegacyLocalSession() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  function nextTarget(href) {
    const url = new URL(href || window.location.href, window.location.origin);
    const candidate = url.searchParams.get("next");
    if (!candidate || !candidate.startsWith("/")) return DEFAULT_TARGET;
    if (candidate === "/") return DEFAULT_TARGET;
    return candidate;
  }

  function currentTarget() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  function redirectToGate(next) {
    window.location.replace(GATE_PATH + "?next=" + encodeURIComponent(next || DEFAULT_TARGET));
  }

  function unveilPage() {
    const veil = document.querySelector("[data-staging-gate-veil]");
    if (veil) {
      veil.remove();
    }
    document.documentElement.setAttribute("data-staging-unlocked", "true");
  }

  function probeTabExclusivity(session) {
    return new Promise((resolve) => {
      if (!("BroadcastChannel" in window)) {
        resolve(true);
        return;
      }

      const pageId = randomId();
      let done = false;
      let blocked = false;
      const channel = new BroadcastChannel(CHANNEL_NAME);

      const finish = () => {
        if (done) return;
        done = true;
        try {
          channel.close();
        } catch {}
        resolve(!blocked);
      };

      const timer = window.setTimeout(finish, PROBE_TIMEOUT_MS);

      channel.onmessage = (event) => {
        const data = event && event.data ? event.data : null;
        if (!data || data.tabId !== session.tabId) return;

        if (data.type === "probe" && data.pageId !== pageId) {
          try {
            channel.postMessage({
              type: "occupied",
              tabId: session.tabId,
              pageId: data.pageId
            });
          } catch {}
          return;
        }

        if (data.type === "occupied" && data.pageId === pageId) {
          blocked = true;
          window.clearTimeout(timer);
          finish();
        }
      };

      try {
        channel.postMessage({
          type: "probe",
          tabId: session.tabId,
          pageId
        });
      } catch {
        window.clearTimeout(timer);
        finish();
      }
    });
  }

  async function protectPage(options) {
    if (window.location.pathname === GATE_PATH) {
      unveilPage();
      return true;
    }

    const next = options && options.next ? options.next : currentTarget();
    const redirectOnPass = options && options.redirectOnPass ? options.redirectOnPass : null;
    const session = readSession();

    if (!session) {
      redirectToGate(next);
      return false;
    }

    const exclusive = await probeTabExclusivity(session);
    if (!exclusive) {
      clearSession();
      redirectToGate(next);
      return false;
    }

    unveilPage();

    if (redirectOnPass) {
      window.location.replace(redirectOnPass);
      return false;
    }

    return true;
  }

  async function sha256Hex(value) {
    const encoded = new TextEncoder().encode(value);
    const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  window.__idvStagingGuard = {
    SESSION_KEY,
    SESSION_VERSION,
    GATE_PATH,
    DEFAULT_TARGET,
    readSession,
    saveSession,
    clearSession,
    nextTarget,
    redirectToGate,
    protectPage,
    sha256Hex
  };
})();
