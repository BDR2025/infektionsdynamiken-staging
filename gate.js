(function () {
  const guard = window.__idvStagingGuard;
  if (!guard) return;
  if (window.location.pathname !== guard.GATE_PATH) return;

  const form = document.getElementById("staging-gate-form");
  const input = document.getElementById("staging-passphrase");
  const toggle = document.getElementById("staging-toggle-passphrase");
  const message = document.getElementById("staging-gate-message");

  if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  const target = guard.nextTarget(window.location.href);

  if (guard.readSession()) {
    guard.protectPage({ next: target, redirectOnPass: target });
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

    const digest = await guard.sha256Hex("idv:staging:v2" + ":" + value);
    const isAllowed = digest === "f33c92eace1a5497870986ba832cc1583273a3c2e2d15fbc08d28cebbc85e5bb";

    if (!isAllowed) {
      if (message) {
        message.textContent = "Falsche Passphrase.";
        message.classList.remove("is-ok");
      }
      return;
    }

    guard.saveSession();

    if (message) {
      message.textContent = "Weiterleitung ...";
      message.classList.add("is-ok");
    }

    window.location.replace(target);
  });
})();
