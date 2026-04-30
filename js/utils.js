(function () {
  const ns = window.ShellStudio || (window.ShellStudio = {});

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(label) {
    return `<span class="icon-mark" aria-hidden="true">${escapeHtml(label)}</span>`;
  }

  const svgIcons = {
    eye: '<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="3"></circle>',
    "eye-off": '<path d="m3 3 18 18"></path><path d="M10.8 5.1A9.8 9.8 0 0 1 12 5c6.1 0 9.5 7 9.5 7a15.6 15.6 0 0 1-2.1 3.2"></path><path d="M6.1 6.1C3.8 8 2.5 12 2.5 12s3.4 7 9.5 7c1 0 1.9-.2 2.8-.5"></path>',
    "panel-left": '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M9 4v16"></path>',
    "panel-right": '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M15 4v16"></path>',
    "panel-top": '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M4 9h16"></path>',
    "panel-bottom": '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M4 15h16"></path>',
    mouse: '<rect x="7" y="3" width="10" height="18" rx="5"></rect><path d="M12 7v4"></path>',
    pencil: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"></path>',
    "arrow-up": '<path d="m12 5-6 6"></path><path d="m12 5 6 6"></path><path d="M12 5v14"></path>',
    "arrow-down": '<path d="M12 5v14"></path><path d="m18 13-6 6"></path><path d="m6 13 6 6"></path>',
    trash: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7A2 2 0 1 1 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"></path>',
    "mouse-pointer-click": '<path d="M5 3l7.7 18 2.1-7 6.2-2.8L5 3Z"></path><path d="M4 12H2"></path><path d="m7.4 7.4-1.8-1.8"></path><path d="m13 3 .7-2"></path>'
  };

  function svgIcon(name) {
    const iconName = svgIcons[name] ? name : "eye";
    const paths = svgIcons[iconName];
    return `<span class="icon-svg icon-svg-${escapeHtml(iconName)}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></span>`;
  }

  function safeHref(value, fallback = "#") {
    const href = String(value || "").trim();

    if (!href || /[\u0000-\u001f\s"'<>`]/.test(href)) {
      return fallback;
    }

    if (href === "#" || href.startsWith("#/") || href.startsWith("/") || /^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
      return href;
    }

    return fallback;
  }

  function compactLabel(value) {
    return String(value)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  ns.Utils = {
    escapeHtml,
    icon,
    svgIcon,
    safeHref,
    compactLabel
  };
})();
