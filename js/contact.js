// Contact form submit handling for contact.html.
// Progressive enhancement: the form has a real action/method already, so
// if this script fails to load or fetch is unavailable, the browser still
// does a plain HTML POST to the configured endpoint. When this script does
// run, it intercepts submit to show inline status instead of a full
// page navigation, and drops honeypot-triggered spam client-side too.

(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitBtn = document.getElementById("contact-submit");
  var statusEl = document.getElementById("contact-status");

  var nameInput = document.getElementById("c-name");
  var emailInput = document.getElementById("c-email");
  var messageInput = document.getElementById("c-message");
  var honeypot = document.getElementById("c-hp");

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = kind ? "status-msg status-msg--" + kind : "";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    if (!nameInput.value.trim()) return "Enter your name.";
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
      return "Enter a valid email address.";
    }
    if (!messageInput.value.trim()) return "Enter a message.";
    return null;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Silently treat a filled honeypot as a no-op, same as the server-side
    // check in api/contact.js — don't tip off whatever filled it in.
    if (honeypot && honeypot.value.trim()) {
      setStatus("Thanks — we'll be in touch.", "ok");
      form.reset();
      return;
    }

    var error = validate();
    if (error) {
      setStatus(error, "err");
      return;
    }

    var endpoint = form.getAttribute("data-endpoint") || form.getAttribute("action");
    if (!endpoint) {
      setStatus("This form isn't wired to an endpoint yet.", "err");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("Sending…", "");

    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        target_roles: document.getElementById("c-role") ? document.getElementById("c-role").value.trim() : "",
        message: messageInput.value.trim(),
        _subject: "New Appre contact form submission"
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed with status " + res.status);
        return res.json().catch(function () { return {}; });
      })
      .then(function () {
        setStatus("Message sent — we'll reply within 1–2 business days.", "ok");
        form.reset();
      })
      .catch(function () {
        setStatus(
          "Something went wrong sending this. Try again, or email us directly if it persists.",
          "err"
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });
})();
