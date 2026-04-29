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

  function compactLabel(value) {
    return String(value)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  ns.Utils = {
    escapeHtml,
    icon,
    compactLabel
  };
})();
