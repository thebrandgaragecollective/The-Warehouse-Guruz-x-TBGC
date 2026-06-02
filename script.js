const WHATSAPP_URL =
  "https://wa.me/919374032161?text=Hello%20The%20Warehouse%20Guruz%2C%20I%20would%20like%20to%20discuss%20an%20industrial%20real%20estate%20requirement.";
const CONTACT_ENDPOINT = "/api/contact";
const FORM_RATE_LIMIT_MAX = 5;
const FORM_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const FORM_CLIENT_KEY_STORAGE = "twg_form_client_key";
const IS_LOCAL_TESTING = ["localhost", "127.0.0.1"].includes(window.location.hostname);

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector("[data-menu-button]");
  const navLinks = document.querySelector("[data-nav-links]");
  const whatsappLinks = document.querySelectorAll("[data-whatsapp]");
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");

  whatsappLinks.forEach((link) => {
    link.href = WHATSAPP_URL;
    link.target = "_blank";
    link.rel = "noopener";
  });

  const closeMenu = () => {
    if (!menuButton || !navLinks) return;
    menuButton.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      navLinks.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  const markScrolled = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  markScrolled();
  window.addEventListener("scroll", markScrolled, { passive: true });

  const currentPage = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }

  if (contactForm && formStatus) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    const setFormStatus = (message, type = "info") => {
      formStatus.textContent = message;
      formStatus.dataset.type = type;
      formStatus.classList.add("is-visible");
      formStatus.focus();
    };

    const readResponseMessage = async (response) => {
      try {
        const result = await response.json();
        return result.message || "";
      } catch {
        return "";
      }
    };

    const getSubmissionLog = () => {
      try {
        return JSON.parse(localStorage.getItem("twg_form_submissions") || "[]");
      } catch {
        return [];
      }
    };

    const recordSubmissionAttempt = () => {
      if (IS_LOCAL_TESTING) return;

      const now = Date.now();
      const recent = getSubmissionLog().filter((time) => now - time < FORM_RATE_LIMIT_WINDOW_MS);
      recent.push(now);
      localStorage.setItem("twg_form_submissions", JSON.stringify(recent));
    };

    const isBrowserRateLimited = () => {
      if (IS_LOCAL_TESTING) return false;

      const now = Date.now();
      const recent = getSubmissionLog().filter((time) => now - time < FORM_RATE_LIMIT_WINDOW_MS);
      localStorage.setItem("twg_form_submissions", JSON.stringify(recent));
      return recent.length >= FORM_RATE_LIMIT_MAX;
    };

    const getClientKey = () => {
      let clientKey = localStorage.getItem(FORM_CLIENT_KEY_STORAGE);
      if (!clientKey) {
        clientKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        localStorage.setItem(FORM_CLIENT_KEY_STORAGE, clientKey);
      }
      return clientKey;
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (isBrowserRateLimited()) {
        setFormStatus("Too many submissions from this browser. Please try again later or contact us on WhatsApp.", "error");
        return;
      }

      const formData = new FormData(contactForm);
      if (formData.get("website")) return;

      formData.append("sourcePage", window.location.href);
      formData.append("userAgent", navigator.userAgent);
      formData.append("clientKey", getClientKey());
      formData.append("submissionId", crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

      recordSubmissionAttempt();
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      setFormStatus("Sending your inquiry...", "info");

      try {
        const response = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(formData)
        });

        const responseMessage = await readResponseMessage(response);

        if (!response.ok) {
          throw new Error(responseMessage || "Form submission failed.");
        }

        contactForm.reset();
        setFormStatus(
          "Thank you. Your inquiry has been received. The Guruz team will review your requirement and contact you shortly.",
          "success"
        );
      } catch (error) {
        setFormStatus(
          `${error.message || "Something went wrong while sending the form."} Please try again or use WhatsApp.`,
          "error"
        );
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    });
  }
});
