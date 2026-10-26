
(() => {
  "use strict";

  const STORAGE_KEY = "rin-analytics-consent";
  const MEASUREMENT_ID = "G-3BE6WVB4PJ";

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Bei deaktiviertem Speicher bleibt die
      // Entscheidung nur für diese Seite gültig.
    }
  }

  function deleteAnalyticsCookies() {
    const cookies = document.cookie.split(";");

    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();

      if (name === "_ga" || name.startsWith("_ga_")) {
        const host = window.location.hostname;
        const domains = [
          "",
          host,
          "." + host,
          ".ruhe-im-nervensystem.de"
        ];

        domains.forEach((domain) => {
          const domainPart = domain
            ? "; domain=" + domain
            : "";

          document.cookie =
            name +
            "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
            "; path=/" +
            domainPart;
        });
      }
    });
  }

  function loadAnalytics() {
    if (window.rinAnalyticsLoaded) return;
    window.rinAnalyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);

    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(MEASUREMENT_ID);

    document.head.appendChild(script);
  }

  function showBanner() {
    if (document.getElementById("rin-consent-banner")) return;

    const banner = document.createElement("div");
    banner.id = "rin-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Datenschutzeinstellungen");

    Object.assign(banner.style, {
      position: "fixed",
      bottom: "16px",
      left: "16px",
      right: "16px",
      maxWidth: "520px",
      margin: "0 auto",
      padding: "22px",
      background: "#ffffff",
      color: "#263b35",
      border: "1px solid #d8e3dc",
      borderRadius: "16px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.16)",
      zIndex: "99999",
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.5"
    });

    const title = document.createElement("h2");
    title.textContent = "Deine Privatsphäre ist uns wichtig";
    title.style.margin = "0 0 10px";
    title.style.fontSize = "20px";

    const description = document.createElement("p");
    description.textContent =
      "Wir möchten mit Google Analytics verstehen, wie unsere " +
      "Website genutzt wird. Das geschieht nur mit deiner " +
      "freiwilligen Zustimmung. Du kannst auch ablehnen.";
    description.style.margin = "0 0 16px";

    const buttons = document.createElement("div");
    Object.assign(buttons.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px"
    });

    function createButton(text, background, color) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = text;

      Object.assign(button.style, {
        flex: "1 1 180px",
        padding: "12px",
        border: "1px solid #617d6e",
        borderRadius: "9px",
        background,
        color,
        cursor: "pointer",
        fontSize: "15px"
      });

      return button;
    }

    const reject = createButton(
      "Ablehnen", "#ffffff", "#263b35"
    );

    const accept = createButton(
      "Akzeptieren", "#426b56", "#ffffff"
    );

   

reject.addEventListener("click", () => {
  const wasGranted = getConsent() === "granted";

  saveConsent("denied");
  deleteAnalyticsCookies();
  banner.remove();

  if (wasGranted) {
    window.location.reload();
  }
});



    accept.addEventListener("click", () => {
      saveConsent("granted");
      banner.remove();
      loadAnalytics();
    });

    buttons.append(reject, accept);
    banner.append(title, description, buttons);
    document.body.appendChild(banner);
  }

  function init() {
    const consent = getConsent();

    if (consent === "granted") {
      loadAnalytics();
    } else if (consent !== "denied") {
      showBanner();
    }
  }

  // Ermöglicht das erneute Öffnen der Datenschutzeinstellungen
  window.rinOpenCookieSettings = function () {
    showBanner();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
